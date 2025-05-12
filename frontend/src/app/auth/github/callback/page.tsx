'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { AuthActions } from '@/api-actions/auth-actions';

export default function GithubCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    const code = searchParams?.get('code');

    // if (!code || !state) {
    //   toast({
    //     title: "Authentication Failed",
    //     description: "Missing authentication parameters",
    //     variant: "destructive"
    //   });
    //   router.push('/?auth=login');
    //   return;
    // }

    const handleCallback = async () => {
      try {
        const response = await AuthActions.handleOAuthCallback('github', code!);
        if (response?.data) {
          setUser(response.data);
          router.push('/');
        }
      } catch (error: any) {
        console.error('GitHub auth error:', error);
        toast({
          title: "Authentication Failed",
          description: error?.message || "Failed to authenticate with GitHub",
          variant: "destructive"
        });
        router.push('/?auth=login');
      }
    };

    handleCallback();
  }, [router, setUser, toast, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-center">
        <h2 className="text-2xl font-semibold mb-2">Authenticating with GitHub...</h2>
        <p className="text-muted-foreground">Please wait while we complete your sign-in</p>
      </div>
    </div>
  );
}