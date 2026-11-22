export type ReaderStatus = "unsupported" | "disconnected" | "connecting" | "connected" | "scanning" | "error";

type SerialPort = {
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
};

type SerialApi = {
  requestPort(): Promise<SerialPort>;
  getPorts(): Promise<SerialPort[]>;
  addEventListener(type: "disconnect", listener: () => void): void;
};

declare global {
  interface Navigator {
    serial?: SerialApi;
  }
}

type ScanRequest = {
  id: string;
  timeout: number;
  resolve: (uid: string) => void;
  reject: (error: Error) => void;
};

const BAUD_RATE = 115200;
const HANDSHAKE_TIMEOUT_MS = 5000;
const SCAN_TIMEOUT_MS = 30000;
const MAX_MESSAGE_BUFFER = 4096;

class RfidSerial {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private status: ReaderStatus = "disconnected";
  private buffer = "";
  private handshake: { resolve: () => void; reject: (error: Error) => void; timeout: number } | null = null;
  private scan: ScanRequest | null = null;
  private listeners = new Set<(status: ReaderStatus) => void>();

  constructor() {
    if (typeof navigator !== "undefined") {
      navigator.serial?.addEventListener("disconnect", () => void this.close());
    }
  }

  getStatus() {
    return typeof navigator !== "undefined" && navigator.serial ? this.status : "unsupported";
  }

  subscribe(listener: (status: ReaderStatus) => void) {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  async reconnectAuthorized() {
    if (!navigator.serial || this.port) return;
    const ports = await navigator.serial.getPorts();
    if (ports.length === 1) await this.open(ports[0]);
  }

  async connect() {
    if (!navigator.serial) throw new Error("Web Serial is not supported. Use Chrome or Edge on a desktop computer.");
    if (this.port && (this.status === "connected" || this.status === "scanning")) return;
    await this.open(await navigator.serial.requestPort());
  }

  async scanCard() {
    if (this.status !== "connected") throw new Error("Connect the RFID reader first.");
    if (this.scan) throw new Error("An RFID scan is already in progress.");

    const id = crypto.randomUUID();
    this.setStatus("scanning");
    return new Promise<string>((resolve, reject) => {
      const timeout = window.setTimeout(() => this.finishScan(new Error("RFID scan timed out. Please try again.")), SCAN_TIMEOUT_MS);
      this.scan = { id, timeout, resolve, reject };
      void this.send({ command: "SCAN_RFID", requestId: id }).catch((error) => this.finishScan(error instanceof Error ? error : new Error("Could not start RFID scan.")));
    });
  }

  async cancelScan() {
    if (!this.scan) return;
    const { id } = this.scan;
    await this.send({ command: "CANCEL_SCAN", requestId: id }).catch(() => undefined);
    this.finishScan(new Error("RFID scan cancelled."));
  }

  private async open(port: SerialPort) {
    this.setStatus("connecting");
    try {
      await port.open({ baudRate: BAUD_RATE });
      this.port = port;
      void this.readMessages();
      await this.verifyDevice();
      this.setStatus("connected");
    } catch (error) {
      await this.close();
      this.setStatus("error");
      throw error instanceof Error ? error : new Error("Could not connect to the RFID reader.");
    }
  }

  private async verifyDevice() {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        this.handshake = null;
        reject(new Error("The selected USB device is not the MediTap RFID reader."));
      }, HANDSHAKE_TIMEOUT_MS);
      this.handshake = { resolve, reject, timeout };
      void this.send("PING").catch(reject);
    });
  }

  private async readMessages() {
    if (!this.port?.readable) return;
    this.reader = this.port.readable.getReader();
    const decoder = new TextDecoder();

    try {
      while (this.reader) {
        const { value, done } = await this.reader.read();
        if (done) break;
        this.buffer += decoder.decode(value, { stream: true });
        if (this.buffer.length > MAX_MESSAGE_BUFFER) this.buffer = "";

        let newline = this.buffer.indexOf("\n");
        while (newline >= 0) {
          const line = this.buffer.slice(0, newline).trim();
          this.buffer = this.buffer.slice(newline + 1);
          if (line) this.handleMessage(line);
          newline = this.buffer.indexOf("\n");
        }
      }
    } catch {
      if (this.port) this.setStatus("error");
    } finally {
      this.reader?.releaseLock();
      this.reader = null;
      if (this.port) await this.close();
    }
  }

  private handleMessage(line: string) {
    let message: { type?: string; device?: string; status?: string; requestId?: string; uid?: string; message?: string };
    try {
      message = JSON.parse(line) as typeof message;
    } catch {
      return;
    }

    if (message.type === "device_info" && message.device === "ESP32_RFID_READER" && message.status === "ready" && this.handshake) {
      window.clearTimeout(this.handshake.timeout);
      this.handshake.resolve();
      this.handshake = null;
      return;
    }

    if (message.type !== "rfid_result" || !this.scan || message.requestId !== this.scan.id) return;
    if (message.status === "success" && message.uid) this.finishScan(null, message.uid.trim().toUpperCase());
    else this.finishScan(new Error(message.status === "timeout" ? "RFID scan timed out. Please try again." : message.message || "RFID scan failed."));
  }

  private async send(payload: string | Record<string, string>) {
    if (!this.port?.writable) throw new Error("RFID reader disconnected.");
    const writer = this.port.writable.getWriter();
    try {
      const message = typeof payload === "string" ? payload : JSON.stringify(payload);
      await writer.write(new TextEncoder().encode(`${message}\n`));
    } finally {
      writer.releaseLock();
    }
  }

  private finishScan(error: Error | null, uid?: string) {
    if (!this.scan) return;
    const scan = this.scan;
    this.scan = null;
    window.clearTimeout(scan.timeout);
    this.setStatus("connected");
    if (error) scan.reject(error);
    else if (uid) scan.resolve(uid);
  }

  private async close() {
    this.finishScan(new Error("RFID reader disconnected."));
    if (this.handshake) {
      window.clearTimeout(this.handshake.timeout);
      this.handshake.reject(new Error("RFID reader disconnected."));
      this.handshake = null;
    }
    const reader = this.reader;
    this.reader = null;
    await reader?.cancel().catch(() => undefined);
    const port = this.port;
    this.port = null;
    await port?.close().catch(() => undefined);
    this.setStatus("disconnected");
  }

  private setStatus(status: ReaderStatus) {
    this.status = status;
    this.listeners.forEach((listener) => listener(this.getStatus()));
  }
}

export const rfidReader = new RfidSerial();
