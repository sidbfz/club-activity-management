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
import { supabase } from "./supabase";

export type { Club, Student, Role, Membership, Budget, Event, Registration, Attendance, EventCoordinator };

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
        if (raw) return JSON.parse(raw);
    } catch { }
    return null;
}

function saveToStorage(state: DataState) {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { }
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function nextId(arr: any[], idKey: string): number {
    return Math.max(0, ...arr.map((item) => (item[idKey] as number) || 0)) + 1;
}

interface DataStoreContextType extends DataState {
    getClubById: (id: number) => Club | undefined;
    getStudentById: (id: number) => Student | undefined;
    getRoleById: (id: number) => Role | undefined;
    getClubMembers: (clubId: number) => (Membership & { student?: Student; role?: Role })[];
    getClubEvents: (clubId: number) => Event[];
    getClubBudgets: (clubId: number) => Budget[];
    getEventRegistrations: (eventId: number) => (Registration & { student?: Student })[];
    getStudentClubs: (studentId: number) => (Membership & { club?: Club; role?: Role })[];
    getStudentRegistrations: (studentId: number) => (Registration & { event?: Event })[];
    getDashboardStats: () => any;
    getClubMemberCounts: () => { clubName: string; members: number }[];
    getCategoryDistribution: () => { name: string; value: number }[];
    getBudgetByClub: () => { clubName: string; approved: number; pending: number; rejected: number }[];

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
    isStudentInClub: (studentId: number, clubId: number) => boolean;
    isStudentRegistered: (studentId: number, eventId: number) => boolean;
    canAssignRole: (clubId: number, roleId: number, excludeMembershipId?: number) => boolean;
    getEventCoordinators: (eventId: number) => (EventCoordinator & { student?: Student })[];
    assignEventCoordinator: (eventId: number, studentId: number) => void;
    removeEventCoordinator: (id: number) => void;
    isEventCoordinator: (eventId: number, studentId: number) => boolean;
    resetData: () => void;
}

const DataStoreContext = createContext<DataStoreContextType | null>(null);

export function DataStoreProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<DataState>(getInitialState);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initSupabase = async () => {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (!supabaseUrl) {
                // Fallback to local storage if no Supabase URL is found
                const stored = loadFromStorage();
                if (stored) setData(stored);
                return;
            }

            try {
                // Fetch clubs first to see if DB is seeded
                const { data: dbClubs, error } = await supabase.from('clubs').select('*');
                if (error) throw error;

                if (!dbClubs || dbClubs.length === 0) {
                    // Seed the database from mock data if it's empty
                    console.log("Seeding Supabase DB...");
                    await supabase.from('clubs').insert(seedClubs);
                    await supabase.from('students').insert(seedStudents);
                    await supabase.from('roles').insert(seedRoles);
                    await supabase.from('memberships').insert(seedMemberships);
                    await supabase.from('budgets').insert(seedBudgets);
                    await supabase.from('events').insert(seedEvents);
                    await supabase.from('registrations').insert(seedRegistrations);
                    await supabase.from('attendances').insert(seedAttendances);
                    await supabase.from('event_coordinators').insert(seedEventCoordinators);

                    // Proceed to fetch seeded data
                    window.location.reload();
                    return;
                }

                // If DB is populated, fetch all data
                const [
                    { data: students },
                    { data: roles },
                    { data: memberships },
                    { data: budgets },
                    { data: events },
                    { data: registrations },
                    { data: attendances },
                    { data: eventCoordinators }
                ] = await Promise.all([
                    supabase.from('students').select('*'),
                    supabase.from('roles').select('*'),
                    supabase.from('memberships').select('*'),
                    supabase.from('budgets').select('*'),
                    supabase.from('events').select('*'),
                    supabase.from('registrations').select('*'),
                    supabase.from('attendances').select('*'),
                    supabase.from('event_coordinators').select('*')
                ]);

                setData({
                    clubs: dbClubs || [],
                    students: students || [],
                    roles: roles || [],
                    memberships: memberships || [],
                    budgets: budgets || [],
                    events: events || [],
                    registrations: registrations || [],
                    attendances: attendances || [],
                    eventCoordinators: eventCoordinators || [],
                });
            } catch (err) {
                console.error("Error fetching from Supabase, falling back to local storage:", err);
                const stored = loadFromStorage();
                if (stored) setData(stored);
            }
        };

        initSupabase();
    }, []);

    // Save to localStorage as backup on every change 
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        saveToStorage(data);
    }, [data]);

    // Helpers
    const getClubById = useCallback((id: number) => data.clubs.find((c) => c.clubId === id), [data.clubs]);
    const getStudentById = useCallback((id: number) => data.students.find((s) => s.studentId === id), [data.students]);
    const getRoleById = useCallback((id: number) => data.roles.find((r) => r.roleId === id), [data.roles]);

    const getClubMembers = useCallback((clubId: number) => data.memberships.filter((m) => m.clubId === clubId).map((m) => ({ ...m, student: data.students.find((s) => s.studentId === m.studentId), role: data.roles.find((r) => r.roleId === m.roleId) })), [data.memberships, data.students, data.roles]);
    const getClubEvents = useCallback((clubId: number) => data.events.filter((e) => e.clubId === clubId), [data.events]);
    const getClubBudgets = useCallback((clubId: number) => data.budgets.filter((b) => b.clubId === clubId), [data.budgets]);
    const getEventRegistrations = useCallback((eventId: number) => data.registrations.filter((r) => r.eventId === eventId).map((r) => ({ ...r, student: data.students.find((s) => s.studentId === r.studentId) })), [data.registrations, data.students]);
    const getStudentClubs = useCallback((studentId: number) => data.memberships.filter((m) => m.studentId === studentId).map((m) => ({ ...m, club: data.clubs.find((c) => c.clubId === m.clubId), role: data.roles.find((r) => r.roleId === m.roleId) })), [data.memberships, data.clubs, data.roles]);
    const getStudentRegistrations = useCallback((studentId: number) => data.registrations.filter((r) => r.studentId === studentId).map((r) => ({ ...r, event: data.events.find((e) => e.eventId === r.eventId) })), [data.registrations, data.events]);

    const getDashboardStats = useCallback(() => ({
        totalClubs: data.clubs.length,
        totalStudents: data.students.length,
        totalEvents: data.events.length,
        upcomingEvents: data.events.filter((e) => e.status === "upcoming").length,
        completedEvents: data.events.filter((e) => e.status === "completed").length,
        totalMembers: data.memberships.length,
        totalBudgetApproved: data.budgets.filter((b) => b.status === "approved").reduce((s, b) => s + b.amount, 0),
        totalBudgetPending: data.budgets.filter((b) => b.status === "pending").reduce((s, b) => s + b.amount, 0),
        totalRegistrations: data.registrations.length,
    }), [data]);

    const getClubMemberCounts = useCallback(() => data.clubs.map((club) => ({ clubName: club.clubName, members: data.memberships.filter((m) => m.clubId === club.clubId).length })), [data.clubs, data.memberships]);
    const getCategoryDistribution = useCallback(() => {
        const map: Record<string, number> = {};
        data.clubs.forEach((c) => { map[c.category] = (map[c.category] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [data.clubs]);

    const getBudgetByClub = useCallback(() => data.clubs.map((club) => {
        const cb = data.budgets.filter((b) => b.clubId === club.clubId);
        return {
            clubName: club.clubName,
            approved: cb.filter((b) => b.status === "approved").reduce((s, b) => s + b.amount, 0),
            pending: cb.filter((b) => b.status === "pending").reduce((s, b) => s + b.amount, 0),
            rejected: cb.filter((b) => b.status === "rejected").reduce((s, b) => s + b.amount, 0),
        };
    }), [data.clubs, data.budgets]);

    const isStudentInClub = useCallback((studentId: number, clubId: number) => data.memberships.some((m) => m.studentId === studentId && m.clubId === clubId), [data.memberships]);
    const isStudentRegistered = useCallback((studentId: number, eventId: number) => data.registrations.some((r) => r.studentId === studentId && r.eventId === eventId), [data.registrations]);

    // Mutators with Optimistic UI & Supabase sync
    const joinClub = useCallback((studentId: number, clubId: number) => {
        setData((prev) => {
            if (prev.memberships.some((m) => m.studentId === studentId && m.clubId === clubId)) return prev;
            const newMembership = { membershipId: nextId(prev.memberships, "membershipId"), studentId, clubId, roleId: 5, joinDate: new Date().toISOString().split("T")[0] };
            supabase.from('memberships').insert([newMembership]).then();
            return { ...prev, memberships: [...prev.memberships, newMembership] };
        });
    }, []);

    const leaveClub = useCallback((membershipId: number) => {
        setData((prev) => ({ ...prev, memberships: prev.memberships.filter((m) => m.membershipId !== membershipId) }));
        supabase.from('memberships').delete().eq('membershipId', membershipId).then();
    }, []);

    const changeMemberRole = useCallback((membershipId: number, roleId: number) => {
        setData((prev) => ({ ...prev, memberships: prev.memberships.map((m) => (m.membershipId === membershipId ? { ...m, roleId } : m)) }));
        supabase.from('memberships').update({ roleId }).eq('membershipId', membershipId).then();
    }, []);

    const createEvent = useCallback((event: Omit<Event, "eventId">) => {
        setData((prev) => {
            const newEvent = { ...event, eventId: nextId(prev.events, "eventId") };
            supabase.from('events').insert([newEvent]).then();
            return { ...prev, events: [...prev.events, newEvent] };
        });
    }, []);

    const updateEvent = useCallback((eventId: number, updates: Partial<Event>) => {
        setData((prev) => ({ ...prev, events: prev.events.map((e) => (e.eventId === eventId ? { ...e, ...updates } : e)) }));
        supabase.from('events').update(updates).eq('eventId', eventId).then();
    }, []);

    const deleteEvent = useCallback((eventId: number) => {
        setData((prev) => ({
            ...prev, events: prev.events.filter((e) => e.eventId !== eventId),
            registrations: prev.registrations.filter((r) => r.eventId !== eventId),
            attendances: prev.attendances.filter((a) => a.eventId !== eventId),
        }));
        supabase.from('events').delete().eq('eventId', eventId).then();
    }, []);

    const registerForEvent = useCallback((studentId: number, eventId: number) => {
        setData((prev) => {
            if (prev.registrations.some((r) => r.studentId === studentId && r.eventId === eventId)) return prev;
            const newReg = { registrationId: nextId(prev.registrations, "registrationId"), eventId, studentId, registrationDate: new Date().toISOString() };
            supabase.from('registrations').insert([newReg]).then();
            return { ...prev, registrations: [...prev.registrations, newReg] };
        });
    }, []);

    const unregisterFromEvent = useCallback((studentId: number, eventId: number) => {
        setData((prev) => ({ ...prev, registrations: prev.registrations.filter((r) => !(r.studentId === studentId && r.eventId === eventId)) }));
        supabase.from('registrations').delete().eq('studentId', studentId).eq('eventId', eventId).then();
    }, []);

    const requestBudget = useCallback((budget: Omit<Budget, "budgetId">) => {
        setData((prev) => {
            const newBudget = { ...budget, budgetId: nextId(prev.budgets, "budgetId") };
            supabase.from('budgets').insert([newBudget]).then();
            return { ...prev, budgets: [...prev.budgets, newBudget] };
        });
    }, []);

    const approveBudget = useCallback((budgetId: number) => {
        setData((prev) => ({ ...prev, budgets: prev.budgets.map((b) => (b.budgetId === budgetId ? { ...b, status: "approved" as const } : b)) }));
        supabase.from('budgets').update({ status: 'approved' }).eq('budgetId', budgetId).then();
    }, []);

    const rejectBudget = useCallback((budgetId: number) => {
        setData((prev) => ({ ...prev, budgets: prev.budgets.map((b) => (b.budgetId === budgetId ? { ...b, status: "rejected" as const } : b)) }));
        supabase.from('budgets').update({ status: 'rejected' }).eq('budgetId', budgetId).then();
    }, []);

    const markAttendance = useCallback((eventId: number, studentId: number, status: Attendance["status"]) => {
        setData((prev) => {
            const existing = prev.attendances.find((a) => a.eventId === eventId && a.studentId === studentId);
            const ts = new Date().toISOString();
            if (existing) {
                supabase.from('attendances').update({ status, checkInTime: ts }).eq('attendanceId', existing.attendanceId).then();
                return { ...prev, attendances: prev.attendances.map((a) => a.attendanceId === existing.attendanceId ? { ...a, status, checkInTime: ts } : a) };
            }
            const newAtt = { attendanceId: nextId(prev.attendances, "attendanceId"), eventId, studentId, status, checkInTime: ts };
            supabase.from('attendances').insert([newAtt]).then();
            return { ...prev, attendances: [...prev.attendances, newAtt] };
        });
    }, []);

    const createClub = useCallback((club: Omit<Club, "clubId">) => {
        setData((prev) => {
            const newClub = { ...club, clubId: nextId(prev.clubs, "clubId") };
            supabase.from('clubs').insert([newClub]).then();
            return { ...prev, clubs: [...prev.clubs, newClub] };
        });
    }, []);

    const updateClub = useCallback((clubId: number, updates: Partial<Club>) => {
        setData((prev) => ({ ...prev, clubs: prev.clubs.map((c) => (c.clubId === clubId ? { ...c, ...updates } : c)) }));
        supabase.from('clubs').update(updates).eq('clubId', clubId).then();
    }, []);

    const canAssignRole = useCallback((clubId: number, roleId: number, excludeMembershipId?: number) => {
        if (roleId === 3 || roleId === 4) return !data.memberships.some((m) => m.clubId === clubId && m.roleId === roleId && m.membershipId !== excludeMembershipId);
        return true;
    }, [data.memberships]);

    const getEventCoordinators = useCallback((eventId: number) => data.eventCoordinators.filter((ec) => ec.eventId === eventId).map((ec) => ({ ...ec, student: data.students.find((s) => s.studentId === ec.studentId) })), [data.eventCoordinators, data.students]);

    const assignEventCoordinator = useCallback((eventId: number, studentId: number) => {
        setData((prev) => {
            if (prev.eventCoordinators.some((ec) => ec.eventId === eventId && ec.studentId === studentId)) return prev;
            const newEc = { id: nextId(prev.eventCoordinators, "id"), eventId, studentId };
            supabase.from('event_coordinators').insert([newEc]).then();
            return { ...prev, eventCoordinators: [...prev.eventCoordinators, newEc] };
        });
    }, []);

    const removeEventCoordinator = useCallback((id: number) => {
        setData((prev) => ({ ...prev, eventCoordinators: prev.eventCoordinators.filter((ec) => ec.id !== id) }));
        supabase.from('event_coordinators').delete().eq('id', id).then();
    }, []);

    const isEventCoordinator = useCallback((eventId: number, studentId: number) => data.eventCoordinators.some((ec) => ec.eventId === eventId && ec.studentId === studentId), [data.eventCoordinators]);

    const resetData = useCallback(() => {
        const fresh = getInitialState();
        setData(fresh);
        saveToStorage(fresh);
    }, []);

    return (
        <DataStoreContext.Provider value={{ ...data, getClubById, getStudentById, getRoleById, getClubMembers, getClubEvents, getClubBudgets, getEventRegistrations, getStudentClubs, getStudentRegistrations, getDashboardStats, getClubMemberCounts, getCategoryDistribution, getBudgetByClub, joinClub, leaveClub, changeMemberRole, createEvent, updateEvent, deleteEvent, registerForEvent, unregisterFromEvent, requestBudget, approveBudget, rejectBudget, markAttendance, createClub, updateClub, isStudentInClub, isStudentRegistered, canAssignRole, getEventCoordinators, assignEventCoordinator, removeEventCoordinator, isEventCoordinator, resetData }}>
            {children}
        </DataStoreContext.Provider>
    );
}

export function useDataStore() {
    const ctx = useContext(DataStoreContext);
    if (!ctx) throw new Error("useDataStore must be used inside DataStoreProvider");
    return ctx;
}
