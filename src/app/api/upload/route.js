import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
    const { filename, contentType } = await req.json();
    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const uniqueId = Math.random().toString(36).substring(2, 15) + '_' + Date.now();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `uploads/${uniqueId}_${cleanFilename}`;

    const command = new PutObjectCommand({
      Bucket: 'tiendadjs-public-assets',
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-07c76c2db2ed47249738d31d00cccd6b.r2.dev'}/${key}`;

    return NextResponse.json({
      presignedUrl,
      publicUrl,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ error: 'Error al generar firma de subida' }, { status: 500 });
  }
}
