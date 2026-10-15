const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    // On Vercel, relative /api/v1 calls the embedded serverless cloud API
    return "/api/v1";
  }
  return "http://localhost:8000/api/v1";
};

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("salon_access_token");
}

export function getCurrentUser(): any | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("salon_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken() && !!getCurrentUser();
}

export function setSession(access: string, refresh: string, user: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem("salon_access_token", access);
  localStorage.setItem("salon_refresh_token", refresh);
  localStorage.setItem("salon_user", JSON.stringify(user));
  
  // Set cookie for Next.js middleware protection (7 days)
  document.cookie = `salon_authenticated=true; path=/; max-age=604800; SameSite=Lax`;
  document.cookie = `salon_token=${access}; path=/; max-age=604800; SameSite=Lax`;

  // Branch assignment isolation
  const branchRoles = user.branch_roles || [];
  if (branchRoles.length === 1 && user.system_role !== "BUSINESS_OWNER" && user.system_role !== "PLATFORM_ADMIN") {
    localStorage.setItem("salon_active_branch", branchRoles[0].branch_id);
  } else if (!localStorage.getItem("salon_active_branch")) {
    localStorage.setItem("salon_active_branch", "all");
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("salon_access_token");
  localStorage.removeItem("salon_refresh_token");
  localStorage.removeItem("salon_user");
  localStorage.removeItem("salon_active_branch");
  
  // Clear auth cookies
  document.cookie = "salon_authenticated=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "salon_token=; path=/; max-age=0; SameSite=Lax";
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (typeof window !== "undefined") {
    const token = getAuthToken();
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkErr: any) {
    throw new Error(networkErr.message || "Network error. Please check your internet connection.");
  }

  // Handle unauthorized or expired tokens
  if (response.status === 401 && typeof window !== "undefined") {
    const isAuthRoute = endpoint.includes("/auth/login/");
    if (!isAuthRoute) {
      clearSession();
      // If currently on a dashboard route, redirect to login
      if (window.location.pathname.startsWith("/dashboard")) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&expired=1`;
      }
      throw new Error("Your session has expired. Please sign in again.");
    }
  }

  if (!response.ok) {
    let errorDetail = `HTTP Error ${response.status}`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch (e) {
      // ignore non-json error
    }
    throw new Error(errorDetail);
  }

  return response.json();
}
