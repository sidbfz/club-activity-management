"use client";

import { useParams, useRouter } from "next/navigation";
import { useDataStore } from "@/lib/data-store";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft,
    CalendarDays,
    MapPin,
    Clock,
    Users,
    Ticket,
    UserPlus,
    UserMinus,
    CheckCircle2,
    Edit,
    Trash2,
    Lock,
    Building2,
    AlertCircle,
    Shield,
} from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
    upcoming: {
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10 border-emerald-500/20",
        label: "Upcoming",
    },
    ongoing: {
        color: "text-amber-400",
        bgColor: "bg-amber-500/10 border-amber-500/20",
        label: "Ongoing",
    },
    completed: {
        color: "text-muted-foreground",
        bgColor: "bg-muted border-border/40",
        label: "Completed",
    },
};

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const store = useDataStore();
    const { hasPermission, isOwnClub, currentUser } = useAuth();
    const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
    const [showEditEvent, setShowEditEvent] = useState(false);

    const eventId = Number(params.id);
    const event = store.events.find((e) => e.eventId === eventId);

    if (!event) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-fade-in-up">
                <Card className="max-w-md border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8 text-center space-y-4">
                        <h2 className="text-xl font-bold">Event Not Found</h2>
                        <p className="text-sm text-muted-foreground">
                            The event you&apos;re looking for doesn&apos;t exist.
                        </p>
                        <Button variant="outline" onClick={() => router.push("/events")}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const club = store.getClubById(event.clubId);
    const registrations = store.getEventRegistrations(eventId);
    const regCount = registrations.length;
    const fillPercent = (regCount / event.maxParticipants) * 100;
    const studentId = currentUser?.student.studentId;
    const isRegistered = studentId ? store.isStudentRegistered(studentId, eventId) : false;
    const ownClub = isOwnClub(event.clubId);
    const canSelfRegister = hasPermission("registration_self_register");
    const canViewRegistrations = hasPermission("event_view_registrations");
    const canEdit = hasPermission("event_edit") && ownClub;
    const canDelete = hasPermission("event_delete") && ownClub;
    const canManageCoordinators = (hasPermission("member_change_role") || hasPermission("event_edit")) && ownClub;
    const status = statusConfig[event.status || "upcoming"];
    const coordinators = store.getEventCoordinators(eventId);
    const clubMembers = store.getClubMembers(event.clubId);
    const [showAssignCoord, setShowAssignCoord] = useState(false);

    const eventDate = new Date(event.eventDate);
    const isPast = eventDate < new Date();
    const isFull = regCount >= event.maxParticipants;

    const showToast = (message: string, type: "success" | "info" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleRegister = () => {
        if (!studentId) return;
        store.registerForEvent(studentId, eventId);
        showToast("Registered successfully! 🎉");
    };

    const handleUnregister = () => {
        if (!studentId) return;
        store.unregisterFromEvent(studentId, eventId);
        showToast("Registration cancelled", "info");
    };

    const handleDelete = () => {
        store.deleteEvent(eventId);
        router.push("/events");
    };

    // Edit event state - initialized from current event data
    const eventDateStr = event.eventDate ? event.eventDate.split("T")[0] : "";
    const eventTimeStr = event.eventDate && event.eventDate.includes("T")
        ? event.eventDate.split("T")[1]?.substring(0, 5) || ""
        : "";
    const [editEvent, setEditEvent] = useState<{
        eventName: string;
        eventDate: string;
        eventTime: string;
        venue: string;
        maxParticipants: string;
        description: string;
        status: "upcoming" | "ongoing" | "completed";
    }>({
        eventName: event.eventName,
        eventDate: eventDateStr,
        eventTime: eventTimeStr,
        venue: event.venue,
        maxParticipants: String(event.maxParticipants),
        description: event.description || "",
        status: event.status || "upcoming",
    });

    const handleEditEvent = () => {
        if (!editEvent.eventName || !editEvent.eventDate || !editEvent.venue) return;
        const dateTime = editEvent.eventTime
            ? `${editEvent.eventDate}T${editEvent.eventTime}:00`
            : `${editEvent.eventDate}T10:00:00`;
        store.updateEvent(eventId, {
            eventName: editEvent.eventName,
            eventDate: dateTime,
            venue: editEvent.venue,
            maxParticipants: Number(editEvent.maxParticipants) || 50,
            description: editEvent.description,
            status: editEvent.status as "upcoming" | "ongoing" | "completed",
        });
        setShowEditEvent(false);
        showToast(`Event updated! ✨`);
    };

    return (
        <div className="space-y-8 animate-fade-in-up max-w-4xl">
            {/* Toast */}
            {toast && (
                <div className="fixed top-20 right-6 z-50 animate-fade-in-up">
                    <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-xl ${toast.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-sky-500/10 border-sky-500/30 text-sky-400"
                            }`}
                    >
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Back Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/events")}
                className="text-muted-foreground hover:text-foreground -ml-2"
            >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Events
            </Button>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Badge
                            variant="outline"
                            className={`text-[11px] capitalize ${status.bgColor}`}
                        >
                            {status.label}
                        </Badge>
                        {isRegistered && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> You&apos;re Registered
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{event.eventName}</h1>
                    {club && (
                        <Link
                            href={`/clubs/${club.clubId}`}
                            className="flex items-center gap-2 group w-fit"
                        >
                            <div
                                className={`h-7 w-7 rounded-lg bg-gradient-to-br ${club.coverColor} flex items-center justify-center text-white text-xs font-bold`}
                            >
                                {club.clubName.charAt(0)}
                            </div>
                            <span className="text-sm text-muted-foreground group-hover:text-violet-400 transition-colors">
                                {club.clubName}
                            </span>
                            <Building2 className="h-3 w-3 text-muted-foreground group-hover:text-violet-400 transition-colors" />
                        </Link>
                    )}
                </div>
                <div className="flex gap-2">
                    {canEdit && (
                        <Dialog open={showEditEvent} onOpenChange={(open) => {
                            setShowEditEvent(open);
                            if (open) {
                                const d = event.eventDate ? event.eventDate.split("T")[0] : "";
                                const t = event.eventDate && event.eventDate.includes("T")
                                    ? event.eventDate.split("T")[1]?.substring(0, 5) || ""
                                    : "";
                                setEditEvent({
                                    eventName: event.eventName,
                                    eventDate: d,
                                    eventTime: t,
                                    venue: event.venue,
                                    maxParticipants: String(event.maxParticipants),
                                    description: event.description || "",
                                    status: event.status || "upcoming",
                                });
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-xs gap-1.5">
                                    <Edit className="h-3 w-3" /> Edit
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md bg-card border-border/40">
                                <DialogHeader>
                                    <DialogTitle>Edit Event</DialogTitle>
                                    <DialogDescription>
                                        Update details for {event.eventName}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-2 max-h-[65vh] overflow-y-auto pr-1">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Event Name *</Label>
                                        <Input
                                            value={editEvent.eventName}
                                            onChange={(e) => setEditEvent({ ...editEvent, eventName: e.target.value })}
                                            className="bg-muted/20 border-border/40"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Date *</Label>
                                            <Input
                                                type="date"
                                                value={editEvent.eventDate}
                                                onChange={(e) => setEditEvent({ ...editEvent, eventDate: e.target.value })}
                                                className="bg-muted/20 border-border/40"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Time</Label>
                                            <Input
                                                type="time"
                                                value={editEvent.eventTime}
                                                onChange={(e) => setEditEvent({ ...editEvent, eventTime: e.target.value })}
                                                className="bg-muted/20 border-border/40"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Venue *</Label>
                                        <Input
                                            value={editEvent.venue}
                                            onChange={(e) => setEditEvent({ ...editEvent, venue: e.target.value })}
                                            className="bg-muted/20 border-border/40"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Max Participants</Label>
                                            <Input
                                                type="number"
                                                value={editEvent.maxParticipants}
                                                onChange={(e) => setEditEvent({ ...editEvent, maxParticipants: e.target.value })}
                                                className="bg-muted/20 border-border/40"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Status</Label>
                                            <Select
                                                value={editEvent.status}
                                                onValueChange={(val) => setEditEvent({ ...editEvent, status: val as "upcoming" | "ongoing" | "completed" })}
                                            >
                                                <SelectTrigger className="bg-muted/20 border-border/40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                                    <SelectItem value="ongoing">Ongoing</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Description</Label>
                                        <Input
                                            value={editEvent.description}
                                            onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                                            className="bg-muted/20 border-border/40"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleEditEvent}
                                        disabled={!editEvent.eventName || !editEvent.eventDate || !editEvent.venue}
                                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                                    >
                                        <Edit className="h-4 w-4 mr-2" /> Save Changes
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                    {canDelete && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-xs gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                    )}
                    {canSelfRegister && event.status === "upcoming" && (
                        isRegistered ? (
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-xs gap-1.5 text-red-400 border-red-500/30 hover:bg-red-500/10"
                                onClick={handleUnregister}
                            >
                                <UserMinus className="h-3 w-3" /> Unregister
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                className="text-xs gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                                disabled={isFull}
                                onClick={handleRegister}
                            >
                                <UserPlus className="h-3 w-3" /> {isFull ? "Event Full" : "Register"}
                            </Button>
                        )
                    )}
                </div>
            </div>

            {/* Description */}
            {event.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.description}
                </p>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarDays className="h-4 w-4 text-violet-400" />
                            <span className="text-[11px] font-medium uppercase tracking-wider">Date</span>
                        </div>
                        <p className="text-sm font-semibold">
                            {eventDate.toLocaleDateString("en-IN", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 text-violet-400" />
                            <span className="text-[11px] font-medium uppercase tracking-wider">Time</span>
                        </div>
                        <p className="text-sm font-semibold">
                            {eventDate.toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 text-violet-400" />
                            <span className="text-[11px] font-medium uppercase tracking-wider">Venue</span>
                        </div>
                        <p className="text-sm font-semibold">{event.venue}</p>
                    </CardContent>
                </Card>

                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 text-violet-400" />
                            <span className="text-[11px] font-medium uppercase tracking-wider">Capacity</span>
                        </div>
                        <p className="text-sm font-semibold">
                            {event.maxParticipants} participants max
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Registration Progress */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-violet-400" />
                            <span className="text-sm font-medium">Registration Progress</span>
                        </div>
                        <span className="text-sm font-bold">
                            {regCount} / {event.maxParticipants}
                        </span>
                    </div>
                    <Progress value={fillPercent} className="h-2 bg-muted/50" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{Math.round(fillPercent)}% filled</span>
                        <span>{event.maxParticipants - regCount} spots remaining</span>
                    </div>
                    {isFull && (
                        <div className="flex items-center gap-2 text-amber-400 text-xs">
                            <AlertCircle className="h-3.5 w-3.5" />
                            This event is at full capacity
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Registered Students */}
            {canViewRegistrations ? (
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-5 space-y-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-violet-400" />
                            Registered Students ({registrations.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {registrations.map((r) => (
                                <div
                                    key={r.registrationId}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                                >
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                                            {r.student?.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {r.student?.name}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {r.student?.department} • Year {r.student?.year}
                                        </p>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        {new Date(r.registrationDate).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {registrations.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-6">
                                No registrations yet. Be the first to register!
                            </p>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                            <p className="text-sm">
                                Registration list is only visible to club coordinators and admins
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Event Coordinators */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Shield className="h-4 w-4 text-amber-400" />
                            Event Coordinators ({coordinators.length})
                        </h3>
                        {canManageCoordinators && (
                            <Dialog open={showAssignCoord} onOpenChange={setShowAssignCoord}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-xs gap-1.5">
                                        <UserPlus className="h-3 w-3" /> Assign
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-sm bg-card border-border/40">
                                    <DialogHeader>
                                        <DialogTitle>Assign Coordinator</DialogTitle>
                                        <DialogDescription>
                                            Pick a club member to coordinate this event
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pt-2">
                                        {clubMembers
                                            .filter((m) => !store.isEventCoordinator(eventId, m.studentId))
                                            .filter((m) => m.roleId !== 1 && m.roleId !== 2) // exclude president/VP
                                            .map((m) => (
                                                <div
                                                    key={m.membershipId}
                                                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
                                                    onClick={() => {
                                                        store.assignEventCoordinator(eventId, m.studentId);
                                                        showToast(`${m.student?.name} assigned as coordinator 🌟`);
                                                        setShowAssignCoord(false);
                                                    }}
                                                >
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="text-[10px] font-semibold bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                                                            {m.student?.name?.split(" ").map((n) => n[0]).join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{m.student?.name}</p>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {m.role?.roleName} • {m.student?.department}
                                                        </p>
                                                    </div>
                                                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            ))}
                                        {clubMembers
                                            .filter((m) => !store.isEventCoordinator(eventId, m.studentId))
                                            .filter((m) => m.roleId !== 1 && m.roleId !== 2).length === 0 && (
                                                <p className="text-sm text-muted-foreground text-center py-4">
                                                    All eligible members are already assigned
                                                </p>
                                            )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {coordinators.map((ec) => (
                            <div
                                key={ec.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                                        {ec.student?.name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{ec.student?.name}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {ec.student?.department} • Year {ec.student?.year}
                                    </p>
                                </div>
                                {canManageCoordinators && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                                        onClick={() => {
                                            store.removeEventCoordinator(ec.id);
                                            showToast(`${ec.student?.name} removed as coordinator`, "info");
                                        }}
                                    >
                                        <UserMinus className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    {coordinators.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No coordinators assigned for this event
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
