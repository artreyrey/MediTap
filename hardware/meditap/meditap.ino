// MediTap ESP32 + RC522 USB reader
// RC522: SDA/SS=D5, SCK=D18, MOSI=D23, MISO=D19, RST=D22, VCC=3.3V, GND=GND

#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 5
#define RST_PIN 22
#define BUZZER_PIN 25
#define GREEN_LED_PIN 26
#define RED_LED_PIN 27

const unsigned long SCAN_TIMEOUT_MS = 30000;
const size_t MAX_COMMAND_LENGTH = 256;

MFRC522 rfid(SS_PIN, RST_PIN);
String commandBuffer;
String activeRequestId;
unsigned long scanStartedAt = 0;
bool scanning = false;

void feedback(bool accepted) {
  const int ledPin = accepted ? GREEN_LED_PIN : RED_LED_PIN;
  digitalWrite(ledPin, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(accepted ? 120 : 700);
  digitalWrite(BUZZER_PIN, LOW);
  delay(accepted ? 180 : 120);
  digitalWrite(ledPin, LOW);
}

void testLeds() {
  digitalWrite(GREEN_LED_PIN, HIGH);
  delay(300);
  digitalWrite(GREEN_LED_PIN, LOW);
  delay(200);
  digitalWrite(RED_LED_PIN, HIGH);
  delay(300);
  digitalWrite(RED_LED_PIN, LOW);
}

String readJsonString(const String &json, const String &key) {
  const String marker = "\"" + key + "\"";
  const int keyStart = json.indexOf(marker);
  if (keyStart < 0) return "";
  const int valueStart = json.indexOf('"', json.indexOf(':', keyStart) + 1);
  if (valueStart < 0) return "";
  const int valueEnd = json.indexOf('"', valueStart + 1);
  return valueEnd < 0 ? "" : json.substring(valueStart + 1, valueEnd);
}

void sendDeviceInfo() {
  Serial.println("{\"type\":\"device_info\",\"device\":\"ESP32_RFID_READER\",\"status\":\"ready\"}");
}

void sendScanStatus(const String &requestId, const String &status) {
  Serial.println("{\"type\":\"scan_status\",\"requestId\":\"" + requestId + "\",\"status\":\"" + status + "\"}");
}

void sendScanResult(const String &requestId, const String &status, const String &uid = "", const String &message = "") {
  String result = "{\"type\":\"rfid_result\",\"requestId\":\"" + requestId + "\",\"status\":\"" + status + "\"";
  if (uid.length() > 0) result += ",\"uid\":\"" + uid + "\"";
  if (message.length() > 0) result += ",\"message\":\"" + message + "\"";
  Serial.println(result + "}");
}

String readCardUid() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return "";

  String uid;
  for (byte index = 0; index < rfid.uid.size; index++) {
    if (rfid.uid.uidByte[index] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[index], HEX);
  }
  uid.toUpperCase();
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  return uid;
}

void stopScan(const String &status, const String &uid = "", const String &message = "") {
  if (!scanning) return;
  sendScanResult(activeRequestId, status, uid, message);
  scanning = false;
  activeRequestId = "";
}

void handleCommand(const String &command) {
  if (command == "PING") {
    sendDeviceInfo();
    return;
  }

  const String action = readJsonString(command, "command");
  const String requestId = readJsonString(command, "requestId");
  if (action == "SCAN_RFID") {
    if (requestId.length() == 0) {
      sendScanResult("", "error", "", "Missing request ID");
    } else if (scanning) {
      sendScanResult(requestId, "error", "", "Another scan is already active");
    } else {
      activeRequestId = requestId;
      scanStartedAt = millis();
      scanning = true;
      sendScanStatus(activeRequestId, "scanning");
    }
    return;
  }

  if (action == "RFID_FEEDBACK") {
    const String result = readJsonString(command, "result");
    if (result == "accepted") feedback(true);
    else if (result == "rejected") feedback(false);
    return;
  }

  if (action == "CANCEL_SCAN" && scanning && requestId == activeRequestId) {
    stopScan("cancelled");
  }
}

void readCommands() {
  while (Serial.available()) {
    const char character = static_cast<char>(Serial.read());
    if (character == '\n') {
      commandBuffer.trim();
      if (commandBuffer.length() > 0) handleCommand(commandBuffer);
      commandBuffer = "";
    } else if (character != '\r') {
      commandBuffer += character;
      if (commandBuffer.length() > MAX_COMMAND_LENGTH) commandBuffer = "";
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  testLeds();
  SPI.begin(18, 19, 23, 5);
  rfid.PCD_Init();
}

void loop() {
  readCommands();
  if (!scanning) return;

  if (millis() - scanStartedAt >= SCAN_TIMEOUT_MS) {
    stopScan("timeout");
    return;
  }

  const String uid = readCardUid();
  if (uid.length() > 0) stopScan("success", uid);
}
