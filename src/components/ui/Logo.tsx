import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
    const dimensions = {
        sm: 32,
        md: 40,
        lg: 48,
    };

    const dim = dimensions[size];

    return (
        <svg
            width={dim}
            height={dim}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Background circle with gradient */}
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0D7377" />
                    <stop offset="100%" stopColor="#14B8A6" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            {/* Main circle background */}
            <circle cx="24" cy="24" r="22" fill="url(#logoGradient)" opacity="0.1" />

            {/* Network nodes (representing intelligence/infrastructure) */}
            <circle cx="12" cy="16" r="2.5" fill="url(#logoGradient)" />
            <circle cx="24" cy="12" r="2.5" fill="url(#logoGradient)" />
            <circle cx="36" cy="16" r="2.5" fill="url(#logoGradient)" />
            <circle cx="14" cy="32" r="2.5" fill="url(#logoGradient)" />
            <circle cx="34" cy="32" r="2.5" fill="url(#logoGradient)" />

            {/* Connection lines */}
            <line x1="12" y1="16" x2="24" y2="12" stroke="url(#logoGradient)" strokeWidth="1.5" opacity="0.6" />
            <line x1="24" y1="12" x2="36" y2="16" stroke="url(#logoGradient)" strokeWidth="1.5" opacity="0.6" />
            <line x1="12" y1="16" x2="14" y2="32" stroke="url(#logoGradient)" strokeWidth="1.5" opacity="0.6" />
            <line x1="36" y1="16" x2="34" y2="32" stroke="url(#logoGradient)" strokeWidth="1.5" opacity="0.6" />
            <line x1="14" y1="32" x2="34" y2="32" stroke="url(#logoGradient)" strokeWidth="1.5" opacity="0.6" />

            {/* Stylized "E" in the center */}
            <path
                d="M18 20 H30 M18 20 V28 H30 M18 24 H28"
                stroke="url(#logoGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                filter="url(#glow)"
            />
        </svg>
    );
};

export const LogoIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0D7377" />
                    <stop offset="100%" stopColor="#14B8A6" />
                </linearGradient>
            </defs>

            {/* Simplified version for small sizes */}
            <circle cx="24" cy="24" r="20" fill="url(#iconGradient)" opacity="0.15" />

            {/* Network pattern */}
            <circle cx="12" cy="18" r="2" fill="url(#iconGradient)" />
            <circle cx="24" cy="14" r="2" fill="url(#iconGradient)" />
            <circle cx="36" cy="18" r="2" fill="url(#iconGradient)" />
            <circle cx="14" cy="32" r="2" fill="url(#iconGradient)" />
            <circle cx="34" cy="32" r="2" fill="url(#iconGradient)" />

            <line x1="12" y1="18" x2="24" y2="14" stroke="url(#iconGradient)" strokeWidth="1" opacity="0.5" />
            <line x1="24" y1="14" x2="36" y2="18" stroke="url(#iconGradient)" strokeWidth="1" opacity="0.5" />
            <line x1="12" y1="18" x2="14" y2="32" stroke="url(#iconGradient)" strokeWidth="1" opacity="0.5" />
            <line x1="36" y1="18" x2="34" y2="32" stroke="url(#iconGradient)" strokeWidth="1" opacity="0.5" />
            <line x1="14" y1="32" x2="34" y2="32" stroke="url(#iconGradient)" strokeWidth="1" opacity="0.5" />

            {/* "E" */}
            <path
                d="M19 22 H29 M19 22 V28 H29 M19 25 H27"
                stroke="url(#iconGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
};
