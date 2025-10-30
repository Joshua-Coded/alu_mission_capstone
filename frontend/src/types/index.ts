export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string; 
  emailVerified: boolean;
  walletAddress?: string;
  department?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  goal: number;
  amountRaised: number;
  deadline: string;
  farmer: User;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  imageUrl?: string;
  location?: string;
}