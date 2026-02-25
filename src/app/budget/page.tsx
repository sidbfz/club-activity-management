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
import {
    Search,
    Wallet,
    CheckCircle2,
    Clock,
    XCircle,
    TrendingUp,
    IndianRupee,
    Plus,
    Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    approved: {
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/20",
        icon: CheckCircle2,
    },
    pending: {
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/20",
        icon: Clock,
    },
    rejected: {
        color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 dark:border-red-500/20",
        icon: XCircle,
    },
};

export default function BudgetPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [clubFilter, setClubFilter] = useState<string>("all");
    const { hasPermission, isOwnClub, activeClub, role, roleInfo } = useAuth();
    const store = useDataStore();

    const canViewBudget = hasPermission("budget_view_history") || hasPermission("budget_request");

    if (!canViewBudget) {
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
                            you don&apos;t have permission to view budget details.
                            This section is available to treasurers and presidents.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const canRequest = hasPermission("budget_request");
    const canApprove = hasPermission("budget_approve");
    const canTrackExpenses = hasPermission("budget_track_expenses");

    // Scope budgets: treasurers & presidents only see their club
    const scopedBudgets =
        activeClub && !hasPermission("dashboard_full_analytics")
            ? store.budgets.filter((b) => b.clubId === activeClub.clubId)
            : store.budgets;

    const enriched = scopedBudgets.map((b) => ({
        ...b,
        club: store.getClubById(b.clubId),
    }));

    const filtered = enriched.filter((b) => {
        const matchesSearch =
            b.description?.toLowerCase().includes(search.toLowerCase()) ||
            b.club?.clubName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || b.status === statusFilter;
        const matchesClub =
            clubFilter === "all" || b.clubId.toString() === clubFilter;
        return matchesSearch && matchesStatus && matchesClub;
    });

    const totalApproved = scopedBudgets
        .filter((b) => b.status === "approved")
        .reduce((s, b) => s + b.amount, 0);
    const totalPending = scopedBudgets
        .filter((b) => b.status === "pending")
        .reduce((s, b) => s + b.amount, 0);
    const totalRejected = scopedBudgets
        .filter((b) => b.status === "rejected")
        .reduce((s, b) => s + b.amount, 0);

    const summaryCards = [
        {
            title: "Total Approved",
            value: `₹${totalApproved.toLocaleString()}`,
            icon: CheckCircle2,
            gradient: "from-emerald-600/20 to-teal-600/20",
            iconColor: "text-emerald-600 dark:text-emerald-400",
            count: scopedBudgets.filter((b) => b.status === "approved").length,
        },
        {
            title: "Pending Requests",
            value: `₹${totalPending.toLocaleString()}`,
            icon: Clock,
            gradient: "from-amber-600/20 to-orange-600/20",
            iconColor: "text-amber-600 dark:text-amber-400",
            count: scopedBudgets.filter((b) => b.status === "pending").length,
        },
        {
            title: "Rejected",
            value: `₹${totalRejected.toLocaleString()}`,
            icon: XCircle,
            gradient: "from-red-600/20 to-rose-600/20",
            iconColor: "text-red-600 dark:text-red-400",
            count: scopedBudgets.filter((b) => b.status === "rejected").length,
        },
        {
            title: "Total Budget",
            value: `₹${(totalApproved + totalPending + totalRejected).toLocaleString()}`,
            icon: TrendingUp,
            gradient: "from-violet-600/20 to-indigo-600/20",
            iconColor: "text-violet-600 dark:text-violet-400",
            count: scopedBudgets.length,
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
                    <p className="text-muted-foreground mt-1">
                        {activeClub && !hasPermission("dashboard_full_analytics")
                            ? (
                                <>
                                    Budget for{" "}
                                    <span className="text-foreground font-medium">
                                        {activeClub.clubName}
                                    </span>
                                </>
                            )
                            : "Track and manage all club budget requests"}
                    </p>
                </div>
                {canRequest && (
                    <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-600/20">
                        <Plus className="h-4 w-4 mr-2" />
                        New Request
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
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {card.title}
                                    </p>
                                    <p className="text-2xl font-bold tracking-tight">
                                        {card.value}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {card.count} request{card.count !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                <div
                                    className={`rounded-xl bg-gradient-to-br ${card.gradient} p-2.5`}
                                >
                                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                                </div>
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
                        placeholder="Search budget requests..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card/50 border-border/40"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] bg-card/50 border-border/40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                {/* Only show club filter for full-analytics users */}
                {hasPermission("dashboard_full_analytics") && (
                    <Select value={clubFilter} onValueChange={setClubFilter}>
                        <SelectTrigger className="w-[180px] bg-card/50 border-border/40">
                            <SelectValue placeholder="Club" />
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
                )}
            </div>

            {/* Budget Table */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/40 hover:bg-transparent">
                                <TableHead className="text-xs">ID</TableHead>
                                <TableHead className="text-xs">Description</TableHead>
                                <TableHead className="text-xs">Club</TableHead>
                                <TableHead className="text-xs">Amount</TableHead>
                                <TableHead className="text-xs">Requested On</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                {canApprove && (
                                    <TableHead className="text-xs text-right">Actions</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((b) => {
                                const sc = statusConfig[b.status];
                                const StatusIcon = sc.icon;
                                return (
                                    <TableRow
                                        key={b.budgetId}
                                        className="border-border/40 hover:bg-muted/20"
                                    >
                                        <TableCell className="text-sm font-mono text-muted-foreground">
                                            #{b.budgetId}
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">
                                            {b.description}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`h-6 w-6 rounded-md bg-gradient-to-br ${b.club?.coverColor} flex items-center justify-center text-white text-[10px] font-bold`}
                                                >
                                                    {b.club?.clubName.charAt(0)}
                                                </div>
                                                <span className="text-sm">{b.club?.clubName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-semibold flex items-center gap-0.5">
                                                <IndianRupee className="h-3 w-3" />
                                                {b.amount.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {b.requestDate
                                                ? new Date(b.requestDate).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] capitalize ${sc.color}`}
                                            >
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {b.status}
                                            </Badge>
                                        </TableCell>
                                        {canApprove && (
                                            <TableCell className="text-right">
                                                {b.status === "pending" && (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                                                            onClick={() => store.approveBudget(b.budgetId)}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:text-red-300 hover:bg-red-500/10"
                                                            onClick={() => store.rejectBudget(b.budgetId)}
                                                        >
                                                            Reject
                                                        </Button>
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
                            No budget requests found
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
