"use client";

import { useEffect, useState } from "react";

export interface Permissions {
    canMomo: boolean;
    canMobcash: boolean;
    canBulk: boolean;
}

export const usePermissions = (): Permissions => {
    const [permissions, setPermissions] = useState<Permissions>({
        canMomo: true,
        canMobcash: true,
        canBulk: true,
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const isFalsyPermission = (val: any): boolean => {
                        if (val === false) return true;
                        if (val === 0) return true;
                        const str = String(val).toLowerCase().trim();
                        if (str === "false" || str === "0") return true;
                        return false;
                    };
                    setPermissions({
                        canMomo: !isFalsyPermission(user?.can_process_momo),
                        canMobcash: !isFalsyPermission(user?.can_process_mobcash),
                        canBulk: !isFalsyPermission(user?.can_process_bulk_payment),
                    });
                }
            } catch (error) {
                console.error("Error parsing user from localStorage for permissions:", error);
            }
        }
    }, []);

    return permissions;
};
