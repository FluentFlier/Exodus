import * as Y from 'yjs';
import { RealtimeClient } from '@insforge/sdk'; // Or generic type, actually client instance
import { Observable } from 'lib0/observable';

export class InsForgeProvider extends Observable<string> {
    doc: Y.Doc;
    client: any; // InsForge client
    channelId: string;
    channel: any;
    awareness: any;

    constructor(client: any, channelId: string, doc: Y.Doc) {
        super();
        this.client = client;
        this.channelId = channelId;
        this.doc = doc;
        this.awareness = null; // Ideally implement awareness (cursors) too

        // Connect
        this.connect();

        // Listen to local updates
        this.doc.on('update', this.handleLocalUpdate);
    }

    async connect() {
        await this.client.realtime.connect();

        this.channel = this.client.realtime.subscribe(this.channelId);

        // Listen to remote updates
        this.client.realtime.on('y-update', (payload: any) => {
            // payload should contain the update blob (base64)
            if (payload.update) {
                const update = Uint8Array.from(atob(payload.update), c => c.charCodeAt(0));
                Y.applyUpdate(this.doc, update, this); // 'this' as origin to filter echo
            }
        });

        this.emit('status', ['connected']);
    }

    handleLocalUpdate = (update: Uint8Array, origin: any) => {
        if (origin === this) return; // Don't propagate remote updates back

        // Encode to base64 to send via JSON
        const updateBase64 = btoa(String.fromCharCode(...update));

        this.client.realtime.publish(this.channelId, 'y-update', {
            update: updateBase64
        });
    }

    disconnect() {
        this.doc.off('update', this.handleLocalUpdate);
        // unsubscribe logic if available
    }
}
