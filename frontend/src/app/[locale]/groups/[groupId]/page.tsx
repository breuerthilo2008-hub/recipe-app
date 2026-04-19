// frontend/src/app/[locale]/groups/[groupId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Users, UserPlus, Trash2, Copy, Check, Shield, Clock, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useGroup } from '@/context/GroupContext';

export default function GroupDashboard() {
    const params = useParams();
    const router = useRouter();
    const { role: userRole, groupId: activeGroupId } = useGroup();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [inviteCode, setInviteCode] = useState<{ code: string; expires_at: string } | null>(null);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    // Re-fetch data on load
    const fetchData = async () => {
        try {
            const res = await api.get(`/groups/${params.groupId}`);
            setData(res);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load family details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [params.groupId]);

    const generateInvite = async () => {
        setGenerating(true);
        try {
            const res = await api.post(`/groups/${params.groupId}/invites`);
            setInviteCode(res);
        } catch (err) {
            console.error('Failed to generate invite');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = () => {
        if (inviteCode) {
            navigator.clipboard.writeText(inviteCode.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const removeMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this family member?')) return;

        try {
            await api.delete(`/groups/${params.groupId}/members/${memberId}`);
            fetchData(); // Refresh list
        } catch (err) {
            alert('Failed to remove member');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-slate-500 font-bold animate-pulse">Loading Kitchen...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl text-center max-w-sm border border-red-50">
                <h1 className="text-2xl font-black text-accent mb-4">Oops!</h1>
                <p className="text-slate-500 mb-6">{error}</p>
                <button onClick={() => router.push('/')} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold">Go Back Home</button>
            </div>
        </div>
    );

    const isOwner = userRole === 'owner';

    return (
        <main className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <Users size={20} />
                            <span className="text-sm font-black uppercase tracking-widest">Family Vault</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-accent">{data.group.name}</h1>
                    </div>

                    <div className="bg-white/50 backdrop-blur px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-black">Members</p>
                            <p className="text-xl font-black text-primary leading-none">{data.members.length}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-black">Established</p>
                            <p className="text-xl font-black text-accent leading-none">{new Date(data.group.created_at).getFullYear()}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Members List */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-black text-accent px-2">Family Members</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {data.members.map((member: any) => (
                                <div key={member.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold border border-primary/20">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-accent">{member.name}</p>
                                                {member.role === 'owner' && < Shield size={14} className="text-amber-500" />}
                                            </div>
                                            <p className="text-xs text-slate-400">{member.email}</p>
                                        </div>
                                    </div>

                                    {isOwner && member.role !== 'owner' && (
                                        <button
                                            onClick={() => removeMember(member.id)}
                                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Invitation Section */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-accent px-2">Invite Others</h2>
                        <div className="bg-accent p-8 rounded-[2.5rem] shadow-2xl shadow-accent/20 text-white relative overflow-hidden">
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <UserPlus size={120} />
                            </div>

                            <div className="relative z-10">
                                <p className="text-sm text-white/70 mb-6 font-medium leading-relaxed">
                                    Generate a 6-digit kitchen code to invite new members to your family.
                                </p>

                                {!inviteCode ? (
                                    <button
                                        onClick={generateInvite}
                                        disabled={generating || !isOwner}
                                        className="w-full py-4 bg-white text-accent rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {generating ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
                                        {isOwner ? 'Create Invite Code' : 'Owner Only'}
                                    </button>
                                ) : (
                                    <div className="space-y-4 animate-in zoom-in-95 duration-500">
                                        <div className="bg-white/10 rounded-2xl p-6 text-center border border-white/10">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-4">Share this code</p>
                                            <div className="text-5xl font-black tracking-[0.2em] mb-4 text-primary-foreground">{inviteCode.code}</div>
                                            <button
                                                onClick={handleCopy}
                                                className="flex items-center gap-2 mx-auto text-sm font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
                                            >
                                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                                {copied ? 'Copied!' : 'Copy Code'}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-xs text-white/50 font-bold">
                                            <Clock size={12} />
                                            Expires on {new Date(inviteCode.expires_at).toLocaleDateString()}
                                        </div>
                                        <button
                                            onClick={() => setInviteCode(null)}
                                            className="w-full py-2 text-xs font-bold text-white/40 hover:text-white transition-colors"
                                        >
                                            Generate New Code
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!isOwner && (
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <p className="text-xs text-slate-400 leading-relaxed italic">
                                    Note: Only the family owner can manage members and generate invite codes.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}
