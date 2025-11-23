import LZString from 'lz-string';
import { GroupData, Friend, Pairing } from '../types';

// Minified types for efficient URL storage
// Structure: [name, interests, notes]
type MinifiedFriend = [string, string[], string];
// Structure: [giverIndex, receiverIndex]
type MinifiedPairing = [number, number];
// Structure: [groupName, organizerName, friends, pairings]
type MinifiedGroupData = [string, string, MinifiedFriend[], MinifiedPairing[]];

export const generateShareUrl = (data: GroupData): string => {
  // 1. Minify Friends: Remove IDs and keys, just keep data
  const friendsList = data.friends;
  const minFriends: MinifiedFriend[] = friendsList.map(f => [
    f.name,
    f.interests,
    f.notes
  ]);

  // 2. Minify Pairings: Use array indices instead of long UUID strings
  const minPairings: MinifiedPairing[] = data.pairings.map(p => {
    const giverIdx = friendsList.findIndex(f => f.id === p.giverId);
    const receiverIdx = friendsList.findIndex(f => f.id === p.receiverId);
    return [giverIdx, receiverIdx];
  });

  // 3. Create compact structure
  const minData: MinifiedGroupData = [
    data.name,
    data.organizerName,
    minFriends,
    minPairings
  ];

  const json = JSON.stringify(minData);
  const compressed = LZString.compressToEncodedURIComponent(json);
  
  const url = new URL(window.location.href);
  // Remove old 'data' param if it exists to keep URL clean
  url.searchParams.delete('data');
  // Use 'd' for data to save 3 characters
  url.searchParams.set('d', compressed);
  
  return url.toString();
};

export const getGroupDataFromUrl = (): GroupData | null => {
  const urlParams = new URLSearchParams(window.location.search);
  
  // 1. Try new compact format ('d')
  const compressedShort = urlParams.get('d');
  if (compressedShort) {
    try {
      const json = LZString.decompressFromEncodedURIComponent(compressedShort);
      if (!json) return null;
      
      const minData = JSON.parse(json) as MinifiedGroupData;
      
      // Rehydrate Friends (Generate new local IDs)
      const friends: Friend[] = minData[2].map(mf => ({
        id: crypto.randomUUID(),
        name: mf[0],
        interests: mf[1],
        notes: mf[2]
      }));

      // Rehydrate Pairings (Map indices back to new IDs)
      const pairings: Pairing[] = minData[3].map(mp => ({
        giverId: friends[mp[0]].id,
        receiverId: friends[mp[1]].id
      }));

      return {
        name: minData[0],
        organizerName: minData[1],
        friends,
        pairings
      };
    } catch (e) {
      console.error("Failed to parse short url data", e);
    }
  }

  // 2. Fallback to legacy format ('data')
  const compressedLegacy = urlParams.get('data');
  if (compressedLegacy) {
    try {
      const json = LZString.decompressFromEncodedURIComponent(compressedLegacy);
      if (!json) return null;
      return JSON.parse(json) as GroupData;
    } catch (error) {
      console.error("Failed to parse legacy shared data", error);
    }
  }

  return null;
};