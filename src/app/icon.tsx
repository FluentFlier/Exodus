import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0D7377 0%, #14B8A6 100%)',
                    borderRadius: '8px',
                }}
            >
                {/* Network nodes */}
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                    {/* Connection lines */}
                    <line x1="12" y1="16" x2="24" y2="12" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <line x1="24" y1="12" x2="36" y2="16" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <line x1="12" y1="16" x2="14" y2="32" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <line x1="36" y1="16" x2="34" y2="32" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <line x1="14" y1="32" x2="34" y2="32" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

                    {/* Network dots */}
                    <circle cx="12" cy="16" r="2" fill="white" opacity="0.8" />
                    <circle cx="24" cy="12" r="2" fill="white" opacity="0.8" />
                    <circle cx="36" cy="16" r="2" fill="white" opacity="0.8" />
                    <circle cx="14" cy="32" r="2" fill="white" opacity="0.8" />
                    <circle cx="34" cy="32" r="2" fill="white" opacity="0.8" />

                    {/* Stylized "E" */}
                    <path
                        d="M18 20 H30 M18 20 V28 H30 M18 24 H28"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    );
}
