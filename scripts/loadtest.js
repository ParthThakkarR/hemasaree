/**
 * HemaSaree Load Testing Script
 * 
 * Uses autocannon for hardcore HTTP load testing.
 * Covers: products listing, single product, API endpoints, filtered queries.
 *
 * Usage:
 *   1. Start dev server: npm run dev
 *   2. Run tests: node scripts/loadtest.js
 *   3. (Optional) Against production: BASE_URL=https://hemasaree.vercel.app node scripts/loadtest.js
 */

const autocannon = require('autocannon');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ── Test Scenarios ──────────────────────────────────────────────────────

const scenarios = [
  {
    name: '1. Homepage',
    url: `${BASE_URL}/`,
    connections: 50,
    duration: 20,
    pipelining: 1,
  },
  {
    name: '2. Products Listing Page',
    url: `${BASE_URL}/products`,
    connections: 50,
    duration: 20,
    pipelining: 1,
  },
  {
    name: '3. Products API — No Filters',
    url: `${BASE_URL}/api/products?page=1&limit=12`,
    connections: 100,
    duration: 30,
    pipelining: 5,
  },
  {
    name: '4. Products API — Single Category',
    url: `${BASE_URL}/api/products?page=1&limit=12&category=Silk`,
    connections: 100,
    duration: 20,
    pipelining: 5,
  },
  {
    name: '5. Products API — Multi Category',
    url: `${BASE_URL}/api/products?page=1&limit=12&category=Silk,Banarasi`,
    connections: 100,
    duration: 20,
    pipelining: 5,
  },
  {
    name: '6. Products API — With All Filters',
    url: `${BASE_URL}/api/products?page=1&limit=12&category=Silk&color=Red&fabric=Silk&occasion=Bridal&sortPrice=low`,
    connections: 80,
    duration: 20,
    pipelining: 5,
  },
  {
    name: '7. Products API — Search',
    url: `${BASE_URL}/api/products?page=1&limit=12&search=wedding`,
    connections: 80,
    duration: 20,
    pipelining: 5,
  },
  {
    name: '8. Settings API (Public)',
    url: `${BASE_URL}/api/settings`,
    connections: 100,
    duration: 15,
    pipelining: 10,
  },
  {
    name: '9. Health Check',
    url: `${BASE_URL}/api/health`,
    connections: 200,
    duration: 15,
    pipelining: 10,
  },
];

// ── Runner ──────────────────────────────────────────────────────────────

function formatNumber(n) {
  return n.toLocaleString('en-IN');
}

function formatLatency(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

async function runScenario(scenario) {
  return new Promise((resolve) => {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  🔥 ${scenario.name}`);
    console.log(`  URL: ${scenario.url}`);
    console.log(`  Connections: ${scenario.connections} | Duration: ${scenario.duration}s | Pipelining: ${scenario.pipelining}`);
    console.log(`${'═'.repeat(70)}`);

    const instance = autocannon({
      url: scenario.url,
      connections: scenario.connections,
      duration: scenario.duration,
      pipelining: scenario.pipelining,
      timeout: 30,
    }, (err, result) => {
      if (err) {
        console.error(`  ❌ Error: ${err.message}`);
        resolve(null);
        return;
      }

      const summary = {
        name: scenario.name,
        totalRequests: result.requests.total,
        rps: result.requests.average,
        throughputMB: (result.throughput.average / 1024 / 1024).toFixed(2),
        latencyP50: result.latency.p50,
        latencyP99: result.latency.p99,
        latencyP999: result.latency.p999 || result.latency.max,
        latencyAvg: result.latency.average,
        errors: result.errors,
        timeouts: result.timeouts,
        non2xx: result.non2xx,
        statusCodes: result['2xx'] || 0,
      };

      console.log(`\n  📊 Results:`);
      console.log(`  ├─ Total Requests:    ${formatNumber(summary.totalRequests)}`);
      console.log(`  ├─ Requests/sec:      ${formatNumber(Math.round(summary.rps))}`);
      console.log(`  ├─ Throughput:         ${summary.throughputMB} MB/s`);
      console.log(`  ├─ Latency (avg):      ${formatLatency(summary.latencyAvg)}`);
      console.log(`  ├─ Latency (p50):      ${formatLatency(summary.latencyP50)}`);
      console.log(`  ├─ Latency (p99):      ${formatLatency(summary.latencyP99)}`);
      console.log(`  ├─ Latency (p99.9):    ${formatLatency(summary.latencyP999)}`);
      console.log(`  ├─ 2xx Responses:      ${formatNumber(summary.statusCodes)}`);
      console.log(`  ├─ Non-2xx:            ${summary.non2xx}`);
      console.log(`  ├─ Errors:             ${summary.errors}`);
      console.log(`  └─ Timeouts:           ${summary.timeouts}`);

      // Health indicators
      if (summary.latencyP99 > 2000) {
        console.log(`  ⚠️  HIGH P99 LATENCY — consider database indexing or query optimization`);
      }
      if (summary.errors > 0 || summary.timeouts > 0) {
        console.log(`  ⚠️  ERRORS/TIMEOUTS DETECTED — investigate server logs`);
      }
      if (summary.non2xx > summary.totalRequests * 0.01) {
        console.log(`  ⚠️  >1% NON-2XX RESPONSES — check error handling`);
      }

      resolve(summary);
    });

    // Progress tracking
    autocannon.track(instance, { renderProgressBar: true });
  });
}

async function main() {
  console.log(`\n╔${'═'.repeat(68)}╗`);
  console.log(`║   HemaSaree Load Testing Suite                                     ║`);
  console.log(`║   Target: ${BASE_URL.padEnd(57)}║`);
  console.log(`║   Time:   ${new Date().toISOString().padEnd(57)}║`);
  console.log(`╚${'═'.repeat(68)}╝`);

  const results = [];

  for (const scenario of scenarios) {
    const result = await runScenario(scenario);
    if (result) results.push(result);
  }

  // Summary table
  console.log(`\n\n${'═'.repeat(70)}`);
  console.log(`  📋 SUMMARY TABLE`);
  console.log(`${'═'.repeat(70)}`);
  console.log(`  ${'Scenario'.padEnd(35)} ${'RPS'.padStart(8)} ${'P50'.padStart(8)} ${'P99'.padStart(8)} ${'Errors'.padStart(8)}`);
  console.log(`  ${'─'.repeat(67)}`);
  
  for (const r of results) {
    const name = r.name.length > 33 ? r.name.slice(0, 30) + '...' : r.name;
    console.log(
      `  ${name.padEnd(35)} ${String(Math.round(r.rps)).padStart(8)} ${formatLatency(r.latencyP50).padStart(8)} ${formatLatency(r.latencyP99).padStart(8)} ${String(r.errors + r.timeouts).padStart(8)}`
    );
  }

  console.log(`\n  ✅ Load testing complete.\n`);
}

main().catch(console.error);
