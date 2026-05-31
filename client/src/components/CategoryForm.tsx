import React from 'react';

import {
    Button,
    Grid,
    Slider,
    Stack,
    Typography
} from '@mui/material';


import WheelOfFortune from './WheelOfFortune';
import ResultModal from './ResultModal';
import { Category } from '../util/categories';
import { useSpellChecker } from '../hooks/useSpellChecker';
import ChoiceInput from './ChoiceInput';
import { generateColors } from '../util/colors';

const CategoryForm: React.FC<{ category: Category }> = ({ category }) => {
    const { categoryName, emoji, choices } = category;
    const [sliderValue, setSliderValue] = React.useState(2);
    const [names, setNames] = React.useState<string[]>([]);
    const [colors, setColors] = React.useState<string[]>([]);
    const [winner, setWinner] = React.useState<string | null>(null);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [isSpinning, setIsSpinning] = React.useState(false);
    const [spinTrigger, setSpinTrigger] = React.useState(0);

    const paletteRef = React.useRef(generateColors(100));
    const originalColors = React.useRef(generateColors(sliderValue));

    const dictionary = useSpellChecker();

    const getRandomUniqueChoices = (count: number, exclude: string[] = []): string[] => {
        const available = choices.filter((a) => !exclude.includes(a));
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    };

    React.useEffect(() => {
        setNames(getRandomUniqueChoices(sliderValue));
        setColors(paletteRef.current.slice(0, sliderValue));
    }, []);

    const isEmpty = names.some((choice) => !choice.trim());

    const duplicateValues = new Set(
        names
            .map((name) => name.trim().toLowerCase())
            .filter(
                (name, _, arr) =>
                    name !== '' &&
                    arr.indexOf(name) !== arr.lastIndexOf(name)
            )
    );
    const hasDuplicates = duplicateValues.size > 0;

    const handleColorReset = (index: number): void => {
        setColors((current) => {
            const next = [...current];
            next[index] = originalColors.current[index];
            return next;
        });
    };

    const handleSliderChange = (_: Event, newValue: number): void => {
        setSliderValue(newValue);

        setNames((current) => {
            if (newValue < current.length) {
                return current.slice(0, newValue);
            } else if (newValue > current.length) {
                const additions = getRandomUniqueChoices(
                    newValue - current.length,
                    current
                );
                return [...current, ...additions];
            }
            return current;
        });

        setColors((current) => {
            let next = [...current];
            if (newValue > current.length) {
                const additions = paletteRef.current.slice(current.length, newValue);
                next = [...next, ...additions];

                originalColors.current = [...originalColors.current, ...additions];
            } else if (newValue < current.length) {
                next = next.slice(0, newValue);
                originalColors.current = originalColors.current.slice(0, newValue);
            }
            return next;
        });
    };

    const reroll = (index: number): void => {
        setNames((current) => {
            const usedByOthers = current.filter((_, i) => i !== index);
            const [replacement] = getRandomUniqueChoices(1, usedByOthers);

            if (!replacement) return current;

            const next = [...current];
            next[index] = replacement;
            return next;
        });
    };

    const randomizeAll = (): void => {
        setNames(getRandomUniqueChoices(sliderValue));
    };

    const handleNameChange = (index: number, value: string): void => {
        setNames((current) => {
            const next = [...current];
            next[index] = value;
            return next;
        });
    };

    const handleColorChange = (index: number, color: string): void => {
        setColors((current) => {
            const next = [...current];
            next[index] = color;
            return next;
        });
    };

    return (
        <React.Fragment>
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={4}>
                    <Stack>
                        <Typography>
                            How many {emoji} can we choose from?
                        </Typography>

                        <Slider
                            step={1}
                            min={2}
                            max={Math.min(choices.length, 15)}
                            marks
                            valueLabelDisplay="auto"
                            color="purple"
                            value={sliderValue}
                            onChange={handleSliderChange}
                            disabled={isSpinning}
                        />

                        <Button
                            variant="contained"
                            onClick={randomizeAll}
                            color="purple"
                            disabled={isSpinning}
                            sx={{ my: 2 }}
                        >
                            Randomize all names
                        </Button>

                        {names.map((choice, index) => (
                            <ChoiceInput
                                key={index}
                                index={index}
                                value={choice}
                                disabled={isSpinning}
                                enableSpellCheck={true}
                                dictionary={dictionary}
                                color={colors[index]}
                                onColorChange={handleColorChange}
                                onChange={handleNameChange}
                                onReroll={reroll}
                                onResetColor={handleColorReset}
                                onEnter={() => setSpinTrigger((prev) => prev + 1)}
                                choices={choices}
                                isDuplicate={duplicateValues.has(
                                    choice.trim().toLowerCase()
                                )}
                            />
                        ))}
                    </Stack>
                </Grid>

                <Grid size={8}>
                    <WheelOfFortune
                        options={names}
                        customColors={colors}
                        disabled={isSpinning || isEmpty || hasDuplicates}
                        onSpinningChange={setIsSpinning}
                        onSelect={(winner) => {
                            setWinner(winner);
                            setModalOpen(true);
                        }}
                        spinTrigger={spinTrigger}
                    />
                </Grid>
            </Grid>

            {winner && (
                <ResultModal
                    name={winner}
                    category={categoryName}
                    open={modalOpen}
                    setModalOpen={setModalOpen}
                />
            )}
        </React.Fragment>
    );
};

export default CategoryForm;