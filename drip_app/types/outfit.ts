import type { ClothingItem } from './database';

export interface OutfitSuggestion {
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  shoes: ClothingItem | null;
  outerwear: ClothingItem | null;
  accessory1: ClothingItem | null;
  accessory2: ClothingItem | null;
  reasoning: string;
}

export interface GeminiOutfitResponse {
  top_id: string | null;
  bottom_id: string | null;
  shoes_id: string | null;
  outerwear_id: string | null;
  accessory1_id: string | null;
  accessory2_id: string | null;
  reasoning: string;
}
