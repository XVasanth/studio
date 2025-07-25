
"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DraftingCompass, User, Shield, Loader2, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, provider, isAdmin } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";


const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-65.2 64.3C337.5 109.9 296.1 92 248 92c-71.8 0-130 58.2-130 130s58.2 130 130 130c79.3 0 119.5-54.2 124.9-82.3H248v-69.8h239.1c1.3 12.2 2.9 24.4 2.9 36.8z"></path>
    </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingInAs, setIsLoggingInAs] = useState<'student' | 'admin' | null>(null);

  const handleLogin = async (role: 'student' | 'admin') => {
    setIsLoggingInAs(role);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user || !user.email) {
          throw new Error("Could not retrieve user information from Google.");
      }
      
      const userIsAdmin = await isAdmin(user.email);

      if (role === 'admin') {
          if(userIsAdmin) {
              router.push('/');
          } else {
              await auth.signOut(); // Sign out the unauthorized user
              throw new Error("You are not authorized to access the admin panel.");
          }
      } else { // role === 'student'
          if(userIsAdmin) {
            // An admin can also log in as a student to see the student view
            router.push('/student');
          } else {
            router.push('/student');
          }
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An unexpected error occurred during login.",
      });
    } finally {
        setIsLoggingInAs(null);
    }
  };

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
          <div className="space-y-4">
             <Button variant="outline" className="w-full" onClick={() => handleLogin('student')} disabled={!!isLoggingInAs}>
              {isLoggingInAs === 'student' ? <Loader2 className="animate-spin" /> : <GraduationCap />}
              {isLoggingInAs === 'student' ? "Signing in..." : "Student Login with Google"}
            </Button>
            <Button variant="default" className="w-full" onClick={() => handleLogin('admin')} disabled={!!isLoggingInAs}>
              {isLoggingInAs === 'admin' ? <Loader2 className="animate-spin" /> : <Shield />}
               {isLoggingInAs === 'admin' ? "Signing in..." : "Admin Login with Google"}
            </Button>
            
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
