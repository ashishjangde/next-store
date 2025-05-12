'use client';

import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { ComponentType, useEffect, useState } from 'react';

type UserRole = 'ADMIN' | 'VENDOR' | 'USER';

interface WithAuthProps {
    allowedRoles?: UserRole[];
}

export function withAuth<T extends object>(
    WrappedComponent: ComponentType<T>,
    { allowedRoles }: WithAuthProps = {}
) {
    return function WithAuthComponent(props: T) {
        const { user, isAuthenticated } = useAuthStore();
        const router = useRouter();
        const [isInitializing, setIsInitializing] = useState(true);

        useEffect(() => {
            // Wait for the auth store to be initialized
            const checkAuth = async () => {
                if (!isAuthenticated) {
                    router.replace('/?auth=login');
                    return;
                }

                if (allowedRoles && allowedRoles.length > 0 && user) {
                    const hasRequiredRole = allowedRoles.some(role => 
                        user.roles.includes(role)
                    );

                    if (!hasRequiredRole) {
                        router.replace('/');
                    }
                }
                setIsInitializing(false);
            };

            // Small delay to allow server-side data to be hydrated
            const timer = setTimeout(() => {
                checkAuth();
            }, 100);

            return () => clearTimeout(timer);
        }, [isAuthenticated, router, user, allowedRoles]);

        // Don't render anything while checking authentication
        if (isInitializing) {
            return null;
        }

        // Only render if authenticated
        if (!isAuthenticated) {
            return null;
        }

        // Only render if user has required roles (when specified)
        if (allowedRoles && allowedRoles.length > 0 && user) {
            const hasRequiredRole = allowedRoles.some(role => 
                user.roles.includes(role)
            );
            if (!hasRequiredRole) {
                return null;
            }
        }

        return <WrappedComponent {...props} />;
    };
}