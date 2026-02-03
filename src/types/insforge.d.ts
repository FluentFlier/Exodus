// Type declarations for @insforge/sdk
// These extend the base types to include missing methods

declare module '@insforge/sdk' {
    export interface InsForgeClient {
        auth: Auth;
        from: <T extends string>(table: T) => QueryBuilder<any>;
        rpc: (fn: string, params?: Record<string, any>) => Promise<{ data: any; error: any }>;
        storage: Storage;
        realtime: RealtimeClient;
        ai: AI;
    }

    export interface Auth {
        signUp: (credentials: { email: string; password: string; name?: string; options?: any }) => Promise<{ data: any; error: any }>;
        signInWithPassword: (credentials: { email: string; password: string }) => Promise<{ data: any; error: any }>;
        signOut: () => Promise<{ error: any }>;
        getUser: (token?: string) => Promise<{ data: { user: User | null }; error: any }>;
        getSession: () => Promise<{ data: { session: Session | null }; error: any }>;
    }

    export interface User {
        id: string;
        email?: string;
        created_at?: string;
        [key: string]: any;
    }

    export interface Session {
        access_token: string;
        refresh_token: string;
        user: User;
    }

    export interface QueryBuilder<T> {
        select: (columns?: string) => QueryBuilder<T>;
        insert: (data: any | any[]) => QueryBuilder<T>;
        update: (data: any) => QueryBuilder<T>;
        upsert: (data: any | any[]) => QueryBuilder<T>;
        delete: () => QueryBuilder<T>;
        eq: (column: string, value: any) => QueryBuilder<T>;
        neq: (column: string, value: any) => QueryBuilder<T>;
        gt: (column: string, value: any) => QueryBuilder<T>;
        gte: (column: string, value: any) => QueryBuilder<T>;
        lt: (column: string, value: any) => QueryBuilder<T>;
        lte: (column: string, value: any) => QueryBuilder<T>;
        like: (column: string, value: string) => QueryBuilder<T>;
        ilike: (column: string, value: string) => QueryBuilder<T>;
        is: (column: string, value: any) => QueryBuilder<T>;
        in: (column: string, values: any[]) => QueryBuilder<T>;
        order: (column: string, options?: { ascending?: boolean }) => QueryBuilder<T>;
        limit: (count: number) => QueryBuilder<T>;
        single: () => Promise<{ data: T | null; error: any }>;
        maybeSingle: () => Promise<{ data: T | null; error: any }>;
        then: <TResult>(onfulfilled?: (value: { data: T[] | null; error: any }) => TResult) => Promise<TResult>;
    }

    export interface Storage {
        from: (bucket: string) => StorageBucket;
    }

    export interface StorageBucket {
        upload: (path: string, file: File | Blob | ArrayBuffer) => Promise<{ data: any; error: any }>;
        download: (path: string) => Promise<{ data: Blob | null; error: any }>;
        remove: (paths: string[]) => Promise<{ data: any; error: any }>;
        createSignedUrl: (path: string, expiresIn: number) => Promise<{ data: { signedUrl: string } | null; error: any }>;
        getPublicUrl: (path: string) => { data: { publicUrl: string } };
        list: (path?: string) => Promise<{ data: any[]; error: any }>;
    }

    export interface RealtimeClient {
        subscribe: (channel: string, callback?: (payload: any) => void) => RealtimeChannel;
        channel: (name: string) => RealtimeChannel;
    }

    export interface RealtimeChannel {
        on: (event: string, filter: any, callback: (payload: any) => void) => RealtimeChannel;
        subscribe: (callback?: (status: string) => void) => RealtimeChannel;
        unsubscribe: () => void;
        send: (payload: { type: string; event: string; payload: any }) => void;
    }

    export interface EmbeddingData {
        embedding: number[];
        index: number;
    }

    export interface AI {
        embeddings: {
            create: (params: { model: string; input: string | string[] }) => Promise<{ data: EmbeddingData[] | null; error: any }>;
        };
        chat: {
            completions: {
                create: (params: {
                    model: string;
                    messages: Array<{ role: string; content: string }>;
                    stream?: boolean;
                }) => Promise<{ data: any; error: any }>;
            };
        };
    }

    export interface CreateClientOptions {
        baseUrl: string;
        anonKey?: string;
        edgeFunctionToken?: string;
    }

    export function createClient<T = any>(options: CreateClientOptions): InsForgeClient;
}

declare module '@insforge/nextjs/server' {
    export function auth(): Promise<{ token: string | null }>;
}

declare module '@insforge/nextjs/middleware' {
    export interface MiddlewareOptions {
        baseUrl: string;
        publicRoutes?: string[];
    }
    export function InsforgeMiddleware(options: MiddlewareOptions): any;
}
