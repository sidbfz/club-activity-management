"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { students, getClubById } from "./mock-data";
import type { Student, Club } from "./mock-data";

// ==================== ROLE TYPES ====================
// Everyone is a Student. Admin is the only system-level role.
// Students get club-specific roles (President, VP, etc.) through Memberships.

export type AppRole =
    | "admin"
    | "president"
    | "vice_president"
    | "secretary"
    | "treasurer"
    | "event_coordinator"
    | "student"; // default — any student, whether in a club or not

export interface RoleInfo {
    id: AppRole;
    label: string;
    shortLabel: string;
    description: string;
    color: string;
    gradientBg: string;
}

export const APP_ROLES: RoleInfo[] = [
    {
        id: "admin",
        label: "System Admin",
        shortLabel: "Admin",
        description:
            "Full system access — manage all clubs, events, budgets, users, and settings",
        color: "text-yellow-600 dark:text-yellow-400",
        gradientBg: "from-yellow-500 to-amber-600",
    },
    {
        id: "president",
        label: "Club President",
        shortLabel: "President",
        description:
            "Full club access — manage events, members, budgets, attendance, and club profile",
        color: "text-red-600 dark:text-red-400",
        gradientBg: "from-red-600 to-rose-600",
    },
    {
        id: "vice_president",
        label: "Vice President",
        shortLabel: "Vice President",
        description:
            "Deputy leader — manage events, members, attendance, and assist president",
        color: "text-violet-600 dark:text-violet-400",
        gradientBg: "from-violet-600 to-indigo-600",
    },
    {
        id: "secretary",
        label: "Secretary",
        shortLabel: "Secretary",
        description:
            "Administrative support — manage registrations, attendance, announcements",
        color: "text-sky-600 dark:text-sky-400",
        gradientBg: "from-sky-500 to-blue-600",
    },
    {
        id: "treasurer",
        label: "Treasurer",
        shortLabel: "Treasurer",
        description:
            "Financial management — request budgets, track expenses, view reports",
        color: "text-amber-600 dark:text-amber-400",
        gradientBg: "from-amber-500 to-orange-600",
    },
    {
        id: "event_coordinator",
        label: "Event Coordinator",
        shortLabel: "Coordinator",
        description:
            "Event management — create events, mark attendance, view registrations",
        color: "text-emerald-600 dark:text-emerald-400",
        gradientBg: "from-emerald-600 to-teal-600",
    },
    {
        id: "student",
        label: "Student",
        shortLabel: "Student",
        description:
            "Browse clubs, join any club, register for events, view attendance",
        color: "text-purple-600 dark:text-purple-400",
        gradientBg: "from-purple-500 to-fuchsia-600",
    },
];

// ==================== PERMISSIONS ====================

export type Permission =
    // Club management
    | "club_create"
    | "club_edit_profile"
    | "club_view_all"
    | "club_view_analytics"
    // Member management
    | "member_add"
    | "member_remove"
    | "member_change_role"
    | "member_view_records"
    // Event management
    | "event_create"
    | "event_edit"
    | "event_delete"
    | "event_view_registrations"
    | "event_view_analytics"
    // Registration
    | "registration_manage"
    | "registration_self_register"
    // Attendance
    | "attendance_mark_others"
    | "attendance_mark_self"
    | "attendance_view"
    // Budget
    | "budget_request"
    | "budget_approve"
    | "budget_view_history"
    | "budget_track_expenses"
    | "budget_view_analytics"
    // Announcements
    | "announcement_post"
    | "announcement_post_with_approval"
    | "announcement_view"
    // Dashboard / Analytics
    | "dashboard_view"
    | "dashboard_full_analytics"
    // General
    | "profile_view_own"
    | "feedback_submit"
    | "certificate_generate"
    | "join_club_request";

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
    admin: [
        "club_create", "club_edit_profile", "club_view_all", "club_view_analytics",
        "event_create", "event_edit", "event_delete", "event_view_registrations", "event_view_analytics",
        "member_add", "member_remove", "member_change_role", "member_view_records",
        "attendance_mark_others", "attendance_mark_self", "attendance_view",
        "budget_request", "budget_approve", "budget_view_history", "budget_track_expenses", "budget_view_analytics",
        "announcement_post", "announcement_view",
        "registration_manage", "registration_self_register",
        "dashboard_view", "dashboard_full_analytics",
        "profile_view_own", "feedback_submit", "certificate_generate", "join_club_request",
    ],
    president: [
        "club_edit_profile", "club_view_all", "club_view_analytics",
        "event_create", "event_edit", "event_delete", "event_view_registrations", "event_view_analytics",
        "member_add", "member_remove", "member_change_role", "member_view_records",
        "attendance_mark_others", "attendance_mark_self", "attendance_view",
        "budget_request", "budget_view_history", "budget_track_expenses", "budget_view_analytics",
        "announcement_post", "announcement_view",
        "registration_manage", "registration_self_register",
        "dashboard_view", "dashboard_full_analytics",
        "profile_view_own", "feedback_submit", "certificate_generate",
        "join_club_request",
    ],
    vice_president: [
        "club_view_all", "club_view_analytics",
        "event_create", "event_edit", "event_delete", "event_view_registrations", "event_view_analytics",
        "member_add", "member_remove", "member_view_records",
        "attendance_mark_others", "attendance_mark_self", "attendance_view",
        "announcement_post", "announcement_view",
        "registration_manage", "registration_self_register",
        "dashboard_view", "dashboard_full_analytics",
        "profile_view_own", "feedback_submit",
        "join_club_request",
    ],
    secretary: [
        "club_view_all",
        "event_view_registrations", "event_view_analytics",
        "member_view_records",
        "attendance_mark_others", "attendance_mark_self", "attendance_view",
        "announcement_post_with_approval", "announcement_view",
        "registration_manage", "registration_self_register",
        "dashboard_view",
        "profile_view_own", "feedback_submit",
        "join_club_request",
    ],
    treasurer: [
        "club_view_all",
        "budget_request", "budget_view_history", "budget_track_expenses", "budget_view_analytics",
        "announcement_view",
        "registration_self_register",
        "attendance_mark_self", "attendance_view",
        "dashboard_view",
        "profile_view_own", "feedback_submit",
        "join_club_request",
    ],
    event_coordinator: [
        "club_view_all",
        "event_create", "event_edit", "event_view_registrations", "event_view_analytics",
        "attendance_mark_others", "attendance_mark_self", "attendance_view",
        "announcement_view",
        "registration_manage", "registration_self_register",
        "dashboard_view",
        "profile_view_own", "feedback_submit",
        "join_club_request",
    ],
    student: [
        "club_view_all",
        "attendance_mark_self", "attendance_view",
        "announcement_view",
        "registration_self_register",
        "join_club_request",
        "profile_view_own", "feedback_submit",
    ],
};

