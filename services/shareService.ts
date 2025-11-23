import LZString from 'lz-string';
import { GroupData } from '../types';

export const generateShareUrl = (data: GroupData): string => {
  const json = JSON.stringify(data);
  const compressed = LZString.compressToEncodedURIComponent(json);
  const url = new URL(window.location.href);
  url.searchParams.set('data', compressed);
  return url.toString();
};

export const getGroupDataFromUrl = (): GroupData | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const compressed = urlParams.get('data');
  
  if (!compressed) return null;

  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    return JSON.parse(json) as GroupData;
  } catch (error) {
    console.error("Failed to parse shared data", error);
    return null;
  }
};