import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqiuyseugrrqnscitzvl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaXV5c2V1Z3JycW5zY2l0enZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTcwMzYsImV4cCI6MjA5NTQ3MzAzNn0._UdSEZiOVxpxa3RCoRt0H5YiCKJDPETlO5CphrBQNVA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Inserting nehuen-lozano...');

  const { data: newArtist, error: insertError } = await supabase
    .from('artists')
    .insert({
      name: 'Lozano',
      slug: 'nehuen-lozano',
      billing_status: 'active',
    })
    .select()
    .single();

  if (insertError) {
    console.error('Insert error:', insertError);
    return;
  }

  console.log('Inserted:', newArtist);

  await supabase.from('artist_bio').insert({
    artist_id: newArtist.id,
    section_title: 'Biografía',
    tagline: 'Latin Tech / After mix',
    intro: 'Biografía en construcción...',
    paragraphs: [
      {
        text: 'Haz clic en la consola de contenidos para comenzar a diseñar tu biografía.',
        highlight: 'consola de contenidos'
      }
    ],
    stats: [
      { value: '10+', label: 'Shows en vivo' },
      { value: '5K', label: 'Seguidores' },
      { value: '15', label: 'Tracks editados' },
      { value: '4', label: 'Ciudades' }
    ]
  });

  console.log('Done creating related info.');
}

run();
