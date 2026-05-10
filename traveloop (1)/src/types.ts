export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  bio?: string;
  preferences?: {
    language?: string;
  };
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  coverPhoto?: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: any;
  updatedAt: any;
  status: 'ongoing' | 'upcoming' | 'completed';
}

export interface Stop {
  id: string;
  cityName: string;
  startDate: string;
  endDate: string;
  budget: number;
  order: number;
}

export interface Activity {
  id: string;
  name: string;
  type: string;
  time: string;
  cost: number;
  duration: string;
  description?: string;
  image?: string;
}

export interface Note {
  id: string;
  content: string;
  type: 'general' | 'stop';
  stopId?: string;
  createdAt: any;
  updatedAt: any;
}

export interface ChecklistItem {
  id: string;
  item: string;
  category: string;
  isPacked: boolean;
  createdAt: any;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  activityId?: string;
}

export interface CommunityPost {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  tripName: string;
  sharedAt: any;
  likes: number;
  commentCount: number;
}
