
"use client";

import Link from "next/link";
import { DraftingCompass, User, LogOut, LayoutDashboard, ShieldCheck, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { auth, isAdmin } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [userRole, setUserRole] = useState<'admin' | 'student' | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
        if (user && user.email) {
            const admin = await isAdmin(user.email);
            setUserRole(admin ? 'admin' : 'student');
        } else {
            setUserRole(null);
        }
    };
    checkUserRole();
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const navLinks = [
    { href: "/", label: "Admin Dashboard", icon: LayoutDashboard, role: 'admin' },
    { href: "/admin", label: "Plagiarism Check", icon: ShieldCheck, role: 'admin' },
    { href: "/student", label: "My Dashboard", icon: GraduationCap, role: 'student' },
  ];

  const filteredNavLinks = navLinks.filter(link => link.role === userRole);
  
  // Don't render header on login page
  if (pathname === '/login') return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href={userRole === 'admin' ? '/' : '/student'} className="mr-8 flex items-center space-x-2">
          <DraftingCompass className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">CAD Comparator</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {filteredNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-primary flex items-center gap-2",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.photoURL ?? undefined} alt="User Avatar" />
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName ?? 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email ?? 'No email'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
