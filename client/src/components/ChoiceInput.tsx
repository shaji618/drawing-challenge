import React from 'react';
import { SketchPicker } from 'react-color';

import {
    Box,
    TextField,
    InputAdornment,
    Popover,
    Tooltip,
    Stack,
    IconButton
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestoreIcon from '@mui/icons-material/Restore';
import WarningIcon from '@mui/icons-material/Warning';

import { THEME_COLORS } from '../themes';
import Typo from 'typo-js';
import { getEmoji } from '../util/emojiResolver';

interface ChoiceInputProps {
    index: number;
    value: string;
    disabled?: boolean;
    enableSpellCheck?: boolean;
    dictionary?: Typo | null;
    color: string;
    onColorChange: (index: number, color: string) => void;
    onChange: (index: number, value: string) => void;
    onReroll: (index: number) => void;
    onResetColor: (index: number) => void;
    onEnter?: () => void;
    choices: string[];
    isDuplicate?: boolean
}

const ChoiceInput: React.FC<ChoiceInputProps> = ({
    index,
    value,
    disabled = false,
    enableSpellCheck = true,
    dictionary,
    color,
    onColorChange,
    onChange,
    onReroll,
    onResetColor,
    onEnter,
    choices,
    isDuplicate
}) => {
    const [colorPickerAnchorEl, setColorPickerAnchorEl] = React.useState<HTMLElement | null>(null);

    const handleColorPickerClick = (event: React.MouseEvent<HTMLDivElement>): void => {
        setColorPickerAnchorEl(event.currentTarget);
    };

    const handleColorPickerClose = (): void => setColorPickerAnchorEl(null);

    const checkInvalid = (input: string): boolean => {
        if (!enableSpellCheck || !dictionary || choices.includes(value)) return false;

        const trimmed = input.trim();
        if (!trimmed) return false;

        return trimmed
            .split(/[\s-]+/)
            .some((word) =>
                !dictionary.check(word) &&
                !dictionary.check(word.charAt(0).toUpperCase() + word.slice(1)) &&
                !dictionary.check(word.toLowerCase())
            );
    };

    const getSuggestions = (input: string): string[] => {
        if (!enableSpellCheck || !dictionary) return [];
        const trimmed = input.trim();
        if (!trimmed) return [];
        const suggestions: string[] = [];
        trimmed
            .toLowerCase()
            .split(/[\s-]+/)
            .forEach((word) => {
                if (!dictionary.check(word)) {
                    suggestions.push(...dictionary.suggest(word).slice(0, 3));
                }
            });
        return suggestions;
    };

    const getTooltipText = (input: string): string => {
        if (!enableSpellCheck || !dictionary) return '';
        const trimmed = input.trim();
        if (!trimmed) return '';

        const words = trimmed.split(/[\s-]+/);
        const parts: string[] = [];

        words.forEach((word) => {
            if (!dictionary.check(word.toLowerCase())) {
                const sug = dictionary.suggest(word.toLowerCase()).slice(0, 3);
                if (sug.length === 0) return;
                if (sug.length === 1) parts.push(`'${word}': Did you mean ${sug[0]}?`);
                else if (sug.length === 2) parts.push(`'${word}': Did you mean ${sug[0]} or ${sug[1]}?`);
                else parts.push(`'${word}': Did you mean ${sug.slice(0, -1).join(', ')}, or ${sug[sug.length - 1]}?`);
            }
        });

        return parts.join('; ');
    };

    const trimmed = value.trim();
    const isEmpty = !trimmed;
    const isMisspelled = !isEmpty && enableSpellCheck && checkInvalid(trimmed);
    const suggestions = getSuggestions(trimmed);
    const hasError = isEmpty || isDuplicate;

    const getHelperText = (): string => {
        if (isEmpty) {
            return "You can't leave this empty!";
        } else if (isDuplicate) {
            return 'Duplicate choice!';
        } else if (isMisspelled) {
            return 'You have a misspelling!';
        };

        return ' ';
    };

    const handleKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === 'Enter' && !isEmpty && !isDuplicate) {
            e.preventDefault();
            onEnter?.();
        }
    };

    return (
        <Box sx={{ position: 'relative', mt: 2 }}>
            <Stack direction='row' spacing={1} sx={{ alignItems: 'flex-start' }}>
                <Popover
                    open={Boolean(colorPickerAnchorEl)}
                    anchorEl={colorPickerAnchorEl}
                    onClose={handleColorPickerClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <Box sx={{ typography: 'body1', p: 1 }}>
                        <SketchPicker
                            color={color}
                            onChangeComplete={(c) => onColorChange(index, c.hex)}
                        />
                    </Box>
                </Popover>
                <Box
                    sx={{
                        position: 'relative',
                        flexGrow: 1,
                        pl: 1
                    }}
                >
                    <Box
                        onClick={disabled ? undefined : handleColorPickerClick}
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: 56,
                            width: 18,
                            backgroundColor: color,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            zIndex: 2,
                            borderTopLeftRadius: 4,
                            borderBottomLeftRadius: 4,
                        }}
                    />
                    <TextField
                        spellCheck
                        fullWidth
                        label={`Choice #${index + 1}`}
                        value={value}
                        error={hasError}
                        disabled={disabled}
                        helperText={getHelperText()}
                        onChange={(e) => onChange(index, e.target.value)}
                        onKeyDown={handleKeyDown}
                        sx={
                            isMisspelled && !isEmpty
                                ? {
                                    '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'warning.main',
                                    },

                                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'warning.dark',
                                    },

                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'warning.main',
                                        borderWidth: 2,
                                    },

                                    '& .MuiInputLabel-root': {
                                        color: 'warning.main',
                                    },

                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: 'warning.main',
                                    },

                                    '& .MuiFormHelperText-root': {
                                        color: 'warning.main',
                                    },
                                }
                                : undefined
                        }
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Stack
                                            spacing={0.25}
                                            sx={{ alignItems: 'center' }}
                                        >
                                            <Tooltip
                                                title="Reset color"
                                                arrow
                                                placement='top'
                                            >
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onResetColor(index)}
                                                        disabled={disabled}
                                                        sx={{ p: 0 }}
                                                    >
                                                        <RestoreIcon
                                                            fontSize="small"
                                                            sx={{
                                                                color: disabled
                                                                    ? THEME_COLORS.INACTIVE
                                                                    : THEME_COLORS.ERROR_PINK,
                                                            }}
                                                        />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip
                                                title="Random choice"
                                                arrow
                                                placement='bottom'
                                            >
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        disabled={disabled}
                                                        onClick={() => {
                                                            if (disabled) return;
                                                            onReroll(index);
                                                        }}
                                                        sx={{ p: 0 }}
                                                    >
                                                        <RefreshIcon
                                                            fontSize="small"
                                                            sx={{
                                                                color: disabled
                                                                    ? THEME_COLORS.INACTIVE
                                                                    : THEME_COLORS.DARK_PURPLE,
                                                            }}
                                                        />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Stack>
                                    </InputAdornment>
                                )
                            }
                        }}
                    />
                </Box>
            </Stack>
            <Box
                sx={{
                    position: 'absolute',
                    right: 14,
                    top: '35%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                }}
            >
                {(hasError || (isMisspelled && suggestions.length > 0)) && (
                    <Tooltip
                        title={isMisspelled ? getTooltipText(trimmed) : ''}
                        arrow
                    >
                        {
                            isMisspelled ?
                                <WarningIcon
                                    color={isEmpty || isDuplicate ? 'error' : 'warning'}
                                    fontSize="small"
                                    sx={{ cursor: 'help' }}
                                /> :
                                <ErrorIcon color={isEmpty || isDuplicate ? 'error' : 'warning'}
                                    fontSize="small"
                                    sx={{ cursor: 'help' }}
                                />}
                    </Tooltip>
                )}
                {!(isEmpty || isDuplicate) &&
                    <Box
                        component="span"
                        sx={{
                            fontSize: 18,
                            lineHeight: 1,
                            pointerEvents: 'none',
                        }}
                    >
                        {getEmoji(value)}
                    </Box>
                }
            </Box>
        </Box>
    );
};

export default ChoiceInput;
