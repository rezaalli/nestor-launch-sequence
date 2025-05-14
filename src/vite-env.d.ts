
/// <reference types="vite/client" />

import { Json } from "@/integrations/supabase/types";

// Define database types that match Supabase table fields
declare global {
  interface DatabaseNotification {
    id: string;
    title: string;
    description: string;
    type: string;
    icon: string;
    icon_bg_color: string;
    icon_color: string;
    time: string;
    date: string;
    read: boolean;
    created_at: string;
    user_id: string;
    actions?: Json;
  }
}
