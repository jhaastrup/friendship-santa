export interface Friend {
  id: string;
  name: string;
  interests: string[];
  notes: string;
}

export interface Pairing {
  giverId: string;
  receiverId: string;
}

export interface GiftIdea {
  title: string;
  description: string;
  category: 'Funny' | 'Practical' | 'Luxury' | 'DIY' | 'Sentimental' | 'Other';
  estimatedPrice?: string;
}

export enum AppStep {
  SETUP = 'SETUP',
  REVIEW = 'REVIEW',
  REVEAL = 'REVEAL',
}

export interface GroupData {
  name: string;
  organizerName: string;
  friends: Friend[];
  pairings: Pairing[];
}