import uuid
from datetime import datetime, date, time, timedelta
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import (
    Tenant, Branch, Service, BranchService, StaffProfile, StaffBranchAssignment,
    StaffService, OperatingHours, StaffShift, StaffTimeOff, Customer,
    Appointment, AppointmentItem, AppointmentStatusHistory, BookingHold,
    BiometricDevice, DeviceSyncRun, RawAttendanceEvent, AttendanceSummary,
    AttendanceAdjustment, SalaryRule, CommissionRule, PayrollRun, PayrollItem,
    Product, BranchInventory, StockMovement, Invoice, InvoiceItem, Payment,
    Refund, Expense, CashRegisterSession, MessageLog, WebhookEvent, WhatsAppSession,
    AuditLog, User
)


class AvailabilityService:
    @staticmethod
    def get_available_slots(branch_id, service_ids, target_date, preferred_staff_id=None):
        """
        Calculates available conflict-free time slots for given branch, services, and date.
        Respects:
          - Branch operating hours
          - Staff qualifications & branch assignment
          - Staff shifts & breaks
          - Approved staff time off
          - Existing non-cancelled appointments + buffer times
          - Active booking holds
        """
        branch = Branch.objects.get(id=branch_id, is_active=True)
        if isinstance(target_date, str):
            target_date = datetime.strptime(target_date, "%Y-%m-%d").date()

        weekday = target_date.weekday()

        # Check branch operating hours
        op_hours = OperatingHours.objects.filter(branch=branch, weekday=weekday, is_closed=False).first()
        if not op_hours:
            return []  # Closed on this weekday

        # Get services and calculate total duration and total price
        services = list(Service.objects.filter(id__in=service_ids, is_active=True))
        if not services:
            return []

        # Duration & buffer calculation
        total_duration = 0
        total_buffer = branch.buffer_minutes

        for s in services:
            # Check for branch override
            b_override = BranchService.objects.filter(branch=branch, service=s).first()
            if b_override and not b_override.is_available:
                return []  # Service not offered at this branch
            s_duration = b_override.duration_minutes if (b_override and b_override.duration_minutes) else s.default_duration_minutes
            total_duration += s_duration

        if total_duration == 0:
            total_duration = 60

        # Find qualified staff
        qualified_staff_qs = StaffProfile.objects.filter(
            tenant=branch.tenant,
            is_active=True,
            branch_assignments__branch=branch,
            branch_assignments__is_active=True,
        )

        for s in services:
            qualified_staff_qs = qualified_staff_qs.filter(
                qualified_services__service=s,
                qualified_services__is_active=True,
            )

        if preferred_staff_id:
            qualified_staff_qs = qualified_staff_qs.filter(id=preferred_staff_id)

        qualified_staff_list = list(qualified_staff_qs.distinct())
        if not qualified_staff_list:
            return []

        # Operating window for the day
        branch_tz = timezone.get_current_timezone()
        day_open = timezone.make_aware(datetime.combine(target_date, op_hours.open_time), branch_tz)
        day_close = timezone.make_aware(datetime.combine(target_date, op_hours.close_time), branch_tz)

        # Slot increment: default 15 or 30 minutes
        slot_interval = timedelta(minutes=15)
        service_duration_delta = timedelta(minutes=total_duration)
        slot_buffer_delta = timedelta(minutes=total_buffer)

        # Existing busy appointments for the day across qualified staff
        day_start = day_open - timedelta(hours=2)
        day_end = day_close + timedelta(hours=2)

        existing_appointments = list(
            Appointment.objects.filter(
                branch=branch,
                primary_staff__in=qualified_staff_list,
                status__in=[
                    Appointment.Status.PENDING,
                    Appointment.Status.CONFIRMED,
                    Appointment.Status.CHECKED_IN,
                    Appointment.Status.IN_PROGRESS,
                ],
                start_time__lt=day_end,
                end_time__gt=day_start,
            ).values("id", "primary_staff_id", "start_time", "end_time", "buffer_minutes")
        )

        # Time-offs
        time_offs = list(
            StaffTimeOff.objects.filter(
                staff__in=qualified_staff_list,
                status=StaffTimeOff.Status.APPROVED,
                start_datetime__lt=day_end,
                end_datetime__gt=day_start,
            ).values("staff_id", "start_datetime", "end_datetime")
        )

        # Active booking holds
        now_utc = timezone.now()
        holds = list(
            BookingHold.objects.filter(
                branch=branch,
                staff__in=qualified_staff_list,
                expires_at__gt=now_utc,
                is_released=False,
            ).values("staff_id", "start_time", "end_time")
        )

        available_slots = []
        seen_slot_times = set()

        for staff in qualified_staff_list:
            # Check shift for this staff on this weekday
            shift = StaffShift.objects.filter(
                branch=branch,
                staff=staff,
                weekday=weekday,
                is_active=True,
            ).first()

            if not shift:
                continue

            shift_start = max(day_open, timezone.make_aware(datetime.combine(target_date, shift.start_time), branch_tz))
            shift_end = min(day_close, timezone.make_aware(datetime.combine(target_date, shift.end_time), branch_tz))

            break_start = timezone.make_aware(datetime.combine(target_date, shift.break_start), branch_tz) if shift.break_start else None
            break_end = timezone.make_aware(datetime.combine(target_date, shift.break_end), branch_tz) if shift.break_end else None

            # Filter staff's appointments
            staff_appts = [a for a in existing_appointments if a["primary_staff_id"] == staff.id]
            staff_tos = [to for to in time_offs if to["staff_id"] == staff.id]
            staff_holds = [h for h in holds if h["staff_id"] == staff.id]

            # Generate slots
            current_cursor = shift_start
            while current_cursor + service_duration_delta <= shift_end:
                slot_end = current_cursor + service_duration_delta
                slot_end_with_buffer = slot_end + slot_buffer_delta

                is_busy = False

                # 1. Break check
                if break_start and break_end:
                    if current_cursor < break_end and slot_end > break_start:
                        is_busy = True

                # 2. Time-off check
                if not is_busy:
                    for to in staff_tos:
                        if current_cursor < to["end_datetime"] and slot_end > to["start_datetime"]:
                            is_busy = True
                            break

                # 3. Existing appointment overlap check (including appointment buffer)
                if not is_busy:
                    for a in staff_appts:
                        appt_buffer = timedelta(minutes=a["buffer_minutes"])
                        appt_end_with_buf = a["end_time"] + appt_buffer
                        # Overlap if slot starts before existing appointment ends (with buffer)
                        # and slot ends (with its buffer) after existing appointment starts
                        if current_cursor < appt_end_with_buf and slot_end_with_buffer > a["start_time"]:
                            is_busy = True
                            break

                # 4. Booking hold check
                if not is_busy:
                    for h in staff_holds:
                        if current_cursor < h["end_time"] and slot_end > h["start_time"]:
                            is_busy = True
                            break

                if not is_busy:
                    slot_key = (current_cursor.isoformat(), staff.id)
                    time_display = current_cursor.strftime("%H:%M")
                    available_slots.append({
                        "time": time_display,
                        "datetime": current_cursor.isoformat(),
                        "staff_id": str(staff.id),
                        "staff_name": staff.full_name,
                        "staff_title": staff.title or "Stylist",
                        "duration_minutes": total_duration,
                    })

                current_cursor += slot_interval

        # Sort slots chronologically
        available_slots.sort(key=lambda s: (s["datetime"], s["staff_name"]))
        return available_slots


