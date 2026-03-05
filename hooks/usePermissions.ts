"use client";

import { useEffect, useState } from "react";

export interface Permissions {
    canMomo: boolean;
    canMobcash: boolean;
    canBulk: boolean;
}

const isFalsyPermission = (val: any): boolean => {
    if (val === false) return true;
    if (val === 0) return true;
    const str = String(val).toLowerCase().trim();
    if (str === "false" || str === "0") return true;
    return false;
};

const permissionsFromUser = (user: any): Permissions => ({
    canMomo: !isFalsyPermission(user?.can_process_momo),
    canMobcash: !isFalsyPermission(user?.can_process_mobcash),
    canBulk: !isFalsyPermission(user?.can_process_bulk_payment),
});

const getLocalPermissions = (): Permissions => {
    try {
        const userStr = localStorage.getItem("user");
        if (userStr) return permissionsFromUser(JSON.parse(userStr));
    } catch { /* ignore */ }
    return { canMomo: true, canMobcash: true, canBulk: true };
};

export const usePermissions = (): Permissions => {
    // Bootstrap immediately from localStorage so there is no flicker
    const [permissions, setPermissions] = useState<Permissions>(() => {
        if (typeof window !== "undefined") return getLocalPermissions();
        return { canMomo: true, canMobcash: true, canBulk: true };
    });

    useEffect(() => {
        const fetchFreshPermissions = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                if (!accessToken) return;

                const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
                const res = await fetch(`${baseUrl}/api/auth/profile/`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (!res.ok) return; // silently fall back to localStorage values

                const freshUser = await res.json();

                // Keep localStorage in sync with the latest profile data
                const existing = localStorage.getItem("user");
                const merged = existing
                    ? { ...JSON.parse(existing), ...freshUser }
                    : freshUser;
                localStorage.setItem("user", JSON.stringify(merged));

                setPermissions(permissionsFromUser(freshUser));
            } catch {
                // Network error — keep the localStorage-bootstrapped values
            }
        };

        fetchFreshPermissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return permissions;
};
