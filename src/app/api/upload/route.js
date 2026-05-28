import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || 'https://d152b92f14f5dc66e9874dad32615915.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '4c687e4c7486f478fe8ba9af186467fb',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || 'c7d766acec97567d6efab9fd297ea648cd9c6abaf7dc92982c0853b32b172540',
  },
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Convert file to buffer for S3 upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Obtener el slug del artista para aislar sus subidas en una carpeta dedicada en Cloudflare R2
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || 'global';

    const uniqueId = Math.random().toString(36).substring(2, 15) + '_' + Date.now();
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `uploads/${slug}/${uniqueId}_${cleanFilename}`;

    const command = new PutObjectCommand({
      Bucket: 'tiendadjs-public-assets',
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const publicUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || '/api/media'}/${key}`;

    return NextResponse.json({
      success: true,
      publicUrl,
    });
  } catch (error) {
    console.error('Error uploading file to R2 via server:', error);
    return NextResponse.json({ error: 'Error interno al subir archivo a R2' }, { status: 500 });
  }
}
