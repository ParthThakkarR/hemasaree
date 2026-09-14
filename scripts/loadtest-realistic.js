/**
 * HemaSaree — Realistic Production Load Test
 * 
 * Targets: API endpoints with realistic concurrency levels.
 * Warm-up phase included to avoid cold-start skew.
 * 
 * Usage: node scripts/loadtest-realistic.js
 */

const autocannon = require('autocannon');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ── Warm-up: Hit each endpoint once to trigger compilation ──

async function warmUp() {
  console.log('\n  🔄 Warming up endpoints (triggering Next.js compilation)...');
  const endpoints = [
    '/api/products?page=1&limit=12',
    '/api/products?page=1&limit=12&category=Silk',
    '/api/products?page=1&limit=12&category=Silk,Banarasi',
    '/api/products?page=1&limit=12&search=wedding',
    '/api/settings',
    '/api/health',
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${ep}`);
      console.log(`     ${ep.padEnd(55)} → ${res.status}`);
    } catch (err) {
      console.log(`     ${ep.padEnd(55)} → FAILED: ${err.message}`);
    }
  }
  console.log('  ✅ Warm-up complete\n');
}

// ── Scenarios: Realistic production traffic ──

const scenarios = [
  {
    name: '1. Products API — Unfiltered (10 users)',
    url: `${BASE_URL}/api/products?page=1&limit=12`,
    connections: 10,
    duration: 15,
    pipelining: 1,
  },
  {
    name: '2. Products API — Unfiltered (25 users)',
    url: `${BASE_URL}/api/products?page=1&limit=12`,
    connections: 25,
    duration: 15,
    pipelining: 1,
  },
  {
    name: '3. Products API — Unfiltered (50 users)',
    url: `${BASE_URL}/api/products?page=1&limit=12`,
    connections: 50,
    duration: 15,
    pipelining: 1,
  },
  {
    name: '4. Single Category (25 users)',
    url: `${BASE_URL}/api/products?page=1&limit=12&category=Silk`,
    connections: 25,
    duration: 15,
    pipelining: 1,
  },
  {
    name: '5. Multi Category (25 users)',
    url: `${BASE_URL}/api/products?page=1&limit=12&category=Silk,Banarasi`,
    connections: 25,
    duration: 15,
    pipelining: 1,
  },
  {
    name: '6. All Filters (25 users)',
    url: `${BASE_URL}/api/products?page=1&limit=12&category=Silk&color=Red&fabric=Silk&occasion=Bridal&sortPrice=low`,
    connections: 25,
    duration: 15,
    pipelining: 1,
  },
  {
    name: '7. Search Query (25 users)',
    url: `${BASE_URL}/api/products?page=1&limit=12&search=wedding`,
    connections: 25,
    duration: 15,
    pipelining: 1,
  },
  {
    name: '8. Settings API (25 users)',
    url: `${BASE_URL}/api/settings`,
    connections: 25,
    duration: 10,
    pipelining: 1,
  },
  {
    name: '9. Health Check (25 users)',
    url: `${BASE_URL}/api/health`,
    connections: 25,
    duration: 10,
    pipelining: 1,
  },
  // Stress test — push limits
  {
    name: '10. STRESS: Unfiltered (100 users)',
    url: `${BASE_URL}/api/products?page=1&limit=12`,
    connections: 100,
    duration: 20,
    pipelining: 1,
  },
];

// ── Runner ──

function fmt(n) { return n.toLocaleString('en-IN'); }
function fmtLat(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

async function runScenario(scenario) {
  return new Promise((resolve) => {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  🔥 ${scenario.name}`);
    console.log(`  Connections: ${scenario.connections} | Duration: ${scenario.duration}s`);
    console.log(`${'═'.repeat(70)}`);

    autocannon({
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

      const s = {
        name: scenario.name,
        connections: scenario.connections,
        totalReqs: result.requests.total,
        rps: Math.round(result.requests.average),
        throughputMB: (result.throughput.average / 1024 / 1024).toFixed(2),
        p50: result.latency.p50,
        p99: result.latency.p99,
        p999: result.latency.p999 || result.latency.max,
        avg: result.latency.average,
        ok: result['2xx'] || 0,
        nonOk: result.non2xx,
        errors: result.errors,
        timeouts: result.timeouts,
      };

      const errorRate = s.totalReqs > 0 ? ((s.nonOk + s.errors) / s.totalReqs * 100).toFixed(1) : '0.0';

      console.log(`\n  📊 Results:`);
      console.log(`  ├─ Total Requests:    ${fmt(s.totalReqs)}`);
      console.log(`  ├─ Requests/sec:      ${fmt(s.rps)}`);
      console.log(`  ├─ Throughput:         ${s.throughputMB} MB/s`);
      console.log(`  ├─ Latency (avg):      ${fmtLat(s.avg)}`);
      console.log(`  ├─ Latency (p50):      ${fmtLat(s.p50)}`);
      console.log(`  ├─ Latency (p99):      ${fmtLat(s.p99)}`);
      console.log(`  ├─ 2xx:                ${fmt(s.ok)}`);
      console.log(`  ├─ Non-2xx:            ${s.nonOk}`);
      console.log(`  ├─ Errors/Timeouts:    ${s.errors}/${s.timeouts}`);
      console.log(`  └─ Error Rate:         ${errorRate}%`);

      if (s.p99 > 2000)   console.log(`  ⚠️  HIGH P99 — needs optimization`);
      if (s.errors > 0)   console.log(`  ⚠️  ERRORS DETECTED`);
      if (parseFloat(errorRate) > 1) console.log(`  ⚠️  ERROR RATE > 1%`);
      if (parseFloat(errorRate) === 0 && s.rps > 0) console.log(`  ✅ CLEAN — zero errors`);

      resolve(s);
    });

    // Show progress bar
    // autocannon.track(instance, { renderProgressBar: true });
  });
}

