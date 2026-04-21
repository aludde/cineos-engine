// --- 1. THE FOUNDATION --- //

export interface Project {
  id: string;
  title: string;
  client: string; // The Brand (e.g., Swiggy)
  agency: string; // The Ad Agency (e.g., Ogilvy)
  status: 'Bidding' | 'Pre-Production' | 'Shooting' | 'Post';
  scenes: Scene[];
  budget: Budget;
}

// --- 2. THE SCRIPT BREAKDOWN --- //

export interface Scene {
  id: string;
  sceneNumber: string; // e.g., "1A"
  setting: 'INT' | 'EXT';
  location: string; // e.g., "Cafe"
  timeOfDay: 'DAY' | 'NIGHT' | 'MAGIC HOUR';
  actionSummary: string; // Brief description of what happens
  assets: Asset[]; // Everything needed to shoot this scene
}

export interface Asset {
  id: string;
  category: 'Cast' | 'Prop' | 'Wardrobe' | 'Camera' | 'Vehicle' | 'Location';
  description: string; // e.g., "Vintage Bullet Motorcycle"
  quantity: number;
}

// --- 3. THE INDIAN FINANCIAL ENGINE --- //

export interface ExpenseItem {
  id: string;
  linkedAssetId?: string; // Links back to an extracted asset from the script
  category: string; // e.g., "Art Department", "Catering"
  description: string;
  vendorName: string;
  ratePerDay: number;
  daysNeeded: number;
  
  // Indian Tax Integration
  gstSlab: 0 | 5 | 12 | 18 | 28; // Standard GST percentages
  tdsApplicable: boolean;
  tdsRate: number; // Usually 2% or 10% depending on the vendor
}

export interface Budget {
  totalAgencyBid: number; // The amount the agency is paying us
  expenses: ExpenseItem[];
}