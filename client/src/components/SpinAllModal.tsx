import React from 'react';

import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import Confetti from 'react-confetti';

import { Category } from '../util/categories';
import WheelOfFortune from './WheelOfFortune';
import { THEME_COLORS } from '../themes';
import { getEmoji } from '../util/emojiResolver';

interface SpinAllModalProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    categories: Category[];
}

interface SpinCategory {
    categoryName: string;
    emoji: string;
    wheelOptions: string[];
}

const shuffle = <T,>(array: T[]): T[] => {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
};

const getWheelOptions = (choices: string[]): string[] => {
    if (choices.length <= 15) {
        return shuffle(choices);
    }

    return shuffle(choices).slice(0, 15);
};

const SpinAllModal: React.FC<SpinAllModalProps> = ({ open, setOpen, categories }) => {
    const [winners, setWinners] = React.useState<Record<string, string>>({});
    const [spinTrigger, setSpinTrigger] = React.useState<number | null>(null);
    const [, setSpinningCount] = React.useState(0);
    const [wheelCategories, setWheelCategories] = React.useState<SpinCategory[]>([]);

    React.useEffect(() => {
        if (!open) return;

        setWheelCategories(
            categories.map((category) => ({
                categoryName: category.categoryName,
                emoji: category.emoji,
                wheelOptions: getWheelOptions(category.choices),
            }))
        );
    }, [open, categories]);

    const completedCount = Object.keys(winners).length;

    const allFinished = wheelCategories.length > 0 && completedCount === wheelCategories.length;

    React.useEffect(() => {
        if (!open) return;

        setWinners({});
    }, [open]);

    React.useEffect(() => {
        if (!open || wheelCategories.length === 0) return;

        const timer = window.setTimeout(() => {
            setSpinTrigger(Date.now());
        }, 500);

        return (): void => clearTimeout(timer);
    }, [open, wheelCategories]);

    const handleClose = (): void => {
        if (!allFinished) return;
        setOpen(false);
    };

    return (
        <Dialog open={open} onClose={handleClose} fullScreen>
            {allFinished && <Confetti recycle={false} numberOfPieces={100} />}
            <DialogTitle>Spin 'em all!</DialogTitle>
            <IconButton
                disabled={!allFinished}
                onClick={handleClose}
                sx={(theme) => ({
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.grey[500],
                })}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                        <Grid size={8}>
                            <Grid container spacing={2}>
                                {wheelCategories.map((category) => (
                                    <Grid
                                        key={category.categoryName}
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 4,
                                        }}
                                    >
                                        <Typography align='center' sx={{ mb: 1 }}>
                                            {`${category.emoji} ${category.categoryName}`}
                                        </Typography>
                                        <WheelOfFortune
                                            key={category.categoryName}
                                            interactionMode='spin-only'
                                            options={category.wheelOptions}
                                            disabled={false}
                                            shouldShowSpinButton={false}
                                            spinTrigger={spinTrigger}
                                            onSpinningChange={(spinning) => {
                                                setSpinningCount((count) =>
                                                    spinning ? count + 1 : count - 1
                                                );
                                            }}
                                            onSelect={(winner) => {
                                                setWinners((current) => ({
                                                    ...current,
                                                    [category.categoryName]: winner,
                                                }));
                                            }}
                                            size={220}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                        <Grid size={4}>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Winner</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {categories.map((category) => (
                                            <TableRow key={category.categoryName}>
                                                <TableCell>
                                                    {category.emoji} {category.categoryName}
                                                </TableCell>

                                                <TableCell width={200} height={30}>
                                                    {winners[category.categoryName] ?
                                                        <Typography>
                                                            {winners[category.categoryName]}
                                                            {getEmoji(winners[category.categoryName]) && ` ${getEmoji(winners[category.categoryName])}`}
                                                        </Typography>
                                                        :
                                                        <DoNotDisturbOnIcon sx={{ color: THEME_COLORS.ERROR_PINK }} />
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default SpinAllModal;
