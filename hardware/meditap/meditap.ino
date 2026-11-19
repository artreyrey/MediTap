// MediTap ESP32 + RC522 reader
// RC522: SDA/SS=D5, SCK=D18, MOSI=D23, MISO=D19, RST=D22, VCC=3.3V, GND=GND

#define ENABLE_USER_AUTH
#define ENABLE_FIRESTORE

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <SPI.h>
#include <MFRC522.h>
#include <FirebaseClient.h>
#include <time.h>

#include "secrets.h"

#define FIREBASE_PROJECT_ID "meditap-3e80a"
#define SS_PIN 5
#define RST_PIN 22

MFRC522 rfid(SS_PIN, RST_PIN);
WiFiClientSecure sslClient;
using AsyncClient = AsyncClientClass;
AsyncClient firebaseClient(sslClient);
UserAuth userAuth(API_KEY, READER_EMAIL, READER_PASSWORD, 3000);
FirebaseApp app;
Firestore::Documents Docs;

bool scanRequested = false;
bool sentForCurrentRequest = false;
bool readySentForCurrentRequest = false;
bool timeReady = false;
bool firebaseConnectedLogged = false;
bool firebaseConnectionWarningLogged = false;
bool readerStatusReported = false;
unsigned long lastCheck = 0;
unsigned long firebaseStartedAt = 0;
unsigned long lastReaderStatusAttempt = 0;
const unsigned long IDLE_CHECK_INTERVAL_MS = 5000;
const unsigned long ACTIVE_CHECK_INTERVAL_MS = 500;
const unsigned long AUTH_RETRY_INTERVAL_MS = 300000;
const unsigned long READER_STATUS_RETRY_INTERVAL_MS = 5000;

String firestoreTimestamp() {
  time_t now = time(nullptr);
  struct tm timeInfo;
  gmtime_r(&now, &timeInfo);

  char value[25];
  strftime(value, sizeof(value), "%Y-%m-%dT%H:%M:%SZ", &timeInfo);
  return String(value);
}

void syncTime() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  const unsigned long startedAt = millis();

  while (time(nullptr) < 1700000000 && millis() - startedAt < 30000) {
    delay(300);
  }

  timeReady = time(nullptr) >= 1700000000;
  Serial.println(timeReady ? "Time synchronized." : "Time unavailable; UID will still work.");
}

bool isScanRequested() {
  String payload = Docs.get(
    firebaseClient,
    Firestore::Parent(FIREBASE_PROJECT_ID),
    "scanControl/current",
    GetDocumentOptions()
  );

  if (firebaseClient.lastError().code() != 0) {
    Serial.println("MediTap/Firebase request error: " + firebaseClient.lastError().message());
    return false;
  }

  payload.replace(" ", "");
  payload.replace("\n", "");
  payload.replace("\r", "");

  // shortcut: expects the current flat scanControl document; use a JSON parser if it becomes nested.
  return payload.indexOf("\"booleanValue\":true") >= 0;
}

String readCardUid() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return "";
  }

  String uid;

  for (uint8_t i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      uid += "0";
    }
    uid += String(rfid.uid.uidByte[i], HEX);
  }

  uid.toUpperCase();
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  return uid;
}

bool sendUidToMediTap(const String &uid) {
  Document<Values::Value> document("uid", Values::Value(Values::StringValue(uid)));
  document.add("state", Values::Value(Values::StringValue("scanned")));
  String fields = "uid,state";

  if (timeReady) {
    document.add("timestamp", Values::Value(Values::TimestampValue(firestoreTimestamp())));
    fields += ",timestamp";
  }

  PatchDocumentOptions options{DocumentMask(fields), DocumentMask{}, Precondition{}};
  Docs.patch(
    firebaseClient,
    Firestore::Parent(FIREBASE_PROJECT_ID),
    "pendingScan/current",
    options,
    document
  );

  if (firebaseClient.lastError().code() != 0) {
    Serial.println("UID upload failed: " + firebaseClient.lastError().message());
    return false;
  }

  Serial.println("UID sent: " + uid);
  return true;
}

