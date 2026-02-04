import '@insforge/sdk';

declare module '@insforge/sdk' {
  interface InsForgeClient {
    database: any;
  }

  interface Auth {
    getUser: (token?: string) => Promise<{ data: { user: any } }>;
  }
}