async function main() {
  console.log(`\n╔${'═'.repeat(68)}╗`);
  console.log(`║   HemaSaree — Realistic Production Load Test                       ║`);
  console.log(`║   Target: ${BASE_URL.padEnd(57)}║`);
  console.log(`║   Time:   ${new Date().toISOString().padEnd(57)}║`);
  console.log(`╚${'═'.repeat(68)}╝`);

  await warmUp();

  const results = [];
  for (const scenario of scenarios) {
    const result = await runScenario(scenario);
    if (result) results.push(result);
  }

  // Summary
  console.log(`\n\n${'═'.repeat(80)}`);
  console.log(`  📋 PERFORMANCE SUMMARY`);
  console.log(`${'═'.repeat(80)}`);
  console.log(`  ${'Scenario'.padEnd(42)} ${'Conn'.padStart(5)} ${'RPS'.padStart(6)} ${'P50'.padStart(7)} ${'P99'.padStart(7)} ${'Err%'.padStart(6)}`);
  console.log(`  ${'─'.repeat(73)}`);

  for (const r of results) {
    const name = r.name.length > 40 ? r.name.slice(0, 37) + '...' : r.name;
    const errRate = r.totalReqs > 0 ? ((r.nonOk + r.errors) / r.totalReqs * 100).toFixed(1) : '0.0';
    console.log(
      `  ${name.padEnd(42)} ${String(r.connections).padStart(5)} ${String(r.rps).padStart(6)} ${fmtLat(r.p50).padStart(7)} ${fmtLat(r.p99).padStart(7)} ${(errRate + '%').padStart(6)}`
    );
  }

  // Verdict
  console.log(`\n  ${'─'.repeat(73)}`);
  const cleanScenarios = results.filter(r => (r.nonOk + r.errors) === 0);
  const errorScenarios = results.filter(r => (r.nonOk + r.errors) > 0);
  console.log(`  ✅ ${cleanScenarios.length}/${results.length} scenarios completed with 0% errors`);
  if (errorScenarios.length > 0) {
    console.log(`  ⚠️  ${errorScenarios.length} scenarios had errors (likely connection pool exhaustion under extreme load)`);
  }
  
  // Capacity estimate
  const bestClean = cleanScenarios.reduce((best, r) => r.rps > best.rps ? r : best, { rps: 0 });
  if (bestClean.rps > 0) {
    console.log(`\n  📈 Estimated max clean throughput: ~${fmt(bestClean.rps)} req/s`);
    console.log(`     At ${bestClean.rps} RPS, site can serve ~${fmt(bestClean.rps * 3600)} requests/hour`);
    console.log(`     Assuming 5 API calls/pageview: ~${fmt(Math.floor(bestClean.rps * 3600 / 5))} pageviews/hour`);
  }

  console.log(`\n  ✅ Load testing complete.\n`);
}

main().catch(console.error);
