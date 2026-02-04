export interface DecodedUser {
    id: string;
    email?: string;
    role?: string;
    user_metadata?: any;
    app_metadata?: any;
}

export function getUserFromToken(token: string): { data: { user: DecodedUser | null }; error: any } {
    try {
        if (!token) return { data: { user: null }, error: 'No token' };

        const parts = token.split('.');
        if (parts.length !== 3) {
            return { data: { user: null }, error: 'Invalid token format' };
        }

        const payload = parts[1];
        // Url safe base64 decode
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
        const decoded = JSON.parse(jsonPayload);

        // Map JWT claims to User object
        const user: DecodedUser = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
            user_metadata: decoded.user_metadata || {},
            app_metadata: decoded.app_metadata || {},
        };

        return { data: { user }, error: null };
    } catch (error) {
        console.error('Token decode error:', error);
        return { data: { user: null }, error: error };
    }
}
