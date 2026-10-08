# 📡 Pinas Connected - Wireless ISP & PTP/PtMP Monitor

> **Ultra-Lightweight Wireless ISP, P2P & PtMP Link Monitor with Telegram Alerts, Inactive Link Auto-Ticketing, Tailscale Funnel, Client Billing, and Multi-Installer Monetization.**

A fast, low-memory Philippine WISP platform and alternative to heavy official Ubiquiti UISP/UNMS (runs in **< 65MB RAM** instead of 4GB). Built for Filipino and global wireless installers, tower operators, and community ISPs.

---

## ⚡ Core Features

- 📶 **P2P & PtMP Wireless Link Monitoring**: Real-time throughput, capacity, signal RSSI/SNR, TX power, and latency tracking modeled after Ubiquiti airOS 8.
- 🚨 **Bandwidth Drop Alerts (< 5 Mbps)**: Instant Telegram alerts via @BotFather when any subscriber dish or backhaul link drops below your speed threshold.
- ⚡ **Auto-Ticket Watchdog for Inactive Links**: Background watchdog detects offline or heartbeat timeouts (> 5 mins) and automatically files critical trouble tickets with immediate Telegram notification.
- 🎫 **Client Support Ticketing System**: Complete trouble-ticket management queue with client reporting portal, issue categories, priority routing, and technician resolution notes.
- 💳 **Client Billing & Due Reminders**: Track subscription renewal days (e.g. 5th of the month), overdue status, and dispatch one-click Telegram billing summaries.
- 🔒 **Tailscale Funnel Ingress**: Securely receive telemetry from remote Ubiquiti LiteBeam, PowerBeam, NanoStation, and Mikrotik CPEs without opening router ports or paying for static public IPs.
- 💼 **Multi-Installer SaaS & Monetization**:
  - Installer registration with **First 30 Days Free Trial**.
  - Wallet payment channels (GCash, Maya, QRPh, Bank Transfer, USDT).
  - Installers submit their payment reference number; Master Admin activates account for +30 days.
  - Master Admin Banking Portal with live QR code management.

---

## 🚀 1-Step Docker Deployment

Deploy on any $5/month VPS (DigitalOcean, Hetzner, Linode, AWS Lightsail) or local Raspberry Pi / mini PC:

```bash
# 1. Clone repository
git clone https://github.com/your-username/ptp-linkpulse.git
cd ptp-linkpulse

# 2. Launch container in background (All data permanently saved in Docker volume)
docker compose up -d --build

# 3. View logs
docker compose logs -f
```

Your monitor is now running at `http://localhost:3000`!

---

## 🔒 Tailscale Funnel Linking (No Port Forwarding)

Expose your monitor to remote antennas over public HTTPS via Tailscale:

```bash
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Enable Funnel on port 3000
tailscale funnel 3000
```

Copy your Funnel URL (e.g. `https://your-node.your-tailnet.ts.net`) into the app's **Tailscale Linking** tab.

---

## 📡 Remote Antenna Scripts

### Ubiquiti airOS 8 / AC (LiteBeam 5AC, NanoBeam, PowerBeam)
In airOS Web UI: go to **System → UISP Management** and enable it, or schedule in SSH:
```bash
curl -k -s -X POST "https://your-funnel-url.ts.net/api/telemetry" \
  -H "Content-Type: application/json" \
  -d '{
    "mac": "E4:38:83:AE:DA:18",
    "name": "Client LiteBeam 5AC",
    "throughput": 1.26,
    "capacity": 22.62,
    "signal": -64,
    "txPower": 21,
    "key": "your_uisp_key"
  }'
```

### Mikrotik RouterOS (v6 & v7)
In Winbox: `/system script` and schedule every 2 minutes:
```routeros
:local url "https://your-funnel-url.ts.net/api/telemetry";
:local key "your_uisp_key";
/tool fetch http-method=post \
  http-header-field="Content-Type: application/json" \
  http-data="{\"name\":\"Backbone PTP\",\"ip\":\"172.16.0.48\",\"throughput\":18.4,\"capacity\":70.0,\"signal\":-58,\"txPower\":22,\"key\":\"$key\"}" \
  url=$url;
```

---

## 🛠️ Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Listening port | `3000` |
| `NODE_ENV` | Environment mode | `production` |
| `DATA_DIR` | Persistent database directory | `/app/data` |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather | Optional |
| `TELEGRAM_CHAT_ID` | Your personal or group chat ID | Optional |

---

## 📂 Project Structure

```
├── Dockerfile              # Lightweight Alpine multi-stage build (< 65MB RAM)
├── docker-compose.yml      # 1-command startup with persistent data volume
├── server.ts               # Express backend, telemetry webhook & watchdog
├── src/
│   ├── App.tsx             # Main application orchestrator
│   ├── types.ts            # P2P/PtMP, Tickets, Installers, Billing data types
│   └── components/
│       ├── Header.tsx      # UISP-style top bar with trial & role indicators
│       ├── DeviceCard.tsx  # airOS gauge, signal diagnostics & simulator
│       ├── DeviceModal.tsx # P2P vs PtMP selector with Sector AP grouping
│       ├── TicketManager.tsx # Client trouble-tickets & Auto-ticket watchdog
│       ├── TailscaleLinker.tsx # Dedicated Tailscale front-end with live ingress
│       ├── BillingManager.tsx  # Monthly client due calendar & Telegram ping
│       ├── AdminPortal.tsx     # Master Admin, 30-day activations & QR banking
│       └── DockerDeployModal.tsx # 1-click terminal deployment instructions
└── package.json
```

---

## 📄 License
Apache-2.0
