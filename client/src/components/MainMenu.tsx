import React from 'react';

import { Box, Button, ButtonGroup, Stack } from '@mui/material';

import { categories, Category } from '../util/categories';
import headerLogo from '/headerLogo.png';
import CategoryForm from './CategoryForm';
import { theme } from '../themes';
import SpinAllModal from './SpinAllModal';
import SpinAllButton from './SpinAllButton';
import RandomCategoryButton from './RandomCategoryButton';
import DrawingCanvas from './DrawingCanvas';

const MainMenu: React.FC = () => {
    const [selection, setSelection] = React.useState<Category | null>(null);
    const [spinAllModalOpen, setSpinAllModalOpen] = React.useState(false);
    const [canvasOpen, setCanvasOpen] = React.useState(false);

    const handleCategoryClick = (item: Category): void => {
        setCanvasOpen(false);
        setSelection(item);
    };

    const handleCanvasClick = (): void => {
        setSelection(null);
        setCanvasOpen(true);
    };

    const handleRandomCategoryClick = (): void => {
        setCanvasOpen(false);
        if (categories.length <= 1) return;

        const filteredCategories = categories.filter(cat => cat !== selection);
        const randomIndex = Math.floor(Math.random() * filteredCategories.length);
        setSelection(filteredCategories[randomIndex]);
    };

    const handleSpinAllClick = (): void => {
        setSpinAllModalOpen(true);
    };

    return (
        <React.Fragment>
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'center'
                }}
            >
                <Stack direction='column' sx={{ alignItems: 'center' }}>
                    <Stack direction='row' sx={{ mb: 2 }}>
                        <Box
                            component="img"
                            src={headerLogo}
                            alt="LOGO"
                            sx={{ width: 'auto' }}
                        />
                        <Stack spacing={1} sx={{ ml: 1 }}>
                            <RandomCategoryButton onClick={handleRandomCategoryClick} />
                            <SpinAllButton onClick={handleSpinAllClick} />
                        </Stack>
                    </Stack>
                    <ButtonGroup>
                        {categories.map((item) => (
                            <Button
                                key={item.categoryName}
                                variant='contained'
                                onClick={() => handleCategoryClick(item)}
                                sx={{
                                    bgcolor: item.categoryName === selection?.categoryName ? theme.palette.purple.light : theme.palette.purple.main,
                                    color: theme.palette.purple.contrastText,
                                    '&:hover': {
                                        bgcolor: theme.palette.purple.dark
                                    }
                                }}
                            >
                                {`${item.emoji} ${item.categoryName}`}
                            </Button>
                        ))}
                        <Button
                            variant='contained'
                            onClick={handleCanvasClick}
                            sx={{
                                bgcolor: canvasOpen ? theme.palette.purple.light : theme.palette.purple.main,
                                color: theme.palette.purple.contrastText,
                                '&:hover': {
                                    bgcolor: theme.palette.purple.dark
                                }
                            }}
                        >
                            🎨 Canvas
                        </Button>
                    </ButtonGroup>
                    {canvasOpen && (
                        <DrawingCanvas
                            height='75vh'
                            width='74vw'
                            marginTop={2}
                        />
                    )}
                    {selection && (
                        <CategoryForm
                            key={selection.categoryName}
                            category={selection}
                        />
                    )}
                </Stack>
            </Box>
            <SpinAllModal
                open={spinAllModalOpen}
                setOpen={setSpinAllModalOpen}
                categories={categories}
            />
        </ React.Fragment>
    );
};

export default MainMenu;
