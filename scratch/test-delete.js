import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqiuyseugrrqnscitzvl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaXV5c2V1Z3JycW5zY2l0enZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTcwMzYsImV4cCI6MjA5NTQ3MzAzNn0._UdSEZiOVxpxa3RCoRt0H5YiCKJDPETlO5CphrBQNVA';

console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  // 1. List current artists
  const { data: artists, error: listError } = await supabase.from('artists').select('*');
  if (listError) {
    console.error('List error:', listError);
    return;
  }
  console.log('Current artists in DB:', artists.map(a => ({ id: a.id, name: a.name, slug: a.slug })));

  // Try to delete one if there is any non-lozano artist
  const toDelete = artists.find(a => a.slug !== 'nehuen-lozano');
  if (!toDelete) {
    console.log('No unregistered artists to delete.');
    return;
  }

  console.log('Attempting to delete artist:', toDelete.name, 'with ID:', toDelete.id);
  
  const bioDel = await supabase.from('artist_bio').delete().eq('artist_id', toDelete.id);
  console.log('artist_bio delete status:', bioDel.status, 'error:', bioDel.error);

  const artistDel = await supabase.from('artists').delete().eq('id', toDelete.id);
  console.log('artists delete status:', artistDel.status, 'error:', artistDel.error);
}

run();
