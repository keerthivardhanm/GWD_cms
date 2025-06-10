
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';
import { ShieldCheck } from 'lucide-react'; // Changed from next/image

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <ShieldCheck className="mx-auto h-24 w-24 text-primary" data-ai-hint="app logo shield" />
        </div>
        <h1 className="text-5xl font-bold font-headline text-foreground mb-4">
          Welcome to {APP_NAME}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          The next-generation Content Management System designed for power and flexibility.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link href="/login">Login to Your Account</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
        <p className="mt-12 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
