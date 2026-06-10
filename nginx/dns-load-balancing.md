# ─── DNS-Based Load Balancing for HemaSaree ─────────────────────────────────
# Reference configurations for DNS-level load balancing
# This works alongside Nginx (which handles per-server load balancing)
# ─────────────────────────────────────────────────────────────────────────────

# ─── How DNS Load Balancing Works ───────────────────────────────────────────
#
# 1. User requests hemasarees.com
# 2. DNS resolves to MULTIPLE server IPs (not just one)
# 3. DNS rotates through IPs (round-robin, weighted, or geo-based)
# 4. Each server runs its own Nginx + Next.js stack
# 5. Nginx on each server handles local load balancing across Next.js instances
#
# Architecture:
#   User → DNS (multiple IPs) → Server A (Nginx → 3x Next.js)
#                              → Server B (Nginx → 3x Next.js)
#                              → Server C (Nginx → 3x Next.js)
#
# ─────────────────────────────────────────────────────────────────────────────

# ─── Option 1: Simple Round-Robin DNS (Any DNS Provider) ────────────────────
#
# Most DNS providers support multiple A records for the same domain.
# They automatically rotate through them (round-robin).
#
# Zone file example (BIND format):
#
# hemasarees.com.    300    IN    A    203.0.113.10    ; Server A
# hemasarees.com.    300    IN    A    203.0.113.11    ; Server B
# hemasarees.com.    300    IN    A    203.0.113.12    ; Server C
# www.hemasarees.com. 300   IN    CNAME hemasarees.com.
#
# TTL of 300 seconds (5 min) ensures clients refresh DNS frequently.
# Each server should run the full Docker Compose stack (Nginx + Next.js + Redis + MongoDB replica).

# ─── Option 2: Cloudflare (Free Tier) ──────────────────────────────────────
#
# Cloudflare provides free load balancing with health checks.
#
# Steps:
# 1. Add your domain to Cloudflare (free plan)
# 2. Go to Traffic → Load Balancing
# 3. Create origin pools:
#    - Pool A: 203.0.113.10 (primary)
#    - Pool B: 203.0.113.11 (secondary)
#    - Pool C: 203.0.113.12 (tertiary)
# 4. Health check: HTTP GET /api/health → expect 200
# 5. Steering policy: Round-robin (or failover for HA)
#
# Cloudflare free tier includes:
# - 2 origin pools
# - 2 origins per pool
# - Unlimited load balancing rules
# - Basic health checks
#
# For 3+ servers, use the Pro plan ($20/mo) or configure DNS records directly.

# ─── Option 3: AWS Route 53 ────────────────────────────────────────────────
#
# Route 53 provides weighted, latency-based, and geolocation routing.
#
# Weighted Routing (for A/B testing or gradual rollout):
# {
#   "Changes": [{
#     "Action": "CREATE",
#     "ResourceRecordSet": {
#       "Name": "hemasarees.com",
#       "Type": "A",
#       "SetIdentifier": "server-a",
#       "Weight": 50,
#       "TTL": 300,
#       "ResourceRecords": [{"Value": "203.0.113.10"}]
#     }
#   }, {
#     "Action": "CREATE",
#     "ResourceRecordSet": {
#       "Name": "hemasarees.com",
#       "Type": "A",
#       "SetIdentifier": "server-b",
#       "Weight": 30,
#       "TTL": 300,
#       "ResourceRecords": [{"Value": "203.0.113.11"}]
#     }
#   }, {
#     "Action": "CREATE",
#     "ResourceRecordSet": {
#       "Name": "hemasarees.com",
#       "Type": "A",
#       "SetIdentifier": "server-c",
#       "Weight": 20,
#       "TTL": 300,
#       "ResourceRecords": [{"Value": "203.0.113.12"}]
#     }
#   }]
# }
#
# Health check: Route 53 checks /api/health endpoint automatically.

# ─── Option 4: DigitalOcean (Free) ─────────────────────────────────────────
#
# DigitalOcean supports round-robin DNS with multiple A records.
#
# Via the control panel:
# 1. Go to Networking → Domains → hemasarees.com
# 2. Add A records:
#    - hemasarees.com → 203.0.113.10 (Server A)
#    - hemasarees.com → 203.0.113.11 (Server B)
#    - hemasarees.com → 203.0.113.12 (Server C)
#
# Via doctl CLI:
#   doctl compute domain records create hemasarees.com \
#     --record-type A --record-name @ --record-data 203.0.113.10 --record-ttl 300
#   doctl compute domain records create hemasarees.com \
#     --record-type A --record-name @ --record-data 203.0.113.11 --record-ttl 300
#   doctl compute domain records create hemasarees.com \
#     --record-type A --record-name @ --record-data 203.0.113.12 --record-ttl 300

# ─── Option 5: Cloudflare DNS (Manual, No Load Balancing Feature) ──────────
#
# Just add multiple A records in Cloudflare DNS:
#
# Type  Name  Content        TTL     Proxy
# A     @     203.0.113.10   Auto    Proxied (orange cloud)
# A     @     203.0.113.11   Auto    Proxied (orange cloud)
# A     @     203.0.113.12   Auto    Proxied (orange cloud)
#
# Cloudflare's proxy will distribute traffic across all three IPs.
# This is the simplest free option and works well for most cases.

# ─── Health Check Configuration ─────────────────────────────────────────────
#
# All DNS providers should monitor backend health:
#
# Health Check Endpoint: GET /api/health
# Expected Response: 200 OK with {"message":"OK"}
# Check Interval: 30-60 seconds
# Failure Threshold: 3 consecutive failures → remove from pool
# Recovery Threshold: 3 consecutive successes → add back to pool
#
# The /api/health endpoint already checks:
# - MongoDB connectivity
# - Redis connectivity
# - Returns 503 if either is down

# ─── Failover Configuration ─────────────────────────────────────────────────
#
# For high availability, configure failover (not just round-robin):
#
# Primary:   203.0.113.10 (Server A) — receives all traffic
# Secondary: 203.0.113.11 (Server B) — receives traffic only if A is unhealthy
# Tertiary:  203.0.113.12 (Server C) — receives traffic only if A and B are unhealthy
#
# This requires:
# 1. DNS provider with health-check-based failover (Cloudflare, Route53, etc.)
# 2. Each server has its own MongoDB (replica set) and Redis (sentinel or cluster)
# 3. Session state stored in Redis (already done via NextAuth adapter)
#
# For a simpler setup:
# - Use round-robin DNS (all servers active)
# - Docker health checks handle individual container failures
# - Nginx handles backend failover within each server

# ─── Deployment Steps ──────────────────────────────────────────────────────
#
# 1. Set up 3 servers (e.g., 3x DigitalOcean droplets or 3x AWS EC2)
# 2. Install Docker + Docker Compose on each server
# 3. Clone the repo on each server
# 4. Configure .env with the same NEXTAUTH_SECRET, REDIS_URL, etc.
# 5. Run: docker compose up -d
# 6. Configure DNS to point to all 3 server IPs
# 7. Set up automated backups for MongoDB data
#
# Scaling commands:
#   docker compose up -d --scale next-app=5    # Scale to 5 instances
#   docker compose ps                          # Check health status
#   docker compose logs -f nginx               # Monitor load balancer
