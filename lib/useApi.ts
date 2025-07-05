"use client"

import { useRouter } from "next/navigation";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./api";

export function useApi() {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  async function refreshAccessToken() {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error('No refresh token');
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) throw new Error('Refresh token invalid');
    const data = await res.json();
    if (!data.access) throw new Error('No access token in refresh response');
    setTokens({ access: data.access, refresh });
    return data.access;
  }

  function clearAllAuth() {
    clearTokens();
    // Remove accessToken cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    }
  }

  async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
    let accessToken = getAccessToken();
    console.log('Access token before fetch:', accessToken);
    // Attach access token if available
    const headers = new Headers(init.headers || {});
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    let res = await fetch(input, { ...init, headers });
    let data;
    try {
      data = await res.clone().json();
    } catch (e) {
      // If not JSON, just return the response
      return res;
    }
    // If token is invalid/expired, try to refresh and retry once
    if (data?.code === 'token_not_valid' || res.status === 401) {
      try {
        accessToken = await refreshAccessToken();
        console.log('Access token after refresh:', accessToken);
        headers.set('Authorization', `Bearer ${accessToken}`);
        res = await fetch(input, { ...init, headers });
        try {
          data = await res.clone().json();
        } catch (e) {
          return res;
        }
        // If still unauthorized, force logout
        if (data?.code === 'token_not_valid' || res.status === 401) {
          clearAllAuth();
          router.push('/');
          throw new Error('Token not valid after refresh');
        }
      } catch (refreshErr) {
        clearAllAuth();
        router.push('/');
        throw new Error('Token refresh failed');
      }
    }
    return data;
  }

  return apiFetch;
} 