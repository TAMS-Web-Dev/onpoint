export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  streak_count: number;
  age: number | null;
  postcode: string | null;
  bio: string | null;
  location: string | null;
  interests: string[];
  is_public: boolean;
  high_contrast: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  updated_at?: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "updated_at" | "streak_count"> & { updated_at?: string; streak_count?: number };
        Update: Partial<Omit<Profile, "id">>;
      };
    };
  };
};
