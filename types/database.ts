export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  streak_count: number;
  date_of_birth: string | null;
  phone_number: string | null;
  postcode: string | null;
  bio: string | null;
  location: string | null;
  interests: string[];
  is_public: boolean;
  high_contrast: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  next_of_kin_name: string | null;
  next_of_kin_contact: string | null;
  user_type: 'young_person' | 'partner' | null;
  status: 'active' | 'pending' | null;
  organisation_name: string | null;
  job_title: string | null;
  phone: string | null;
  updated_at?: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  hidden: boolean;
};

export type Like = {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
};

export type Comment = {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
};

export type PostWithMeta = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
  is_admin: boolean;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  hidden: boolean;
};

export type CommentWithMeta = {
  id: string;
  content: string;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
  parent_id: string | null;
  replies: CommentWithMeta[];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "updated_at" | "streak_count"> & { updated_at?: string; streak_count?: number };
        Update: Partial<Omit<Profile, "id">>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, "id" | "created_at">;
        Update: Partial<Omit<Post, "id" | "user_id">>;
      };
      likes: {
        Row: Like;
        Insert: Omit<Like, "id" | "created_at">;
        Update: never;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, "id" | "created_at">;
        Update: Partial<Pick<Comment, "content">>;
      };
    };
  };
};