class BookingService:
    @staticmethod
    def book_appointment(
        branch_id,
        service_ids,
        start_time_iso,
        customer_data,
        preferred_staff_id=None,
        source=Appointment.Source.WEBSITE,
        notes="",
        created_by_user=None,
    ):
        """
        Concurrency-safe appointment booking with transactional row-level locking.
        Prevents double-booking under concurrent load.
        """
        if isinstance(start_time_iso, str):
            start_time = datetime.fromisoformat(start_time_iso.replace("Z", "+00:00"))
        else:
            start_time = start_time_iso

        if timezone.is_naive(start_time):
            start_time = timezone.make_aware(start_time)

        with transaction.atomic():
            branch = Branch.objects.select_for_update().get(id=branch_id, is_active=True)
            tenant = branch.tenant

            # Fetch services
            services = list(Service.objects.filter(id__in=service_ids, is_active=True))
            if not services:
                raise ValidationError("No valid services selected for booking.")

            # Calculate total duration & prices
            total_duration = 0
            subtotal = Decimal("0.00")
            item_details = []

            for s in services:
                b_override = BranchService.objects.filter(branch=branch, service=s).first()
                price = b_override.effective_price() if b_override else s.base_price
                duration = b_override.effective_duration() if b_override else s.default_duration_minutes
                total_duration += duration
                subtotal += price
                item_details.append({
                    "service": s,
                    "price": price,
                    "duration": duration,
                })

            end_time = start_time + timedelta(minutes=total_duration)
            buffer_minutes = branch.buffer_minutes
            end_time_with_buffer = end_time + timedelta(minutes=buffer_minutes)

            # Determine and lock the assigned staff member
            qualified_staff_qs = StaffProfile.objects.select_for_update().filter(
                tenant=tenant,
                is_active=True,
                branch_assignments__branch=branch,
                branch_assignments__is_active=True,
            )
            for s in services:
                qualified_staff_qs = qualified_staff_qs.filter(
                    qualified_services__service=s,
                    qualified_services__is_active=True,
                )

            if preferred_staff_id:
                qualified_staff_qs = qualified_staff_qs.filter(id=preferred_staff_id)

            candidate_staff = list(qualified_staff_qs.distinct())
            if not candidate_staff:
                raise ValidationError("No qualified staff member is available for the requested services.")

            assigned_staff = None

            for staff in candidate_staff:
                # Check for overlapping appointments
                overlapping = Appointment.objects.filter(
                    primary_staff=staff,
                    status__in=[
                        Appointment.Status.PENDING,
                        Appointment.Status.CONFIRMED,
                        Appointment.Status.CHECKED_IN,
                        Appointment.Status.IN_PROGRESS,
                    ],
                    start_time__lt=end_time_with_buffer,
                    end_time__gt=start_time - timedelta(minutes=buffer_minutes),
                ).exists()

                if not overlapping:
                    assigned_staff = staff
                    break

            if not assigned_staff:
                raise ValidationError("The requested time slot is no longer available. Please select another time.")

            # Find or create customer
            customer_phone = customer_data.get("phone", "").strip()
            customer_name = customer_data.get("full_name", "").strip() or customer_data.get("name", "").strip()
            customer_email = customer_data.get("email", "").strip()

            customer, created = Customer.objects.get_or_create(
                tenant=tenant,
                phone=customer_phone,
                defaults={
                    "full_name": customer_name,
                    "email": customer_email,
                    "whatsapp_opt_in": customer_data.get("whatsapp_opt_in", True),
                    "sms_opt_in": customer_data.get("sms_opt_in", False),
                    "email_opt_in": customer_data.get("email_opt_in", True),
                }
            )
            if not created and (customer_name or customer_email):
                if customer_name:
                    customer.full_name = customer_name
                if customer_email:
                    customer.email = customer_email
                customer.save()

            # Calculate taxes
            tax_rate = branch.tax_rate or tenant.default_tax_rate or Decimal("0.00")
            tax_amount = (subtotal * tax_rate) / Decimal("100.00")
            total_amount = subtotal + tax_amount

            # Generate unique booking reference (e.g. LA-2610-A8B9)
            ref_code = f"BK-{uuid.uuid4().hex[:8].upper()}"

            appointment = Appointment.objects.create(
                tenant=tenant,
                branch=branch,
                customer=customer,
                primary_staff=assigned_staff,
                booking_reference=ref_code,
                source=source,
                status=Appointment.Status.CONFIRMED,
                start_time=start_time,
                end_time=end_time,
                buffer_minutes=buffer_minutes,
                total_duration_minutes=total_duration,
                subtotal_amount=subtotal,
                tax_amount=tax_amount,
                total_amount=total_amount,
                notes=notes,
                created_by=created_by_user,
            )

            # Create AppointmentItems
            seq = 1
            for item in item_details:
                AppointmentItem.objects.create(
                    appointment=appointment,
                    service=item["service"],
                    staff=assigned_staff,
                    service_name_snapshot=item["service"].name,
                    duration_minutes=item["duration"],
                    price=item["price"],
                    sequence_order=seq,
                )
                seq += 1

            # Log status history
            AppointmentStatusHistory.objects.create(
                appointment=appointment,
                from_status="",
                to_status=Appointment.Status.CONFIRMED,
                changed_by=created_by_user,
                reason="Initial booking created.",
            )

            # Audit log
            AuditLog.objects.create(
                tenant=tenant,
                branch=branch,
                actor=created_by_user,
                entity_type="Appointment",
                entity_id=str(appointment.id),
                action="CREATE",
                metadata={"booking_reference": ref_code, "total_amount": str(total_amount)},
            )

            return appointment

    @staticmethod
    def cancel_appointment(appointment_id, reason="", user=None, is_customer_initiated=False):
        """Cancels an appointment respecting the branch's cancellation window."""
        with transaction.atomic():
            appointment = Appointment.objects.select_for_update().get(id=appointment_id)
            if appointment.status == Appointment.Status.CANCELLED:
                return appointment

            # Check policy if customer initiated
            if is_customer_initiated:
                cancellation_hours = appointment.branch.cancellation_window_hours
                deadline = appointment.start_time - timedelta(hours=cancellation_hours)
                if timezone.now() > deadline:
                    raise ValidationError(
                        f"Appointments cannot be cancelled within {cancellation_hours} hours of scheduled start time."
                    )

            old_status = appointment.status
            appointment.status = Appointment.Status.CANCELLED
            appointment.cancellation_reason = reason
            appointment.save()

            AppointmentStatusHistory.objects.create(
                appointment=appointment,
                from_status=old_status,
                to_status=Appointment.Status.CANCELLED,
                changed_by=user,
                reason=reason or "Cancelled by user/customer.",
            )

            AuditLog.objects.create(
                tenant=appointment.tenant,
                branch=appointment.branch,
                actor=user,
                entity_type="Appointment",
                entity_id=str(appointment.id),
                action="STATUS_CHANGE",
                metadata={"from": old_status, "to": "CANCELLED", "reason": reason},
            )

            return appointment

    @staticmethod
    def reschedule_appointment(appointment_id, new_start_time_iso, reason="", user=None):
        """Reschedules an appointment after verifying conflict-free availability."""
        if isinstance(new_start_time_iso, str):
            new_start_time = datetime.fromisoformat(new_start_time_iso.replace("Z", "+00:00"))
        else:
            new_start_time = new_start_time_iso

        if timezone.is_naive(new_start_time):
            new_start_time = timezone.make_aware(new_start_time)

        with transaction.atomic():
            appointment = Appointment.objects.select_for_update().get(id=appointment_id)
            new_end_time = new_start_time + timedelta(minutes=appointment.total_duration_minutes)
            buffer_minutes = appointment.buffer_minutes
            new_end_with_buf = new_end_time + timedelta(minutes=buffer_minutes)

            # Check overlap for the primary staff
            overlapping = Appointment.objects.filter(
                primary_staff=appointment.primary_staff,
                status__in=[
                    Appointment.Status.PENDING,
                    Appointment.Status.CONFIRMED,
                    Appointment.Status.CHECKED_IN,
                    Appointment.Status.IN_PROGRESS,
                ],
                start_time__lt=new_end_with_buf,
                end_time__gt=new_start_time - timedelta(minutes=buffer_minutes),
            ).exclude(id=appointment.id).exists()

            if overlapping:
                raise ValidationError("The requested time slot is in conflict with another appointment.")

            old_start = appointment.start_time
            appointment.start_time = new_start_time
            appointment.end_time = new_end_time
            appointment.notes = f"{appointment.notes}\nRescheduled from {old_start} (Reason: {reason})".strip()
            appointment.save()

            AppointmentStatusHistory.objects.create(
                appointment=appointment,
                from_status=appointment.status,
                to_status=appointment.status,
                changed_by=user,
                reason=f"Rescheduled to {new_start_time}. Reason: {reason}",
            )

            return appointment


