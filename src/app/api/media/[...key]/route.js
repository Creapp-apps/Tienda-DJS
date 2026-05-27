import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || 'https://d152b92f14f5dc66e9874dad32615915.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '4c687e4c7486f478fe8ba9af186467fb',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || 'c7d766acec97567d6efab9fd297ea648cd9c6abaf7dc92982c0853b32b172540',
  },
});

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const keyArray = resolvedParams.key;
    if (!keyArray || keyArray.length === 0) {
      return NextResponse.json({ error: 'Falta la clave del archivo' }, { status: 400 });
    }

    // Reconstruct the full key path in R2 bucket (e.g. ["uploads", "file.png"] -> "uploads/file.png")
    const keyPath = keyArray.join('/');

    const command = new GetObjectCommand({
      Bucket: 'tiendadjs-public-assets',
      Key: keyPath,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: 'El archivo está vacío' }, { status: 404 });
    }

    // Convert stream to standard Uint8Array / Buffer
    const bytes = await response.Body.transformToByteArray();

    // Cache the image heavily at the CDN level (31536000 seconds = 1 year)
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': response.ContentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error(`Error al recuperar archivo desde R2:`, error);
    if (error.name === 'NoSuchKey') {
      return NextResponse.json({ error: 'El archivo especificado no existe' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Error al recuperar archivo' }, { status: 500 });
  }
}
