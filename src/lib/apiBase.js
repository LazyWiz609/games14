// Runtime-safe API base resolver
// Priority:
// 1) VITE_API_BASE (from .env or .env.production at build time)
// 2) Fallback to same-origin backend path: `${window.location.origin}/backend/api`

export function getApiBase() {
  const envBase = import.meta.env?.VITE_API_BASE;
  if (envBase && envBase.trim()) return envBase;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/backend/api`;
  }
  // In non-browser environments, default to local dev
  return 'http://localhost/14-18/backend/api';
}