// ==================== DEMO USER PROFILES ====================

export interface UserProfile {
    student: Student;
    role: AppRole;
    clubId?: number; // the club this student has a role in (for club-specific roles)
}

// Pre-defined demo profiles for quick login
export const DEMO_PROFILES: UserProfile[] = [
    {
        student: students[9], // Diya Kapoor — Admin
        role: "admin",
    },
    {
        student: students[0], // Aarav Sharma — President of CodeCraft
        role: "president",
        clubId: 1,
    },
    {
        student: students[3], // Priya Patel — Vice President of CodeCraft
        role: "vice_president",
        clubId: 1,
    },
    {
        student: students[13], // Kavya Nair — Secretary of Artistry
        role: "secretary",
        clubId: 2,
    },
    {
        student: students[5], // Sneha Reddy — Treasurer of EcoVerse
        role: "treasurer",
        clubId: 3,
    },
    {
        student: students[12], // Nikhil Joshi — Event Coordinator at CodeCraft
        role: "event_coordinator",
        clubId: 1,
    },
    {
        student: students[2], // Rohan Kumar — Regular Student
        role: "student",
    },
];

// ==================== NAV VISIBILITY PER ROLE ====================

export interface NavItem {
    href: string;
    label: string;
    requiredPermissions: Permission[]; // user needs at least one
}

export const NAV_ITEMS: NavItem[] = [
    { href: "/", label: "Dashboard", requiredPermissions: ["dashboard_view"] },
    { href: "/clubs", label: "Clubs", requiredPermissions: ["club_view_all"] },
    { href: "/events", label: "Events", requiredPermissions: ["club_view_all"] },
    { href: "/members", label: "Members", requiredPermissions: ["member_view_records"] },
    { href: "/students", label: "Students", requiredPermissions: ["member_view_records"] },
    { href: "/budget", label: "Budget", requiredPermissions: ["budget_view_history", "budget_request"] },
    { href: "/attendance", label: "Attendance", requiredPermissions: ["attendance_view"] },
];

// ==================== CONTEXT ====================

interface AuthContextType {
    currentUser: UserProfile | null;
    isAuthenticated: boolean;
    login: (profile: UserProfile) => void;
    logout: () => void;
    hasPermission: (permission: Permission) => boolean;
    hasAnyPermission: (...permissions: Permission[]) => boolean;
    role: AppRole;
    roleInfo: RoleInfo;
    activeClub: Club | undefined;
    isOwnClub: (clubId: number) => boolean;
    canAccessNav: (item: NavItem) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

    const isAuthenticated = currentUser !== null;

    const login = useCallback((profile: UserProfile) => {
        setCurrentUser(profile);
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
    }, []);

    const currentRole = currentUser?.role ?? "student";

    const hasPermission = useCallback(
        (permission: Permission) => {
            if (!currentUser) return false;
            return ROLE_PERMISSIONS[currentUser.role]?.includes(permission) ?? false;
        },
        [currentUser]
    );

    const hasAnyPermission = useCallback(
        (...permissions: Permission[]) => {
            if (!currentUser) return false;
            return permissions.some((p) =>
                ROLE_PERMISSIONS[currentUser.role]?.includes(p) ?? false
            );
        },
        [currentUser]
    );

    const roleInfo =
        APP_ROLES.find((r) => r.id === currentRole) ?? APP_ROLES[0];

    const activeClub = currentUser?.clubId
        ? getClubById(currentUser.clubId)
        : undefined;

    const isOwnClub = useCallback(
        (clubId: number) => {
            if (!currentUser) return false;
            // Admin has access to ALL clubs
            if (currentUser.role === "admin") return true;
            // Students without a club role don't own any club
            if (!currentUser.clubId) return false;
            return currentUser.clubId === clubId;
        },
        [currentUser]
    );

    const canAccessNav = useCallback(
        (item: NavItem) => {
            if (!currentUser) return false;
            return item.requiredPermissions.some((p) =>
                ROLE_PERMISSIONS[currentUser.role]?.includes(p) ?? false
            );
        },
        [currentUser]
    );

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isAuthenticated,
                login,
                logout,
                hasPermission,
                hasAnyPermission,
                role: currentRole,
                roleInfo,
                activeClub,
                isOwnClub,
                canAccessNav,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