class WhatsAppBookingService:
    @staticmethod
    def process_incoming_message(tenant, phone_number, message_text):
        """
        Handles stateful WhatsApp conversational booking dialog.
        State machine:
          GREETING -> SELECT_BRANCH -> SELECT_SERVICE -> SELECT_STAFF -> SELECT_DATE -> SELECT_SLOT -> CONFIRM -> COMPLETED
        """
        text = message_text.strip()
        phone = phone_number.strip()

        session, _ = WhatsAppSession.objects.get_or_create(
            tenant=tenant,
            phone_number=phone,
            defaults={"state": WhatsAppSession.State.GREETING, "context_data": {}},
        )

        ctx = session.context_data or {}
        reply = ""

        # Reset command
        if text.lower() in ["reset", "restart", "start", "menu", "hi", "hello"]:
            session.state = WhatsAppSession.State.GREETING
            ctx = {}

        if session.state == WhatsAppSession.State.GREETING:
            branches = list(Branch.objects.filter(tenant=tenant, is_active=True))
            if not branches:
                reply = "Welcome to our salon! Currently no branches are available."
            elif len(branches) == 1:
                ctx["branch_id"] = str(branches[0].id)
                ctx["branch_name"] = branches[0].name
                session.state = WhatsAppSession.State.SELECT_SERVICE
                services = list(Service.objects.filter(tenant=tenant, is_active=True, public_bookable=True)[:6])
                reply = f"Welcome to *{tenant.name}*!\n\nPlease reply with the number of the service you'd like to book:\n"
                for idx, s in enumerate(services, 1):
                    reply += f"{idx}. {s.name} (${s.base_price} - {s.default_duration_minutes}m)\n"
                ctx["service_options"] = [str(s.id) for s in services]
            else:
                session.state = WhatsAppSession.State.SELECT_BRANCH
                reply = f"Welcome to *{tenant.name}*!\n\nPlease select your preferred branch:\n"
                for idx, b in enumerate(branches, 1):
                    reply += f"{idx}. {b.name} ({b.city})\n"
                ctx["branch_options"] = [str(b.id) for b in branches]

        elif session.state == WhatsAppSession.State.SELECT_BRANCH:
            branch_options = ctx.get("branch_options", [])
            try:
                choice_idx = int(text) - 1
                if 0 <= choice_idx < len(branch_options):
                    branch_id = branch_options[choice_idx]
                    branch = Branch.objects.get(id=branch_id)
                    ctx["branch_id"] = str(branch.id)
                    ctx["branch_name"] = branch.name
                    session.state = WhatsAppSession.State.SELECT_SERVICE
                    services = list(Service.objects.filter(tenant=tenant, is_active=True, public_bookable=True)[:6])
                    reply = f"Great! Selected *{branch.name}*.\n\nNow select a service:\n"
                    for idx, s in enumerate(services, 1):
                        reply += f"{idx}. {s.name} (Rs. {int(s.base_price):,} - {s.default_duration_minutes}m)\n"
                    ctx["service_options"] = [str(s.id) for s in services]
                else:
                    reply = "Invalid choice. Please reply with the number corresponding to your branch."
            except ValueError:
                reply = "Please send a number corresponding to your branch choice."

        elif session.state == WhatsAppSession.State.SELECT_SERVICE:
            service_options = ctx.get("service_options", [])
            try:
                choice_idx = int(text) - 1
                if 0 <= choice_idx < len(service_options):
                    service_id = service_options[choice_idx]
                    service = Service.objects.get(id=service_id)
                    ctx["service_id"] = str(service.id)
                    ctx["service_name"] = service.name
                    session.state = WhatsAppSession.State.SELECT_DATE
                    today = timezone.localdate()
                    dates = [today + timedelta(days=i) for i in range(1, 4)]
                    reply = f"Selected service: *{service.name}*.\n\nPlease pick a date for your appointment:\n"
                    for idx, d in enumerate(dates, 1):
                        reply += f"{idx}. {d.strftime('%A, %b %d')}\n"
                    ctx["date_options"] = [d.isoformat() for d in dates]
                else:
                    reply = "Invalid option. Please reply with the service number."
            except ValueError:
                reply = "Please reply with a valid number for the service."

        elif session.state == WhatsAppSession.State.SELECT_DATE:
            date_options = ctx.get("date_options", [])
            try:
                choice_idx = int(text) - 1
                if 0 <= choice_idx < len(date_options):
                    chosen_date = date_options[choice_idx]
                    ctx["date"] = chosen_date
                    session.state = WhatsAppSession.State.SELECT_SLOT
                    slots = AvailabilityService.get_available_slots(
                        branch_id=ctx["branch_id"],
                        service_ids=[ctx["service_id"]],
                        target_date=chosen_date,
                    )[:5]
                    if not slots:
                        reply = "No open slots on that date. Please send 'menu' to start over or pick another day."
                    else:
                        reply = f"Available times on *{chosen_date}*:\n"
                        for idx, sl in enumerate(slots, 1):
                            reply += f"{idx}. {sl['time']} (with {sl['staff_name']})\n"
                        ctx["slot_options"] = slots
                else:
                    reply = "Invalid selection. Please choose a date number."
            except ValueError:
                reply = "Please enter the number for your date preference."

        elif session.state == WhatsAppSession.State.SELECT_SLOT:
            slot_options = ctx.get("slot_options", [])
            try:
                choice_idx = int(text) - 1
                if 0 <= choice_idx < len(slot_options):
                    chosen_slot = slot_options[choice_idx]
                    ctx["slot"] = chosen_slot
                    session.state = WhatsAppSession.State.CONFIRM
                    reply = (
                        f"Please confirm your booking:\n"
                        f"• Branch: *{ctx.get('branch_name')}*\n"
                        f"• Service: *{ctx.get('service_name')}*\n"
                        f"• Time: *{chosen_slot['datetime']}*\n"
                        f"• Stylist: *{chosen_slot['staff_name']}*\n\n"
                        f"Please reply with your *Full Name* to confirm the appointment!"
                    )
                else:
                    reply = "Invalid slot choice. Please reply with the slot number."
            except ValueError:
                reply = "Please reply with the number corresponding to your time slot."

        elif session.state == WhatsAppSession.State.CONFIRM:
            customer_name = text
            chosen_slot = ctx["slot"]

            # Book appointment using core booking service
            appt = BookingService.book_appointment(
                branch_id=ctx["branch_id"],
                service_ids=[ctx["service_id"]],
                start_time_iso=chosen_slot["datetime"],
                customer_data={
                    "phone": phone,
                    "full_name": customer_name,
                    "whatsapp_opt_in": True,
                },
                preferred_staff_id=chosen_slot["staff_id"],
                source=Appointment.Source.WHATSAPP,
                notes="Booked via WhatsApp Assistant",
            )

            session.state = WhatsAppSession.State.COMPLETED
            ctx["booking_reference"] = appt.booking_reference
            reply = (
                f"🎉 *Booking Confirmed!*\n\n"
                f"Reference: *{appt.booking_reference}*\n"
                f"Customer: *{customer_name}*\n"
                f"Branch: *{appt.branch.name}*\n"
                f"Date & Time: *{appt.start_time.strftime('%Y-%m-%d %H:%M')}*\n"
                f"Staff: *{appt.primary_staff.full_name}*\n"
                f"Total Amount: *Rs. {int(appt.total_amount):,}*\n\n"
                f"Thank you for choosing {tenant.name}!"
            )

        elif session.state == WhatsAppSession.State.COMPLETED:
            session.state = WhatsAppSession.State.GREETING
            ctx = {}
            reply = "You already completed your booking. Send 'hi' to book another appointment!"

        session.context_data = ctx
        session.save()

        # Log to message table
        MessageLog.objects.create(
            tenant=tenant,
            channel="WHATSAPP",
            direction=MessageLog.Direction.OUTBOUND,
            recipient_phone=phone,
            content=reply,
            status=MessageLog.Status.SENT,
        )

        return reply


