import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerificationSuccessPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Email Verified Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">Your email has been successfully verified. You can now log in to your account.</p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
