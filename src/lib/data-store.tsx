"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
    clubs as seedClubs,
    students as seedStudents,
    roles as seedRoles,
    memberships as seedMemberships,
    budgets as seedBudgets,
    events as seedEvents,
    registrations as seedRegistrations,
    attendances as seedAttendances,
    eventCoordinators as seedEventCoordinators,
} from "./mock-data";
import type { Club, Student, Role, Membership, Budget, Event, Registration, Attendance, EventCoordinator } from "./mock-data";

// Re-export types for convenience
export type { Club, Student, Role, Membership, Budget, Event, Registration, Attendance, EventCoordinator };

// ==================== STORE SHAPE ====================

interface DataState {
    clubs: Club[];
    students: Student[];
    roles: Role[];
    memberships: Membership[];
    budgets: Budget[];
    events: Event[];
    registrations: Registration[];
    attendances: Attendance[];
    eventCoordinators: EventCoordinator[];
}

const STORAGE_KEY = "clubsync_data";

function loadFromStorage(): DataState | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            // Migration: add eventCoordinators if missing from older cached data
            if (!parsed.eventCoordinators) {
                parsed.eventCoordinators = [...seedEventCoordinators];
            }
            return parsed;
        }
    } catch {
        // corrupted data — ignore
    }
    return null;
}

function saveToStorage(state: DataState) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // full storage — ignore
    }
}

function getInitialState(): DataState {
    return {
        clubs: [...seedClubs],
        students: [...seedStudents],
        roles: [...seedRoles],
        memberships: [...seedMemberships],
        budgets: [...seedBudgets],
        events: [...seedEvents],
        registrations: [...seedRegistrations],
        attendances: [...seedAttendances],
        eventCoordinators: [...seedEventCoordinators],
    };
}

// ==================== ID GENERATORS ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function nextId(arr: any[], idKey: string): number {
    return Math.max(0, ...arr.map((item) => (item[idKey] as number) || 0)) + 1;
}

// ==================== CONTEXT INTERFACE ====================

interface DataStoreContextType {
    // Raw data
    clubs: Club[];
    students: Student[];
    roles: Role[];
    memberships: Membership[];
    budgets: Budget[];
    events: Event[];
    registrations: Registration[];
    attendances: Attendance[];
    eventCoordinators: EventCoordinator[];

    // ---- Helpers (computed from state) ----
    getClubById: (id: number) => Club | undefined;
    getStudentById: (id: number) => Student | undefined;
    getRoleById: (id: number) => Role | undefined;
    getClubMembers: (clubId: number) => (Membership & { student?: Student; role?: Role })[];
    getClubEvents: (clubId: number) => Event[];
    getClubBudgets: (clubId: number) => Budget[];
    getEventRegistrations: (eventId: number) => (Registration & { student?: Student })[];
    getStudentClubs: (studentId: number) => (Membership & { club?: Club; role?: Role })[];
    getStudentRegistrations: (studentId: number) => (Registration & { event?: Event })[];
    getDashboardStats: () => {
        totalClubs: number;
        totalStudents: number;
        totalEvents: number;
        upcomingEvents: number;
        completedEvents: number;
        totalMembers: number;
        totalBudgetApproved: number;
        totalBudgetPending: number;
        totalRegistrations: number;
    };
    getClubMemberCounts: () => { clubName: string; members: number }[];
    getCategoryDistribution: () => { name: string; value: number }[];
    getBudgetByClub: () => { clubName: string; approved: number; pending: number; rejected: number }[];

    // ---- Actions ----
    joinClub: (studentId: number, clubId: number) => void;
    leaveClub: (membershipId: number) => void;
    changeMemberRole: (membershipId: number, roleId: number) => void;

    createEvent: (event: Omit<Event, "eventId">) => void;
    updateEvent: (eventId: number, updates: Partial<Event>) => void;
    deleteEvent: (eventId: number) => void;

    registerForEvent: (studentId: number, eventId: number) => void;
    unregisterFromEvent: (studentId: number, eventId: number) => void;

    requestBudget: (budget: Omit<Budget, "budgetId">) => void;
    approveBudget: (budgetId: number) => void;
    rejectBudget: (budgetId: number) => void;

    markAttendance: (eventId: number, studentId: number, status: Attendance["status"]) => void;

