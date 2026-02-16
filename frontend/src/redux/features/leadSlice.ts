import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// 1. Define the Data Shape
export interface Lead {
  id: number;
  address: string;
  city: string;
  zip: string;
  county: string;
  state: string;
  price: number;
  status: string;
  auction_date: string;
  owner_name?: string;
  masked?: boolean; // Optional flag for UI
}

// 2. Define the State Shape
interface LeadState {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  totalLeads: number;
  // NEW: State for the Modal
  selectedLead: Lead | null;
  isModalOpen: boolean;
}

const initialState: LeadState = {
  leads: [],
  loading: false,
  error: null,
  totalLeads: 0,
  // NEW: Initial values
  selectedLead: null,
  isModalOpen: false,
};

// 3. Async Thunk to Fetch Data (Mock API)
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Return Mock Data
    return [
      { id: 1, address: "1234 Maple Ave", city: "Dallas", state: "TX", zip: "75201", county: "Dallas", price: 150000, status: "Foreclosure", auction_date: "2023-12-01", masked: true },
      { id: 2, address: "5678 Oak Lane", city: "Austin", state: "TX", zip: "78701", county: "Travis", price: 320000, status: "Tax Default", auction_date: "2023-11-15", masked: false },
      { id: 3, address: "999 Pine St", city: "Houston", state: "TX", zip: "77001", county: "Harris", price: 85000, status: "Divorce", auction_date: "2023-12-10", masked: true },
      { id: 4, address: "444 Elm Dr", city: "San Antonio", state: "TX", zip: "78201", county: "Bexar", price: 210000, status: "Pre-Foreclosure", auction_date: "2023-12-20", masked: true },
    ];
  }
);

// 4. The Slice Logic
export const leadSlice = createSlice({
  name: 'lead',
  initialState,
  reducers: {
    // ACTION: Open the Modal
    openLeadModal: (state, action: PayloadAction<Lead>) => {
      state.selectedLead = action.payload;
      state.isModalOpen = true;
    },
    // ACTION: Close the Modal
    closeLeadModal: (state) => {
      state.selectedLead = null;
      state.isModalOpen = false;
    },
    // ACTION: Clear Leads
    clearLeads: (state) => {
      state.leads = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload;
        state.totalLeads = action.payload.length;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching leads';
      });
  },
});

// 5. Export Actions
export const { openLeadModal, closeLeadModal, clearLeads } = leadSlice.actions;
export default leadSlice.reducer;