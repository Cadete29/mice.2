function getDefaultApiUrl() {
  if (typeof window === "undefined") return "http://localhost:4002/api";
  const { protocol, hostname } = window.location;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  if (isLocalHost) return "http://localhost:4002/api";
  return `${protocol}//${hostname}/api`;
}
const API_URL = (import.meta.env.VITE_API_URL || getDefaultApiUrl()).replace(
  /\/$/,
  "",
);
const ACCESS_TOKEN_KEY = "micelo-access-token";
const CSRF_TOKEN_KEY = "micelo-csrf-token";
let refreshPromise = null;
let activeBeachEventPromise = null;
export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
const getToken = () => window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
const getCsrfToken = () => window.sessionStorage.getItem(CSRF_TOKEN_KEY);
const setToken = (token) => {
  if (token) window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  else window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.dispatchEvent(new Event("micelo-auth-change"));
};
const setSession = (accessToken, csrfToken) => {
  if (csrfToken) window.sessionStorage.setItem(CSRF_TOKEN_KEY, csrfToken);
  else window.sessionStorage.removeItem(CSRF_TOKEN_KEY);
  setToken(accessToken);
};
async function parseResponse(response) {
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      data.error?.message || "No fue posible completar la solicitud.",
      data.error?.code,
      response.status,
    );
  return data;
}
async function request(path, options = {}, retry = true) {
  const headers = {
    ...options.headers,
  };
  const token = getToken();
  if (options.body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  if (
    response.status === 401 &&
    retry &&
    !["/auth/login", "/auth/refresh"].includes(path)
  ) {
    const refreshed = await refreshSession().catch(() => null);
    if (refreshed) return request(path, options, false);
  }
  return parseResponse(response);
}
export async function login(credentials) {
  const data = await request(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    },
    false,
  );
  if (data.mfaRequired) return data;
  setSession(data.accessToken, data.csrfToken);
  return {
    user: data.user,
  };
}
export async function completeMfaLogin(mfaToken, code) {
  const data = await request(
    "/auth/mfa/verify",
    {
      method: "POST",
      body: JSON.stringify({
        mfaToken,
        code,
      }),
    },
    false,
  );
  setSession(data.accessToken, data.csrfToken);
  return data.user;
}
export async function register(profile) {
  const data = await request(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(profile),
    },
    false,
  );
  return data;
}
async function performRefresh() {
  const csrfToken = getCsrfToken();
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: csrfToken
      ? {
          "X-CSRF-Token": csrfToken,
        }
      : {},
  });
  if (!response.ok) {
    setSession(null, null);
    return null;
  }
  const data = await response.json();
  setSession(data.accessToken, data.csrfToken);
  return data.user;
}
export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
export async function getCurrentUser() {
  if (!getToken()) return refreshSession();
  const data = await request("/auth/me");
  return data.user;
}
export const saveProfilePhoto = (photo) =>
  request("/auth/profile/photo", {
    method: "PUT",
    body: JSON.stringify({
      photo,
    }),
  });
export const deleteProfilePhoto = () =>
  request("/auth/profile/photo", {
    method: "DELETE",
  });
export const saveProfileDetails = (details) =>
  request("/auth/profile/details", {
    method: "PUT",
    body: JSON.stringify(details),
  });
export async function logout() {
  const csrfToken = getCsrfToken();
  try {
    await request(
      "/auth/logout",
      {
        method: "POST",
        headers: csrfToken
          ? {
              "X-CSRF-Token": csrfToken,
            }
          : {},
      },
      false,
    );
  } finally {
    setSession(null, null);
  }
}
export const forgotPassword = (correoElectronico) =>
  request(
    "/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({
        correoElectronico,
      }),
    },
    false,
  );
export const resetPassword = (token, password) =>
  request(
    "/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify({
        token,
        password,
      }),
    },
    false,
  );
export const verifyEmail = (token) =>
  request(
    "/auth/verify-email",
    {
      method: "POST",
      body: JSON.stringify({
        token,
      }),
    },
    false,
  );
export const resendVerification = (correoElectronico) =>
  request(
    "/auth/resend-verification",
    {
      method: "POST",
      body: JSON.stringify({
        correoElectronico,
      }),
    },
    false,
  );
export const hasAccessToken = () => Boolean(getToken());
export const getMfaStatus = () => request("/auth/mfa/status");
export const beginMfaSetup = () =>
  request("/auth/mfa/setup", {
    method: "POST",
  });
export const enableMfa = (code) =>
  request("/auth/mfa/enable", {
    method: "POST",
    body: JSON.stringify({
      code,
    }),
  });
export const disableMfa = (code) =>
  request("/auth/mfa/disable", {
    method: "POST",
    body: JSON.stringify({
      code,
    }),
  });
export const listUsers = ({ search = "", page = 1 } = {}) =>
  request(`/admin/users?search=${encodeURIComponent(search)}&page=${page}`);
export const changeUserRole = (userId, role) =>
  request(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({
      role,
    }),
  });
export const changeUserStatus = (userId, active) =>
  request(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      active,
    }),
  });
