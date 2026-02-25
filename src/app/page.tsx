"use client";

import {
  Building2,
  CalendarDays,
  GraduationCap,
  TrendingUp,
  Users,
  Wallet,
  ArrowUpRight,
  Clock,
  ShieldAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDataStore } from "@/lib/data-store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const COLORS = [
  "oklch(0.7 0.2 270)",
  "oklch(0.696 0.17 162.48)",
  "oklch(0.769 0.188 70.08)",
  "oklch(0.627 0.265 303.9)",
  "oklch(0.645 0.246 16.439)",
  "oklch(0.7 0.15 200)",
];

export default function DashboardPage() {
  const { hasPermission, role, roleInfo, activeClub, currentUser } = useAuth();
  const store = useDataStore();

  // If user doesn't have dashboard permission, show a simple welcome
  if (!hasPermission("dashboard_view")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in-up">
        <Card className="max-w-md border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-xl font-bold">Welcome, {currentUser!.student.name}!</h2>
            <p className="text-sm text-muted-foreground">
              As a <span className={`font-medium ${roleInfo.color}`}>{roleInfo.shortLabel}</span>,
              you can browse clubs and register for events.
              Use the sidebar to navigate.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Link
                href="/clubs"
                className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:text-violet-300 flex items-center gap-1"
              >
                Browse Clubs <ArrowUpRight className="h-3 w-3" />
              </Link>
              <Link
                href="/events"
                className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:text-violet-300 flex items-center gap-1"
              >
                View Events <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = store.getDashboardStats();
  const showFullAnalytics = hasPermission("dashboard_full_analytics");

  // Scoped data for club-level roles
  const isClubScoped = activeClub && role !== "student";
  const scopedEvents = isClubScoped
    ? store.getClubEvents(activeClub!.clubId)
    : store.events;
  const scopedMembers = isClubScoped
    ? store.getClubMembers(activeClub!.clubId)
    : [];
  const scopedBudgets = isClubScoped
    ? store.getClubBudgets(activeClub!.clubId)
    : [];

  const memberCounts = store.getClubMemberCounts();
  const categoryData = store.getCategoryDistribution();
  const budgetData = store.getBudgetByClub();

  const upcomingEvents = scopedEvents
    .filter((e) => e.status === "upcoming")
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    )
    .slice(0, 5);

  // Build stat cards based on role
  const statCards = [];

  if (showFullAnalytics) {
    statCards.push(
      {
        title: "Total Clubs",
        value: stats.totalClubs,
        icon: Building2,
        gradient: "from-violet-600/20 to-indigo-600/20",
        iconColor: "text-violet-600 dark:text-violet-400",
        change: "+2 this semester",
      },
      {
        title: "Active Students",
        value: stats.totalStudents,
        icon: GraduationCap,
        gradient: "from-emerald-600/20 to-teal-600/20",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        change: "+5 this month",
      }
    );
  }

  if (isClubScoped) {
    statCards.push({
      title: "Club Members",
      value: scopedMembers.length,
      icon: Users,
      gradient: "from-sky-600/20 to-blue-600/20",
      iconColor: "text-sky-600 dark:text-sky-400",
      change: activeClub!.clubName,
    });
  }

  statCards.push({
    title: isClubScoped ? "Club Events" : "Total Events",
    value: isClubScoped ? scopedEvents.length : stats.totalEvents,
    icon: CalendarDays,
    gradient: "from-amber-600/20 to-orange-600/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    change: `${scopedEvents.filter((e) => e.status === "upcoming").length
      } upcoming`,
  });

  if (hasPermission("budget_view_history") || hasPermission("budget_request")) {
    const approvedTotal = isClubScoped
      ? scopedBudgets
        .filter((b) => b.status === "approved")
        .reduce((s, b) => s + b.amount, 0)
      : stats.totalBudgetApproved;
    const pendingTotal = isClubScoped
      ? scopedBudgets
        .filter((b) => b.status === "pending")
        .reduce((s, b) => s + b.amount, 0)
      : stats.totalBudgetPending;

    statCards.push({
      title: "Budget Approved",
      value: `₹${(approvedTotal / 1000).toFixed(0)}K`,
      icon: Wallet,
      gradient: "from-pink-600/20 to-rose-600/20",
      iconColor: "text-pink-600 dark:text-pink-400",
      change: `₹${(pendingTotal / 1000).toFixed(0)}K pending`,
    });
  }

  if (showFullAnalytics) {
    statCards.push({
      title: "All Registrations",
      value: stats.totalRegistrations,
      icon: TrendingUp,
      gradient: "from-purple-600/20 to-fuchsia-600/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      change: "Across all events",
    });
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {isClubScoped ? (
            <>
              Overview for{" "}
              <span className="font-medium text-foreground">
                {activeClub!.clubName}
              </span>{" "}
              •{" "}
              <span className={`${roleInfo.color}`}>
                {roleInfo.shortLabel}
              </span>
            </>
          ) : (
            <>
              Welcome back,{" "}
              <span className="font-medium text-foreground">
                {currentUser!.student.name}
              </span>
              ! System-wide overview.
            </>
          )}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <Card
            key={stat.title}
            className="glow-card border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground/80">
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts — only for full analytics */}
      {showFullAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Members per Club */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Members per Club</CardTitle>
              <CardDescription>Active membership distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={memberCounts}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.3 0 0)"
                  />
                  <XAxis
                    dataKey="clubName"
                    tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
                    axisLine={{ stroke: "oklch(0.3 0 0)" }}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
                    axisLine={{ stroke: "oklch(0.3 0 0)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.2 0 0)",
                      border: "1px solid oklch(0.3 0 0)",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="members"
                    fill="oklch(0.7 0.2 270)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Club Categories</CardTitle>
              <CardDescription>Distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.2 0 0)",
                      border: "1px solid oklch(0.3 0 0)",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Overview — only for budget-related permissions */}
        {showFullAnalytics && hasPermission("budget_view_history") && (
          <Card className="lg:col-span-2 border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Budget Overview</CardTitle>
              <CardDescription>
                Approved vs Pending budget by club
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={budgetData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.3 0 0)"
                  />
                  <XAxis
                    dataKey="clubName"
                    tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
                    axisLine={{ stroke: "oklch(0.3 0 0)" }}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
                    axisLine={{ stroke: "oklch(0.3 0 0)" }}
                    tickFormatter={(v) => `₹${v / 1000}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.2 0 0)",
                      border: "1px solid oklch(0.3 0 0)",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [
                      `₹${value.toLocaleString()}`,
                      "",
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "oklch(0.6 0 0)" }}
                  />
                  <Bar
                    dataKey="approved"
                    name="Approved"
                    fill="oklch(0.7 0.17 162)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="pending"
                    name="Pending"
                    fill="oklch(0.769 0.188 70)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Events */}
        <Card
          className={`border-border/40 bg-card/50 backdrop-blur-sm ${!showFullAnalytics || !hasPermission("budget_view_history")
            ? "lg:col-span-3"
            : ""
            }`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
                <CardDescription>
                  {isClubScoped
                    ? `${activeClub!.clubName} events`
                    : "All upcoming events"}
                </CardDescription>
              </div>
              <Link
                href="/events"
                className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:text-violet-300 flex items-center gap-1 transition-colors"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No upcoming events
              </p>
            ) : (
              upcomingEvents.map((event) => {
                const club = store.clubs.find((c: { clubId: number }) => c.clubId === event.clubId);
                const regCount = store.registrations.filter(
                  (r: { eventId: number }) => r.eventId === event.eventId
                ).length;
                return (
                  <Link
                    key={event.eventId}
                    href={`/events/${event.eventId}`}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
                      <CalendarDays className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium truncate">
                        {event.eventName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {club?.clubName}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(event.eventDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                        <span>•</span>
                        <span>
                          {regCount}/{event.maxParticipants}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
