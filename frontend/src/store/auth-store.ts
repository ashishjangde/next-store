import { IUser } from '@/app/types';
import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

type UserRole = 'ADMIN' | 'VENDOR' | 'USER';

interface AuthStore {
    user: IUser | null;
    isAuthenticated: boolean;
    setUser: (user: IUser | null) => void;
    logout: () => void;
    hasRole: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthStore>()(
    // persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            logout: () => set({ user: null, isAuthenticated: false }),
            hasRole: (roles) => {
                const user = get().user;
                if (!user) return false;
                return roles.some(role => user.roles.includes(role));
            },
        }),
    //     {
    //         name: 'auth-storage',
    //     }
    // )
);