export class TTLCache {
  constructor(ttl = 300000) { this.ttl = ttl; this.store = new Map(); }
  get(key) { const item = this.store.get(key); if (!item) return null; if (Date.now() - item.time > this.ttl) { this.store.delete(key); return null; } return item.value; }
  set(key, value) { this.store.set(key, { time: Date.now(), value }); return value; }
  clear() { this.store.clear(); }
}
