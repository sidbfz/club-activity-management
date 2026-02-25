"use client";

import { useState } from "react";
import { useDataStore } from "@/lib/data-store";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Search,
    GraduationCap,
    Mail,
    Building2,
    CalendarDays,
    Lock,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";

export default function StudentsPage() {
    const [search, setSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState<string>("all");
    const [yearFilter, setYearFilter] = useState<string>("all");
    const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
    const { hasPermission, roleInfo } = useAuth();
    const store = useDataStore();

    const canViewStudents = hasPermission("member_view_records");

    if (!canViewStudents) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-fade-in-up">
                <Card className="max-w-md border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8 text-center space-y-4">
                        <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-red-600/20 to-rose-600/20 flex items-center justify-center">
                            <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold">Access Restricted</h2>
                        <p className="text-sm text-muted-foreground">
                            As a <span className={`font-medium ${roleInfo.color}`}>{roleInfo.shortLabel}</span>,
                            you don&apos;t have access to the student directory.
                            This section is available to club officers.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const departments = Array.from(new Set(store.students.map((s) => s.department)));
    const years = Array.from(new Set(store.students.map((s) => s.year))).sort();

    const filtered = store.students.filter((s) => {
        const matchesSearch =
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase());
        const matchesDept =
            deptFilter === "all" || s.department === deptFilter;
        const matchesYear =
            yearFilter === "all" || s.year.toString() === yearFilter;
        return matchesSearch && matchesDept && matchesYear;
    });

    const activeStudent = selectedStudent
        ? store.students.find((s) => s.studentId === selectedStudent)
        : null;
    const activeClubs = selectedStudent
        ? store.getStudentClubs(selectedStudent)
        : [];
    const activeRegs = selectedStudent
        ? store.getStudentRegistrations(selectedStudent)
        : [];

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                <p className="text-muted-foreground mt-1">
                    Directory of {store.students.length} registered students
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card/50 border-border/40"
                    />
                </div>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                    <SelectTrigger className="w-[200px] bg-card/50 border-border/40">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((d) => (
                            <SelectItem key={d} value={d}>
                                {d}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-[140px] bg-card/50 border-border/40">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {years.map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                                Year {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Student Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((student) => {
                    const clubCount = store.getStudentClubs(student.studentId).length;
                    return (
                        <Dialog
                            key={student.studentId}
                            open={selectedStudent === student.studentId}
                            onOpenChange={(open) =>
                                setSelectedStudent(open ? student.studentId : null)
                            }
                        >
                            <DialogTrigger asChild>
                                <Card className="glow-card border-border/40 bg-card/50 backdrop-blur-sm cursor-pointer hover:bg-card/70 hover:-translate-y-1 transition-all duration-300 group">
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-11 w-11">
                                                <AvatarFallback className="font-bold text-sm bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                                                    {student.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate group-hover:text-violet-600 dark:text-violet-400 transition-colors">
                                                    {student.name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground font-mono">
                                                    {student.rollNumber}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                                                {student.department} • Year {student.year}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                                                <span className="truncate">{student.email}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-1">
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 dark:border-violet-500/20"
                                            >
                                                {clubCount} club{clubCount !== 1 ? "s" : ""}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </DialogTrigger>

                            <DialogContent className="max-w-md max-h-[80vh] overflow-auto bg-card border-border/40">
                                {activeStudent && (
                                    <>
                                        <DialogHeader>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarFallback className="font-bold bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                                                        {activeStudent.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <DialogTitle>{activeStudent.name}</DialogTitle>
                                                    <DialogDescription className="font-mono">
                                                        {activeStudent.rollNumber}
                                                    </DialogDescription>
                                                </div>
                                            </div>
                                        </DialogHeader>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="p-3 rounded-lg bg-muted/20 space-y-1">
                                                <p className="text-[11px] text-muted-foreground">
                                                    Department
                                                </p>
                                                <p className="font-medium text-xs">
                                                    {activeStudent.department}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/20 space-y-1">
                                                <p className="text-[11px] text-muted-foreground">
                                                    Year
                                                </p>
                                                <p className="font-medium text-xs">
                                                    Year {activeStudent.year}
                                                </p>
                                            </div>
                                        </div>

                                        <Tabs defaultValue="clubs" className="mt-2">
                                            <TabsList className="bg-muted/50">
                                                <TabsTrigger value="clubs" className="text-xs">
                                                    <Building2 className="h-3 w-3 mr-1" /> Clubs (
                                                    {activeClubs.length})
                                                </TabsTrigger>
                                                <TabsTrigger value="events" className="text-xs">
                                                    <CalendarDays className="h-3 w-3 mr-1" /> Events (
                                                    {activeRegs.length})
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="clubs" className="mt-4 space-y-2">
                                                {activeClubs.map((mc) => (
                                                    <div
                                                        key={mc.membershipId}
                                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
                                                    >
                                                        <div
                                                            className={`h-8 w-8 rounded-lg bg-gradient-to-br ${mc.club?.coverColor} flex items-center justify-center text-white text-xs font-bold`}
                                                        >
                                                            {mc.club?.clubName.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium">
                                                                {mc.club?.clubName}
                                                            </p>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                Since{" "}
                                                                {new Date(mc.joinDate).toLocaleDateString(
                                                                    "en-IN",
                                                                    {
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    }
                                                                )}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[10px] ${mc.role?.roleType === "admin"
                                                                ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 dark:border-violet-500/20"
                                                                : ""
                                                                }`}
                                                        >
                                                            {mc.role?.roleName}
                                                        </Badge>
                                                    </div>
                                                ))}
                                                {activeClubs.length === 0 && (
                                                    <p className="text-sm text-muted-foreground text-center py-4">
                                                        Not a member of any club
                                                    </p>
                                                )}
                                            </TabsContent>

                                            <TabsContent value="events" className="mt-4 space-y-2">
                                                {activeRegs.map((r) => (
                                                    <div
                                                        key={r.registrationId}
                                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
                                                    >
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                                                            <CalendarDays className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium">
                                                                {r.event?.eventName}
                                                            </p>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                {r.event?.eventDate
                                                                    ? new Date(
                                                                        r.event.eventDate
                                                                    ).toLocaleDateString("en-IN", {
                                                                        day: "numeric",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    })
                                                                    : ""}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[10px] capitalize ${r.event?.status === "upcoming"
                                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/20"
                                                                : "bg-muted text-muted-foreground"
                                                                }`}
                                                        >
                                                            {r.event?.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                                {activeRegs.length === 0 && (
                                                    <p className="text-sm text-muted-foreground text-center py-4">
                                                        Not registered for any events
                                                    </p>
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                    );
                })}
            </div>
        </div>
    );
}
