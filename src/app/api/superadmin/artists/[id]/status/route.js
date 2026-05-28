import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();

  if (!body.status || !['active', 'suspended'].includes(body.status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-project')) {
    return NextResponse.json({ success: true, localMock: true, updatedStatus: body.status });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data: updated, error } = await supabase
      .from('artists')
      .update({ billing_status: body.status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, artist: updated });
  } catch (error) {
    console.error('Error al cambiar el estado del artista:', error);
    return NextResponse.json({ error: 'Error al actualizar el estado del artista en la base de datos' }, { status: 500 });
  }
}
