import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        purple: Palette['primary'];
        lightPurple: Palette['primary'];
    }

    interface PaletteOptions {
        purple?: PaletteOptions['primary'];
        lightPurple: Palette['primary'];
    }
}

declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        purple: true;
    }
}

declare module '@mui/material/Slider' {
    interface SliderPropsColorOverrides {
        purple: true;
    }
}

declare module '@mui/material/Switch' {
    interface SwitchPropsColorOverrides {
        purple: true;
    }
}

declare module '@mui/material/Fab' {
    interface FabPropsColorOverrides {
        purple: true;
        lightPurple: true;
    }
}

export enum THEME_COLORS {
    ERROR_PINK = '#e75480',
    MAIN_PURPLE = '#831DC6',
    LIGHT_PURPLE = '#CFA3EA',
    DARK_PURPLE = '#560BAD',
    WHITE = '#ffffff',
    BLACK = '#000000',
    INACTIVE = '#dadada',
    WARNING_LIGHT = '#D33D03',
    WARNING_MAIN = '#A72906',
    WARNING_DARK = '#7B1509',
}

export const theme = createTheme({
    palette: {
        purple: {
            main: THEME_COLORS.MAIN_PURPLE,
            light: THEME_COLORS.LIGHT_PURPLE,
            dark: THEME_COLORS.DARK_PURPLE,
            contrastText: THEME_COLORS.WHITE
        },
        lightPurple: {
            light: '#F0E0FA',
            main: THEME_COLORS.LIGHT_PURPLE,
            dark:'#A66CC9',
            contrastText: THEME_COLORS.WHITE
        },
        warning: {
            light: THEME_COLORS.WARNING_LIGHT,
            main: THEME_COLORS.WARNING_MAIN,
            dark: THEME_COLORS.WARNING_DARK,
            contrastText: THEME_COLORS.WHITE
        }
    },
    components: {
        MuiTooltip: {
            styleOverrides: {
                popper: {
                    zIndex: 3000,
                },
            },
        },
        MuiFab: {
            styleOverrides: {
                root: ({ ownerState, theme }) => ({
                    ...(ownerState.color === 'purple' && {
                        backgroundColor: theme.palette.purple.main,
                        color: theme.palette.purple.contrastText,
                        '&:hover': {
                            backgroundColor: theme.palette.purple.dark,
                        },
                    }),
                }),
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    borderRadius: 8,

                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.purple.light,
                    },

                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.purple.main,
                    },

                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.purple.dark,
                        borderWidth: 2,
                    },

                    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.error.main,
                    },
                }),
            },
        },
        MuiFormLabel: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.purple.main,

                    '&.Mui-focused': {
                        color: theme.palette.purple.dark,
                    },

                    '&.Mui-error': {
                        color: theme.palette.error.main,
                    },
                }),
            },
        },
        MuiFormHelperText: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.purple.main,

                    '&.Mui-error': {
                        color: theme.palette.error.main,
                    },
                }),
            },
        }
    },
});
