import LZString from 'lz-string';
import { GroupData, Friend, Pairing } from '../types';

// Minified types for efficient URL storage
type MinifiedFriend = [string, string[], string];
type MinifiedPairing = [number, number];
type MinifiedGroupData = [string, string, MinifiedFriend[], MinifiedPairing[]];

const JSON_BLOB_API = "https://jsonblob.com/api/jsonBlob";

/**
 * Saves the group data to a remote JSON store (JSONBlob) to get a short ID.
 * Returns the full short URL (e.g., domain.com/?id=uuid)
 */
export const createShortUrl = async (data: GroupData): Promise<string> => {
  try {
    const response = await fetch(JSON_BLOB_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error creating blob: ${response.statusText}`);
    }

    // The Location header contains the full URL to the blob
    const location = response.headers.get('Location');
    if (!location) throw new Error('No Location header received');

    // Extract UUID from the location URL
    const id = location.split('/').pop();
    if (!id) throw new Error('Invalid ID received');

    const url = new URL(window.location.href);
    // Clear legacy params
    url.searchParams.delete('data');
    url.searchParams.delete('d');
    // Set new ID param
    url.searchParams.set('id', id);
    
    return url.toString();
  } catch (error) {
    console.error("Failed to create short link, falling back to compressed URL", error);
    // Fallback to the long compressed URL if the API fails
    return generateCompressedUrl(data);
  }
};

/**
 * Fetches group data from the remote store using the ID.
 */
export const getRemoteGroup = async (id: string): Promise<GroupData | null> => {
  try {
    const response = await fetch(`${JSON_BLOB_API}/${id}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data as GroupData;
  } catch (error) {
    console.error("Failed to fetch remote group", error);
    return null;
  }
};

/**
 * Generates the long compressed URL (Client-side only)
 */
export const generateCompressedUrl = (data: GroupData): string => {
  // 1. Minify Friends
  const friendsList = data.friends;
  const minFriends: MinifiedFriend[] = friendsList.map(f => [
    f.name,
    f.interests,
    f.notes
  ]);

  // 2. Minify Pairings
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
  url.searchParams.delete('data');
  url.searchParams.delete('id');
  url.searchParams.set('d', compressed);
  
  return url.toString();
};

/**
 * Resolves GroupData from any supported URL format (ID, Compressed, or Legacy).
 */
export const resolveGroupDataFromUrl = async (): Promise<GroupData | null> => {
  const urlParams = new URLSearchParams(window.location.search);
  
  // 1. Try Remote ID (Short Link)
  const id = urlParams.get('id');
  if (id) {
    const remoteData = await getRemoteGroup(id);
    if (remoteData) return remoteData;
  }

  // 2. Try Compact Format ('d')
  const compressedShort = urlParams.get('d');
  if (compressedShort) {
    return parseCompressedData(compressedShort);
  }

  // 3. Try Legacy Format ('data')
  const compressedLegacy = urlParams.get('data');
  if (compressedLegacy) {
    return parseLegacyData(compressedLegacy);
  }

  return null;
};

// Helper to parse minified 'd' param
const parseCompressedData = (compressed: string): GroupData | null => {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    
    const minData = JSON.parse(json) as MinifiedGroupData;
    
    const friends: Friend[] = minData[2].map(mf => ({
      id: crypto.randomUUID(),
      name: mf[0],
      interests: mf[1],
      notes: mf[2]
    }));

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
    console.error("Failed to parse compressed data", e);
    return null;
  }
};

// Helper to parse legacy 'data' param
const parseLegacyData = (compressed: string): GroupData | null => {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    return JSON.parse(json) as GroupData;
  } catch (error) {
    console.error("Failed to parse legacy data", error);
    return null;
  }
};