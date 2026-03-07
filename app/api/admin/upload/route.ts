// // /app/api/admin/upload/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { writeFile, mkdir } from "fs/promises";
// import { join } from "path";
// import { verifyAdminToken } from "@/app/utils/auth";

// export async function POST(request: NextRequest) {
//   // ✅ Verify admin authentication
//   const adminId = await verifyAdminToken(request);
//   if (!adminId) {
//     return NextResponse.json(
//       { error: "Unauthorized: Admin access required" },
//       { status: 401 }
//     );
//   }

//   try {
//     const formData = await request.formData();

//     // ✅ Support multiple file uploads
//     const files = formData.getAll("files") as File[];

//     if (!files || files.length === 0) {
//       return NextResponse.json({ error: "No files provided." }, { status: 400 });
//     }

//     const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
//     const maxSize = 5 * 1024 * 1024; // 5MB

//     const uploadDir = join(process.cwd(), "public/uploads/products");
//     await mkdir(uploadDir, { recursive: true });

//     const uploadedUrls: string[] = [];

//     for (const file of files) {
//       // ✅ Type validation
//       if (!allowedTypes.includes(file.type)) {
//         return NextResponse.json(
//           { error: `Invalid file type: ${file.name}.` },
//           { status: 400 }
//         );
//       }

//       // ✅ Size validation
//       if (file.size > maxSize) {
//         return NextResponse.json(
//           { error: `File ${file.name} is too large (max 5MB).` },
//           { status: 400 }
//         );
//       }

//       // ✅ Sanitize filename and write file
//       const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
//       const timestamp = Date.now();
//       const finalName = `${timestamp}_${sanitizedName}`;
//       const filePath = join(uploadDir, finalName);

//       const bytes = await file.arrayBuffer();
//       await writeFile(filePath, Buffer.from(bytes));

//       // ✅ Add to URL list
//       uploadedUrls.push(`/uploads/products/${finalName}`);
//     }

//     // ✅ Return all uploaded URLs
//     return NextResponse.json({
//       message: "Files uploaded successfully",
//       urls: uploadedUrls,
//     });
//   } catch (error) {
//     console.error("[FILE_UPLOAD_ERROR]", error);
//     return NextResponse.json(
//       { error: "Failed to upload files. Please try again later." },
//       { status: 500 }
//     );
//   }
// }


// /app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyAdminToken } from '@/app/utils/auth';

export const runtime = 'nodejs';

const ALLOWED_FOLDERS = new Set(['products', 'categories', 'returns']);

export async function POST(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    // ✅ Get all uploaded files
    const files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided.' }, { status: 400 });
    }

    // ✅ Optional folder name (default: products)
    const requestedFolder = String(formData.get('folder') || 'products').trim().toLowerCase();
    const folder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : null;
    if (!folder) {
      return NextResponse.json({ error: 'Invalid upload folder.' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const uploadDir = path.join(process.cwd(), `public/uploads/${folder}`);
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type for ${file.name}.` },
          { status: 400 }
        );
      }
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `${file.name} exceeds the 5MB upload limit.` },
          { status: 400 }
        );
      }

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}_${sanitizedName}`;
      const filePath = path.join(uploadDir, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      urls.push(`/uploads/${folder}/${filename}`);
    }

    if (urls.length === 0) {
      return NextResponse.json({ error: 'No valid files were uploaded.' }, { status: 400 });
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('[FILE_UPLOAD_ERROR]', error);
    return NextResponse.json({ error: 'File upload failed.' }, { status: 500 });
  }
}