class BiometricAttendanceService:
    @staticmethod
    def ingest_punch_batch(branch, punches, device=None):
        """
        Ingests a list of raw punch dicts from biometric device or API:
        punches = [{"biometric_user_id": "101", "timestamp": "2026-10-15T09:02:00Z", "event_type": "CHECK_IN"}]
        Deduplicates via SHA-256 hash.
        Updates daily AttendanceSummary automatically.
        """
        imported = 0
        duplicated = 0
        tenant = branch.tenant

        for p in punches:
            bio_user_id = str(p.get("biometric_user_id", "")).strip()
            ts_str = p.get("timestamp")
            if isinstance(ts_str, str):
                ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            else:
                ts = ts_str
            if timezone.is_naive(ts):
                ts = timezone.make_aware(ts)

            device_id_str = str(device.id) if device else "MANUAL"
            dedup_hash = RawAttendanceEvent.generate_dedup_hash(device_id_str, bio_user_id, ts.isoformat())

            if RawAttendanceEvent.objects.filter(dedup_hash=dedup_hash).exists():
                duplicated += 1
                continue

            # Match staff
            staff = StaffProfile.objects.filter(tenant=tenant, biometric_user_id=bio_user_id, is_active=True).first()

            raw_event = RawAttendanceEvent.objects.create(
                tenant=tenant,
                branch=branch,
                device=device,
                staff=staff,
                biometric_user_id=bio_user_id,
                event_type=p.get("event_type", RawAttendanceEvent.EventType.CHECK_IN),
                timestamp=ts,
                external_event_id=p.get("external_event_id", ""),
                dedup_hash=dedup_hash,
                raw_payload=p,
            )
            imported += 1

            # Update AttendanceSummary for this staff member and date
            if staff:
                work_date = ts.date()
                summary, created = AttendanceSummary.objects.get_or_create(
                    branch=branch,
                    staff=staff,
                    work_date=work_date,
                    defaults={"status": AttendanceSummary.Status.PRESENT},
                )
                if not summary.first_check_in or ts < summary.first_check_in:
                    summary.first_check_in = ts
                if not summary.last_check_out or ts > summary.last_check_out:
                    summary.last_check_out = ts

                if summary.first_check_in and summary.last_check_out and summary.last_check_out > summary.first_check_in:
                    diff_mins = int((summary.last_check_out - summary.first_check_in).total_seconds() / 60)
                    summary.worked_minutes = diff_mins

                summary.save()

        return {"imported": imported, "duplicated": duplicated}


