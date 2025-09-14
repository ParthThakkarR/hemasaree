

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/contexts/AuthContext"; // 👈 1. IMPORT
import Navbar from "@/app/components/Navbar"; // 👈 2. IMPORT

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Saree Bazaar",
  description: "Elegant Saree Store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* You can keep your bootstrap link here if you use it sitewide */}
        <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossOrigin="anonymous"/>
      </head>
      <body className={inter.className}>
        {/* 3. WRAP EVERYTHING IN THE AUTH PROVIDER */}
        <AuthProvider>
          <Navbar /> {/* 👈 4. RENDER THE NAVBAR */}
          <main className="container mt-4">{children}</main>
        </AuthProvider>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossOrigin="anonymous"></script>

      </body>
    </html>
  );
}

