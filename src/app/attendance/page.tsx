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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Search,
    ClipboardCheck,
    CheckCircle2,
    XCircle,
    Clock,
    UserCheck,
    UserX,
    AlertTriangle,
    Lock,
    ClipboardEdit,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const statusBadge: Record<string, { color: string; icon: React.ElementType }> = {
    present: {
        color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: CheckCircle2,
    },
    absent: {
        color: "bg-red-500/10 text-red-400 border-red-500/20",
        icon: XCircle,
    },
    late: {
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        icon: AlertTriangle,
    },
};

export default function AttendancePage() {
    const [search, setSearch] = useState("");
    const [eventFilter, setEventFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { hasPermission, isOwnClub, activeClub, role, roleInfo, currentUser } =
        useAuth();
    const store = useDataStore();

    const canView = hasPermission("attendance_view");
    const canMarkOthers = hasPermission("attendance_mark_others");
    const canMarkSelf = hasPermission("attendance_mark_self");

    if (!canView) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-fade-in-up">
                <Card className="max-w-md border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8 text-center space-y-4">
                        <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-red-600/20 to-rose-600/20 flex items-center justify-center">
                            <Lock className="h-8 w-8 text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold">Access Restricted</h2>
                        <p className="text-sm text-muted-foreground">
                            As a{" "}
                            <span className={`font-medium ${roleInfo.color}`}>
                                {roleInfo.shortLabel}
                            </span>
                            , you don&apos;t have permission to view attendance records.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Only show events that have attendance records
    const eventsWithAttendance = store.events.filter((e) =>
        store.attendances.some((a) => a.eventId === e.eventId)
    );

    const enriched = store.attendances.map((a) => ({
        ...a,
        student: store.getStudentById(a.studentId),
        event: store.events.find((e) => e.eventId === a.eventId),
    }));

    // Members can only see their own attendance
    const scopedData =
        role === "student"
            ? enriched.filter(
                (a) => a.studentId === currentUser!.student.studentId
            )
            : enriched;

    const filtered = scopedData.filter((a) => {
        const matchesSearch =
            a.student?.name.toLowerCase().includes(search.toLowerCase()) ||
            a.event?.eventName.toLowerCase().includes(search.toLowerCase());
        const matchesEvent =
            eventFilter === "all" || a.eventId.toString() === eventFilter;
        const matchesStatus =
            statusFilter === "all" || a.status === statusFilter;
        return matchesSearch && matchesEvent && matchesStatus;
    });

    const presentCount = scopedData.filter((a) => a.status === "present").length;
    const absentCount = scopedData.filter((a) => a.status === "absent").length;
    const lateCount = scopedData.filter((a) => a.status === "late").length;

    const summaryCards = [
        {
            title: "Total Records",
            value: scopedData.length,
            icon: ClipboardCheck,
            gradient: "from-violet-600/20 to-indigo-600/20",
            iconColor: "text-violet-400",
        },
        {
            title: "Present",
            value: presentCount,
            icon: UserCheck,
            gradient: "from-emerald-600/20 to-teal-600/20",
            iconColor: "text-emerald-400",
        },
        {
            title: "Late",
            value: lateCount,
            icon: Clock,
            gradient: "from-amber-600/20 to-orange-600/20",
            iconColor: "text-amber-400",
        },
        {
            title: "Absent",
            value: absentCount,
            icon: UserX,
            gradient: "from-red-600/20 to-rose-600/20",
            iconColor: "text-red-400",
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
                    <p className="text-muted-foreground mt-1">
                        {role === "student"
                            ? "Your personal attendance records"
                            : "Track event attendance records"}
                    </p>
                </div>
                {canMarkOthers && (
                    <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-600/20">
                        <ClipboardEdit className="h-4 w-4 mr-2" />
                        Mark Attendance
                    </Button>
                )}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((card) => (
                    <Card
                        key={card.title}
                        className="border-border/40 bg-card/50 backdrop-blur-sm"
                    >
                        <CardContent className="p-5 flex items-center gap-4">
                            <div
                                className={`rounded-xl bg-gradient-to-br ${card.gradient} p-2.5`}
                            >
                                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{card.value}</p>
                                <p className="text-xs text-muted-foreground">{card.title}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by student or event..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card/50 border-border/40"
                    />
                </div>
                <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="w-[200px] bg-card/50 border-border/40">
                        <SelectValue placeholder="Filter by event" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        {eventsWithAttendance.map((e) => (
                            <SelectItem key={e.eventId} value={e.eventId.toString()}>
                                {e.eventName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] bg-card/50 border-border/40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Attendance Table */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/40 hover:bg-transparent">
                                <TableHead className="text-xs">Student</TableHead>
                                <TableHead className="text-xs">Event</TableHead>
                                <TableHead className="text-xs">Club</TableHead>
                                <TableHead className="text-xs">Check-in Time</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                {canMarkOthers && (
                                    <TableHead className="text-xs text-right">Actions</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((a) => {
                                const club = a.event ? store.getClubById(a.event.clubId) : null;
                                const sc = statusBadge[a.status];
                                const StatusIcon = sc.icon;
                                const isOwn = club ? isOwnClub(club.clubId) : false;
                                return (
                                    <TableRow
                                        key={a.attendanceId}
                                        className={`border-border/40 hover:bg-muted/20 ${isOwn ? "bg-violet-500/[0.03]" : ""
                                            }`}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                                                        {a.student?.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {a.student?.name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {a.student?.department}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {a.event?.eventName}
                                        </TableCell>
                                        <TableCell>
                                            {club && (
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`h-6 w-6 rounded-md bg-gradient-to-br ${club.coverColor} flex items-center justify-center text-white text-[10px] font-bold`}
                                                    >
                                                        {club.clubName.charAt(0)}
                                                    </div>
                                                    <span className="text-sm">{club.clubName}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(a.checkInTime).toLocaleTimeString("en-IN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                            <span className="text-[11px] ml-1">
                                                (
                                                {new Date(a.checkInTime).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                                )
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] capitalize ${sc.color}`}
                                            >
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {a.status}
                                            </Badge>
                                        </TableCell>
                                        {canMarkOthers && (
                                            <TableCell className="text-right">
                                                {isOwn && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            No attendance records found
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
