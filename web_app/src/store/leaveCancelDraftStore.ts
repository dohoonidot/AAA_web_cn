import { create } from 'zustand';

export interface LeaveCancelDraftData {
    id: number;
    cancel_reason: string;
    start_date: string;
    end_date: string;
    leave_type: string;
    half_day_slot: string;
    reason?: string | null;
}

interface LeaveCancelDraftState {
    isOpen: boolean;
    isLoading: boolean;
    pendingData: LeaveCancelDraftData | null;
    openPanel: (data: LeaveCancelDraftData) => void;
    closePanel: () => void;
    setLoading: (loading: boolean) => void;
}

export const useLeaveCancelDraftStore = create<LeaveCancelDraftState>((set) => ({
    isOpen: false,
    isLoading: false,
    pendingData: null,
    openPanel: (data) => {
        set({ isOpen: true, isLoading: false, pendingData: data });
    },
    closePanel: () => {
        set({ isOpen: false, isLoading: false });
        setTimeout(() => set({ pendingData: null }), 300);
    },
    setLoading: (loading) => set({ isLoading: loading }),
}));
