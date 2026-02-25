"use client";

import { useAuth } from "@/lib/auth-context";
import AppShell from "@/components/app-shell";
import LoginPage from "@/app/login/page";

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return <AppShell>{children}</AppShell>;
}
