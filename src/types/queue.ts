export interface Patient {
  id: string;
  tokenNumber: number;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  department: 'General' | 'Diagnostics' | 'Emergency' | 'Pharmacy';
  visitType: 'New' | 'Follow-up' | 'Emergency';
  registrationTime: Date;
  status: 'Waiting' | 'In Progress' | 'Completed';
  priority: number; // Higher number = higher priority
  isEmergency: boolean;
  isSeniorCitizen: boolean;
}

export interface Department {
  id: string;
  name: string;
  currentToken: number | null;
  nextToken: number | null;
  totalServed: number;
  waitingCount: number;
}

export interface QueueStats {
  totalPatients: number;
  averageWaitTime: number;
  busiestDepartment: string;
  totalServedToday: number;
}