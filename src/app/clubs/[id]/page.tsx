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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    ArrowLeft,
    Users,
    CalendarDays,
    Wallet,
    MapPin,
    Clock,
    Edit,
    UserPlus,
    UserMinus,
    LogIn,
    LogOut as LeaveIcon,
    CheckCircle2,
    Ticket,
    Sparkles,
    TrendingUp,
    Mail,
    Globe,
    CalendarPlus,
    Building2,
    Shield,
} from "lucide-react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const categoryColors: Record<string, string> = {
    Technology: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    Design: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Environment: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Music: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Sports: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    Literature: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Photography: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export default function ClubDetailPage() {
    const params = useParams();
    const router = useRouter();
    const store = useDataStore();
    const { hasPermission, isOwnClub, currentUser } = useAuth();
    const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [showEditClub, setShowEditClub] = useState(false);
    const [newEvent, setNewEvent] = useState({
        eventName: "",
        eventDate: "",
        eventTime: "",
        venue: "",
        maxParticipants: "50",
        description: "",
        status: "upcoming" as const,
    });

    const clubId = Number(params.id);
    const club = store.getClubById(clubId);

    if (!club) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-fade-in-up">
                <Card className="max-w-md border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8 text-center space-y-4">
                        <h2 className="text-xl font-bold">Club Not Found</h2>
                        <p className="text-sm text-muted-foreground">
                            The club you&apos;re looking for doesn&apos;t exist.
                        </p>
                        <Button variant="outline" onClick={() => router.push("/clubs")}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Clubs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const members = store.getClubMembers(clubId);
    const events = store.getClubEvents(clubId);
    const budgets = store.getClubBudgets(clubId);
    const studentId = currentUser?.student.studentId;
    const isMember = studentId ? store.isStudentInClub(studentId, clubId) : false;
    const ownClub = isOwnClub(clubId);
    const canJoin = hasPermission("join_club_request");
    const canManageMembers = hasPermission("member_add") && ownClub;
    const canCreateEvents = hasPermission("event_create") && ownClub;
    const canRequestBudget = hasPermission("budget_request") && ownClub;
    const canEditClub = hasPermission("club_edit_profile") && ownClub;
    const canChangeRoles = hasPermission("member_change_role") && ownClub;

    const upcomingEvents = events.filter((e) => e.status === "upcoming").length;
    const completedEvents = events.filter((e) => e.status === "completed").length;
    const totalBudgetApproved = budgets
        .filter((b) => b.status === "approved")
        .reduce((s, b) => s + b.amount, 0);
    const adminMembers = members.filter((m) => m.role?.roleType === "admin").length;

    const showToast = (message: string, type: "success" | "info" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleJoinClub = () => {
        if (!studentId) return;
        store.joinClub(studentId, clubId);
        showToast(`Successfully joined ${club.clubName}! 🎉`);
    };

    const handleLeaveClub = () => {
        if (!studentId) return;
        const membership = store.memberships.find(
            (m) => m.studentId === studentId && m.clubId === clubId
        );
        if (membership) {
            store.leaveClub(membership.membershipId);
            showToast(`Left ${club.clubName}`);
        }
    };

    const handleRemoveMember = (membershipId: number, memberName?: string) => {
        store.leaveClub(membershipId);
        showToast(`Removed ${memberName || "member"} from club`);
    };

    const handleCreateEvent = () => {
        if (!newEvent.eventName || !newEvent.eventDate || !newEvent.venue) return;
        const dateTime = newEvent.eventTime
            ? `${newEvent.eventDate}T${newEvent.eventTime}:00`
            : `${newEvent.eventDate}T10:00:00`;
        store.createEvent({
            clubId,
            eventName: newEvent.eventName,
            eventDate: dateTime,
            venue: newEvent.venue,
            maxParticipants: Number(newEvent.maxParticipants) || 50,
            description: newEvent.description,
            status: "upcoming",
        });
        setShowCreateEvent(false);
        setNewEvent({ eventName: "", eventDate: "", eventTime: "", venue: "", maxParticipants: "50", description: "", status: "upcoming" });
        showToast(`Event "${newEvent.eventName}" created! 🎉`);
    };

    // Edit Club
    const [editClub, setEditClub] = useState({
        clubName: club?.clubName || "",
        description: club?.description || "",
        meetingDay: club?.meetingDay || "",
        meetingTime: club?.meetingTime || "",
        location: club?.location || "",
        contactEmail: club?.contactEmail || "",
        website: club?.website || "",
    });

    const handleEditClub = () => {
        if (!editClub.clubName) return;
        store.updateClub(clubId, {
            clubName: editClub.clubName,
            description: editClub.description,
            meetingDay: editClub.meetingDay || undefined,
            meetingTime: editClub.meetingTime || undefined,
            location: editClub.location || undefined,
            contactEmail: editClub.contactEmail || undefined,
            website: editClub.website || undefined,
        });
        setShowEditClub(false);
        showToast(`Club details updated! ✨`);
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
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
                onClick={() => router.push("/clubs")}
                className="text-muted-foreground hover:text-foreground -ml-2"
            >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Clubs
            </Button>

            {/* Hero Banner */}
            <div
                className={`relative h-48 md:h-56 rounded-2xl bg-gradient-to-br ${club.coverColor} overflow-hidden`}
            >
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Club Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="flex items-end justify-between gap-4">
                        <div className="flex items-end gap-4">
                            <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-white font-bold text-3xl md:text-4xl shadow-lg border border-white/10">
                                {club.clubName.charAt(0)}
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                        {club.clubName}
                                    </h1>
                                    {ownClub && (
                                        <Badge className="bg-white/20 backdrop-blur-md text-white border-white/10 text-[10px]">
                                            Your Club
                                        </Badge>
                                    )}
                                    {isMember && !ownClub && (
                                        <Badge className="bg-emerald-500/30 backdrop-blur-md text-white border-emerald-400/20 text-[10px]">
                                            Joined
                                        </Badge>
                                    )}
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`text-[11px] ${categoryColors[club.category] || ""}`}
                                >
                                    {club.category}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {canEditClub && (
                                <Dialog open={showEditClub} onOpenChange={(open) => {
                                    setShowEditClub(open);
                                    if (open && club) {
                                        setEditClub({
                                            clubName: club.clubName,
                                            description: club.description || "",
                                            meetingDay: club.meetingDay || "",
                                            meetingTime: club.meetingTime || "",
                                            location: club.location || "",
                                            contactEmail: club.contactEmail || "",
                                            website: club.website || "",
                                        });
                                    }
                                }}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="secondary" className="text-xs gap-1.5 bg-white/10 backdrop-blur-md border-white/10 text-white hover:bg-white/20">
                                            <Edit className="h-3 w-3" /> Edit
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md bg-card border-border/40">
                                        <DialogHeader>
                                            <DialogTitle>Edit Club</DialogTitle>
                                            <DialogDescription>
                                                Update details for {club.clubName}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-2 max-h-[65vh] overflow-y-auto pr-1">
                                            <div className="space-y-2">
                                                <Label className="text-xs">Club Name *</Label>
                                                <Input
                                                    value={editClub.clubName}
                                                    onChange={(e) => setEditClub({ ...editClub, clubName: e.target.value })}
                                                    className="bg-muted/20 border-border/40"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Description</Label>
                                                <Input
                                                    value={editClub.description}
                                                    onChange={(e) => setEditClub({ ...editClub, description: e.target.value })}
                                                    className="bg-muted/20 border-border/40"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Meeting Day</Label>
                                                    <Input
                                                        placeholder="e.g. Every Wednesday"
                                                        value={editClub.meetingDay}
                                                        onChange={(e) => setEditClub({ ...editClub, meetingDay: e.target.value })}
                                                        className="bg-muted/20 border-border/40"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Meeting Time</Label>
                                                    <Input
                                                        placeholder="e.g. 4:00 PM – 6:00 PM"
                                                        value={editClub.meetingTime}
                                                        onChange={(e) => setEditClub({ ...editClub, meetingTime: e.target.value })}
                                                        className="bg-muted/20 border-border/40"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Location</Label>
                                                    <Input
                                                        placeholder="e.g. Lab 301"
                                                        value={editClub.location}
                                                        onChange={(e) => setEditClub({ ...editClub, location: e.target.value })}
                                                        className="bg-muted/20 border-border/40"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Contact Email</Label>
                                                    <Input
                                                        placeholder="club@university.edu"
                                                        value={editClub.contactEmail}
                                                        onChange={(e) => setEditClub({ ...editClub, contactEmail: e.target.value })}
                                                        className="bg-muted/20 border-border/40"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Website</Label>
                                                <Input
                                                    placeholder="https://..."
                                                    value={editClub.website}
                                                    onChange={(e) => setEditClub({ ...editClub, website: e.target.value })}
                                                    className="bg-muted/20 border-border/40"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleEditClub}
                                                disabled={!editClub.clubName}
                                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                                            >
                                                <Edit className="h-4 w-4 mr-2" /> Save Changes
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                            {canJoin && !ownClub && (
                                isMember ? (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="text-xs gap-1.5 bg-red-500/20 backdrop-blur-md border-red-400/20 text-white hover:bg-red-500/30"
                                        onClick={handleLeaveClub}
                                    >
                                        <LeaveIcon className="h-3 w-3" /> Leave Club
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        className="text-xs gap-1.5 bg-white/20 backdrop-blur-md border-white/10 text-white hover:bg-white/30"
                                        onClick={handleJoinClub}
                                    >
                                        <LogIn className="h-3 w-3" /> Join Club
                                    </Button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {club.description}
            </p>

            {/* Club Information */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-5">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-violet-400" />
                        Club Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {club.meetingDay && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                                <div className="rounded-lg bg-violet-500/10 p-2 mt-0.5">
                                    <CalendarDays className="h-4 w-4 text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Meeting Schedule</p>
                                    <p className="text-sm font-medium">{club.meetingDay}</p>
                                    {club.meetingTime && <p className="text-xs text-muted-foreground">{club.meetingTime}</p>}
                                </div>
                            </div>
                        )}
                        {club.location && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                                <div className="rounded-lg bg-emerald-500/10 p-2 mt-0.5">
                                    <MapPin className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Location</p>
                                    <p className="text-sm font-medium">{club.location}</p>
                                </div>
                            </div>
                        )}
                        {club.contactEmail && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                                <div className="rounded-lg bg-amber-500/10 p-2 mt-0.5">
                                    <Mail className="h-4 w-4 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Contact</p>
                                    <p className="text-sm font-medium">{club.contactEmail}</p>
                                </div>
                            </div>
                        )}
                        {club.foundedDate && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                                <div className="rounded-lg bg-sky-500/10 p-2 mt-0.5">
                                    <Clock className="h-4 w-4 text-sky-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Founded</p>
                                    <p className="text-sm font-medium">
                                        {new Date(club.foundedDate).toLocaleDateString("en-IN", {
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                        {club.website && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                                <div className="rounded-lg bg-pink-500/10 p-2 mt-0.5">
                                    <Globe className="h-4 w-4 text-pink-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Website</p>
                                    <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-violet-400 hover:underline">
                                        {club.website.replace("https://", "")}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-xl bg-violet-500/10 p-2.5">
                            <Users className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{members.length}</p>
                            <p className="text-xs text-muted-foreground">Members</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-500/10 p-2.5">
                            <CalendarDays className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{events.length}</p>
                            <p className="text-xs text-muted-foreground">
                                Events ({upcomingEvents} upcoming)
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-xl bg-amber-500/10 p-2.5">
                            <Sparkles className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{adminMembers}</p>
                            <p className="text-xs text-muted-foreground">Leadership</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-xl bg-sky-500/10 p-2.5">
                            <TrendingUp className="h-5 w-5 text-sky-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">₹{(totalBudgetApproved / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-muted-foreground">Budget Approved</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="members" className="space-y-6">
                <TabsList className="bg-muted/50">
                    <TabsTrigger value="members" className="text-xs">
                        <Users className="h-3.5 w-3.5 mr-1.5" /> Members ({members.length})
                    </TabsTrigger>
                    <TabsTrigger value="events" className="text-xs">
                        <CalendarDays className="h-3.5 w-3.5 mr-1.5" /> Events ({events.length})
                    </TabsTrigger>
                    {(hasPermission("budget_view_history") || canRequestBudget) && (
                        <TabsTrigger value="budget" className="text-xs">
                            <Wallet className="h-3.5 w-3.5 mr-1.5" /> Budget ({budgets.length})
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* Members Tab */}
                <TabsContent value="members" className="space-y-4">
                    {canManageMembers && (
                        <Button size="sm" variant="outline" className="text-xs gap-1.5">
                            <UserPlus className="h-3 w-3" /> Add Member
                        </Button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {members.map((m) => (
                            <Card key={m.membershipId} className="border-border/40 bg-card/50 hover:bg-card/70 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                                                {m.student?.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {m.student?.name}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {m.student?.department} • Year {m.student?.year}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            {/* Role badge / Change role */}
                                            {canChangeRoles && m.roleId !== 1 && m.roleId !== 2 ? (
                                                <Select
                                                    value={String(m.roleId)}
                                                    onValueChange={(val) => {
                                                        const newRoleId = Number(val);
                                                        if (!store.canAssignRole(clubId, newRoleId, m.membershipId)) {
                                                            showToast(
                                                                `This club already has a ${newRoleId === 3 ? "Secretary" : "Treasurer"}`,
                                                                "info"
                                                            );
                                                            return;
                                                        }
                                                        store.changeMemberRole(m.membershipId, newRoleId);
                                                        showToast(`${m.student?.name} is now ${store.getRoleById(newRoleId)?.roleName || "updated"} ✨`);
                                                    }}
                                                >
                                                    <SelectTrigger className="h-7 text-[10px] w-[120px] bg-muted/20 border-border/40">
                                                        <Shield className="h-3 w-3 mr-1 text-violet-400" />
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="3" disabled={!store.canAssignRole(clubId, 3, m.membershipId)}>
                                                            Secretary {!store.canAssignRole(clubId, 3, m.membershipId) ? "(taken)" : ""}
                                                        </SelectItem>
                                                        <SelectItem value="4" disabled={!store.canAssignRole(clubId, 4, m.membershipId)}>
                                                            Treasurer {!store.canAssignRole(clubId, 4, m.membershipId) ? "(taken)" : ""}
                                                        </SelectItem>
                                                        <SelectItem value="5">Member</SelectItem>
                                                        <SelectItem value="6">Coordinator</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] ${m.role?.roleType === "admin"
                                                        ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                                                        : ""
                                                        }`}
                                                >
                                                    {m.role?.roleName}
                                                </Badge>
                                            )}
                                            {canManageMembers && m.roleId !== 1 && m.roleId !== 2 && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400"
                                                    onClick={() => handleRemoveMember(m.membershipId, m.student?.name)}
                                                >
                                                    <UserMinus className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-2">
                                        Joined {new Date(m.joinDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {members.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No members yet. Be the first to join! 🎉
                        </p>
                    )}
                </TabsContent>

                {/* Events Tab */}
                <TabsContent value="events" className="space-y-4">
                    {canCreateEvents && (
                        <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-xs gap-1.5">
                                    <CalendarPlus className="h-3 w-3" /> Create Event
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md bg-card border-border/40">
                                <DialogHeader>
                                    <DialogTitle>Create New Event</DialogTitle>
                                    <DialogDescription>
                                        Add a new event for {club.clubName}
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
                                        disabled={!newEvent.eventName || !newEvent.eventDate || !newEvent.venue}
                                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                                    >
                                        <CalendarPlus className="h-4 w-4 mr-2" /> Create Event
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {events.map((e) => {
                            const regCount = store.registrations.filter(
                                (r) => r.eventId === e.eventId
                            ).length;
                            const fillPercent = (regCount / e.maxParticipants) * 100;
                            const isRegistered = studentId
                                ? store.isStudentRegistered(studentId, e.eventId)
                                : false;

                            return (
                                <Link key={e.eventId} href={`/events/${e.eventId}`}>
                                    <Card className="border-border/40 bg-card/50 hover:bg-card/70 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
                                        <CardContent className="p-5 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1 min-w-0">
                                                    <h3 className="font-semibold text-sm group-hover:text-violet-400 transition-colors truncate">
                                                        {e.eventName}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                                        {e.description}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] capitalize shrink-0 ml-2 ${e.status === "upcoming"
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : e.status === "ongoing"
                                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                            : "bg-muted text-muted-foreground"
                                                        }`}
                                                >
                                                    {e.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <CalendarDays className="h-3 w-3 text-violet-400" />
                                                    {new Date(e.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-violet-400" />
                                                    {new Date(e.eventDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 text-violet-400" />
                                                    {e.venue}
                                                </span>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <Ticket className="h-3 w-3" /> Registrations
                                                    </span>
                                                    <span className="font-medium">
                                                        {regCount}/{e.maxParticipants}
                                                    </span>
                                                </div>
                                                <Progress value={fillPercent} className="h-1.5 bg-muted/50" />
                                            </div>
                                            {isRegistered && (
                                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Registered
                                                </Badge>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                    {events.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No events scheduled yet
                        </p>
                    )}
                </TabsContent>

                {/* Budget Tab */}
                {(hasPermission("budget_view_history") || canRequestBudget) && (
                    <TabsContent value="budget" className="space-y-4">
                        {canRequestBudget && (
                            <Button size="sm" variant="outline" className="text-xs gap-1.5">
                                <Wallet className="h-3 w-3" /> Request Budget
                            </Button>
                        )}

                        {/* Budget Summary */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-[11px] text-muted-foreground">Approved</p>
                                <p className="text-lg font-bold text-emerald-400">
                                    ₹{totalBudgetApproved.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                <p className="text-[11px] text-muted-foreground">Pending</p>
                                <p className="text-lg font-bold text-amber-400">
                                    ₹{budgets.filter((b) => b.status === "pending").reduce((s, b) => s + b.amount, 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                <p className="text-[11px] text-muted-foreground">Rejected</p>
                                <p className="text-lg font-bold text-red-400">
                                    ₹{budgets.filter((b) => b.status === "rejected").reduce((s, b) => s + b.amount, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Budget List */}
                        <div className="space-y-2">
                            {budgets.map((b) => (
                                <div
                                    key={b.budgetId}
                                    className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                                        <Wallet className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{b.description}</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Requested: {b.requestDate ? new Date(b.requestDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">₹{b.amount.toLocaleString()}</p>
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] ${b.status === "approved"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : b.status === "pending"
                                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                                }`}
                                        >
                                            {b.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {budgets.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No budget requests yet
                            </p>
                        )}
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
