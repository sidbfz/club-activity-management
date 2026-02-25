"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    CalendarDays,
    Wallet,
    ClipboardCheck,
    Building2,
    GraduationCap,
    Sparkles,
    ChevronDown,
    Crown,
    Shield,
    ShieldCheck,
    Briefcase,
    CalendarCheck,
    LogOut,
    User,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    useAuth,
    NAV_ITEMS,
    type AppRole,
} from "@/lib/auth-context";

const navIcons: Record<string, React.ElementType> = {
    "/": LayoutDashboard,
    "/clubs": Building2,
    "/events": CalendarDays,
    "/members": Users,
    "/students": GraduationCap,
    "/budget": Wallet,
    "/attendance": ClipboardCheck,
};

const roleIcons: Record<AppRole, React.ElementType> = {
    admin: ShieldCheck,
    president: Crown,
    vice_president: Shield,
    secretary: Briefcase,
    treasurer: Wallet,
    event_coordinator: CalendarCheck,
    student: GraduationCap,
};

function AppSidebarContent() {
    const pathname = usePathname();
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const { canAccessNav, roleInfo, currentUser, activeClub } = useAuth();

    const visibleNavItems = NAV_ITEMS.filter((item) => canAccessNav(item));

    // currentUser is guaranteed non-null when AppShell renders (AuthGate guards it)
    const user = currentUser!;

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <SidebarHeader className="p-4">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20 transition-shadow group-hover:shadow-violet-600/40">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight gradient-text">
                                ClubSync
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                Activity Manager
                            </span>
                        </div>
                    )}
                </Link>
            </SidebarHeader>
            <Separator className="opacity-50" />

            {/* Active Role Badge */}
            {!collapsed && (
                <div className="px-4 py-3">
                    <div
                        className={`rounded-lg bg-gradient-to-r ${roleInfo.gradientBg} p-[1px]`}
                    >
                        <div className="rounded-[7px] bg-sidebar px-3 py-2 space-y-0.5">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                Signed in as
                            </p>
                            <p className="text-xs font-semibold">{roleInfo.shortLabel}</p>
                            {activeClub && (
                                <p className="text-[10px] text-muted-foreground">
                                    {activeClub.clubName}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <SidebarContent className="p-2">
                <SidebarMenu>
                    {visibleNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = navIcons[item.href] ?? LayoutDashboard;
                        return (
                            <SidebarMenuItem key={item.href}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className={`transition-all duration-200 ${isActive
                                                ? "bg-sidebar-accent text-sidebar-primary font-semibold shadow-sm"
                                                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                                                }`}
                                        >
                                            <Link href={item.href}>
                                                <Icon
                                                    className={`h-4 w-4 ${isActive ? "text-violet-600 dark:text-violet-400" : ""
                                                        }`}
                                                />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </TooltipTrigger>
                                    {collapsed && (
                                        <TooltipContent side="right">{item.label}</TooltipContent>
                                    )}
                                </Tooltip>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>
            <Separator className="opacity-50" />
            <SidebarFooter className="p-3">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-violet-500/30">
                        <AvatarFallback
                            className={`bg-gradient-to-br ${roleInfo.gradientBg} text-white text-xs font-bold`}
                        >
                            {user.student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium truncate">
                                {user.student.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate">
                                {user.student.email}
                            </span>
                        </div>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}

function UserMenu() {
    const { currentUser, roleInfo, logout, activeClub } = useAuth();

    // currentUser is guaranteed non-null when AppShell renders
    const user = currentUser!;
    const RoleIcon = roleIcons[user.role];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-border/40 bg-card/50 hover:bg-card/80 transition-colors text-sm">
                    <Avatar className="h-7 w-7">
                        <AvatarFallback
                            className={`bg-gradient-to-br ${roleInfo.gradientBg} text-white text-[10px] font-bold`}
                        >
                            {user.student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start">
                        <span className="text-xs font-medium leading-tight">
                            {user.student.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight">
                            {roleInfo.shortLabel}
                        </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-card border-border/40">
                {/* User Info */}
                <div className="px-3 py-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback
                                className={`bg-gradient-to-br ${roleInfo.gradientBg} text-white text-sm font-bold`}
                            >
                                {user.student.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.student.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">
                                {user.student.email}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Badge
                                    variant="outline"
                                    className={`text-[9px] ${roleInfo.color} border-current/20`}
                                >
                                    <RoleIcon className="h-2.5 w-2.5 mr-0.5" />
                                    {roleInfo.shortLabel}
                                </Badge>
                                {activeClub && (
                                    <Badge
                                        variant="outline"
                                        className="text-[9px] text-muted-foreground"
                                    >
                                        {activeClub.clubName}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-muted-foreground cursor-pointer">
                    <User className="h-3.5 w-3.5 mr-2" />
                    My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={logout}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:text-red-300 focus:text-red-700 dark:text-red-300 cursor-pointer"
                >
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { roleInfo, activeClub } = useAuth();

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebarContent />
                <main className="flex-1 flex flex-col min-w-0">
                    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/40 bg-background/80 backdrop-blur-xl px-6">
                        <SidebarTrigger className="-ml-2" />
                        {/* Role context indicator */}
                        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge
                                variant="outline"
                                className={`text-[10px] ${roleInfo.color} border-current/20`}
                            >
                                {roleInfo.shortLabel}
                            </Badge>
                            {activeClub && (
                                <>
                                    <span>•</span>
                                    <span>{activeClub.clubName}</span>
                                </>
                            )}
                        </div>
                        <div className="flex-1" />
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 mr-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs text-muted-foreground hidden sm:inline">
                                    Online
                                </span>
                            </div>
                            <UserMenu />
                        </div>
                    </header>
                    <div className="flex-1 overflow-auto p-6">{children}</div>
                </main>
            </div>
        </SidebarProvider>
    );
}
