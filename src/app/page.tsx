
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react'; // Changed from Bug
import { APP_NAME } from '@/lib/constants';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="text-center max-w-md">
        <ShieldCheck className="mx-auto h-20 w-20 text-primary mb-6" /> 
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