export const getUserConsents = (userId) =>
  request(`/admin/users/${userId}/consents`);
export const listProjects = () => request("/projects");
export const getProject = (projectId) => request(`/projects/${projectId}`);
export const getPublicProfile = (userId) =>
  request(`/projects/profiles/${userId}`);
export const listMyProjects = () => request("/projects/mine");
export const createProject = (project) =>
  request("/projects", {
    method: "POST",
    body: JSON.stringify(project),
  });
export const updateProject = (projectId, project) =>
  request(`/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(project),
  });
export const deleteOwnProject = (projectId) =>
  request(`/projects/${projectId}`, {
    method: "DELETE",
  });
export const getSocialProfile = () => request("/projects/profile/social");
export const saveSocialProfile = (profile) =>
  request("/projects/profile/social", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
export const listAdminProjects = () => request("/admin/projects");
export const deleteProject = (projectId) =>
  request(`/admin/projects/${projectId}`, {
    method: "DELETE",
  });
export const listCalls = () => request("/calls");
export const getCall = (id) => request(`/calls/${id}`);
export const createCall = (call) =>
  request("/calls", {
    method: "POST",
    body: JSON.stringify(call),
  });
export const deleteCall = (id) =>
  request(`/calls/${id}`, {
    method: "DELETE",
  });
export const listAdminCalls = () => request("/calls/admin/list");
export const getAdminCall = (id) => request(`/calls/admin/${id}`);
export const updateCall = (id, call) =>
  request(`/calls/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(call),
  });
export const setCallVisibility = (id, activa) =>
  request(`/calls/admin/${id}/visibility`, {
    method: "PATCH",
    body: JSON.stringify({
      activa,
    }),
  });
export const applyToCall = (id) =>
  request(`/calls/${id}/apply`, {
    method: "POST",
  });
export const listMyApplications = () => request("/calls/mine");
export const listCallApplications = () => request("/calls/admin/applications");
export const updateApplicationStatus = (id, estado) =>
  request(`/calls/admin/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      estado,
    }),
  });
export const deleteCallApplication = (id) =>
  request(`/calls/admin/applications/${id}`, {
    method: "DELETE",
  });
export const createBeachRegistration = (registration) =>
  request(
    "/beach-registrations",
    {
      method: "POST",
      body: JSON.stringify(registration),
    },
    false,
  );
export const getActiveBeachEvent = () => {
  if (!activeBeachEventPromise)
    activeBeachEventPromise = request(
      "/beach-registrations/active",
      { cache: "no-store" },
      false,
    ).catch((error) => {
      activeBeachEventPromise = null;
      throw error;
    }).finally(() => {
      activeBeachEventPromise = null;
    });
  return activeBeachEventPromise;
};
export const listBeachRegistrations = (eventId) =>
  request(
    `/beach-registrations/admin${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ""}`,
  );
export const listBeachEvents = () =>
  request("/beach-registrations/admin/events");
export const createBeachEvent = (event) =>
  request("/beach-registrations/admin/events", {
    method: "POST",
    body: JSON.stringify(event),
  });
export const getBeachEvent = (id) => request(`/beach-registrations/admin/events/${id}`, { cache: 'no-store' });
export const updateBeachEvent = (id, event) => request(`/beach-registrations/admin/events/${id}`, { method: 'PATCH', body: JSON.stringify(event) });
export const setBeachEventStatus = (id, status) =>
  request(`/beach-registrations/admin/events/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
    }),
  });
export const listCategories = () => request("/categories");
export const createCategory = (nombre) =>
  request("/categories", {
    method: "POST",
    body: JSON.stringify({
      nombre,
    }),
  });
export const deleteCategory = (id) =>
  request(`/categories/${id}`, {
    method: "DELETE",
  });
export const listCallCategories = () => request("/call-categories");
export const createCallCategory = (nombre) =>
  request("/call-categories", {
    method: "POST",
    body: JSON.stringify({
      nombre,
    }),
  });
export const deleteCallCategory = (id) =>
  request(`/call-categories/${id}`, {
    method: "DELETE",
  });
export const sendContactMessage = (message) =>
  request(
    "/contact",
    {
      method: "POST",
      body: JSON.stringify(message),
    },
    false,
  );
export const sendFamilyContactMessage = (message) =>
  request(
    "/contact/family",
    {
      method: "POST",
      body: JSON.stringify(message),
    },
    false,
  );
export const getSessions = () => request("/auth/sessions");
export async function revokeSession(sessionId, isCurrent = false) {
  await request(`/auth/sessions/${sessionId}`, {
    method: "DELETE",
  });
  if (isCurrent) setSession(null, null);
}
export async function logoutAllSessions() {
  const result = await request("/auth/logout-all", {
    method: "POST",
  });
  setSession(null, null);
  return result;
}

export const sendParticipantEmails = (id, content) => request(`/beach-registrations/admin/events/${id}/emails`, { method: 'POST', body: JSON.stringify(content) });
export const listParticipantEmails = (id) => request(`/beach-registrations/admin/events/${id}/emails`, { cache: 'no-store' });
