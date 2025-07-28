
"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraftingCompass, User, Shield, Loader2, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, provider, isAdmin, ADMIN_EMAIL } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";


const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-65.2 64.3C337.5 109.9 296.1 92 248 92c-71.8 0-130 58.2-130 130s58.2 130 130 130c79.3 0 119.5-54.2 124.9-82.3H248v-69.8h239.1c1.3 12.2 2.9 24.4 2.9 36.8z"></path>
    </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isStudentLoggingIn, setIsStudentLoggingIn] = useState(false);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleStudentLogin = async () => {
    setIsStudentLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user || !user.email) {
          throw new Error("Could not retrieve user information from Google.");
      }
      
      const userIsAdmin = await isAdmin(user.email);
      if (userIsAdmin) {
        router.push('/');
      } else {
        router.push('/student');
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An unexpected error occurred during login.",
      });
    } finally {
        setIsStudentLoggingIn(false);
    }
  };

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsAdminLoggingIn(true);
    try {
        if (adminEmail !== ADMIN_EMAIL) {
            throw new Error("Invalid admin email address.");
        }
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        router.push('/');
    } catch (error: any) {
        let description = "An unexpected error occurred.";
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            description = "Invalid credentials. Please try again.";
        } else if (error.message) {
            description = error.message;
        }
        toast({
            variant: "destructive",
            title: "Admin Login Failed",
            description,
        });
    } finally {
        setIsAdminLoggingIn(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9D6FF,transparent)]"></div></div>
        <Card className="w-full max-w-md mx-auto shadow-2xl">
            <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <DraftingCompass className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">CAD Comparator</CardTitle>
            <CardDescription>
                Sign in to compare, analyze, and report on your 3D models.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="student" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="student"><GraduationCap className="mr-2"/>Student</TabsTrigger>
                        <TabsTrigger value="admin"><Shield className="mr-2"/>Admin</TabsTrigger>
                    </TabsList>
                    <TabsContent value="student">
                        <Card>
                        <CardHeader>
                            <CardTitle>Student Login</CardTitle>
                            <CardDescription>
                            Sign in with your Google account to access the student dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full" onClick={handleStudentLogin} disabled={isStudentLoggingIn}>
                                {isStudentLoggingIn ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
                                {isStudentLoggingIn ? "Signing in..." : "Sign in with Google"}
                            </Button>
                        </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="admin">
                        <Card>
                            <form onSubmit={handleAdminLogin}>
                                <CardHeader>
                                    <CardTitle>Admin Login</CardTitle>
                                    <CardDescription>
                                    Enter your admin credentials to access the dashboard.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" placeholder="admin@example.com" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input id="password" type="password" required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full" disabled={isAdminLoggingIn}>
                                    {isAdminLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Sign In
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>
                </Tabs>
                 <p className="px-8 text-center text-sm text-muted-foreground pt-4">
                    By clicking continue, you agree to our{" "}
                    <Link
                        href="#"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        href="#"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
