import React from 'react';

import { Box, keyframes, SxProps, Theme } from '@mui/material';
import { THEME_COLORS } from '../themes';

const drift = keyframes`
  0% {
    transform: translateX(0) scale(var(--scale));
    opacity: 0;
  }

  10% {
    opacity: var(--opacity);
  }

  90% {
    opacity: var(--opacity);
  }

  100% {
    transform: translateX(160vw) scale(var(--scale));
    opacity: 0;
  }
`;

interface Cloud {
    top: string;
    startX: number;
    scale: number;
    duration: number;
    offset: number;
    opacity: number;
};

interface CloudBackgroundProps {
    gradientBaseColor?: string;
}

const clouds: Cloud[] = Array.from({ length: 10 }).map(() => ({
    top: `${Math.random() * 90}%`,
    startX: Math.random() * 160 - 80,
    scale: 0.6 + Math.random() * 1.3,
    duration: 25 + Math.random() * 25,
    offset: Math.random() * 25,

    opacity: 0.25 + Math.random() * 0.35
}));

const puff = (left: number, top: number, size: number): SxProps<Theme> => ({
    position: 'absolute',
    left,
    top,
    width: size,
    height: size,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.92)',
    filter: 'blur(0.7px)'
});

const CloudBackground: React.FC<CloudBackgroundProps> = ({ gradientBaseColor = THEME_COLORS.ERROR_PINK }) => {
    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: -1,
                background: `linear-gradient(#cfe9ff, ${gradientBaseColor})`
            }}
        >
            {clouds.map((c, i) => (
                <Box
                    key={i}
                    sx={{
                        position: 'absolute',
                        top: c.top,
                        left: `${c.startX}vw`,
                        width: 240,
                        height: 100,

                        '--scale': c.scale,
                        '--opacity': c.opacity,

                        animation: `${drift} ${c.duration}s linear infinite`,
                        animationDelay: `-${c.offset}s`,

                        willChange: 'transform, opacity'
                    } as SxProps<Theme>}
                >
                    <Box sx={puff(-20, 20, 70)} />
                    <Box sx={puff(20, 10, 90)} />
                    <Box sx={puff(60, 25, 85)} />
                    <Box sx={puff(110, 20, 65)} />
                </Box>
            ))}
        </Box>
    );
};

export default CloudBackground;