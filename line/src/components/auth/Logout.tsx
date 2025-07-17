'use client';

import { signOut } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

export const Logout = () => {
    const router = useRouter();
    const handleLogout = async () => {
        await signOut();
        router.push('/auth');
    };

    return (
        <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={handleLogout}
        >
            ログアウト
        </button>
    );
};