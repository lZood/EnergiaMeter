import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase URL and/or anonymous key are not provided. App will run with mock data.');
  // Provide a dummy client to avoid crashes when Supabase is not configured.
  // The app logic should handle this case and use mock data.
  supabase = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: () => ({
      select: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel: () => ({
      on: () => ({
        subscribe: (callback?: (status: string) => void) => {
          if (callback) {
            callback('CHANNEL_ERROR');
          }
          return {
            unsubscribe: () => {},
          };
        },
      }),
    }) as any,
    removeChannel: () => Promise.resolve('ok'),
  } as unknown as SupabaseClient;
}

export { supabase };
