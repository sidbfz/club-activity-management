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
import { Button } from "@/components/ui/button";
import {
    Search,
    Users,
    Shield,
    UserPlus,
    UserMinus,
    UserCog,
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

export default function MembersPage() {
    const [search, setSearch] = useState("");
    const [clubFilter, setClubFilter] = useState<string>("all");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const { hasPermission, isOwnClub, activeClub, role, roleInfo } = useAuth();
    const store = useDataStore();

    const canViewRecords = hasPermission("member_view_records");

    // If role doesn't have member_view_records, show restricted view
    if (!canViewRecords) {
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
                            you don&apos;t have permission to view member records.
                            This section is available to club officers and coordinators.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const enrichedMemberships = store.memberships.map((m) => ({
        ...m,
        student: store.getStudentById(m.studentId),
        club: store.getClubById(m.clubId),
        role: store.getRoleById(m.roleId),
    }));

    const filtered = enrichedMemberships.filter((m) => {
        const matchesSearch =
            m.student?.name.toLowerCase().includes(search.toLowerCase()) ||
            m.student?.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
            m.club?.clubName.toLowerCase().includes(search.toLowerCase());
        const matchesClub =
            clubFilter === "all" || m.clubId.toString() === clubFilter;
        const matchesRole =
            roleFilter === "all" || m.roleId.toString() === roleFilter;
        return matchesSearch && matchesClub && matchesRole;
    });

    const adminCount = enrichedMemberships.filter(
        (m) => m.role?.roleType === "admin"
    ).length;
    const memberCount = enrichedMemberships.filter(
        (m) => m.role?.roleType === "member"
    ).length;

    const canAdd = hasPermission("member_add");
    const canRemove = hasPermission("member_remove");
    const canChangeRole = hasPermission("member_change_role");

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Members</h1>
                    <p className="text-muted-foreground mt-1">
                        View all club memberships and roles
                        {activeClub && (
                            <span>
                                {" "}
                                • Managing{" "}
                                <span className="text-foreground font-medium">
                                    {activeClub.clubName}
                                </span>
                            </span>
                        )}
                    </p>
                </div>
                {canAdd && (
                    <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-600/20">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Member
                    </Button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border/40 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-xl bg-violet-500/10 p-2.5">
                            <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{store.memberships.length}</p>
                            <p className="text-xs text-muted-foreground">
                                Total Memberships
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/40 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-xl bg-amber-500/10 p-2.5">
                            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{adminCount}</p>
                            <p className="text-xs text-muted-foreground">Admin Roles</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/40 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-500/10 p-2.5">
                            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{memberCount}</p>
                            <p className="text-xs text-muted-foreground">Regular Members</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, roll number, or club..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card/50 border-border/40"
                    />
                </div>
                <Select value={clubFilter} onValueChange={setClubFilter}>
                    <SelectTrigger className="w-[180px] bg-card/50 border-border/40">
                        <SelectValue placeholder="Filter by club" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Clubs</SelectItem>
                        {store.clubs.map((c) => (
                            <SelectItem key={c.clubId} value={c.clubId.toString()}>
                                {c.clubName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px] bg-card/50 border-border/40">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {store.roles.map((r) => (
                            <SelectItem key={r.roleId} value={r.roleId.toString()}>
                                {r.roleName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Memberships Table */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/40 hover:bg-transparent">
                                <TableHead className="text-xs">Student</TableHead>
                                <TableHead className="text-xs">Roll Number</TableHead>
                                <TableHead className="text-xs">Club</TableHead>
                                <TableHead className="text-xs">Role</TableHead>
                                <TableHead className="text-xs">Department</TableHead>
                                <TableHead className="text-xs">Joined</TableHead>
                                {(canRemove || canChangeRole) && (
                                    <TableHead className="text-xs text-right">Actions</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((m) => {
                                const isOwn = isOwnClub(m.clubId);
                                return (
                                    <TableRow
                                        key={m.membershipId}
                                        className={`border-border/40 hover:bg-muted/20 ${isOwn ? "bg-violet-500/[0.03]" : ""
                                            }`}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                                                        {m.student?.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {m.student?.name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {m.student?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-mono text-muted-foreground">
                                            {m.student?.rollNumber}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`h-6 w-6 rounded-md bg-gradient-to-br ${m.club?.coverColor} flex items-center justify-center text-white text-[10px] font-bold`}
                                                >
                                                    {m.club?.clubName.charAt(0)}
                                                </div>
                                                <span className="text-sm">{m.club?.clubName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] ${m.role?.roleType === "admin"
                                                    ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 dark:border-violet-500/20"
                                                    : "bg-muted text-muted-foreground"
                                                    }`}
                                            >
                                                {m.role?.roleName}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {m.student?.department}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(m.joinDate).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        {(canRemove || canChangeRole) && (
                                            <TableCell className="text-right">
                                                {isOwn && (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {canChangeRole && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:text-violet-300 hover:bg-violet-500/10"
                                                            >
                                                                <UserCog className="h-3 w-3 mr-1" /> Role
                                                            </Button>
                                                        )}
                                                        {canRemove && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:text-red-300 hover:bg-red-500/10"
                                                            >
                                                                <UserMinus className="h-3 w-3 mr-1" /> Remove
                                                            </Button>
                                                        )}
                                                    </div>
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
                            No memberships found matching your filters
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
