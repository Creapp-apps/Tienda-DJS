import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqiuyseugrrqnscitzvl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaXV5c2V1Z3JycW5zY2l0enZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTcwMzYsImV4cCI6MjA5NTQ3MzAzNn0._UdSEZiOVxpxa3RCoRt0H5YiCKJDPETlO5CphrBQNVA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Deleting nehuen-lozano...');

  // Cascade delete relations first
  const { data: artist } = await supabase.from('artists').select('id').eq('slug', 'nehuen-lozano').single();
  if (artist) {
    await supabase.from('artist_bio').delete().eq('artist_id', artist.id);
    const { data } = await supabase.from('artists').delete().eq('id', artist.id).select();
    console.log('Deleted artist:', data);
  } else {
    console.log('No artist found with slug nehuen-lozano');
  }
}

run();
