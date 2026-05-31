import React from 'react';

import { Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { THEME_COLORS } from '../themes';
import { generateColors } from '../util/colors';

interface WheelOfFortuneProps {
    options: string[];
    customColors?: string[];
    onSelect: (value: string) => void;
    disabled: boolean;
    shouldShowSpinButton?: boolean;
    onSpinningChange?: (spinning: boolean) => void;
    spinTrigger?: number | null;
    size?: number;
    interactionMode?: 'full' | 'spin-only';
}

interface Point {
    x: number;
    y: number;
}

const DEFAULT_SIZE = 500;
const SPIN_DURATION_MIN = 4500;
const SPIN_DURATION_MAX = 6500;

const getRandomSpinDuration = (): number =>
    Math.floor(Math.random() * (SPIN_DURATION_MAX - SPIN_DURATION_MIN + 1)) + SPIN_DURATION_MIN;

const polarToCartesian = (cx: number, cy: number, r: number, angle: number): Point => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const createSlicePath = (cx: number, cy: number, r: number, start: number, end: number): string => {
    const a = polarToCartesian(cx, cy, r, end);
    const b = polarToCartesian(cx, cy, r, start);
    const largeArc = end - start <= 180 ? '0' : '1';
    return [`M ${cx} ${cy}`, `L ${a.x} ${a.y}`, `A ${r} ${r} 0 ${largeArc} 0 ${b.x} ${b.y}`, 'Z'].join(' ');
};


const getFontSize = (count: number, textLength = 0): number => {
    let size: number;
    if (count <= 5) size = 15;
    else if (count <= 8) size = 13;
    else if (count <= 12) size = 11;
    else size = 10;

    if (textLength > 12) size -= 2;
    if (textLength > 20) size -= 2;

    return Math.max(size, 6);
};

const WarningIcon: React.FC<{ x: number; y: number; rotation: number }> = ({ x, y, rotation }) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
        <path d="M0 -10 L10 10 L-10 10 Z" fill="#ffcc00" stroke={THEME_COLORS.BLACK} strokeWidth={1} />
        <text x="0" y="6" textAnchor="middle" fontSize="12" fontWeight="bold" fill={THEME_COLORS.BLACK}>
            !
        </text>
    </g>
);

const splitIntoLines = (text: string, maxChars = 10): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length <= maxChars) current = candidate;
        else {
            if (current) lines.push(current);
            current = word;
        }
    }
    if (current) lines.push(current);
    return lines;
};

