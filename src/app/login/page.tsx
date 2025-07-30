"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ShieldCheck } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});
const resetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }).min(1, "Email is required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
    } catch {
      // error handled in AuthContext
    }
  };

  const onResetSubmit = async (data: ResetFormValues) => {
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast({
        title: "Password Reset Email Sent",
        description: (
          <div>
            <p>If an account exists for {data.email}, a reset link has been sent.</p>
            <p className="mt-2 text-xs text-muted-foreground">Please check your inbox and spam folder.</p>
          </div>
        ),
      });
      setIsResetDialogOpen(false);
      resetForm.reset();
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: "Could not send password reset email. Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (authLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      {/* Left pane */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-[380px] gap-6">
          <div className="grid gap-2 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-primary"/>
            <h1 className="text-3xl font-bold">Welcome to {APP_NAME}</h1>
            <p className="text-balance text-muted-foreground">
              Sign in to manage your content
            </p>
          </div>
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="grid gap-4">
            {/* email field */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" {...loginForm.register("email")} />
              {loginForm.formState.errors.email && (
                <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
              )}
            </div>
            {/* password field */}
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" type="button"
                  onClick={() => setIsResetDialogOpen(true)}
                  className="ml-auto h-auto p-0 text-sm">
                  Forgot your password?
                </Button>
              </div>
              <Input id="password" type="password" {...loginForm.register("password")} />
              {loginForm.formState.errors.password && (
                <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginForm.formState.isSubmitting || authLoading}>
              { (loginForm.formState.isSubmitting || authLoading) &&
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="#" className="underline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
      {/* Right pane */}
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1080x1920"
          alt="Abstract background"
          width={1080}
          height={1920}
          className="h-full w-full object-cover dark:brightness-[0.3]"
          priority
        />
      </div>

      {/* Reset Password Modal */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address below and we will send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="reset-email" className="text-left">Email</Label>
              <Input id="reset-email" type="email" placeholder="m@example.com" {...resetForm.register("email")} />
              {resetForm.formState.errors.email && (
                <p className="text-sm text-destructive">{resetForm.formState.errors.email.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={resetForm.formState.isSubmitting}>
                {resetForm.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send Reset Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
