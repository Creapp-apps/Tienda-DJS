import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqiuyseugrrqnscitzvl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaXV5c2V1Z3JycW5zY2l0enZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTcwMzYsImV4cCI6MjA5NTQ3MzAzNn0._UdSEZiOVxpxa3RCoRt0H5YiCKJDPETlO5CphrBQNVA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: artists } = await supabase.from('artists').select('*');
  const target = artists.find(a => a.slug !== 'nehuen-lozano');
  
  if (!target) {
    console.log('No dynamic artist found to test deletion count.');
    return;
  }
  
  console.log('Target Artist:', target.name, 'ID:', target.id);

  // Attempt delete and SELECT the deleted row to see if it actually deleted anything
  const resBio = await supabase.from('artist_bio').delete().eq('artist_id', target.id).select();
  console.log('artist_bio delete count:', resBio.data?.length, 'error:', resBio.error);

  const resManifesto = await supabase.from('artist_manifesto').delete().eq('artist_id', target.id).select();
  console.log('artist_manifesto delete count:', resManifesto.data?.length, 'error:', resManifesto.error);

  const resOutro = await supabase.from('artist_outro').delete().eq('artist_id', target.id).select();
  console.log('artist_outro delete count:', resOutro.data?.length, 'error:', resOutro.error);

  const resGigs = await supabase.from('artist_gigs').delete().eq('artist_id', target.id).select();
  console.log('artist_gigs delete count:', resGigs.data?.length, 'error:', resGigs.error);

  const resTracks = await supabase.from('artist_tracks').delete().eq('artist_id', target.id).select();
  console.log('artist_tracks delete count:', resTracks.data?.length, 'error:', resTracks.error);

  const resVideos = await supabase.from('artist_videos').delete().eq('artist_id', target.id).select();
  console.log('artist_videos delete count:', resVideos.data?.length, 'error:', resVideos.error);

  const resArtist = await supabase.from('artists').delete().eq('id', target.id).select();
  console.log('artists delete count:', resArtist.data?.length, 'error:', resArtist.error);
}

run();
