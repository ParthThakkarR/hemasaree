// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) { /* ... redirect ... */ }



  const verifyUrl = new URL("/api/verify", req.url);

  try {

    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Pass token via header
      },
    });



    const responseText = await response.text(); // Read body as text first

    // -------------

    if (!response.ok) {
        console.error("❌ [MIDDLEWARE] API verification call failed!");
        return NextResponse.redirect(new URL("/login", req.url));
    }


    let data;
    try {
        data = JSON.parse(responseText); // Parse the text body

    } catch (parseError) {
        console.error("❌ [MIDDLEWARE] Failed to parse JSON response:", parseError);
        return NextResponse.redirect(new URL("/login", req.url));
    }
    // -----------------

    if (!data.isAdmin) {

      return NextResponse.redirect(new URL("/", req.url));
    }

   
    return NextResponse.next();

  } catch (error) { /* ... error handling ... */ }
}

export const config = { matcher: ["/admin/:path*"] };