const WheelOfFortune: React.FC<WheelOfFortuneProps> = ({
    options,
    customColors,
    onSelect,
    disabled,
    shouldShowSpinButton = true,
    onSpinningChange,
    spinTrigger,
    size = DEFAULT_SIZE,
    interactionMode = 'full'
}) => {
    const theme = useTheme();
    const [rotation, setRotation] = React.useState<number>(0);
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
    const [spinDuration, setSpinDuration] = React.useState<number>(0);

    const timeoutRef = React.useRef<number | null>(null);
    const colorsRef = React.useRef(generateColors(100));

    const hasError = options.map((v: string): boolean => !v.trim());
    const sliceAngle = options.length > 0 ? 360 / options.length : 360;
    const SVG_SIZE = 500;
    const radius = SVG_SIZE / 2;

    React.useEffect(() => {
        if (spinTrigger == null || disabled || options.length < 2) return;
        spin();
    }, [spinTrigger]);

    React.useEffect(() => {
        return (): void => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const spin = (): void => {
        if (disabled || options.length < 2) return;
        const duration = getRandomSpinDuration();
        setSpinDuration(duration);
        onSpinningChange?.(true);
        const winnerIndex = Math.floor(Math.random() * options.length);
        const winnerValue = options[winnerIndex];

        const padding = sliceAngle * 0.25;
        const randomOffset = padding + Math.random() * (sliceAngle - 2 * padding);
        const winnerAngle = winnerIndex * sliceAngle + randomOffset;

        const current = ((rotation % 360) + 360) % 360;
        const delta = (360 - winnerAngle - current + 360) % 360;
        const spins = 6 + Math.floor(Math.random() * 3);
        const final = rotation + spins * 360 + delta;

        setRotation(final);

        timeoutRef.current = window.setTimeout(() => {
            onSpinningChange?.(false);
            onSelect(winnerValue);
        }, duration);
    };

    const themeFont = theme.typography.fontFamily;
    const colors = customColors ?? colorsRef.current;
    const isClickable = interactionMode === 'full' && !disabled;
    const isHoverable = interactionMode === 'full' && !disabled;

    return (
        <Box sx={{ p: 1, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{
                position: 'relative',
                width: size,
                height: size,
                flexShrink: 0,
                mb: shouldShowSpinButton ? 2 : 0
            }
            }>
                <Box
                    sx={{
                        position: 'absolute',
                        top: -6,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        pointerEvents: 'none',
                    }}
                >
                    <svg width="30" height="30" viewBox="0 0 30 30">
                        <path d="M15 30 L0 0 L30 0 Z" fill={THEME_COLORS.ERROR_PINK} stroke="white" strokeWidth="2" />
                    </svg>
                </Box>
                <Box
                    component="svg"
                    width={size}
                    height={size}
                    viewBox="0 0 500 500"
                    sx={{
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: '50% 50%',
                        transition: `transform ${spinDuration}ms cubic-bezier(0.12, 0.8, 0.1, 1)`,
                        pointerEvents: disabled ? 'not-allowed' : 'auto',
                        overflow: 'visible'
                    }}
                >
                    {options.map((option, i) => {
                        const start = i * sliceAngle;
                        const end = start + sliceAngle;
                        const mid = start + sliceAngle / 2;
                        const pos = polarToCartesian(
                            radius,
                            radius,
                            options.length > 15 ? radius * 0.78 : radius * 0.68,
                            mid
                        );
                        const upsideDown = mid > 90 && mid < 270;
                        const rotationText = mid + (upsideDown ? 180 : 0);
                        const empty = hasError[i];
                        const fontSize = getFontSize(options.length, option.length);
                        const lines = splitIntoLines(option, 12);

                        return (
                            <g
                                key={`${option}-${i}`}
                                onMouseEnter={
                                    isHoverable ? (): void => setHoveredIndex(i) : undefined
                                }
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isClickable) onSelect(option);
                                }}
                                style={{
                                    cursor: interactionMode === 'spin-only' ?
                                        'auto' : disabled || empty ? 'not-allowed' : 'pointer',
                                    transform: i === hoveredIndex ? 'scale(1.04)' : 'scale(1)',
                                    transformOrigin: '250px 250px',
                                    transition: 'transform 0.15s ease',
                                }}
                            >
                                <path
                                    d={createSlicePath(radius, radius, radius, start, end)}
                                    fill={empty ? THEME_COLORS.INACTIVE : colors[i]}
                                    stroke={THEME_COLORS.WHITE}
                                    strokeWidth={2}
                                />
                                {empty ? (
                                    <WarningIcon x={pos.x} y={pos.y} rotation={rotationText} />
                                ) : (
                                    <text
                                        x={pos.x}
                                        y={pos.y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontFamily={themeFont}
                                        fontSize={fontSize}
                                        fontWeight={700}
                                        fill={THEME_COLORS.WHITE}
                                        transform={`rotate(${rotationText} ${pos.x} ${pos.y})`}
                                    >
                                        {lines.map((line, idx) => (
                                            <tspan key={idx} x={pos.x} dy={idx === 0 ? 0 : '1.1em'}>
                                                {line}
                                            </tspan>
                                        ))}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </Box>
            </Box>

            {shouldShowSpinButton && <Button
                variant="contained"
                disabled={disabled || options.length < 2}
                onClick={spin}
                color="purple"
                sx={{ minWidth: 150 }}
            >
                Spin
            </Button>}
        </Box>
    );
};

export default WheelOfFortune;