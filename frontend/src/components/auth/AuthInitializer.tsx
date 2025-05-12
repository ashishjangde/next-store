'use client';

import { AuthActions } from '@/api-actions/auth-actions';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const {setUser , logout} = useAuthStore();

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const response = await AuthActions.refreshToken();
                if (response?.data) {
                    setUser(response.data);
                }
                if(response?.apiError && response.apiError.message === "Refresh token not found"){
                    logout()
                }
            } catch (error) {
                console.log('Failed to refresh token:', error);
            }
        };

        initializeAuth();
    }, [setUser]);

    return <>{children}</>;
}