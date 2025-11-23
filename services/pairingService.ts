import { Friend, Pairing } from '../types';

/**
 * Generates a random Secret Santa pairing.
 * Uses a simple shift algorithm on a shuffled array to ensure a closed loop (Derangement).
 * A -> B -> C -> A
 */
export const generatePairings = (friends: Friend[]): Pairing[] => {
  if (friends.length < 3) {
    throw new Error("You need at least 3 friends to start a Secret Santa exchange.");
  }

  // Create a shallow copy and shuffle it using Fisher-Yates algorithm
  const shuffled = [...friends];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const pairings: Pairing[] = [];
  
  for (let i = 0; i < shuffled.length; i++) {
    const giver = shuffled[i];
    // The receiver is the next person in the array, wrapping around to the start
    const receiver = shuffled[(i + 1) % shuffled.length];
    
    pairings.push({
      giverId: giver.id,
      receiverId: receiver.id,
    });
  }

  return pairings;
};

export const getReceiverForGiver = (giverId: string, pairings: Pairing[], friends: Friend[]): Friend | undefined => {
  const pairing = pairings.find(p => p.giverId === giverId);
  if (!pairing) return undefined;
  return friends.find(f => f.id === pairing.receiverId);
};