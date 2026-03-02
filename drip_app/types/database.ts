export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    location: string | null;
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
        };
    };
}
