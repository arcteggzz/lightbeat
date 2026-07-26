# V1 Tracker — My Personal To-Do List

Goal: get a working v1 in my own house. Check these off in order.

## 1. Hardware sourcing
- [ ] Decide where to source the board: Computer Village/Otigba (in person) vs Jumia/Konga vs Jiji vs AliExpress
- [ ] Buy 1x ESP32 DevKit board (look for "ESP32 DevKitC" or "ESP32-WROOM-32")
- [ ] Buy 1x USB cable matching the board's port (micro-USB or USB-C, check listing)
- [ ] Buy 1x standard 5V USB wall charger head

## 2. Electrical setup
- [ ] Call/book an electrician
- [ ] Get a dedicated standalone socket installed next to the fridge, wired to NEPA-only (not backed by inverter)
- [ ] Confirm with electrician (or test myself) that the new socket actually loses power when NEPA goes off, independent of the inverter circuit

## 3. Dev environment setup
- [ ] Download and install Arduino IDE on my laptop
- [ ] Install ESP32 board support in Arduino IDE (board manager URL + package install)
- [ ] Connect ESP32 to laptop via USB, confirm it's detected (port shows up in Arduino IDE)
- [ ] Run a basic "blink" test sketch to confirm the board flashes and works at all

## 4. Firmware (Arduino code)
- [ ] Write WiFi connection logic: try Network #1 (home router), fall back to Network #2 (phone hotspot) — whichever connects, use it. No fallback-priority logic, keep it simple.
- [ ] Hardcode both WiFi credentials (SSID + password) into the sketch
- [ ] Write heartbeat logic: every 30 seconds, send HTTP POST to my server's `/heartbeat` endpoint
- [ ] Include in the payload: device ID, which network it connected through, timestamp
- [ ] Flash the finished sketch onto the ESP32 via USB
- [ ] Test: unplug from laptop, plug into a normal socket via wall charger, confirm heartbeats arrive at a test endpoint (can use a temporary logging tool like a webhook site before the real server exists)

## 5. Backend (server)
- [ ] Decide stack: Node/Express + TS vs .NET (pick one, don't overthink)
- [ ] Set up basic project + hosting (reuse existing EC2/infra or spin up something small)
- [ ] Build `POST /heartbeat` endpoint — just logs incoming pings (device_id, network, timestamp) to a database
- [ ] Set up database table(s): raw heartbeats table, derived outage_events table
- [ ] Build the "missed heartbeat" detection job — checks last heartbeat time, flips state to "down" after threshold (~90s), logs outage start/end/duration
- [ ] Add a simple `GET /status` endpoint (current state: up/down, since when)
- [ ] Add a `GET /history` endpoint (list of past outage events)

## 6. Frontend (dashboard)
- [ ] Set up basic React project
- [ ] Build current status view (power on/off, live, since when)
- [ ] Build outage history/timeline view
- [ ] Build simple uptime % stat
- [ ] (Later) Add WiFi-network-used view, since it's basically free data

## 7. Real-world install & validation
- [ ] Move the flashed ESP32 to its permanent spot: wall charger → new NEPA-only socket
- [ ] Confirm it connects to WiFi and starts sending heartbeats from its permanent location
- [ ] Let it run for a few days, manually verify against real-life outages I notice (does it match reality?)
- [ ] Adjust the "missed heartbeat" threshold if false positives/negatives show up

## 8. Repo & docs
- [ ] Create GitHub repo
- [ ] Add `summary.md` and `tracker.md` to repo root
- [ ] Add Arduino sketch code to repo
- [ ] Add backend code to repo
- [ ] Add frontend code to repo
- [ ] Write a basic README linking to summary.md for context
