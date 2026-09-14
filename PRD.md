# Frontend AI Agent Instruction: E-Commerce Code Review & Production Refactor

## 1. Goal and Objective
Your primary task as a Frontend AI Agent is twofold:
1. **Review:** Audit the provided e-commerce frontend codebase to identify technical debt, performance bottlenecks, and security gaps.
2. **Convert:** Refactor the codebase into a production-ready, top-tier e-commerce architecture using React, Next.js, and Tailwind CSS. 

Production readiness means the application is fit for real users, real traffic, real failures, and real operational constraints. A system can pass functional QA and still fail in production because of weak secrets handling, missing alerts, or unstable database queries. 

## 2. Review Phase: Code Audit Protocols
Before writing any new code, perform a comprehensive audit against the following checks:

### Performance & Core Web Vitals
*   Identify unoptimized images and missing responsive `srcset` or `sizes` attributes, as modern formats like WebP or AVIF deliver the biggest impact. 
*   Check for late-loading images that do not have explicit width and height set, as these can nudge surrounding content and ruin the CLS score.
*   Audit the number of resources the pages load and remove any unnecessary fonts, icons, or analytics scripts that aren't providing value.

### Security & Reliability
*   Ensure that customer data is handled securely and that the site enforces HTTPS (TLS), as modern HTTPS is faster and non-HTTPS sites are flagged as insecure.
*   Check for hardcoded secrets, weak environment variable handling, or insecure client-side API calls.
*   Identify if there are explicit assumptions about what happens when an external service degrades, when the database becomes slow, or when a sudden traffic spike arrives.

### User Experience, Design & SEO
*   Ensure the purchasing process is distraction-free, such as removing navigation menus from cart and checkout pages to keep customers focused.
*   Verify that calls to action (CTAs), like the "Add to Cart" button, are prominently placed above the fold and clearly visible near the product image.

## 3. Conversion Phase: Production Refactoring Standards
When refactoring the frontend to a production-level state, apply the following architectural standards:

### Data Fetching & Rendering Architecture
*   Serve pre-built static pages when possible, or use server-side page caching for rendered pages to reduce work. 
*   Utilize Server Components to securely interface with the database or ORM, keeping heavy processing and secrets out of the client bundle.
*   Isolate client-side interactivity to small, purpose-built components.

### Network & Asset Optimization
*   Configure the setup to deliver text assets (HTML, CSS, JS, SVG) pre-shrunk using compression algorithms like Brotli or Gzip.
*   Ensure assets are delivered through a CDN to cache static assets on edge servers around the world, dramatically lowering latency.
*   Upgrade protocols by utilizing HTTP/2 or HTTP/3 to benefit from multiplexing and reduced latency.

### Error Boundaries & Resilience
*   Implement explicit React Error Boundaries around critical checkout and product fetch flows.
*   Ensure that if an API mutation (like adding an item to the cart) fails, the UI gracefully rolls back its optimistic state and alerts the user without crashing the app.

## 4. Agent Execution Protocol
1.  **Analyze & Report:** Do not rewrite the whole file immediately. First, output a brief summary of the production readiness failures you have identified.
2.  **Iterative Refactor:** Provide the refactored code block-by-block. 
3.  **Validate:** Explain how the new code resolves the specific production-level problem (e.g., "This explicit image height fixes the CLS penalty").