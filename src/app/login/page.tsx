
"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DraftingCompass, User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";


const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-65.2 64.3C337.5 109.9 296.1 92 248 92c-71.8 0-130 58.2-130 130s58.2 130 130 130c79.3 0 119.5-54.2 124.9-82.3H248v-69.8h239.1c1.3 12.2 2.9 24.4 2.9 36.8z"></path>
    </svg>
);


export default function LoginPage() {
  const [role, setRole] = useState("student");
  const router = useRouter();

  const handleLogin = () => {
    // In a real app, you would handle authentication here.
    // For this prototype, we'll just redirect based on role.
    if (role === 'admin') {
      router.push('/');
    } else {
      router.push('/student');
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
          <div className="space-y-6">
            <RadioGroup defaultValue="student" onValueChange={setRole} className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="student" id="student" className="peer sr-only" />
                <Label
                  htmlFor="student"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <User className="mb-3 h-6 w-6" />
                  Student
                </Label>
              </div>
              <div>
                <RadioGroupItem value="admin" id="admin" className="peer sr-only" />
                <Label
                  htmlFor="admin"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Shield className="mb-3 h-6 w-6" />
                  Admin
                </Label>
              </div>
            </RadioGroup>
            
            <Button variant="default" className="w-full" onClick={handleLogin}>
              <GoogleIcon/>
              Sign in with Google
            </Button>
            
            <p className="px-8 text-center text-sm text-muted-foreground">
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
