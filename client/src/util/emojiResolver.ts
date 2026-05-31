import * as emoji from 'node-emoji';
import emojilib from 'emojilib';

interface EmojiLibShape {
    emoji?: Record<string, string[]>;
}

const FALLBACK_EXACT: Record<string, string> = {
    'alligator': '🐊',
    'bison': '🦬',
    'fairy': '🧚🏻‍♀️',
    'fox': '🦊',
    'goblin': '🧌',
    'griffin': '🦅',
    'hot dog': '🌭',
    'jellyfish': '🪼',
    'phoenix': '🐦‍🔥',
    'squirrel': '🐿️'
};

const FALLBACK_CONTAINS: { match: string; emoji: string }[] = [
    { match: 'castle', emoji: '🏰' },
    { match: 'fish', emoji: '🐟' },
    { match: 'tree', emoji: '🌳'}
];

const normalize = (input: string): string =>
    input.toLowerCase().trim();

const tokenize = (input: string): string[] =>
    normalize(input)
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(Boolean);

const resolveNodeEmoji = (input: string): string | null => {
    try {
        const res = emoji.get(input);
        if (!res || res === `:${input}:`) return null;
        return res;
    } catch {
        return null;
    }
};

const resolveEmojiLib = (input: string): string | null => {
    try {
        const lib = emojilib as EmojiLibShape;
        const key = normalize(input).replace(/\s+/g, '_');
        return lib.emoji?.[key]?.[0] ?? null;
    } catch {
        return null;
    }
};

const resolveStrictTokenMatch = (input: string): string | null => {
    const words = tokenize(input);
    const lib = emojilib as EmojiLibShape;

    for (const key of Object.keys(lib.emoji ?? {})) {
        const keyNorm = normalize(key).replace(/_/g, ' ');
        const keyTokens = keyNorm.split(/\s+/);

        if (keyTokens.length !== words.length) continue;

        const match = keyTokens.every((t, i) => t === words[i]);

        if (match) {
            return lib.emoji?.[key]?.[0] ?? null;
        }
    }

    return null;
};

const resolveFallbackExact = (input: string): string | null => {
    const norm = normalize(input);
    return FALLBACK_EXACT[norm] ?? null;
};

const resolveFallbackContains = (input: string): string | null => {
    const norm = normalize(input);

    for (const rule of FALLBACK_CONTAINS) {
        const match = rule.match.toLowerCase();
        const regex = new RegExp(`\\b${match}\\b`, 'i');

        if (regex.test(norm)) {
            return rule.emoji;
        }
    }

    return null;
};

export const getEmoji = (input: string): string | null => {
    if (!input?.trim()) return '';

    return (
        resolveNodeEmoji(input) ||
        resolveEmojiLib(input) ||
        resolveStrictTokenMatch(input) ||
        resolveFallbackExact(input) ||
        resolveFallbackContains(input) ||
        null
    );
};