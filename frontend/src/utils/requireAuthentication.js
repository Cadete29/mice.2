import { hasAccessToken } from "../services/authApi";
export function requireAuthentication(event) {
  if (hasAccessToken()) return true;
  event?.preventDefault();
  window.location.href = "/sign-up";
  return false;
}
