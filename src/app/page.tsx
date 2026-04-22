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
  CheckCircle2,
  BarChart3,
  UserPlus,
  Star,
  Sparkles,
  Shield,
  CircleDollarSign,
  ClipboardCheck,
  CalendarCheck,
  Activity,
  Trophy,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  "oklch(0.55 0.2 270)",
  "oklch(0.55 0.17 162.48)",
  "oklch(0.65 0.188 70.08)",
  "oklch(0.55 0.265 303.9)",
  "oklch(0.55 0.246 16.439)",
  "oklch(0.55 0.15 200)",
];

// ==================== SHARED COMPONENTS ====================

function StatCard({ title, value, icon: Icon, gradient, iconColor, subtitle }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  subtitle: string;
}) {
  return (
    <Card className="border-border bg-card hover:shadow-lg transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground/80">{subtitle}</p>
          </div>
          <div className={`rounded-xl bg-gradient-to-br ${gradient} p-2.5`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EventListItem({ event, clubName, regCount }: {
  event: { eventId: number; eventName: string; eventDate: string; maxParticipants: number; venue: string };
  clubName?: string;
  regCount: number;
}) {
  return (
    <Link
      href={`/events/${event.eventId}`}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <CalendarDays className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {event.eventName}
        </p>
        {clubName && (
          <p className="text-[11px] text-muted-foreground">{clubName}</p>
        )}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(event.eventDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </span>
          <span>
            {regCount}/{event.maxParticipants} registered
          </span>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ href, icon: Icon, label, color }: {
  href: string;
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-muted/50 hover:shadow-md transition-all group"
    >
      <div className={`rounded-xl p-2.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </span>
    </Link>
  );
}

// ==================== ADMIN DASHBOARD ====================

function AdminDashboard() {
  const store = useDataStore();
  const { currentUser } = useAuth();
  const stats = store.getDashboardStats();
  const memberCounts = store.getClubMemberCounts();
  const categoryData = store.getCategoryDistribution();
  const budgetData = store.getBudgetByClub();

  const upcomingEvents = store.events
    .filter((e) => e.status === "upcoming")
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5);

  const recentClubs = store.clubs.slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-[10px] font-semibold">
            <Shield className="h-3 w-3 mr-1" /> ADMIN
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">System Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, <span className="font-medium text-foreground">{currentUser!.student.name}</span>.
          Here&apos;s your system-wide overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="Total Clubs" value={stats.totalClubs} icon={Building2}
          gradient="from-violet-100 to-indigo-100" iconColor="text-violet-600" subtitle="+2 this semester" />
        <StatCard title="Active Students" value={stats.totalStudents} icon={GraduationCap}
          gradient="from-emerald-100 to-teal-100" iconColor="text-emerald-600" subtitle="+5 this month" />
        <StatCard title="Total Events" value={stats.totalEvents} icon={CalendarDays}
          gradient="from-amber-100 to-orange-100" iconColor="text-amber-600"
          subtitle={`${stats.upcomingEvents} upcoming`} />
        <StatCard title="Budget Approved" value={`₹${(stats.totalBudgetApproved / 1000).toFixed(0)}K`} icon={Wallet}
          gradient="from-pink-100 to-rose-100" iconColor="text-pink-600"
          subtitle={`₹${(stats.totalBudgetPending / 1000).toFixed(0)}K pending`} />
        <StatCard title="Registrations" value={stats.totalRegistrations} icon={TrendingUp}
          gradient="from-purple-100 to-fuchsia-100" iconColor="text-purple-600" subtitle="Across all events" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Members per Club
            </CardTitle>
            <CardDescription>Active membership distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={memberCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                <XAxis dataKey="clubName" tick={{ fill: "oklch(0.45 0 0)", fontSize: 11 }}
                  axisLine={{ stroke: "oklch(0.85 0 0)" }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "oklch(0.45 0 0)", fontSize: 11 }}
                  axisLine={{ stroke: "oklch(0.85 0 0)" }} />
                <Tooltip contentStyle={{
                  background: "white", border: "1px solid oklch(0.9 0 0)",
                  borderRadius: "8px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                }} />
                <Bar dataKey="members" fill="oklch(0.55 0.2 270)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Club Categories
            </CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} innerRadius={55}
                  paddingAngle={4} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{
                  background: "white", border: "1px solid oklch(0.9 0 0)",
                  borderRadius: "8px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-emerald-600" />
              Budget Overview
            </CardTitle>
            <CardDescription>Approved vs Pending budget by club</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                <XAxis dataKey="clubName" tick={{ fill: "oklch(0.45 0 0)", fontSize: 11 }}
                  axisLine={{ stroke: "oklch(0.85 0 0)" }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "oklch(0.45 0 0)", fontSize: 11 }}
                  axisLine={{ stroke: "oklch(0.85 0 0)" }}
                  tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip contentStyle={{
                  background: "white", border: "1px solid oklch(0.9 0 0)",
                  borderRadius: "8px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                }} formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="approved" name="Approved" fill="oklch(0.55 0.17 162)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="oklch(0.65 0.188 70)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
                <CardDescription>All upcoming events</CardDescription>
              </div>
              <Link href="/events" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => {
                const club = store.clubs.find((c) => c.clubId === event.clubId);
                const regCount = store.registrations.filter((r) => r.eventId === event.eventId).length;
                return <EventListItem key={event.eventId} event={event} clubName={club?.clubName} regCount={regCount} />;
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick overview of clubs */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Active Clubs
              </CardTitle>
              <CardDescription>Quick overview of all clubs</CardDescription>
            </div>
            <Link href="/clubs" className="text-xs text-primary hover:underline flex items-center gap-1">
              Manage all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentClubs.map((club) => {
              const memberCount = store.getClubMembers(club.clubId).length;
              const eventCount = store.getClubEvents(club.clubId).length;
              return (
                <Link key={club.clubId} href={`/clubs/${club.clubId}`}
                  className="p-4 rounded-xl border border-border hover:shadow-md hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${club.coverColor} flex items-center justify-center text-white font-bold`}>
                      {club.clubName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{club.clubName}</p>
                      <p className="text-[11px] text-muted-foreground">{club.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {memberCount}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {eventCount}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== PRESIDENT / VP DASHBOARD ====================

function ClubLeaderDashboard() {
  const store = useDataStore();
  const { currentUser, role, roleInfo, activeClub } = useAuth();

  if (!activeClub) return null;

  const members = store.getClubMembers(activeClub.clubId);
  const events = store.getClubEvents(activeClub.clubId);
  const budgets = store.getClubBudgets(activeClub.clubId);
  const upcomingEvents = events
    .filter((e) => e.status === "upcoming")
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5);

  const completedEvents = events.filter((e) => e.status === "completed").length;
  const approvedBudget = budgets.filter((b) => b.status === "approved").reduce((s, b) => s + b.amount, 0);
  const pendingBudget = budgets.filter((b) => b.status === "pending").reduce((s, b) => s + b.amount, 0);
  const adminMembers = members.filter((m) => m.role?.roleType === "admin").length;

  const isPresident = role === "president";

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Badge className={`${isPresident ? "bg-red-100 text-red-700 border-red-300" : "bg-violet-100 text-violet-700 border-violet-300"} text-[10px] font-semibold`}>
            <Star className="h-3 w-3 mr-1" /> {isPresident ? "PRESIDENT" : "VICE PRESIDENT"}
          </Badge>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm font-medium">{activeClub.clubName}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Club Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your club, {currentUser!.student.name}. Here&apos;s what&apos;s happening at{" "}
          <span className="font-medium text-foreground">{activeClub.clubName}</span>.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickAction href={`/clubs/${activeClub.clubId}`} icon={Building2} label="Club Page" color="bg-violet-100 text-violet-600" />
        <QuickAction href="/events" icon={CalendarDays} label="Manage Events" color="bg-amber-100 text-amber-600" />
        <QuickAction href="/members" icon={Users} label="Members" color="bg-emerald-100 text-emerald-600" />
        <QuickAction href="/budget" icon={Wallet} label="Budget" color="bg-pink-100 text-pink-600" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Members" value={members.length} icon={Users}
          gradient="from-violet-100 to-indigo-100" iconColor="text-violet-600"
          subtitle={`${adminMembers} in leadership`} />
        <StatCard title="Club Events" value={events.length} icon={CalendarDays}
          gradient="from-amber-100 to-orange-100" iconColor="text-amber-600"
          subtitle={`${completedEvents} completed`} />
        <StatCard title="Budget Approved" value={`₹${(approvedBudget / 1000).toFixed(0)}K`} icon={Wallet}
          gradient="from-emerald-100 to-teal-100" iconColor="text-emerald-600"
          subtitle={`₹${(pendingBudget / 1000).toFixed(0)}K pending`} />
        <StatCard title="Upcoming" value={upcomingEvents.length} icon={Clock}
          gradient="from-sky-100 to-blue-100" iconColor="text-sky-600"
          subtitle="Events to manage" />
      </div>

      {/* Members + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Team Members
                </CardTitle>
                <CardDescription>{members.length} members in your club</CardDescription>
              </div>
              <Link href={`/clubs/${activeClub.clubId}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.slice(0, 6).map((m) => (
              <div key={m.membershipId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                    {m.student?.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.student?.name}</p>
                  <p className="text-[11px] text-muted-foreground">{m.student?.department}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] ${m.role?.roleType === "admin"
                  ? "bg-violet-50 text-violet-600 border-violet-200" : ""}`}>
                  {m.role?.roleName}
                </Badge>
              </div>
            ))}
            {members.length > 6 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{members.length - 6} more members
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-amber-600" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>Your club&apos;s next events</CardDescription>
              </div>
              <Link href="/events" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <CalendarDays className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                <p className="text-sm text-muted-foreground">No upcoming events</p>
                <Link href="/events" className="text-xs text-primary hover:underline">Create one →</Link>
              </div>
            ) : (
              upcomingEvents.map((event) => {
                const regCount = store.registrations.filter((r) => r.eventId === event.eventId).length;
                return <EventListItem key={event.eventId} event={event} regCount={regCount} />;
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-emerald-600" />
              Budget Requests
            </CardTitle>
            <CardDescription>Recent budget activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgets.slice(0, 5).map((b) => (
                <div key={b.budgetId} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{b.description || "Budget Request"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {b.requestDate ? new Date(b.requestDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold">₹{b.amount.toLocaleString()}</p>
                    <Badge variant="outline" className={`text-[10px] ${b.status === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : b.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-200"
                        : "bg-red-50 text-red-600 border-red-200"}`}>
                      {b.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== SECRETARY DASHBOARD ====================

function SecretaryDashboard() {
  const store = useDataStore();
  const { currentUser, activeClub } = useAuth();

  if (!activeClub) return null;

  const members = store.getClubMembers(activeClub.clubId);
  const events = store.getClubEvents(activeClub.clubId);
  const upcomingEvents = events.filter((e) => e.status === "upcoming")
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5);

  const totalRegistrations = events.reduce((sum, e) =>
    sum + store.registrations.filter((r) => r.eventId === e.eventId).length, 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Badge className="bg-sky-100 text-sky-700 border-sky-300 text-[10px] font-semibold">
            <ClipboardCheck className="h-3 w-3 mr-1" /> SECRETARY
          </Badge>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm font-medium">{activeClub.clubName}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Secretary Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Hi {currentUser!.student.name}! Manage registrations and attendance for{" "}
          <span className="font-medium text-foreground">{activeClub.clubName}</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickAction href={`/clubs/${activeClub.clubId}`} icon={Building2} label="Club Page" color="bg-sky-100 text-sky-600" />
        <QuickAction href="/attendance" icon={ClipboardCheck} label="Attendance" color="bg-emerald-100 text-emerald-600" />
        <QuickAction href="/events" icon={CalendarDays} label="Events" color="bg-amber-100 text-amber-600" />
        <QuickAction href="/members" icon={Users} label="Members" color="bg-violet-100 text-violet-600" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Members" value={members.length} icon={Users}
          gradient="from-sky-100 to-blue-100" iconColor="text-sky-600" subtitle={`${activeClub.clubName}`} />
        <StatCard title="Total Registrations" value={totalRegistrations} icon={UserPlus}
          gradient="from-emerald-100 to-teal-100" iconColor="text-emerald-600" subtitle="Across all events" />
        <StatCard title="Upcoming Events" value={upcomingEvents.length} icon={CalendarDays}
          gradient="from-amber-100 to-orange-100" iconColor="text-amber-600" subtitle="To manage" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Track registrations and attendance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => {
                const regCount = store.registrations.filter((r) => r.eventId === event.eventId).length;
                const fillPercent = (regCount / event.maxParticipants) * 100;
                return (
                  <Link key={event.eventId} href={`/events/${event.eventId}`}
                    className="block p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{event.eventName}</p>
                      <span className="text-xs text-muted-foreground">{regCount}/{event.maxParticipants}</span>
                    </div>
                    <Progress value={fillPercent} className="h-1.5" />
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Recent Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.slice(0, 8).map((m) => (
              <div key={m.membershipId} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-[10px] font-semibold bg-gradient-to-br from-sky-500 to-blue-500 text-white">
                    {m.student?.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.student?.name}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{m.role?.roleName}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== TREASURER DASHBOARD ====================

function TreasurerDashboard() {
  const store = useDataStore();
  const { currentUser, activeClub } = useAuth();

  if (!activeClub) return null;

  const budgets = store.getClubBudgets(activeClub.clubId);
  const approved = budgets.filter((b) => b.status === "approved");
  const pending = budgets.filter((b) => b.status === "pending");
  const rejected = budgets.filter((b) => b.status === "rejected");
  const totalApproved = approved.reduce((s, b) => s + b.amount, 0);
  const totalPending = pending.reduce((s, b) => s + b.amount, 0);
  const totalRejected = rejected.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-[10px] font-semibold">
            <CircleDollarSign className="h-3 w-3 mr-1" /> TREASURER
          </Badge>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm font-medium">{activeClub.clubName}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Budget Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track finances and budget requests for{" "}
          <span className="font-medium text-foreground">{activeClub.clubName}</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickAction href="/budget" icon={Wallet} label="Budget Requests" color="bg-amber-100 text-amber-600" />
        <QuickAction href={`/clubs/${activeClub.clubId}`} icon={Building2} label="Club Page" color="bg-violet-100 text-violet-600" />
        <QuickAction href="/events" icon={CalendarDays} label="Events" color="bg-sky-100 text-sky-600" />
        <QuickAction href="/members" icon={Users} label="Members" color="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Approved" value={`₹${(totalApproved / 1000).toFixed(0)}K`} icon={CheckCircle2}
          gradient="from-emerald-100 to-teal-100" iconColor="text-emerald-600"
          subtitle={`${approved.length} requests`} />
        <StatCard title="Pending" value={`₹${(totalPending / 1000).toFixed(0)}K`} icon={Clock}
          gradient="from-amber-100 to-orange-100" iconColor="text-amber-600"
          subtitle={`${pending.length} requests`} />
        <StatCard title="Rejected" value={`₹${(totalRejected / 1000).toFixed(0)}K`} icon={ShieldAlert}
          gradient="from-red-100 to-rose-100" iconColor="text-red-600"
          subtitle={`${rejected.length} requests`} />
        <StatCard title="Total Requests" value={budgets.length} icon={Wallet}
          gradient="from-violet-100 to-indigo-100" iconColor="text-violet-600"
          subtitle={`For ${activeClub.clubName}`} />
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CircleDollarSign className="h-5 w-5 text-amber-600" />
                All Budget Requests
              </CardTitle>
              <CardDescription>Complete budget history</CardDescription>
            </div>
            <Link href="/budget" className="text-xs text-primary hover:underline flex items-center gap-1">
              Manage <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {budgets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No budget requests yet</p>
            ) : (
              budgets.map((b) => (
                <div key={b.budgetId} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{b.description || "Budget Request"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {b.requestDate ? new Date(b.requestDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <p className="text-sm font-bold">₹{b.amount.toLocaleString()}</p>
                    <Badge variant="outline" className={`text-[10px] ${b.status === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : b.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-200"
                        : "bg-red-50 text-red-600 border-red-200"}`}>
                      {b.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== EVENT COORDINATOR DASHBOARD ====================

function CoordinatorDashboard() {
  const store = useDataStore();
  const { currentUser, activeClub } = useAuth();

  if (!activeClub) return null;

  const events = store.getClubEvents(activeClub.clubId);
  const upcomingEvents = events.filter((e) => e.status === "upcoming")
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  const completedEvents = events.filter((e) => e.status === "completed");
  const totalRegistrations = events.reduce((sum, e) =>
    sum + store.registrations.filter((r) => r.eventId === e.eventId).length, 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-[10px] font-semibold">
            <CalendarCheck className="h-3 w-3 mr-1" /> COORDINATOR
          </Badge>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm font-medium">{activeClub.clubName}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Event Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage events and attendance for{" "}
          <span className="font-medium text-foreground">{activeClub.clubName}</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickAction href="/events" icon={CalendarDays} label="All Events" color="bg-emerald-100 text-emerald-600" />
        <QuickAction href="/attendance" icon={ClipboardCheck} label="Attendance" color="bg-sky-100 text-sky-600" />
        <QuickAction href={`/clubs/${activeClub.clubId}`} icon={Building2} label="Club Page" color="bg-violet-100 text-violet-600" />
        <QuickAction href="/members" icon={Users} label="Members" color="bg-amber-100 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Upcoming Events" value={upcomingEvents.length} icon={CalendarDays}
          gradient="from-emerald-100 to-teal-100" iconColor="text-emerald-600" subtitle="To coordinate" />
        <StatCard title="Completed" value={completedEvents.length} icon={CheckCircle2}
          gradient="from-violet-100 to-indigo-100" iconColor="text-violet-600" subtitle="Events finished" />
        <StatCard title="Total Registrations" value={totalRegistrations} icon={UserPlus}
          gradient="from-amber-100 to-orange-100" iconColor="text-amber-600" subtitle="Across all events" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-emerald-600" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Events you&apos;re coordinating</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => {
                const regCount = store.registrations.filter((r) => r.eventId === event.eventId).length;
                return <EventListItem key={event.eventId} event={event} regCount={regCount} />;
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              Completed Events
            </CardTitle>
            <CardDescription>Past events summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {completedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No completed events yet</p>
            ) : (
              completedEvents.slice(0, 5).map((event) => {
                const regCount = store.registrations.filter((r) => r.eventId === event.eventId).length;
                return <EventListItem key={event.eventId} event={event} regCount={regCount} />;
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== STUDENT DASHBOARD ====================

function StudentDashboard() {
  const store = useDataStore();
  const { currentUser } = useAuth();

  const studentId = currentUser!.student.studentId;
  const myClubs = store.getStudentClubs(studentId);
  const myRegistrations = store.getStudentRegistrations(studentId);

  const upcomingRegistrations = myRegistrations
    .filter((r) => r.event?.status === "upcoming")
    .sort((a, b) => new Date(a.event!.eventDate).getTime() - new Date(b.event!.eventDate).getTime());

  const allUpcomingEvents = store.events
    .filter((e) => e.status === "upcoming")
    .filter((e) => !myRegistrations.some((r) => r.eventId === e.eventId))
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-[10px] font-semibold">
            <BookOpen className="h-3 w-3 mr-1" /> STUDENT
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {currentUser!.student.name}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse clubs, register for events, and track your activities.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickAction href="/clubs" icon={Building2} label="Browse Clubs" color="bg-violet-100 text-violet-600" />
        <QuickAction href="/events" icon={CalendarDays} label="All Events" color="bg-amber-100 text-amber-600" />
        <QuickAction href="/attendance" icon={ClipboardCheck} label="My Attendance" color="bg-emerald-100 text-emerald-600" />
        <QuickAction href="/students" icon={GraduationCap} label="Students" color="bg-sky-100 text-sky-600" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="My Clubs" value={myClubs.length} icon={Building2}
          gradient="from-violet-100 to-indigo-100" iconColor="text-violet-600"
          subtitle="Clubs you've joined" />
        <StatCard title="Registered Events" value={myRegistrations.length} icon={CalendarDays}
          gradient="from-amber-100 to-orange-100" iconColor="text-amber-600"
          subtitle={`${upcomingRegistrations.length} upcoming`} />
        <StatCard title="Browse Events" value={store.events.filter((e) => e.status === "upcoming").length} icon={Sparkles}
          gradient="from-emerald-100 to-teal-100" iconColor="text-emerald-600"
          subtitle="Available to register" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Clubs */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  My Clubs
                </CardTitle>
                <CardDescription>Clubs you&apos;re a member of</CardDescription>
              </div>
              <Link href="/clubs" className="text-xs text-primary hover:underline flex items-center gap-1">
                Browse all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {myClubs.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Building2 className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                <p className="text-sm text-muted-foreground">You haven&apos;t joined any clubs yet</p>
                <Link href="/clubs" className="text-xs text-primary hover:underline">Browse clubs →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myClubs.map((mc) => (
                  <Link key={mc.membershipId} href={`/clubs/${mc.club?.clubId}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${mc.club?.coverColor} flex items-center justify-center text-white font-bold`}>
                      {mc.club?.clubName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {mc.club?.clubName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{mc.club?.category}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{mc.role?.roleName}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Upcoming Events */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-amber-600" />
                  My Upcoming Events
                </CardTitle>
                <CardDescription>Events you&apos;re registered for</CardDescription>
              </div>
              <Link href="/events" className="text-xs text-primary hover:underline flex items-center gap-1">
                All events <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {upcomingRegistrations.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <CalendarDays className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                <p className="text-sm text-muted-foreground">No upcoming registrations</p>
                <Link href="/events" className="text-xs text-primary hover:underline">Browse events →</Link>
              </div>
            ) : (
              upcomingRegistrations.map((r) => {
                if (!r.event) return null;
                const club = store.clubs.find((c) => c.clubId === r.event!.clubId);
                const regCount = store.registrations.filter((reg) => reg.eventId === r.eventId).length;
                return <EventListItem key={r.registrationId} event={r.event} clubName={club?.clubName} regCount={regCount} />;
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Discover Events */}
      {allUpcomingEvents.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Discover Events
            </CardTitle>
            <CardDescription>Events you haven&apos;t registered for yet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allUpcomingEvents.map((event) => {
                const club = store.clubs.find((c) => c.clubId === event.clubId);
                const regCount = store.registrations.filter((r) => r.eventId === event.eventId).length;
                const fillPercent = (regCount / event.maxParticipants) * 100;
                return (
                  <Link key={event.eventId} href={`/events/${event.eventId}`}
                    className="p-4 rounded-xl border border-border hover:shadow-md hover:border-primary/30 transition-all group">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {event.eventName}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">{club?.clubName}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{regCount}/{event.maxParticipants}</span>
                        <span>{Math.round(fillPercent)}%</span>
                      </div>
                      <Progress value={fillPercent} className="h-1.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== MAIN ROUTER ====================

export default function DashboardPage() {
  const { role } = useAuth();

  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "president":
    case "vice_president":
      return <ClubLeaderDashboard />;
    case "secretary":
      return <SecretaryDashboard />;
    case "treasurer":
      return <TreasurerDashboard />;
    case "event_coordinator":
      return <CoordinatorDashboard />;
    case "student":
    default:
      return <StudentDashboard />;
  }
}
