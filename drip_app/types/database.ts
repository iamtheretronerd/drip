export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  location: string | null;
  lifestyle: string | null;
  weather_sensitivity: string | null;
  priority: string | null;
  lat: number | null;
  lon: number | null;
  city_name: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export interface OnboardingResponse {
  id: string;
  user_id: string;
  typical_day: string | null;
  location: string | null;
  weather_sensitivity: string | null;
  outfit_priority: string | null;
  completed_at: string;
}

export interface ClothingItem {
  id: string;
  user_id: string;
  photo_url: string;
  status: 'pending_analysis' | 'analyzing' | 'analyzed' | 'error';
  name: string | null;
  type: string | null;
  sub_type: string | null;
  color: string | null;
  secondary_color: string | null;
  pattern: string | null;
  material: string | null;
  formality: string | null;
  warmth_rating: number | null;
  seasons: string[] | null;
  layer_type: string | null;
  fit: string | null;
  occasion_tags: string[] | null;
  category: string | null;
  style_tags: string[] | null;
  weather_suitability: string[] | null;
  is_onboarding_item: boolean;
  last_worn: string | null;
  times_worn: number;
  consecutive_days_worn: number;
  created_at: string;
  updated_at: string;
}

export interface OutfitLog {
  id: string;
  user_id: string;
  date: string;
  item_ids: string[];
  mood_input: string | null;
  weather_snapshot: WeatherSnapshot | null;
  was_modified: boolean;
  created_at: string;
}

export interface WeatherSnapshot {
  temp: number;
  feels_like: number;
  description: string;
  icon: string;
  precipitation_chance: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      onboarding_responses: {
        Row: OnboardingResponse;
        Insert: Omit<OnboardingResponse, 'id' | 'completed_at'>;
        Update: Partial<Omit<OnboardingResponse, 'id' | 'user_id' | 'completed_at'>>;
      };
      clothing_items: {
        Row: ClothingItem;
        Insert: Omit<ClothingItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ClothingItem, 'id' | 'user_id' | 'created_at'>>;
      };
      outfit_logs: {
        Row: OutfitLog;
        Insert: Omit<OutfitLog, 'id' | 'created_at'>;
        Update: Partial<Omit<OutfitLog, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
}
