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
import { Label } from "@/components/ui/label";
import {
    Search,
    Users,
    CalendarDays,
    ChevronRight,
    Sparkles,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const categoryColors: Record<string, string> = {
    Technology: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 dark:border-violet-500/20",
    Design: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30 dark:border-pink-500/20",
    Environment: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/20",
    Music: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/20",
    Sports: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 dark:border-sky-500/20",
    Literature: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 dark:border-purple-500/20",
    Photography: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

const CATEGORIES = ["Technology", "Design", "Environment", "Music", "Sports", "Literature", "Photography"];

const COVER_COLORS = [
    { label: "Violet", value: "from-violet-600 to-indigo-600" },
    { label: "Pink", value: "from-pink-600 to-rose-600" },
    { label: "Emerald", value: "from-emerald-600 to-teal-600" },
    { label: "Amber", value: "from-amber-500 to-orange-600" },
    { label: "Sky", value: "from-sky-500 to-blue-600" },
    { label: "Purple", value: "from-purple-500 to-fuchsia-600" },
    { label: "Cyan", value: "from-cyan-500 to-blue-500" },
    { label: "Red", value: "from-red-500 to-rose-600" },
];

export default function ClubsPage() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { hasPermission, isOwnClub, currentUser } = useAuth();
    const store = useDataStore();
    const [showCreateClub, setShowCreateClub] = useState(false);
    const [newClub, setNewClub] = useState({
        clubName: "",
        category: "",
        description: "",
        coverColor: "from-violet-600 to-indigo-600",
        meetingDay: "",
        meetingTime: "",
        location: "",
        contactEmail: "",
    });

    const categories = Array.from(new Set(store.clubs.map((c) => c.category)));
    const studentId = currentUser?.student.studentId;

    const filtered = store.clubs.filter((club) => {
        const matchesSearch =
            club.clubName.toLowerCase().includes(search.toLowerCase()) ||
            club.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
            !selectedCategory || club.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleCreateClub = () => {
        if (!newClub.clubName || !newClub.category) return;
        store.createClub({
            clubName: newClub.clubName,
            category: newClub.category,
            description: newClub.description,
            coverColor: newClub.coverColor,
            meetingDay: newClub.meetingDay || undefined,
            meetingTime: newClub.meetingTime || undefined,
            location: newClub.location || undefined,
            contactEmail: newClub.contactEmail || undefined,
            foundedDate: new Date().toISOString().split("T")[0],
        });
        setShowCreateClub(false);
        setNewClub({
            clubName: "",
            category: "",
            description: "",
            coverColor: "from-violet-600 to-indigo-600",
            meetingDay: "",
            meetingTime: "",
            location: "",
            contactEmail: "",
        });
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clubs</h1>
                    <p className="text-muted-foreground mt-1">
                        Browse and manage all {store.clubs.length} registered clubs
                    </p>
                </div>
                {hasPermission("club_create") && (
                    <Dialog open={showCreateClub} onOpenChange={setShowCreateClub}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-600/20 transition-all">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Create Club
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg bg-card border-border/40">
                            <DialogHeader>
                                <DialogTitle>Create New Club</DialogTitle>
                                <DialogDescription>
                                    Set up a new club with all its details
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
                                <div className="space-y-2">
                                    <Label className="text-xs">Club Name *</Label>
                                    <Input
                                        placeholder="e.g. AI Research Club"
                                        value={newClub.clubName}
                                        onChange={(e) => setNewClub({ ...newClub, clubName: e.target.value })}
                                        className="bg-muted/20 border-border/40"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Category *</Label>
                                        <Select value={newClub.category} onValueChange={(val) => setNewClub({ ...newClub, category: val })}>
                                            <SelectTrigger className="bg-muted/20 border-border/40">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Theme Color</Label>
                                        <Select value={newClub.coverColor} onValueChange={(val) => setNewClub({ ...newClub, coverColor: val })}>
                                            <SelectTrigger className="bg-muted/20 border-border/40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COVER_COLORS.map((c) => (
                                                    <SelectItem key={c.value} value={c.value}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${c.value}`} />
                                                            {c.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Description</Label>
                                    <Input
                                        placeholder="What is your club about?"
                                        value={newClub.description}
                                        onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                                        className="bg-muted/20 border-border/40"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Meeting Day</Label>
                                        <Input
                                            placeholder="e.g. Every Wednesday"
                                            value={newClub.meetingDay}
                                            onChange={(e) => setNewClub({ ...newClub, meetingDay: e.target.value })}
                                            className="bg-muted/20 border-border/40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Meeting Time</Label>
                                        <Input
                                            placeholder="e.g. 4:00 PM – 6:00 PM"
                                            value={newClub.meetingTime}
                                            onChange={(e) => setNewClub({ ...newClub, meetingTime: e.target.value })}
                                            className="bg-muted/20 border-border/40"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Location</Label>
                                        <Input
                                            placeholder="e.g. Lab 301, CS Block"
                                            value={newClub.location}
                                            onChange={(e) => setNewClub({ ...newClub, location: e.target.value })}
                                            className="bg-muted/20 border-border/40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Contact Email</Label>
                                        <Input
                                            placeholder="club@university.edu"
                                            value={newClub.contactEmail}
                                            onChange={(e) => setNewClub({ ...newClub, contactEmail: e.target.value })}
                                            className="bg-muted/20 border-border/40"
                                        />
                                    </div>
                                </div>

                                {/* Preview */}
                                {newClub.clubName && (
                                    <div className="rounded-xl overflow-hidden border border-border/40">
                                        <div className={`h-16 bg-gradient-to-br ${newClub.coverColor}`} />
                                        <div className="p-3 space-y-1">
                                            <p className="text-sm font-semibold">{newClub.clubName}</p>
                                            {newClub.category && (
                                                <Badge variant="outline" className={`text-[10px] ${categoryColors[newClub.category] || ""}`}>
                                                    {newClub.category}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={handleCreateClub}
                                    disabled={!newClub.clubName || !newClub.category}
                                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" /> Create Club
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
                        placeholder="Search clubs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card/50 border-border/40"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={selectedCategory === null ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                        className="text-xs"
                    >
                        All
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? "secondary" : "outline"}
                            size="sm"
                            onClick={() =>
                                setSelectedCategory(selectedCategory === cat ? null : cat)
                            }
                            className="text-xs"
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Club Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((club) => {
                    const memberCount = store.memberships.filter(
                        (m) => m.clubId === club.clubId
                    ).length;
                    const eventCount = store.events.filter(
                        (e) => e.clubId === club.clubId
                    ).length;
                    const ownClub = isOwnClub(club.clubId);
                    const isMember = studentId
                        ? store.isStudentInClub(studentId, club.clubId)
                        : false;

                    return (
                        <Link key={club.clubId} href={`/clubs/${club.clubId}`}>
                            <Card
                                className={`glow-card border-border/40 bg-card/50 backdrop-blur-sm cursor-pointer 
                    hover:bg-card/70 hover:-translate-y-1 transition-all duration-300 group h-full
                    ${ownClub ? "ring-1 ring-violet-500/20" : ""}
                    ${isMember && !ownClub ? "ring-1 ring-emerald-500/20" : ""}`}
                            >
                                <CardContent className="p-0">
                                    {/* Cover */}
                                    <div
                                        className={`h-24 bg-gradient-to-br ${club.coverColor} relative overflow-hidden`}
                                    >
                                        <div className="absolute inset-0 bg-black/20" />
                                        {ownClub && (
                                            <Badge className="absolute top-2 right-2 bg-black/40 backdrop-blur-md border-0 text-[10px] text-white">
                                                Your Club
                                            </Badge>
                                        )}
                                        {isMember && !ownClub && (
                                            <Badge className="absolute top-2 right-2 bg-emerald-600/60 backdrop-blur-md border-0 text-[10px] text-white">
                                                Joined
                                            </Badge>
                                        )}
                                        <div className="absolute bottom-3 left-4">
                                            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-lg">
                                                {club.clubName.charAt(0)}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-sm group-hover:text-violet-600 dark:text-violet-400 transition-colors">
                                                    {club.clubName}
                                                </h3>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`mt-1.5 text-[10px] ${categoryColors[club.category] || ""}`}
                                            >
                                                {club.category}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {club.description}
                                        </p>
                                        <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" /> {memberCount}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CalendarDays className="h-3 w-3" /> {eventCount}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
