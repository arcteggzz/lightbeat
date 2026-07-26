# Electricity Uptime Tracker — Project.md (Detailed)

## What This Project Is

A device + software system to track when I have electricity (NEPA) at home and when I don't — an uptime monitor, but for mains power instead of a website. Long-term, the goal is to expand this into something bigger (see Expansion section), but the immediate focus is a v1 that works for my own house only.

---

## Part 1: The Core Problem — Detecting Power State

The hard part of this project isn't the software CRUD — it's that **a server can't directly ask "is there power at this house?"**. Power state has to be inferred indirectly, because a device going silent could mean power is out, OR WiFi is down, OR the device itself crashed — these all look identical from the server's point of view. Complicating this further, a home WiFi router itself typically runs on mains power, so when power goes out, the router usually goes down too, taking any WiFi-dependent reporting down with it at the same moment.

So the real question underneath "detect power state" is: **how do you get a signal out of the house that reliably reflects power state, and ideally survives (or at least clearly indicates) the power going out?**

---

## Part 2: Options We Considered for Detecting Power State

We discussed three broad approaches before settling on one for v1.

### Option 1 — ESP32/ESP8266 board, powered directly off the monitored circuit ("canary" approach) — **CHOSEN FOR V1**

The board is plugged into a socket that only has power when NEPA is on. As long as NEPA is on, the board is powered and sends heartbeats to a server. The moment NEPA goes off, the board loses power and goes silent. The server infers "power is out" from the silence.

- **How it detects power loss:** By dying, not by sensing. No special hardware needed.
- **Pros:** Cheapest, simplest, no soldering, no extra sensors, no battery required.
- **Cons:** Can't distinguish "power is actually out" from "WiFi/internet issue" from "device crash." Requires a dedicated always-NEPA socket. Fully dependent on home WiFi having internet access.
- **Why chosen:** For a single, well-understood house (mine), the ambiguity is manageable, and the simplicity means an actual v1 can ship quickly.

### Option 2 — ESP32/ESP8266 + battery backup, with real mains-sensing

Instead of relying on the device dying to signal power loss, the device has its own small battery (e.g., an 18650 lithium cell or supercapacitor) and a proper sensor to directly detect whether mains voltage is present. It runs off mains normally, but on battery briefly when mains drops — long enough to send one explicit "power just went out" message before going fully idle to conserve battery.

- **Pros:** More accurate — the device explicitly knows and reports "mains power lost," rather than the server merely inferring it from silence. Doesn't require plugging into a specific "NEPA-only" socket, since it senses power directly rather than relying on which circuit it's plugged into.
- **Cons:** More complex to build — requires actual mains-sensing circuitry (not just a microcontroller), a battery, and battery management logic. More expensive and more failure-prone (battery degradation, more components).
- **Why not chosen for v1:** Meaningfully more hardware complexity for a personal project where the "canary" approach's ambiguity is an acceptable tradeoff. This is the natural direction for a v2, especially if the project ever needs to work in houses without a convenient NEPA-only socket.

### Option 3 — Smart plug with a cloud API (e.g., TP-Link Kasa, Shelly)

Instead of a custom microcontroller, use an off-the-shelf WiFi smart plug that's always powering something (e.g., a lamp), and poll its cloud API to check if it's reachable/reporting.

- **Pros:** No custom firmware to write at all — fully off-the-shelf. Fast to set up.
- **Cons:** Still fundamentally dependent on home WiFi/internet (same limitation as Option 1), so it doesn't solve the "how do I get a signal independent of home internet" problem — it just moves where the ambiguity lives. Less flexible/extensible than owning custom firmware, since you're limited to what the smart plug's API exposes. Ongoing dependency on a third-party cloud service staying online and free.
- **Why not chosen:** Doesn't meaningfully reduce the ambiguity problem versus Option 1, while giving up the flexibility of custom code — and this project is explicitly meant to expand into something bigger, which favors owning the firmware from day one.

### Option 4 — Cellular/GSM-connected device (e.g., SIM800L module), independent of home WiFi

A microcontroller with a GSM/cellular module instead of (or alongside) WiFi, reporting over the mobile network rather than through the home router/internet at all.

