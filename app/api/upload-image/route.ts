import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Only initialize once
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = getStorage().bucket();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const collection = formData.get('collection') as string;
  const categoryId = formData.get('categoryId') as string;
  const itemName = formData.get('itemName') as string;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Read file buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = file.name.split('.').pop();
  const filename = `${collection}/${categoryId}/${itemName}-${uuidv4()}.${ext}`;

  const fileRef = bucket.file(filename);
  await fileRef.save(buffer, {
    contentType: file.type,
    public: true,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  // Make public and get URL
  await fileRef.makePublic();
  const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  return NextResponse.json({ url });
}
