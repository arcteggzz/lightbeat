# Electricity Uptime Tracker — Summary

A device + software system to track when I have electricity (NEPA) at home vs. when I don't — an uptime monitor, but for mains power instead of a website.

**How v1 works:** A small ESP32 board is plugged into a dedicated, NEPA-only socket (installed by an electrician). As long as NEPA is on, the board is powered and sends a heartbeat to a server every 30 seconds. When NEPA goes off, the board loses power and goes silent — no more heartbeats. The server detects the silence and logs it as an outage, with start/end times and duration.

**Two halves of the build:**
1. **Device (hardware + firmware)** — the ESP32 board and the Arduino program running on it.
2. **Backend + frontend** — a server that receives heartbeats and infers uptime/downtime, and a web dashboard to view the history.

**We considered 4 detection approaches** before picking one for v1 (full comparison in `project.md`):
1. ESP32 powered directly off the monitored circuit ("canary" approach) — **chosen for v1**
2. ESP32 + battery + real mains-sensing hardware
3. Off-the-shelf smart plug with a cloud API
4. Cellular/GSM-connected device, independent of home WiFi

**Scope:** v1 is for my own house only, not a general product.

**Known limitations of v1 (accepted, not solved yet):**
- Depends on home WiFi (or a phone hotspot fallback) having internet access
- Requires a dedicated NEPA-only socket

**Possible future expansion:** generalize the pipeline to track other things (water tank, door sensors, generator, temperature), add cellular connectivity, add real mains-sensing hardware, and potentially expand beyond my own house.

👉 For the full detailed write-up (including why each option was/wasn't chosen), see `project.md`.
👉 For my personal step-by-step to-do list to get v1 built, see `tracker.md`.