    createClub: (club: Omit<Club, "clubId">) => void;
    updateClub: (clubId: number, updates: Partial<Club>) => void;

    // Check helpers
    isStudentInClub: (studentId: number, clubId: number) => boolean;
    isStudentRegistered: (studentId: number, eventId: number) => boolean;
    canAssignRole: (clubId: number, roleId: number, excludeMembershipId?: number) => boolean;

    // Event Coordinators
    getEventCoordinators: (eventId: number) => (EventCoordinator & { student?: Student })[];
    assignEventCoordinator: (eventId: number, studentId: number) => void;
    removeEventCoordinator: (id: number) => void;
    isEventCoordinator: (eventId: number, studentId: number) => boolean;

    // Reset to seed data
    resetData: () => void;
}

const DataStoreContext = createContext<DataStoreContextType | null>(null);

// ==================== PROVIDER ====================

export function DataStoreProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<DataState>(getInitialState);
    const initialized = useRef(false);

    // Load from localStorage on mount (client-side only)
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        const stored = loadFromStorage();
        if (stored) {
            setData(stored);
        }
    }, []);

    // Save to localStorage on every change (except initial load)
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        saveToStorage(data);
    }, [data]);

    // ---- Helper functions ----

    const getClubById = useCallback((id: number) => data.clubs.find((c) => c.clubId === id), [data.clubs]);
    const getStudentById = useCallback((id: number) => data.students.find((s) => s.studentId === id), [data.students]);
    const getRoleById = useCallback((id: number) => data.roles.find((r) => r.roleId === id), [data.roles]);

    const getClubMembers = useCallback(
        (clubId: number) =>
            data.memberships
                .filter((m) => m.clubId === clubId)
                .map((m) => ({ ...m, student: data.students.find((s) => s.studentId === m.studentId), role: data.roles.find((r) => r.roleId === m.roleId) })),
        [data.memberships, data.students, data.roles]
    );

    const getClubEvents = useCallback((clubId: number) => data.events.filter((e) => e.clubId === clubId), [data.events]);
    const getClubBudgets = useCallback((clubId: number) => data.budgets.filter((b) => b.clubId === clubId), [data.budgets]);

    const getEventRegistrations = useCallback(
        (eventId: number) =>
            data.registrations
                .filter((r) => r.eventId === eventId)
                .map((r) => ({ ...r, student: data.students.find((s) => s.studentId === r.studentId) })),
        [data.registrations, data.students]
    );

    const getStudentClubs = useCallback(
        (studentId: number) =>
            data.memberships
                .filter((m) => m.studentId === studentId)
                .map((m) => ({ ...m, club: data.clubs.find((c) => c.clubId === m.clubId), role: data.roles.find((r) => r.roleId === m.roleId) })),
        [data.memberships, data.clubs, data.roles]
    );

    const getStudentRegistrations = useCallback(
        (studentId: number) =>
            data.registrations
                .filter((r) => r.studentId === studentId)
                .map((r) => ({ ...r, event: data.events.find((e) => e.eventId === r.eventId) })),
        [data.registrations, data.events]
    );

    const getDashboardStats = useCallback(() => {
        return {
            totalClubs: data.clubs.length,
            totalStudents: data.students.length,
            totalEvents: data.events.length,
            upcomingEvents: data.events.filter((e) => e.status === "upcoming").length,
            completedEvents: data.events.filter((e) => e.status === "completed").length,
            totalMembers: data.memberships.length,
            totalBudgetApproved: data.budgets.filter((b) => b.status === "approved").reduce((s, b) => s + b.amount, 0),
            totalBudgetPending: data.budgets.filter((b) => b.status === "pending").reduce((s, b) => s + b.amount, 0),
            totalRegistrations: data.registrations.length,
        };
    }, [data]);

    const getClubMemberCounts = useCallback(
        () => data.clubs.map((club) => ({ clubName: club.clubName, members: data.memberships.filter((m) => m.clubId === club.clubId).length })),
        [data.clubs, data.memberships]
    );

    const getCategoryDistribution = useCallback(() => {
        const map: Record<string, number> = {};
        data.clubs.forEach((c) => { map[c.category] = (map[c.category] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [data.clubs]);

    const getBudgetByClub = useCallback(() => {
        return data.clubs.map((club) => {
            const cb = data.budgets.filter((b) => b.clubId === club.clubId);
            return {
                clubName: club.clubName,
                approved: cb.filter((b) => b.status === "approved").reduce((s, b) => s + b.amount, 0),
                pending: cb.filter((b) => b.status === "pending").reduce((s, b) => s + b.amount, 0),
                rejected: cb.filter((b) => b.status === "rejected").reduce((s, b) => s + b.amount, 0),
            };
        });
    }, [data.clubs, data.budgets]);

    // ---- Check helpers ----

    const isStudentInClub = useCallback(
        (studentId: number, clubId: number) => data.memberships.some((m) => m.studentId === studentId && m.clubId === clubId),
        [data.memberships]
    );

    const isStudentRegistered = useCallback(
        (studentId: number, eventId: number) => data.registrations.some((r) => r.studentId === studentId && r.eventId === eventId),
        [data.registrations]
    );

    // ---- Mutators ----

    const joinClub = useCallback((studentId: number, clubId: number) => {
        setData((prev) => {
            if (prev.memberships.some((m) => m.studentId === studentId && m.clubId === clubId)) return prev;
            const memberRoleId = 5; // "Member" role
            const newMembership: Membership = {
                membershipId: nextId(prev.memberships, "membershipId"),
                studentId,
                clubId,
                roleId: memberRoleId,
                joinDate: new Date().toISOString().split("T")[0],
            };
            return { ...prev, memberships: [...prev.memberships, newMembership] };
        });
    }, []);

    const leaveClub = useCallback((membershipId: number) => {
        setData((prev) => ({
            ...prev,
            memberships: prev.memberships.filter((m) => m.membershipId !== membershipId),
        }));
    }, []);

    const changeMemberRole = useCallback((membershipId: number, roleId: number) => {
        setData((prev) => ({
            ...prev,
            memberships: prev.memberships.map((m) => (m.membershipId === membershipId ? { ...m, roleId } : m)),
        }));
    }, []);

    const createEvent = useCallback((event: Omit<Event, "eventId">) => {
        setData((prev) => ({
            ...prev,
            events: [...prev.events, { ...event, eventId: nextId(prev.events, "eventId") }],
        }));
    }, []);

    const updateEvent = useCallback((eventId: number, updates: Partial<Event>) => {
        setData((prev) => ({
            ...prev,
            events: prev.events.map((e) => (e.eventId === eventId ? { ...e, ...updates } : e)),
        }));
    }, []);

    const deleteEvent = useCallback((eventId: number) => {
        setData((prev) => ({
            ...prev,
            events: prev.events.filter((e) => e.eventId !== eventId),
            registrations: prev.registrations.filter((r) => r.eventId !== eventId),
            attendances: prev.attendances.filter((a) => a.eventId !== eventId),
        }));
    }, []);

    const registerForEvent = useCallback((studentId: number, eventId: number) => {
        setData((prev) => {
            if (prev.registrations.some((r) => r.studentId === studentId && r.eventId === eventId)) return prev;
            const newReg: Registration = {
                registrationId: nextId(prev.registrations, "registrationId"),
                eventId,
                studentId,
                registrationDate: new Date().toISOString(),
            };
            return { ...prev, registrations: [...prev.registrations, newReg] };
        });
    }, []);

    const unregisterFromEvent = useCallback((studentId: number, eventId: number) => {
        setData((prev) => ({
            ...prev,
            registrations: prev.registrations.filter((r) => !(r.studentId === studentId && r.eventId === eventId)),
        }));
    }, []);

    const requestBudget = useCallback((budget: Omit<Budget, "budgetId">) => {
        setData((prev) => ({
            ...prev,
            budgets: [...prev.budgets, { ...budget, budgetId: nextId(prev.budgets, "budgetId") }],
        }));
    }, []);

    const approveBudget = useCallback((budgetId: number) => {
        setData((prev) => ({
            ...prev,
            budgets: prev.budgets.map((b) => (b.budgetId === budgetId ? { ...b, status: "approved" as const } : b)),
        }));
    }, []);

    const rejectBudget = useCallback((budgetId: number) => {
        setData((prev) => ({
            ...prev,
            budgets: prev.budgets.map((b) => (b.budgetId === budgetId ? { ...b, status: "rejected" as const } : b)),
        }));
    }, []);

    const markAttendance = useCallback((eventId: number, studentId: number, status: Attendance["status"]) => {
        setData((prev) => {
            const existing = prev.attendances.find((a) => a.eventId === eventId && a.studentId === studentId);
            if (existing) {
                return {
                    ...prev,
                    attendances: prev.attendances.map((a) =>
                        a.eventId === eventId && a.studentId === studentId ? { ...a, status, checkInTime: new Date().toISOString() } : a
                    ),
                };
            }
            return {
                ...prev,
                attendances: [
                    ...prev.attendances,
                    {
                        attendanceId: nextId(prev.attendances, "attendanceId"),
                        eventId,
                        studentId,
                        status,
                        checkInTime: new Date().toISOString(),
                    },
                ],
            };
        });
    }, []);

    const createClub = useCallback((club: Omit<Club, "clubId">) => {
        setData((prev) => ({
            ...prev,
            clubs: [...prev.clubs, { ...club, clubId: nextId(prev.clubs, "clubId") }],
        }));
    }, []);

    const updateClub = useCallback((clubId: number, updates: Partial<Club>) => {
        setData((prev) => ({
            ...prev,
            clubs: prev.clubs.map((c) => (c.clubId === clubId ? { ...c, ...updates } : c)),
        }));
    }, []);

    // ---- Role validation ----

    const canAssignRole = useCallback(
        (clubId: number, roleId: number, excludeMembershipId?: number) => {
            // Secretary (3) and Treasurer (4) are unique per club
            if (roleId === 3 || roleId === 4) {
                return !data.memberships.some(
                    (m) => m.clubId === clubId && m.roleId === roleId && m.membershipId !== excludeMembershipId
                );
            }
            return true; // Members, Coordinator roles have no limit
        },
        [data.memberships]
    );

    // ---- Event Coordinators ----

    const getEventCoordinators = useCallback(
        (eventId: number) =>
            data.eventCoordinators
                .filter((ec) => ec.eventId === eventId)
                .map((ec) => ({ ...ec, student: data.students.find((s) => s.studentId === ec.studentId) })),
        [data.eventCoordinators, data.students]
    );

    const assignEventCoordinator = useCallback((eventId: number, studentId: number) => {
        setData((prev) => {
            if (prev.eventCoordinators.some((ec) => ec.eventId === eventId && ec.studentId === studentId)) return prev;
            const newEc: EventCoordinator = {
                id: nextId(prev.eventCoordinators, "id"),
                eventId,
                studentId,
            };
            return { ...prev, eventCoordinators: [...prev.eventCoordinators, newEc] };
        });
    }, []);

    const removeEventCoordinator = useCallback((id: number) => {
        setData((prev) => ({
            ...prev,
            eventCoordinators: prev.eventCoordinators.filter((ec) => ec.id !== id),
        }));
    }, []);

    const isEventCoordinator = useCallback(
        (eventId: number, studentId: number) =>
            data.eventCoordinators.some((ec) => ec.eventId === eventId && ec.studentId === studentId),
        [data.eventCoordinators]
    );

    const resetData = useCallback(() => {
        const fresh = getInitialState();
        setData(fresh);
        saveToStorage(fresh);
    }, []);

    return (
        <DataStoreContext.Provider
            value={{
                ...data,
                getClubById,
                getStudentById,
                getRoleById,
                getClubMembers,
                getClubEvents,
                getClubBudgets,
                getEventRegistrations,
                getStudentClubs,
                getStudentRegistrations,
                getDashboardStats,
                getClubMemberCounts,
                getCategoryDistribution,
                getBudgetByClub,
                joinClub,
                leaveClub,
                changeMemberRole,
                createEvent,
                updateEvent,
                deleteEvent,
                registerForEvent,
                unregisterFromEvent,
                requestBudget,
                approveBudget,
                rejectBudget,
                markAttendance,
                createClub,
                updateClub,
                isStudentInClub,
                isStudentRegistered,
                canAssignRole,
                getEventCoordinators,
                assignEventCoordinator,
                removeEventCoordinator,
                isEventCoordinator,
                resetData,
            }}
        >
            {children}
        </DataStoreContext.Provider>
    );
}

export function useDataStore() {
    const ctx = useContext(DataStoreContext);
    if (!ctx) throw new Error("useDataStore must be used inside DataStoreProvider");
    return ctx;
}