bool sendReaderReady() {
  Document<Values::Value> document("state", Values::Value(Values::StringValue("ready")));
  PatchDocumentOptions options{DocumentMask("state"), DocumentMask{}, Precondition{}};
  Docs.patch(
    firebaseClient,
    Firestore::Parent(FIREBASE_PROJECT_ID),
    "pendingScan/current",
    options,
    document
  );

  if (firebaseClient.lastError().code() != 0) {
    Serial.println("Reader-ready upload failed: " + firebaseClient.lastError().message());
    return false;
  }

  Serial.println("Reader ready for scan.");
  return true;
}

bool sendReaderConnectedStatus() {
  Document<Values::Value> document("state", Values::Value(Values::StringValue("connected")));
  String fields = "state";

  if (timeReady) {
    document.add("authenticatedAt", Values::Value(Values::TimestampValue(firestoreTimestamp())));
    fields += ",authenticatedAt";
  }

  PatchDocumentOptions options{DocumentMask(fields), DocumentMask{}, Precondition{}};
  Docs.patch(
    firebaseClient,
    Firestore::Parent(FIREBASE_PROJECT_ID),
    "readerStatus/current",
    options,
    document
  );

  if (firebaseClient.lastError().code() != 0) {
    Serial.println("Reader status upload failed: " + firebaseClient.lastError().message());
    return false;
  }

  Serial.println("MediTap website notified: Firebase authentication finished.");
  return true;
}

void startFirebaseAuthentication() {
  initializeApp(firebaseClient, app, getAuth(userAuth));
  app.getApp<Firestore::Documents>(Docs);
  firebaseStartedAt = millis();
  firebaseConnectionWarningLogged = false;
  firebaseConnectedLogged = false;
  readerStatusReported = false;
  Serial.println("Connecting to Firebase and MediTap website scan channel...");
}

void setup() {
  Serial.begin(115200);
  SPI.begin(18, 19, 23, 5);
  rfid.PCD_Init();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }

  Serial.println("\nESP32 connected to hotspot: " + String(WIFI_SSID));
  Serial.println("ESP32 IP address: " + WiFi.localIP().toString());
  syncTime();

  sslClient.setInsecure();
  sslClient.setConnectionTimeout(1000);
  sslClient.setHandshakeTimeout(5);

  // Start Firebase once; app.loop() maintains the session and refreshes tokens afterward.
  startFirebaseAuthentication();
}

void loop() {
  app.loop();

  if (!app.ready()) {
    if (!firebaseConnectionWarningLogged && millis() - firebaseStartedAt > 15000) {
      firebaseConnectionWarningLogged = true;
      Serial.println("Firebase not connected yet. Still trying; check reader email, password, and devices permission.");
    }
    if (millis() - firebaseStartedAt > AUTH_RETRY_INTERVAL_MS) {
      Serial.println("Retrying Firebase authentication after a 5-minute cooldown...");
      deinitializeApp(app);
      startFirebaseAuthentication();
    }
    return;
  }

  if (!firebaseConnectedLogged) {
    firebaseConnectedLogged = true;
    Serial.println("Firebase connected. MediTap website scan channel ready.");
  }

  if (!readerStatusReported && millis() - lastReaderStatusAttempt > READER_STATUS_RETRY_INTERVAL_MS) {
    lastReaderStatusAttempt = millis();
    readerStatusReported = sendReaderConnectedStatus();
  }

  const unsigned long checkInterval = scanRequested ? ACTIVE_CHECK_INTERVAL_MS : IDLE_CHECK_INTERVAL_MS;
  if (millis() - lastCheck >= checkInterval) {
    lastCheck = millis();
    const bool requestIsActive = isScanRequested();

    if (!requestIsActive) {
      scanRequested = false;
      sentForCurrentRequest = false;
      readySentForCurrentRequest = false;
    } else if (!scanRequested) {
      scanRequested = true;
      sentForCurrentRequest = false;
      readySentForCurrentRequest = false;
      Serial.println("MediTap website requested an RFID scan.");
    }

    if (scanRequested && !readySentForCurrentRequest) {
      readySentForCurrentRequest = sendReaderReady();
    }
  }

  if (!scanRequested || !readySentForCurrentRequest || sentForCurrentRequest) {
    return;
  }

  const String uid = readCardUid();
  if (uid.length() > 0 && sendUidToMediTap(uid)) {
    sentForCurrentRequest = true;
  }
}
