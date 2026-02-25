"use client";

import { useState } from "react";
import { useDataStore } from "@/lib/data-store";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Search,
    CalendarDays,
    MapPin,
    Clock,
    Plus,
    Ticket,
    CheckCircle2,
    ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const statusColors: Record<string, string> = {
    upcoming: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/20",
    ongoing: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/20",
    completed: "bg-muted text-muted-foreground border-border/40",
};

export default function EventsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const { hasPermission, isOwnClub, role, activeClub, currentUser } = useAuth();
    const store = useDataStore();

    const studentId = currentUser?.student.studentId;
    const canCreateEvent = hasPermission("event_create");
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [newEvent, setNewEvent] = useState({
        eventName: "",
        eventDate: "",
        eventTime: "",
        venue: "",
        maxParticipants: "50",
        description: "",
        clubId: activeClub?.clubId?.toString() || "",
    });

    const handleCreateEvent = () => {
        if (!newEvent.eventName || !newEvent.eventDate || !newEvent.venue || !newEvent.clubId) return;
        const dateTime = newEvent.eventTime
            ? `${newEvent.eventDate}T${newEvent.eventTime}:00`
            : `${newEvent.eventDate}T10:00:00`;
        store.createEvent({
            clubId: Number(newEvent.clubId),
            eventName: newEvent.eventName,
            eventDate: dateTime,
            venue: newEvent.venue,
            maxParticipants: Number(newEvent.maxParticipants) || 50,
            description: newEvent.description,
            status: "upcoming",
        });
        setShowCreateEvent(false);
        setNewEvent({ eventName: "", eventDate: "", eventTime: "", venue: "", maxParticipants: "50", description: "", clubId: activeClub?.clubId?.toString() || "" });
    };

    const filtered = store.events.filter((event) => {
        const matchesSearch =
            event.eventName.toLowerCase().includes(search.toLowerCase()) ||
            event.venue.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || event.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Events</h1>
                    <p className="text-muted-foreground mt-1">
                        {activeClub && role !== "student"
                            ? `Events across all clubs • You manage ${activeClub.clubName}`
                            : `Browse all ${store.events.length} events`}
                    </p>
                </div>
                {canCreateEvent && (
                    <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-600/20">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Event
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-card border-border/40">
                            <DialogHeader>
                                <DialogTitle>Create New Event</DialogTitle>
                                <DialogDescription>
                                    Add a new event to a club
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-xs">Event Name *</Label>
                                    <Input
                                        placeholder="e.g. Annual Hackathon"
                                        value={newEvent.eventName}
                                        onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
                                        className="bg-muted/20 border-border/40"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Club *</Label>
                                    {role === "admin" ? (
                                        <Select
                                            value={newEvent.clubId}
                                            onValueChange={(val) => setNewEvent({ ...newEvent, clubId: val })}
                                        >
                                            <SelectTrigger className="bg-muted/20 border-border/40">
                                                <SelectValue placeholder="Select club" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {store.clubs.map((c) => (
                                                    <SelectItem key={c.clubId} value={c.clubId.toString()}>
                                                        {c.clubName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            value={activeClub?.clubName || ""}
                                            disabled
                                            className="bg-muted/20 border-border/40 opacity-70"
                                        />
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Date *</Label>
                                        <Input
                                            type="date"
                                            value={newEvent.eventDate}
                                            onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                                            className="bg-muted/20 border-border/40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Time</Label>
                                        <Input
                                            type="time"
                                            value={newEvent.eventTime}
                                            onChange={(e) => setNewEvent({ ...newEvent, eventTime: e.target.value })}
                                            className="bg-muted/20 border-border/40"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Venue *</Label>
                                    <Input
                                        placeholder="e.g. Main Auditorium"
                                        value={newEvent.venue}
                                        onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                                        className="bg-muted/20 border-border/40"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Max Participants</Label>
                                    <Input
                                        type="number"
                                        placeholder="50"
                                        value={newEvent.maxParticipants}
                                        onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: e.target.value })}
                                        className="bg-muted/20 border-border/40"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Description</Label>
                                    <Input
                                        placeholder="Describe the event..."
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        className="bg-muted/20 border-border/40"
                                    />
                                </div>
                                <Button
                                    onClick={handleCreateEvent}
                                    disabled={!newEvent.eventName || !newEvent.eventDate || !newEvent.venue || !newEvent.clubId}
                                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Create Event
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card/50 border-border/40"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={statusFilter === null ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(null)}
                        className="text-xs"
                    >
                        All
                    </Button>
                    {["upcoming", "ongoing", "completed"].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "secondary" : "outline"}
                            size="sm"
                            onClick={() =>
                                setStatusFilter(statusFilter === status ? null : status)
                            }
                            className="text-xs capitalize"
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((event) => {
                    const club = store.getClubById(event.clubId);
                    const regCount = store.registrations.filter(
                        (r) => r.eventId === event.eventId
                    ).length;
                    const fillPercent = (regCount / event.maxParticipants) * 100;
                    const isOwn = isOwnClub(event.clubId);
                    const isRegistered = studentId
                        ? store.isStudentRegistered(studentId, event.eventId)
                        : false;

                    return (
                        <Link key={event.eventId} href={`/events/${event.eventId}`}>
                            <Card
                                className={`glow-card border-border/40 bg-card/50 backdrop-blur-sm cursor-pointer 
                    hover:bg-card/70 hover:-translate-y-1 transition-all duration-300 group h-full
                    ${isOwn ? "ring-1 ring-violet-500/20" : ""}`}
                            >
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-sm group-hover:text-violet-600 dark:text-violet-400 transition-colors truncate">
                                                    {event.eventName}
                                                </h3>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isOwn && (
                                                    <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 dark:border-violet-500/20 text-[9px] shrink-0">
                                                        Your Club
                                                    </Badge>
                                                )}
                                                {isRegistered && (
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/20 text-[9px] shrink-0">
                                                        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                                                        Registered
                                                    </Badge>
                                                )}
                                            </div>
                                            {club && (
                                                <p className="text-xs text-muted-foreground">
                                                    {club.clubName}
                                                </p>
                                            )}
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] capitalize shrink-0 ${statusColors[event.status || ""] || ""
                                                }`}
                                        >
                                            {event.status}
                                        </Badge>
                                    </div>

                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {event.description}
                                    </p>

                                    <div className="space-y-2 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                                            {new Date(event.eventDate).toLocaleDateString("en-IN", {
                                                weekday: "short",
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                                            {new Date(event.eventDate).toLocaleTimeString("en-IN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                                            {event.venue}
                                        </div>
                                    </div>

                                    {/* Registration Progress */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Ticket className="h-3 w-3" /> Registrations
                                            </span>
                                            <span className="font-medium">
                                                {regCount}/{event.maxParticipants}
                                            </span>
                                        </div>
                                        <Progress
                                            value={fillPercent}
                                            className="h-1.5 bg-muted/50"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No events found matching your search
                </div>
            )}
        </div>
    );
}
