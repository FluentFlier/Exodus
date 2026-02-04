import * as Y from 'yjs';
import { Observable } from 'lib0/observable';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness';

type ProviderStatus = 'connecting' | 'connected' | 'disconnected';

const encodeUpdate = (update: Uint8Array) => btoa(String.fromCharCode(...update));
const decodeUpdate = (value: string) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

export class InsForgeProvider extends Observable<string> {
  doc: Y.Doc;
  client: any;
  channelId: string;
  awareness: Awareness;
  status: ProviderStatus;

  constructor(client: any, channelId: string, doc: Y.Doc) {
    super();
    this.client = client;
    this.channelId = channelId;
    this.doc = doc;
    this.status = 'connecting';

    this.awareness = new Awareness(this.doc);

    this.doc.on('update', this.handleLocalUpdate);
    this.awareness.on('update', this.handleAwarenessUpdate);

    this.connect();
  }

  async connect() {
    this.status = 'connecting';
    this.emit('status', [this.status]);

    await this.client.realtime.connect();
    const { ok, error } = await this.client.realtime.subscribe(this.channelId);
    if (!ok) {
      this.status = 'disconnected';
      this.emit('status', [this.status]);
      throw error;
    }

    this.client.realtime.on('y-update', this.handleRemoteUpdate);
    this.client.realtime.on('y-sync', this.handleRemoteSync);
    this.client.realtime.on('y-sync-request', this.handleSyncRequest);
    this.client.realtime.on('y-awareness', this.handleRemoteAwareness);
    this.client.realtime.on('connect', this.handleReconnect);
    this.client.realtime.on('disconnect', this.handleDisconnect);

    this.publishSync();

    this.status = 'connected';
    this.emit('status', [this.status]);
  }

  publishSync = () => {
    const update = Y.encodeStateAsUpdate(this.doc);
    this.client.realtime.publish(this.channelId, 'y-sync', {
      update: encodeUpdate(update),
      sender: this.client.realtime.socketId || null,
    });
  };

  handleSyncRequest = (payload: any) => {
    if (payload?.sender && payload.sender === this.client.realtime.socketId) return;
    this.publishSync();
  };

  handleLocalUpdate = (update: Uint8Array, origin: any) => {
    if (origin === this) return;
    this.client.realtime.publish(this.channelId, 'y-update', {
      update: encodeUpdate(update),
      sender: this.client.realtime.socketId || null,
    });
  };

  handleRemoteUpdate = (payload: any) => {
    if (!payload?.update) return;
    if (payload.sender && payload.sender === this.client.realtime.socketId) return;
    const update = decodeUpdate(payload.update);
    Y.applyUpdate(this.doc, update, this);
  };

  handleRemoteSync = (payload: any) => {
    if (!payload?.update) return;
    if (payload.sender && payload.sender === this.client.realtime.socketId) return;
    const update = decodeUpdate(payload.update);
    Y.applyUpdate(this.doc, update, this);
  };

  handleAwarenessUpdate = ({ added, updated, removed }: any) => {
    const changes = added.concat(updated).concat(removed);
    const update = encodeAwarenessUpdate(this.awareness, changes);
    this.client.realtime.publish(this.channelId, 'y-awareness', {
      update: encodeUpdate(update),
      sender: this.client.realtime.socketId || null,
    });
  };

  handleRemoteAwareness = (payload: any) => {
    if (!payload?.update) return;
    if (payload.sender && payload.sender === this.client.realtime.socketId) return;
    const update = decodeUpdate(payload.update);
    applyAwarenessUpdate(this.awareness, update, this);
  };

  handleReconnect = () => {
    this.publishSync();
  };

  handleDisconnect = () => {
    this.status = 'disconnected';
    this.emit('status', [this.status]);
  };

  requestSync = () => {
    this.client.realtime.publish(this.channelId, 'y-sync-request', {
      sender: this.client.realtime.socketId || null,
    });
  };

  disconnect() {
    this.doc.off('update', this.handleLocalUpdate);
    this.awareness.off('update', this.handleAwarenessUpdate);
    this.client.realtime.off('y-update', this.handleRemoteUpdate);
    this.client.realtime.off('y-sync', this.handleRemoteSync);
    this.client.realtime.off('y-sync-request', this.handleSyncRequest);
    this.client.realtime.off('y-awareness', this.handleRemoteAwareness);
    this.client.realtime.off('connect', this.handleReconnect);
    this.client.realtime.off('disconnect', this.handleDisconnect);
    this.client.realtime.unsubscribe(this.channelId);
  }
}
