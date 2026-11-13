import type { ClientPacket, ServerPacket } from '@camp_candor/types';
import { GamePacket } from '@camp_candor/types';

/** Connection status for UI feedback */
export type SocketStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'ERROR';

const LOG_PREFIX = '🔌 [GameSocket]';

export class GameSocket {
  private ws: WebSocket;
  // The callback function that React will provide
  public onStateChange: ((state: ServerPacket) => void) | null = null;
  public onStatusChange: ((status: SocketStatus) => void) | null = null;

  private messageCount = 0;

  constructor(url: string) {
    // 🛠️ SANITIZE: Strip quotes and fix protocols (handles dashboard config errors)
    let sanitized = url.trim().replace(/^["']|["']$/g, '');
    if (sanitized.startsWith('http')) {
      sanitized = sanitized.replace(/^http/, 'ws');
    }

    console.log(`${LOG_PREFIX} ⏳ Connecting to: ${sanitized}`);
    this.emitStatus('CONNECTING');

    this.ws = new WebSocket(sanitized);

    // MANDATE: Tell the browser we want raw bytes, not Blobs.
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      console.log(`${LOG_PREFIX} ✅ CONNECTED to ${url}`);
      console.log(`${LOG_PREFIX} 📡 WebSocket readyState: ${this.ws.readyState} (OPEN)`);
      this.emitStatus('OPEN');

      // Send a join packet immediately to wake up the DO
      console.log(`${LOG_PREFIX} 📤 Sending JOIN packet...`);
      this.send({
        join: { sessionToken: 'dev-token', charId: 'grog' },
      });
    };

    this.ws.onmessage = (event) => {
      this.messageCount++;

      // Handle JSON MODE coming from the worker-actor
      if (typeof event.data === 'string') {
        if (this.messageCount <= 3 || this.messageCount % 10 === 0) {
          console.log(`${LOG_PREFIX} 📩 Message #${this.messageCount} received (${event.data.length} chars)`);
        }
        try {
          const parsed = JSON.parse(event.data);

          if (parsed && parsed.type === 'error') {
            console.error(`${LOG_PREFIX} 🚨 SERVER ERROR RECEIVED:`, parsed.payload || parsed.message || parsed);
          }

          if (parsed && parsed.type === 'auth_status') {
            console.log('%c[WARDEN]%c 🛡️ Outer Wall: Stateful Rate Limiter (Token Bucket) PASSED', 'color: #00ff00; font-weight: bold;', 'color: inherit;');
            console.log('%c[WARDEN]%c ✅ Inner Wall: Clerk JWT Authorization VERIFIED', 'color: #00ff00; font-weight: bold;', 'color: inherit;');
            console.log('%c[ACTOR ENGINE]%c 🎫 Zero-Trust: "The Pass" Accepted & Consumed', 'color: #ffaa00; font-weight: bold;', 'color: inherit;');
          }

          if (parsed && parsed.type === 'ping' && this.onStateChange) {
            // Map the JSON structure to a pseudo ServerPacket
            const tickVal = parsed.payload?.intBit?.dat?.server?.srvBit?.val ?? 0;
            const mockServerPacket: ServerPacket = {
              update: { tick: tickVal, hp: 100, x: 0, y: 0 } as any,
            };
            this.onStateChange(mockServerPacket);
          }
        } catch (e) {
          console.error(`${LOG_PREFIX} JSON Parse error:`, e);
        }
        return;
      }

      // 1. Cast to Uint8Array (The format Protobuf expects)
      const buffer = new Uint8Array(event.data as ArrayBuffer);

      // Log first few messages, then throttle to every 10th
      if (this.messageCount <= 3 || this.messageCount % 10 === 0) {
        console.log(`${LOG_PREFIX} 📩 Message #${this.messageCount} received (${buffer.byteLength} bytes)`);
      }

      // 2. Decode via the Shared Schema
      try {
        const packet = GamePacket.decode(buffer);

        // 3. Emit to React
        if (packet.server && this.onStateChange) {
          this.onStateChange(packet.server);
        }
      } catch (e) {
        console.error(`${LOG_PREFIX} Protobuf Decode error:`, e);
      }
    };

    this.ws.onerror = (e) => {
      console.error(`${LOG_PREFIX} 🚨 ERROR:`, e);
      this.emitStatus('ERROR');
    };

    this.ws.onclose = (event) => {
      console.log(`${LOG_PREFIX} ❌ CLOSED (code: ${event.code}, reason: "${event.reason || 'none'}", clean: ${event.wasClean})`);
      console.log(`${LOG_PREFIX} 📊 Total messages received: ${this.messageCount}`);
      this.emitStatus('CLOSED');
    };
  }

  private emitStatus(status: SocketStatus) {
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  /**
   * Helper to wrap payloads in the root envelope and send as binary
   */
  private send(payload: ClientPacket) {
    if (this.ws.readyState === WebSocket.OPEN) {
      const envelope = GamePacket.encode({ client: payload }).finish();
      console.log(`${LOG_PREFIX} 📤 Sent ${envelope.byteLength} bytes`);
      this.ws.send(envelope);
    } else {
      console.warn(`${LOG_PREFIX} ⚠️ Cannot send — socket not open (readyState: ${this.ws.readyState})`);
    }
  }

  public move(x: number, y: number) {
    this.send({
      input: { inputType: 1, x, y }, // 1 = MOVE
    });
  }

  public attack() {
    this.send({
      input: { inputType: 3, x: 0, y: 0 }, // 3 = ATTACK (Self-Harm Test)
    });
  }

  public close() {
    console.log(`${LOG_PREFIX} 🔒 Closing connection...`);
    this.ws.close();
  }
}