- **Pros:** Solves the "home WiFi/internet must be up" dependency entirely — the device can report even if the home router and internet are completely down, as long as it has power and cellular signal. This is the most robust option for a version of this meant to work reliably in any house, not just mine.
- **Cons:** More expensive, needs a SIM card and possibly a data plan, adds signal-strength considerations, more complex firmware.
- **Why not chosen for v1:** Real overkill for a personal, single-house v1 where I already have decent home WiFi. This is the clear "real fix" if the project expands to work independent of any given house's internet situation — noted as a v2+ direction.

### Decision for v1

**Option 1 (ESP32 as a "canary," powered directly off the monitored circuit) plus a WiFi fallback trick**: instead of hardcoding a single home WiFi network, the device tries WiFi Network #1 (home router) and falls back to WiFi Network #2 (a phone hotspot) if the first isn't reachable — whichever connects, it uses, with no fallback-priority logic. This doesn't fully solve Option 1's core WiFi-dependency limitation, but meaningfully reduces false positives caused by ordinary WiFi/router hiccups unrelated to NEPA. As a side effect, since each heartbeat records which network it used, this produces a rough log of home WiFi availability over time too — a small bonus "WiFi uptime tracker" for free.

---

## Part 3: The Two Halves of the Build

### Half A — The Tracker Device (Hardware + Firmware)

- An ESP32 DevKit board, powered via a USB wall charger plugged into a **dedicated NEPA-only socket** (to be installed by an electrician next to the fridge, so it never shares a circuit with the inverter).
- The board runs a small Arduino program (flashed via the Arduino IDE) that, in a loop:
  1. Tries to connect to WiFi Network #1 (home router).
  2. If that fails, tries WiFi Network #2 (phone hotspot) — whichever is available, connects to it. No fallback-priority handling in v1, just "connect to whichever works."
  3. Once connected, sends an HTTP POST request to a hosted server endpoint (e.g. `https://myserver.com/heartbeat`) every 30 seconds, including a device ID and which network it connected through.

### Half B — Backend + Frontend (Software)

- **Backend (Node/Express or .NET, TBD):**
  - `POST /heartbeat` endpoint — receives pings from the device, stores each one with a timestamp and which WiFi network was used.
  - A background job / scheduled check that looks at "when was the last heartbeat received?" — if the gap exceeds a threshold (e.g. 90 seconds), the server marks the state as "down" and logs an outage event with a start time. When heartbeats resume, it logs the end time and computed duration.
  - Data model: a raw `heartbeats` table (device_id, network, timestamp) and a derived `outage_events` table (device_id, start_time, end_time, duration).
- **Frontend (React):**
  - A dashboard showing current status (power on/off, live), uptime percentage, a history/timeline of past outages, and how long each lasted.
  - Later: charts, trends, and a view for the WiFi-network-used data.

---

## Part 4: Known Limitations of v1 (Accepted, Not Solved Yet)

These are real architectural constraints of the chosen design, deliberately accepted because the goal is "works for my house," not "works for anyone's house."

1. **Depends entirely on WiFi (home or hotspot) having internet access.** If both available networks are down or lack internet, the device can't report — even if NEPA is fine.
   - **Real fix (v2+):** Option 4 — cellular/GSM connectivity, independent of home WiFi entirely.
2. **Requires a dedicated, pre-existing "NEPA-only" socket.** Solved for my house via an electrician installing a standalone socket next to the fridge — but not something a random house is guaranteed to have.
   - **Real fix (v2+):** Option 2 — real mains-sensing hardware instead of the "power the device directly off the circuit" trick.

---

## Part 5: Possible Future Expansion

- Generalize the device → heartbeat → event pipeline so it's not power-specific: the same architecture could track a water tank sensor, a door/window sensor, generator on/off, temperature, etc. (`device_id`, `event_type`, `payload`, `timestamp` as a generic schema from the start).
- Add cellular connectivity (Option 4) to remove the home-WiFi dependency.
- Add real mains-sensing hardware (Option 2) to remove the dedicated-socket dependency.
- Expand from "my house" to a small multi-house/product setup, if it proves useful enough.
- Build out the WiFi-availability side of the data (already being logged) as its own small feature.
