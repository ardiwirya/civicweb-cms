// File ini idealnya di-generate otomatis dari schema database yang sebenarnya:
//   npm run db:types
// (butuh SUPABASE_PROJECT_ID di .env dan Supabase CLI login)
//
// Untuk tahap awal development, tipe di bawah ditulis manual mengikuti
// supabase/migrations/0001_init_schema.sql. Setelah project Supabase asli
// dibuat, jalankan perintah di atas dan file ini akan digantikan otomatis.

export type UserRole = "super_admin" | "admin";
export type ContentStatus = "draft" | "published";
export type InstitutionType =
  | "desa"
  | "kecamatan"
  | "dinas"
  | "sekolah"
  | "lembaga"
  | "instansi"
  | "organisasi";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          full_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      institution_profile: {
        Row: {
          id: number;
          name: string;
          type: InstitutionType;
          logo_url: string | null;
          favicon_url: string | null;
          primary_color: string;
          secondary_color: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          social_media: Record<string, string>;
          vision: string | null;
          mission: string | null;
          hero_title: string | null;
          hero_subtitle: string | null;
          hero_image_url: string | null;
          footer_text: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["institution_profile"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["institution_profile"]["Row"]>;
        Relationships: [];
      };
      news: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          cover_image_url: string | null;
          category: string | null;
          status: ContentStatus;
          author_id: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["news"]["Row"]> & {
          title: string;
          slug: string;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["news"]["Row"]>;
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          attachment_url: string | null;
          is_pinned: boolean;
          status: ContentStatus;
          published_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["announcements"]["Row"]> & {
          title: string;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Row"]>;
        Relationships: [];
      };
      agenda_events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          location: string | null;
          start_at: string;
          end_at: string | null;
          status: ContentStatus;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["agenda_events"]["Row"]> & {
          title: string;
          start_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["agenda_events"]["Row"]>;
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          name: string;
          position: string;
          photo_url: string | null;
          parent_id: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["organization_members"]["Row"]> & {
          name: string;
          position: string;
        };
        Update: Partial<Database["public"]["Tables"]["organization_members"]["Row"]>;
        Relationships: [];
      };
      gallery_albums: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          cover_image_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["gallery_albums"]["Row"]> & { title: string };
        Update: Partial<Database["public"]["Tables"]["gallery_albums"]["Row"]>;
        Relationships: [];
      };
      gallery_photos: {
        Row: {
          id: string;
          album_id: string;
          image_url: string;
          caption: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["gallery_photos"]["Row"]> & {
          album_id: string;
          image_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_photos"]["Row"]>;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string | null;
          file_url: string;
          file_size_kb: number | null;
          published_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["documents"]["Row"]> & {
          title: string;
          file_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Row"]>;
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          owner_name: string | null;
          description: string | null;
          category: string | null;
          image_url: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["businesses"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["businesses"]["Row"]>;
        Relationships: [];
      };
      attractions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          location: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["attractions"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["attractions"]["Row"]>;
        Relationships: [];
      };
      regional_potentials: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["regional_potentials"]["Row"]> & { title: string };
        Update: Partial<Database["public"]["Tables"]["regional_potentials"]["Row"]>;
        Relationships: [];
      };
      statistics: {
        Row: {
          id: string;
          label: string;
          value: number;
          unit: string | null;
          category: string | null;
          year: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["statistics"]["Row"]> & {
          label: string;
          value: number;
        };
        Update: Partial<Database["public"]["Tables"]["statistics"]["Row"]>;
        Relationships: [];
      };
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          order_index: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["faqs"]["Row"]> & {
          question: string;
          answer: string;
        };
        Update: Partial<Database["public"]["Tables"]["faqs"]["Row"]>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]> & {
          name: string;
          email: string;
          subject: string;
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
