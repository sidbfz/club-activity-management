"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Sparkles,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    Crown,
    Shield,
    Briefcase,
    Wallet,
    CalendarCheck,
    Users,
    GraduationCap,
    Check,
    User,
} from "lucide-react";
import {
    useAuth,
    DEMO_PROFILES,
    APP_ROLES,
    type AppRole,
    type UserProfile,
} from "@/lib/auth-context";
import { useDataStore } from "@/lib/data-store";

const roleIcons: Record<AppRole, React.ElementType> = {
    admin: ShieldCheck,
    president: Crown,
    vice_president: Shield,
    secretary: Briefcase,
    treasurer: Wallet,
    event_coordinator: CalendarCheck,
    student: GraduationCap,
};

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [signUpEmail, setSignUpEmail] = useState("");
    const [signUpPassword, setSignUpPassword] = useState("");
    const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
    const { login } = useAuth();
    const store = useDataStore();
    const router = useRouter();

    const handleDemoLogin = (profile: UserProfile) => {
        login(profile);
        router.push("/");
    };

    const handleSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        // For demo — match email to a demo profile, or default to first
        const match = DEMO_PROFILES.find(
            (p) => p.student.email.toLowerCase() === email.toLowerCase()
        );
        if (match) {
            login(match);
        } else {
            // Default login as student
            login(DEMO_PROFILES[DEMO_PROFILES.length - 1]);
        }
        router.push("/");
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        // For demo — sign up as student
        login(DEMO_PROFILES[DEMO_PROFILES.length - 1]);
        router.push("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl" />
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center relative z-10 animate-fade-in-up">
                {/* Left side — Branding */}
                <div className="hidden lg:flex flex-col space-y-8 pr-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/30">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                                ClubSync
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Activity Management System
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold leading-tight tracking-tight">
                            Manage your
                            <br />
                            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                club activities
                            </span>
                            <br />
                            seamlessly.
                        </h2>
                        <p className="text-muted-foreground max-w-md leading-relaxed">
                            Track events, manage members, handle budgets, and monitor
                            attendance — all in one beautiful platform built for student
                            organizations.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-md">
                        {[
                            { label: "Clubs", value: "8+", icon: "🏛️" },
                            { label: "Events", value: "12+", icon: "📅" },
                            { label: "Students", value: "15+", icon: "🎓" },
                            { label: "Budgets", value: "₹2.5L+", icon: "💰" },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="p-3 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{stat.icon}</span>
                                    <div>
                                        <p className="text-lg font-bold">{stat.value}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {stat.label}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side — Auth Card */}
                <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-2xl shadow-violet-600/5">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 pt-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                            ClubSync
                        </h1>
                    </div>

                    <Tabs defaultValue="signin" className="w-full">
                        <CardHeader className="pb-4">
                            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                                <TabsTrigger
                                    value="signin"
                                    className="text-xs data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                                >
                                    Sign In
                                </TabsTrigger>
                                <TabsTrigger
                                    value="signup"
                                    className="text-xs data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                                >
                                    Sign Up
                                </TabsTrigger>
                            </TabsList>
                        </CardHeader>

                        {/* Sign In Tab */}
                        <TabsContent value="signin">
                            <CardContent className="space-y-5 px-6 pb-6">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">Welcome back</CardTitle>
                                    <CardDescription>
                                        Sign in to your account or use a demo profile below
                                    </CardDescription>
                                </div>

                                <form onSubmit={handleSignIn} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs">
                                            Email
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@university.edu"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-9 bg-muted/30 border-border/40"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-xs">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-9 pr-9 bg-muted/30 border-border/40"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-600/20 transition-all"
                                    >
                                        Sign In
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </form>

                                <div className="relative">
                                    <Separator className="opacity-50" />
                                    <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-[10px] text-muted-foreground uppercase tracking-wider">
                                        Quick Demo Login
                                    </span>
                                </div>

                                {/* Demo Profiles */}
                                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                                    {DEMO_PROFILES.map((profile, index) => {
                                        const info = APP_ROLES.find(
                                            (r) => r.id === profile.role
                                        )!;
                                        const Icon = roleIcons[profile.role];
                                        const club = profile.clubId
                                            ? store.getClubById(profile.clubId)
                                            : null;

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleDemoLogin(profile)}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/30 hover:border-violet-500/30 transition-all text-left group"
                                            >
                                                <div
                                                    className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${info.gradientBg} flex items-center justify-center shadow-sm`}
                                                >
                                                    <Icon className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium group-hover:text-violet-600 dark:text-violet-400 transition-colors">
                                                            {info.shortLabel}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[9px] ${info.color} border-current/20`}
                                                        >
                                                            {profile.student.name.split(" ")[0]}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                        {info.description.slice(0, 60)}...
                                                        {club ? ` • ${club.clubName}` : ""}
                                                    </p>
                                                </div>
                                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </TabsContent>

                        {/* Sign Up Tab */}
                        <TabsContent value="signup">
                            <CardContent className="space-y-5 px-6 pb-6">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">Create an account</CardTitle>
                                    <CardDescription>
                                        Join ClubSync and start exploring student clubs
                                    </CardDescription>
                                </div>

                                <form onSubmit={handleSignUp} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name" className="text-xs">
                                            Full Name
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signup-name"
                                                type="text"
                                                placeholder="Your full name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="pl-9 bg-muted/30 border-border/40"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email" className="text-xs">
                                            University Email
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="you@university.edu"
                                                value={signUpEmail}
                                                onChange={(e) => setSignUpEmail(e.target.value)}
                                                className="pl-9 bg-muted/30 border-border/40"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password" className="text-xs">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signup-password"
                                                type="password"
                                                placeholder="Create a strong password"
                                                value={signUpPassword}
                                                onChange={(e) => setSignUpPassword(e.target.value)}
                                                className="pl-9 bg-muted/30 border-border/40"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <Check className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                                        <p>
                                            By signing up, you agree to our Terms of Service and
                                            Privacy Policy.
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-600/20"
                                    >
                                        Create Account
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </form>

                                <p className="text-center text-[11px] text-muted-foreground">
                                    New accounts are created with{" "}
                                    <span className="font-medium text-purple-600 dark:text-purple-400">Student</span>{" "}
                                    role by default.
                                    <br />
                                    Club leaders can assign roles after you join a club.
                                </p>
                            </CardContent>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
