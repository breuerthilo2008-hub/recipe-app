// frontend/src/context/GroupContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface GroupContextType {
    groupId: string | null;
    groupName: string | null;
    role: 'owner' | 'member' | null;
    setGroup: (groupId: string | null, groupName: string | null, role: 'owner' | 'member' | null) => void;
    loading: boolean;
    refreshGroup: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
    const [groupId, setGroupId] = useState<string | null>(null);
    const [groupName, setGroupName] = useState<string | null>(null);
    const [role, setRole] = useState<'owner' | 'member' | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshGroup = async () => {
        try {
            const data = await api.get('/auth/me');
            if (data.user && data.user.groupId) {
                setGroupId(data.user.groupId);
                setGroupName(data.user.groupName);
                setRole(data.user.role);
            } else {
                setGroupId(null);
                setGroupName(null);
                setRole(null);
            }
        } catch (err) {
            setGroupId(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshGroup();
    }, []);

    const setGroup = (gid: string | null, gname: string | null, grole: 'owner' | 'member' | null) => {
        setGroupId(gid);
        setGroupName(gname);
        setRole(grole);
    };

    return (
        <GroupContext.Provider value={{ groupId, groupName, role, setGroup, loading, refreshGroup }}>
            {children}
        </GroupContext.Provider>
    );
}

export function useGroup() {
    const context = useContext(GroupContext);
    if (context === undefined) {
        throw new Error('useGroup must be used within a GroupProvider');
    }
    return context;
}
