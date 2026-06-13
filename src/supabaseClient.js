import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fwrlssqucskpazgyiebn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pvGRPL7YJ7PBhHmNJjE-7Q_-9crc6Rg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
