import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  // Get the form data from the request
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  // If there's no file, return an error
  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // Get the file data as a buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Define where to save the file (public/uploads/original-filename.ext)
  const path = join(process.cwd(), 'public/uploads', file.name);
  
  // Write the file to the server
  await writeFile(path, buffer);
  console.log(`File saved to: ${path}`);

  // Return the public URL of the saved file
  return NextResponse.json({ url: `/uploads/${file.name}` });
}