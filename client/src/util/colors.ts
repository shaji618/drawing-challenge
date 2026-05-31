const randomBetween = (min: number, max: number): number => min + Math.random() * (max - min);

const generateRandomColor = (hueRanges?: number[][]): string => {
    const defaultHueRanges = hueRanges ?? [
        [200, 240], // blues
        [250, 300], // purples
        [310, 355], // pinks
    ];
    const [minHue, maxHue] = defaultHueRanges[Math.floor(Math.random() * defaultHueRanges.length)];
    const hue = randomBetween(minHue, maxHue);
    const saturation = randomBetween(65, 85);
    const lightness = randomBetween(50, 68);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const generateColors = (count: number): string[] => {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
        colors.push(generateRandomColor());
    }
    return colors;
};