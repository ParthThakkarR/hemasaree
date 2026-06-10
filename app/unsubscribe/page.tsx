"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleUnsubscribe = async () => {
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0, backgroundColor: "#fbf5ec" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "24px", boxShadow: "0 4px 20px rgba(107, 15, 26, 0.05)", textAlign: "center", maxWidth: "400px" }}>
        {!email ? (
          <>
            <h1 style={{ color: "#6b0f1a", marginBottom: "16px", fontSize: "24px" }}>Invalid Link</h1>
            <p style={{ color: "#57534e", lineHeight: 1.6 }}>This unsubscribe link is invalid or missing an email parameter.</p>
          </>
        ) : status === "done" ? (
          <>
            <h1 style={{ color: "#6b0f1a", marginBottom: "16px", fontSize: "24px" }}>Unsubscribed</h1>
            <p style={{ color: "#57534e", lineHeight: 1.6 }}>You have been successfully removed from our newsletter. We&apos;re sorry to see you go!</p>
            <a href="/" style={{ display: "inline-block", marginTop: "24px", padding: "12px 24px", background: "#6b0f1a", color: "white", textDecoration: "none", borderRadius: "12px", fontWeight: "bold" }}>Return to Store</a>
          </>
        ) : status === "error" ? (
          <>
            <h1 style={{ color: "#6b0f1a", marginBottom: "16px", fontSize: "24px" }}>Error</h1>
            <p style={{ color: "#57534e", lineHeight: 1.6 }}>Something went wrong. Please try again later.</p>
          </>
        ) : (
          <>
            <h1 style={{ color: "#6b0f1a", marginBottom: "16px", fontSize: "24px" }}>Unsubscribe</h1>
            <p style={{ color: "#57534e", lineHeight: 1.6 }}>Click below to unsubscribe from our newsletter.</p>
            <button
              onClick={handleUnsubscribe}
              disabled={status === "loading"}
              style={{ marginTop: "24px", padding: "12px 24px", background: "#6b0f1a", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", opacity: status === "loading" ? 0.7 : 1 }}
            >
              {status === "loading" ? "Unsubscribing..." : "Unsubscribe"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
