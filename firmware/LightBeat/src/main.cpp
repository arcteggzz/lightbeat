#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>
#include "secrets.h"

const unsigned long HEARTBEAT_INTERVAL_MS = 30000;
const unsigned long WIFI_CONNECT_TIMEOUT_MS = 10000;

const int LED_PIN = 2; // onboard LED: solid = connected, blinking = searching/disconnected

unsigned long lastHeartbeatAt = 0;
String connectedNetwork = "";

// Blinks LED_PIN while waiting so you can see "trying to connect" on the board itself
bool tryConnectWiFi(const char *ssid, const char *password) {
  Serial.printf("Trying WiFi: %s\n", ssid);
  WiFi.begin(ssid, password);

  unsigned long startedAt = millis();
  bool ledOn = false;
  while (WiFi.status() != WL_CONNECTED && millis() - startedAt < WIFI_CONNECT_TIMEOUT_MS) {
    ledOn = !ledOn;
    digitalWrite(LED_PIN, ledOn ? HIGH : LOW);
    delay(250);
  }

  bool connected = WiFi.status() == WL_CONNECTED;
  digitalWrite(LED_PIN, connected ? HIGH : LOW);

  if (connected) {
    Serial.printf("Connected to %s, IP: %s\n", ssid, WiFi.localIP().toString().c_str());
  } else {
    Serial.printf("Failed to connect to %s (status=%d)\n", ssid, WiFi.status());
  }

  return connected;
}

void ensureWiFiConnected() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  for (int i = 0; i < WIFI_NETWORK_COUNT; i++) {
    if (tryConnectWiFi(WIFI_NETWORKS[i].ssid, WIFI_NETWORKS[i].password)) {
      connectedNetwork = WIFI_NETWORKS[i].ssid;
      return;
    }
  }

  connectedNetwork = "";
}

String currentTimestamp() {
  time_t now = time(nullptr);
  if (now < 1700000000) {
    // NTP hasn't synced yet, fall back to uptime so the payload still has something
    return "uptime_ms:" + String(millis());
  }

  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  char buffer[25];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buffer);
}

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Skipping heartbeat: WiFi not connected");
    return;
  }

  HTTPClient http;
  http.begin(HEARTBEAT_URL);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"deviceId\":\"" + String(DEVICE_ID) +
                    "\",\"network\":\"" + connectedNetwork +
                    "\",\"timestamp\":\"" + currentTimestamp() + "\"}";

  Serial.printf("POST %s\nPayload: %s\n", HEARTBEAT_URL, payload.c_str());
  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.printf("Response code: %d, body: %s\n", httpCode, http.getString().c_str());
  } else {
    Serial.printf("POST failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  WiFi.mode(WIFI_STA);
  ensureWiFiConnected();
  configTime(0, 0, "pool.ntp.org");
}

void loop() {
  ensureWiFiConnected();

  if (millis() - lastHeartbeatAt >= HEARTBEAT_INTERVAL_MS) {
    sendHeartbeat();
    lastHeartbeatAt = millis();
  }
}
