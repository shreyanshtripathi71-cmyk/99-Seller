// Saved Leads Service - Backend Integration
import { Lead } from "@/components/search/components/LeadTableView";
import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/saved-properties`;

// Get headers with token
const getHeaders = () => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("99sellers_token");
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export interface SavedLead extends Lead {
    savedOn: string;
    savedId?: number; // Backend ID
}

// Get all saved leads
export const getSavedLeads = async (): Promise<SavedLead[]> => {
    try {
        const response = await axios.get(API_URL, getHeaders());
        if (response.data.success) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching saved leads:", error);
        return [];
    }
};

// Toggle lead saved status
export const toggleSavedLead = async (lead: Lead): Promise<{ saved: boolean }> => {
    try {
        try {
            const saveRes = await axios.post(API_URL, { propertyId: lead.id }, getHeaders());
            if (saveRes.data.success) {
                return { saved: true };
            }
        } catch (postErr: any) {
            if (postErr.response && postErr.response.status === 400) {
                // Already saved, so DELETE it
                await axios.delete(`${API_URL}/${lead.id}`, getHeaders());
                return { saved: false };
            }
        }
        return { saved: false };
    } catch (error) {
        console.error("Error toggling saved lead:", error);
        return { saved: false };
    }
};

// Remove a saved lead
export const removeSavedLead = async (leadId: number): Promise<boolean> => {
    try {
        const response = await axios.delete(`${API_URL}/${leadId}`, getHeaders());
        return response.data.success;
    } catch (error) {
        console.error("Error removing saved lead:", error);
        return false;
    }
};
