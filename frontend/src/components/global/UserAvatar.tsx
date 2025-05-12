import { useAuthStore } from '@/store/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { AuthActions } from '@/api-actions/auth-actions';
import { useRouter } from 'next/navigation';

export default function UserAvatar() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await AuthActions.logout();
            logout();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage src={user?.profile_picture} />
                    <AvatarFallback>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                {user?.roles.includes('ADMIN') && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                )}
                {user?.roles.includes('VENDOR') && (
                    <DropdownMenuItem asChild>
                        <Link href="/seller">Seller Dashboard</Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}