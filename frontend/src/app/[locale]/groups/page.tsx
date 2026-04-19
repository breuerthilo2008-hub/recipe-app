// frontend/src/app/[locale]/groups/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Users, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useGroup } from '@/context/GroupContext';

export default function GroupOnboarding() {
    const t = useTranslations('groups');
    const router = useRouter();
    const { refreshGroup } = useGroup();
    const [groupName, setGroupName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading('create');
        setError(null);
        try {
            await api.post('/groups', { name: groupName });
            await refreshGroup();
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create group');
        } finally {
            setLoading(null);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading('join');
        setError(null);
        try {
            await api.post('/groups/join', { code: inviteCode });
            await refreshGroup();
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid invite code');
        } finally {
            setLoading(null);
        }
    };

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-background flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Header Section (Mobile-only centered text) */}
                <div className="md:col-span-2 text-center mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                        <Users size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-accent mb-2">Welcome to your Kitchen</h1>
                    <p className="text-slate-500 max-w-md mx-auto">Recipes are better when shared. Start a new family vault or join one with an invite code.</p>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
                            {error}
                        </div>
                    )}
                </div>

                {/* Create Group Card */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                        <Plus size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-accent mb-2">Start a new family</h2>
                    <p className="text-sm text-slate-500 mb-8">Create a private space for your family to share and plan meals together.</p>

                    <form onSubmit={handleCreate} className="mt-auto space-y-4">
                        <input
                            type="text"
                            placeholder="e.g. The Miller Family"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            required
                        />
                        <button
                            disabled={!!loading}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading === 'create' ? <Loader2 className="animate-spin" /> : 'Create Vault'}
                            <ArrowRight size={18} />
                        </button>
                    </form>
                </div>

                {/* Join Group Card */}
                <div className="bg-accent p-8 rounded-[2.5rem] shadow-xl shadow-accent/20 text-white flex flex-col">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-6">
                        <Users size={24} />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Join your family</h2>
                    <p className="text-sm text-white/60 mb-8">Got a 6-digit code? Enter it here to access your family's secret recipes.</p>

                    <form onSubmit={handleJoin} className="mt-auto space-y-4">
                        <input
                            type="text"
                            placeholder="6-DIGIT CODE"
                            maxLength={6}
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            className="w-full px-5 py-4 bg-white/10 border-none rounded-2xl focus:ring-2 focus:ring-white/20 transition-all font-bold tracking-widest text-center"
                            required
                        />
                        <button
                            disabled={!!loading}
                            className="w-full py-4 bg-white text-accent rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading === 'join' ? <Loader2 className="animate-spin" /> : 'Join Family'}
                            <ArrowRight size={18} />
                        </button>
                    </form>
                </div>

            </div>
        </main>
    );
}
