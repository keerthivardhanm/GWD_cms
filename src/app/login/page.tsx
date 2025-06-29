
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
    } catch (error) {
      // Error is handled in AuthContext, form state is updated automatically.
    }
  };
  
  const onResetSubmit = async (data: ResetFormValues) => {
    try {
        await sendPasswordResetEmail(auth, data.email);
        toast({
            title: "Password Reset Email Sent",
            description: "If an account with that email exists, a reset link has been sent. Please check your inbox and spam folder.",
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
  }


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
      )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 text-center">
        <ShieldCheck className="mx-auto h-16 w-16 text-primary mb-4" data-ai-hint="app logo shield" />
        <h1 className="text-3xl font-bold text-foreground mt-2">Welcome to {APP_NAME}</h1>
        <p className="text-muted-foreground">Sign in to access your dashboard.</p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Login</CardTitle>
          <CardDescription>Enter your email and password below to login.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" {...loginForm.register("email")} />
              {loginForm.formState.errors.email && <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                 <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="link" type="button" className="ml-auto h-auto p-0 text-sm">
                            Forgot your password?
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription>
                                Enter your email address below and we'll send you a link to reset your password.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="reset-email">Email</Label>
                                <Input id="reset-email" type="email" placeholder="m@example.com" {...resetForm.register("email")} />
                                {resetForm.formState.errors.email && <p className="text-sm text-destructive">{resetForm.formState.errors.email.message}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={resetForm.formState.isSubmitting}>
                                    {resetForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Send Reset Link
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                 </Dialog>
              </div>
              <Input id="password" type="password" {...loginForm.register("password")} />
              {loginForm.formState.errors.password && <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting || authLoading}>
              {loginForm.formState.isSubmitting || authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Login
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex-col items-start text-sm">
            <p className="text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="#" className="underline">
                    Contact Support
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
