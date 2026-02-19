"use client"

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/providers/language-provider";
import { extractErrorMessages } from "@/components/ui/error-display";

export function useApi() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const refreshAccessToken = useCallback(async () => {
    const refresh = getRefreshToken();
    if (!refresh) {
      console.log('No refresh token available');
      throw new Error('No refresh token available');
    }

    try {
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.log('Refresh token request failed:', res.status, errorData);
        throw new Error(errorData?.detail || 'Refresh token invalid');
      }

      const data = await res.json();
      if (!data.access) {
        console.log('No access token in refresh response');
        throw new Error('No access token in refresh response');
      }

      setTokens({ access: data.access, refresh });
      console.log('Token refreshed successfully');
      return data.access;
    } catch (error) {
      console.log('Refresh token error:', error);
      // Clear auth and redirect on any refresh error
      clearAllAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      throw error;
    }
  }, [baseUrl]);

  const clearAllAuth = useCallback(() => {
    clearTokens();
    // Remove accessToken cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
      // Clear localStorage authentication flag
      localStorage.removeItem("isAuthenticated");
    }
  }, []);

  const apiFetch = useCallback(async (input: RequestInfo, init: RequestInit = {}) => {
    let accessToken = getAccessToken();

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
        console.log('Token expired, attempting refresh...');
        accessToken = await refreshAccessToken();
        headers.set('Authorization', `Bearer ${accessToken}`);

        // Retry the original request with new token
        res = await fetch(input, { ...init, headers });
        try {
          data = await res.clone().json();
        } catch (e) {
          return res;
        }

        // If still unauthorized after refresh, force logout
        if (data?.code === 'token_not_valid' || res.status === 401) {
          console.log('Token refresh failed, logging out...');
          clearAllAuth();
          // Force redirect to root page on authentication failure
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          } else {
            router.push('/');
          }
          throw new Error('Authentication failed after token refresh');
        }
      } catch (refreshErr) {
        console.log('Token refresh error:', refreshErr);
        clearAllAuth();
        // Force redirect to root page on token refresh failure
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        } else {
          router.push('/');
        }
        throw new Error('Token refresh failed');
      }
    }

    // Automatic Toast Handling
    const method = init.method || 'GET';
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());

    // If the response is an error, throw it so it can be handled by the calling component
    if (!res.ok) {
      const errorMessage = extractErrorMessages(data);
      toast({
        title: t("common.error") || "Error",
        description: errorMessage,
        variant: "destructive",
      });
      // Throw the full data object so error extraction works locally if needed
      throw data;
    }

    // Success Toast for mutations
    if (isMutation) {
      toast({
        title: t("common.success") || "Success",
        description: data?.message || t("common.operationSuccessful") || "Operation completed successfully",
      });
    }

    return data;
  }, [refreshAccessToken, clearAllAuth, router, t, toast]);

  return apiFetch;
}