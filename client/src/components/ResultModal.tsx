import React from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    FormControlLabel,
    ImageList,
    ImageListItem,
    Skeleton,
    Switch,
    Typography
} from '@mui/material';

import { THEME_COLORS } from '../themes';
import { useDuckDuckGoImageSearch } from '../hooks/useDuckDuckGoImageSearch';
import { useWikipediaSummary } from '../hooks/useWikipediaSummary';
import DrawingCanvas from './DrawingCanvas';

interface ResultModalProps {
    name: string;
    category: string;
    open: boolean;
    setModalOpen: (value: boolean) => void;
    imageCount?: number;
}

interface ImageResult {
    image: string;
    thumbnail?: string;
    title?: string;
}

const IMAGE_COUNT = 24;

const ResultModal: React.FC<ResultModalProps> = ({
    name,
    category,
    open,
    setModalOpen,
    imageCount = IMAGE_COUNT
}) => {
    const [switchActive, setSwitchActive] = React.useState(false);
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const [canvasOpen, setCanvasOpen] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState<ImageResult | null>(null);

    const {
        ddgImages,
        ddgLoading,
        ddgError
    } = useDuckDuckGoImageSearch(name, category);

    const getWikipediaSearchString = (): string => {
        switch (name) {
        case 'black-eyed susan':
            return 'Rudbeckia hirta';
        case 'phoenix':
            return 'phoenix (mythology)';
        case 'crane':
            return 'crane (bird)';
        case 'bluebonnet':
            return 'bluebonnet (plant)';
        }

        return name;
    };

    const {
        wikipediaSummary,
        wikipediaLoading,
        wikipediaError
    } = useWikipediaSummary(getWikipediaSearchString(), category);

    const showSkeleton = !switchActive || ddgLoading || ddgImages.length === 0;
    const gridItems = showSkeleton
        ? Array.from({ length: imageCount })
        : ddgImages;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if (ddgLoading) return;
        setSwitchActive(event.target.checked);
    };

    const handleClose = (): void => {
        setModalOpen(false);
        setSwitchActive(false);
        setPreviewOpen(false);
        setCanvasOpen(false);
        setSelectedImage(null);
    };

    return (
        <React.Fragment>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <Box sx={{ p: 2 }}>
                    <DialogTitle
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            alignItems: 'center',
                            minHeight: 72,
                            px: 2
                        }}
                    >
                        <Box sx={{ justifySelf: 'start' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={switchActive}
                                        onChange={handleChange}
                                        disabled={ddgLoading || ddgImages.length === 0}
                                        color="purple"
                                    />
                                }
                                label={switchActive ? 'Not from memory' : 'From memory'}
                            />
                        </Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 900,
                                letterSpacing: '0.04em',
                                background: `linear-gradient(
                                    180deg,
                                    ${THEME_COLORS.ERROR_PINK} 0%,
                                    ${THEME_COLORS.LIGHT_PURPLE} 35%,
                                    ${THEME_COLORS.MAIN_PURPLE} 70%,
                                    ${THEME_COLORS.DARK_PURPLE} 100%
                                )`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            {name.toUpperCase()}
                        </Typography>
                        <Box sx={{ justifySelf: 'end' }}>
                            <Button
                                variant="contained"
                                color='purple'
                                onClick={() => setCanvasOpen(true)}
                            >
                                Ready to draw?
                            </Button>
                        </Box>
                    </DialogTitle>

                    <Box sx={{ mb: 2 }}>
                        {wikipediaLoading ? (
                            <Skeleton variant="text" width="100%" height={60} />
                        ) : wikipediaError ? (
                            null
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                {wikipediaSummary}
                            </Typography>
                        )}
                    </Box>
                    {ddgError && switchActive && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {ddgError}
                        </Typography>
                    )}
                    <Box sx={{ mt: 3 }}>
                        <ImageList cols={3} gap={8}>
                            {gridItems.map((item, i) => {
                                return (
                                    <ImageListItem key={showSkeleton ? i : (item as ImageResult).image} sx={{ mx: 1, my: 1 }}>
                                        {showSkeleton ? (
                                            <Skeleton variant="rectangular" width="100%" height={180} />
                                        ) : (
                                            <Box
                                                sx={{
                                                    p: 0.5,
                                                    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.06)',
                                                    borderRadius: 1,
                                                    backgroundColor: 'transparent'
                                                }}
                                            >
                                                <img
                                                    src={
                                                        (item as ImageResult).thumbnail ??
                                                        (item as ImageResult).image
                                                    }
                                                    alt={(item as ImageResult).title ?? name}
                                                    loading="lazy"
                                                    onClick={() => {
                                                        setSelectedImage(item as ImageResult);
                                                        setPreviewOpen(true);
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        height: 180,
                                                        objectFit: 'contain',
                                                        display: 'block',
                                                        borderRadius: 4,
                                                        cursor: 'zoom-in'
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </ImageListItem>
                                );
                            })}
                        </ImageList>
                    </Box>
                </Box>
            </Dialog>
            {previewOpen && selectedImage && (
                <Box
                    onClick={() => setPreviewOpen(false)}
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: THEME_COLORS.BLACK,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2000,
                        cursor: 'zoom-out',
                        overflow: 'hidden'
                    }}
                >
                    <img
                        src={selectedImage.image}
                        alt={selectedImage.title ?? name}
                        onError={(e) => {
                            const target = e.currentTarget;
                            if (selectedImage.thumbnail && target.src !== selectedImage.thumbnail) {
                                target.src = selectedImage.thumbnail;
                            } else {
                                target.style.display = 'none';
                            }
                        }}
                        style={{
                            maxWidth: '100vw',
                            maxHeight: '100vh',
                            objectFit: 'contain',
                            cursor: 'zoom-out'
                        }}
                    />
                </Box>
            )}
            <Dialog
                open={canvasOpen}
                maxWidth={false}
            >
                <DrawingCanvas
                    handleBack={() => { setCanvasOpen(false); }}
                    backgroundImage={ddgImages[0]?.thumbnail}
                />
            </Dialog>
        </React.Fragment>
    );
};

export default ResultModal;