class BillingService:
    @staticmethod
    def create_invoice_for_appointment(appointment, issued_by_user):
        """Creates an issued Invoice from a completed or confirmed appointment."""
        with transaction.atomic():
            if hasattr(appointment, "invoice") and appointment.invoice:
                return appointment.invoice

            inv_number = f"INV-{uuid.uuid4().hex[:8].upper()}"
            invoice = Invoice.objects.create(
                tenant=appointment.tenant,
                branch=appointment.branch,
                customer=appointment.customer,
                appointment=appointment,
                invoice_number=inv_number,
                status=Invoice.Status.ISSUED,
                subtotal=appointment.subtotal_amount,
                tax_amount=appointment.tax_amount,
                total_amount=appointment.total_amount,
                amount_paid=Decimal("0.00"),
                issued_by=issued_by_user,
            )

            for item in appointment.items.all():
                InvoiceItem.objects.create(
                    invoice=invoice,
                    item_type=InvoiceItem.ItemType.SERVICE,
                    service=item.service,
                    staff=item.staff,
                    description=item.service_name_snapshot,
                    quantity=Decimal("1.00"),
                    unit_price=item.price,
                    total_price=item.price,
                )

            return invoice

    @staticmethod
    def record_payment(invoice_id, method, amount, received_by_user, reference_code=""):
        """Records single or split payment against an invoice."""
        with transaction.atomic():
            invoice = Invoice.objects.select_for_update().get(id=invoice_id)
            amt = Decimal(str(amount))

            payment = Payment.objects.create(
                invoice=invoice,
                branch=invoice.branch,
                method=method,
                amount=amt,
                reference_code=reference_code,
                received_by=received_by_user,
            )

            invoice.amount_paid += amt
            if invoice.amount_paid >= invoice.total_amount:
                invoice.status = Invoice.Status.PAID
            elif invoice.amount_paid > Decimal("0.00"):
                invoice.status = Invoice.Status.PARTIALLY_PAID
            invoice.save()

            return payment
