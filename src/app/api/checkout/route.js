import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { items, artistSlug } = await req.json();

    if (!items || !items.length) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    // Get MP Access Token. In multi-tenant, we can look up the artist's specific token.
    // For Nehuen Lozano or fallback, we use system environment or a test token.
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-4165518299105417-052701-db34c56e01a88cd577a726615b3c5885-235777894';

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // Format items for Mercado Pago Preferences API
    const mpItems = items.map((item) => ({
      id: item.id,
      title: item.title,
      description: `${item.type} by DJ/Producer`,
      quantity: 1,
      unit_price: Number(item.price),
      currency_id: 'ARS',
    }));

    const body = {
      items: mpItems,
      back_urls: {
        success: `${origin}/success?slug=${artistSlug || 'nehuen-lozano'}`,
        failure: `${origin}/failure?slug=${artistSlug || 'nehuen-lozano'}`,
        pending: `${origin}/pending?slug=${artistSlug || 'nehuen-lozano'}`,
      },
      auto_return: 'approved',
      statement_descriptor: 'TIENDA DJS',
    };

    const mpResponse = await fetch('https://api.mercadopago.com/v1/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json();
      console.error('Mercado Pago Preference creation failed:', errorData);
      return NextResponse.json({ error: 'Error al registrar preferencia de pago en Mercado Pago' }, { status: mpResponse.status });
    }

    const preference = await mpResponse.json();

    return NextResponse.json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ error: 'Error interno en el servidor durante checkout' }, { status: 500 });
  }
}
