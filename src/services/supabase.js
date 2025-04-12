import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cxezauqscpmfplmtnzzj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4ZXphdXFzY3BtZnBsbXRuenpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTUxODMsImV4cCI6MjA2MDAzMTE4M30.Tl9BaFs34hfdFRx31bT1ma5Pf53EEas9FW4QWA1OTCs';
export const supabase = createClient(supabaseUrl, supabaseKey);