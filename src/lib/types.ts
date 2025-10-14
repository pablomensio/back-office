export type SalesFunnelStage =
  | "Lead"
  | "Contactado"
  | "Cita"
  | "Calificado"
  | "Cerrado";

export type UserRole = "admin" | "supervisor" | "vendedor";

export interface AppUser {
  id?: string; // Made optional for backwards compatibility
  uid: string;
  email: string;
  role: UserRole;
  reportsTo?: string;
  displayName?: string;
  photoURL?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  address?: string;
  preferences?: {
    models?: string[];
    budget?: number;
  };
  purchaseHistory?: {
    model: string;
    date: string;
  }[];
  salesFunnelStatus: {
    status: SalesFunnelStage;
    lastUpdated: string;
  };
}

export interface Activity {
  id: string;
  customerId: string;
  activityType: "Llamada" | "Email" | "Reunión" | "Nota";
  date: string;
  notes: string;
}

export interface Task {
  id: string;
  customerId: string;
  taskType: string;
  dueDate: string;
  isCompleted: boolean;
  notes?: string;
}
