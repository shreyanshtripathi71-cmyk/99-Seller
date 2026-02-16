/**
 * Motive Type Configuration
 * Defines motive types, their display names, and required fields for frontend validation
 */

export interface MotiveTypeConfig {
    code: string;
    name: string;
    description: string;
    color: string; // For UI badges/indicators
    icon: string; // Font Awesome icon class
    requiredSections: string[]; // Which sections to display
}

export const MOTIVE_TYPES: Record<string, MotiveTypeConfig> = {
    PRE: {
        code: 'PRE',
        name: 'Pre-foreclosure',
        description: 'Property in pre-foreclosure stage',
        color: '#f59e0b', // amber
        icon: 'fa-exclamation-triangle',
        requiredSections: ['trustee', 'loan', 'owner']
    },
    FOR: {
        code: 'FOR',
        name: 'Foreclosure',
        description: 'Property in foreclosure',
        color: '#ef4444', // red
        icon: 'fa-gavel',
        requiredSections: ['auction', 'trustee', 'loan', 'owner']
    },
    AUC: {
        code: 'AUC',
        name: 'Auction',
        description: 'Property scheduled for auction',
        color: '#8b5cf6', // purple
        icon: 'fa-hammer',
        requiredSections: ['auction', 'auctioneer']
    },
    PRO: {
        code: 'PRO',
        name: 'Probate',
        description: 'Property in probate',
        color: '#6366f1', // indigo
        icon: 'fa-balance-scale',
        requiredSections: ['probate', 'trustee']
    },
    COD: {
        code: 'COD',
        name: 'Code Violation',
        description: 'Property with code violations',
        color: '#dc2626', // dark red
        icon: 'fa-file-contract',
        requiredSections: ['violations']
    },
    EVI: {
        code: 'EVI',
        name: 'Eviction',
        description: 'Property with eviction proceedings',
        color: '#ea580c', // orange
        icon: 'fa-door-open',
        requiredSections: ['evictions']
    },
    DIV: {
        code: 'DIV',
        name: 'Divorce',
        description: 'Property involved in divorce proceedings',
        color: '#ec4899', // pink
        icon: 'fa-heart-broken',
        requiredSections: ['divorce', 'owners']
    },
    TAX: {
        code: 'TAX',
        name: 'Unpaid Taxes',
        description: 'Property with unpaid tax liens',
        color: '#10b981', // green
        icon: 'fa-file-invoice-dollar',
        requiredSections: ['taxLiens']
    },
    OUT: {
        code: 'OUT',
        name: 'Out of State',
        description: 'Property with out-of-state owner',
        color: '#3b82f6', // blue
        icon: 'fa-map-marker-alt',
        requiredSections: ['owner']
    }
};

export const getMotiveTypeConfig = (code: string): MotiveTypeConfig | null => {
    return MOTIVE_TYPES[code] || null;
};

export const getAllMotiveTypes = (): MotiveTypeConfig[] => {
    return Object.values(MOTIVE_TYPES);
};

export const getMotiveTypeColor = (code: string): string => {
    return MOTIVE_TYPES[code]?.color || '#64748b';
};

export const getMotiveTypeName = (code: string): string => {
    return MOTIVE_TYPES[code]?.name || 'Unknown';
};
