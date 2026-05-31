import React from 'react';

import {
    Autocomplete,
    Box,
    Button,
    ButtonGroup,
    Dialog,
    DialogActions,
    DialogTitle,
    Divider,
    IconButton,
    Popover,
    Stack,
    TextField,
    Tooltip
} from '@mui/material';
import NumberSpinner from './NumberSpinner';
import {
    ArrowBack,
    Backspace,
    Delete,
    Download,
    Draw,
    Redo,
    Undo,
} from '@mui/icons-material';

import {
    ReactSketchCanvas,
    ReactSketchCanvasRef,
} from 'react-sketch-canvas';
import { SketchPicker } from 'react-color';

import { THEME_COLORS } from '../themes';

interface DrawingCanvasProps {
    handleBack?: () => void;
    backgroundImage?: string;
    height?: string;
    width?: string;
    marginTop?: number;
}

interface DeleteConfirmationModalProps {
    open: boolean;
    handleClear: () => void;
    handleClose: () => void;
}

interface FileUploadModalProps {
    open: boolean;
    handleSave: (fileName: string) => void;
    handleClose: () => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
    handleBack,
    height = '90vh',
    width = '90vw',
    marginTop
}) => {
    const canvasRef = React.useRef<ReactSketchCanvasRef>(null);

    const [strokeColor, setStrokeColor] = React.useState(THEME_COLORS.LIGHT_PURPLE.toString());
    const [strokeWidth, setStrokeWidth] = React.useState(4);
    const [isErasing, setIsErasing] = React.useState(false);
    const [colorPickerAnchorEl, setColorPickerAnchorEl] = React.useState<HTMLElement | null>(null);
    const [clearCanvasConfirmationModalOpen, setClearCanvasConfirmationModalOpen] = React.useState(false);
    const [fileUploadModalOpen, setFileUploadModalOpen] = React.useState(false);

    const handleColorPickerClick = (
        event: React.MouseEvent<HTMLDivElement>
    ): void => {
        setColorPickerAnchorEl(event.currentTarget);
    };

    const handleColorPickerClose = (): void => {
        setColorPickerAnchorEl(null);
    };

    const handleColorChange = (newColor: string): void => {
        setStrokeColor(newColor);
        setIsErasing(false);
        canvasRef.current?.eraseMode(false);
    };

    const handleEraser = (): void => {
        setIsErasing(true);
        canvasRef.current?.eraseMode(true);
    };

    const handlePen = (): void => {
        setIsErasing(false);
        canvasRef.current?.eraseMode(false);
    };

    const handleClear = (): void => {
        canvasRef.current?.clearCanvas();
    };

    const handleUndo = (): void => {
        canvasRef.current?.undo();
    };

    const handleRedo = (): void => {
        canvasRef.current?.redo();
    };

    const handleDownload = async (fileName: string): Promise<void> => {
        const dataUrl = await canvasRef.current?.exportImage('png');

        if (!dataUrl) return;

        const response = await fetch(dataUrl);
        const blob = await response.blob();

        const formData = new FormData();
        formData.append('image', blob, `${fileName}.png`);

        const uploadResponse = await fetch(
            'http://localhost:3001/api/localImages',
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!uploadResponse.ok) {
            console.error('Failed to save image');
            return;
        }

        const result = await uploadResponse.json();
        console.log('Saved image:', result);
    };


    return (
        <React.Fragment>
            <Box
                sx={{
                    width: width,
                    height: height,
                    display: 'flex',
                    flexDirection: 'column',
                    mt: marginTop
                }}
            >
                {/* Toolbar */}
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        backgroundColor: THEME_COLORS.WHITE,
                        borderTopLeftRadius: 2,
                        borderTopRightRadius: 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1
                    }}
                >
                    {/* Back button */}
                    {!!handleBack && 
                        <Tooltip title="Back to images">
                            <Button
                                color='purple'
                                variant="outlined"
                                onClick={handleBack}
                            >
                                <ArrowBack />
                            </Button>
                        </Tooltip>
                    }
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {/* Pen & Eraser */}
                        <ButtonGroup size="small">
                            <Tooltip title="Pen">
                                <Button
                                    color='purple'
                                    variant={!isErasing ? 'contained' : 'outlined'}
                                    onClick={handlePen}
                                >
                                    <Draw />
                                </Button>
                            </Tooltip>

                            <Tooltip title="Eraser">
                                <Button
                                    color='purple'
                                    variant={isErasing ? 'contained' : 'outlined'}
                                    onClick={handleEraser}
                                >
                                    <Backspace />
                                </Button>
                            </Tooltip>
                        </ButtonGroup>

                        <Divider orientation="vertical" flexItem />

                        {/* Color picker */}
                        <Popover
                            open={Boolean(colorPickerAnchorEl)}
                            anchorEl={colorPickerAnchorEl}
                            onClose={handleColorPickerClose}
                            sx={{ zIndex: 3000 }}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                        >
                            <Box sx={{ p: 1 }}>
                                <SketchPicker
                                    color={strokeColor}
                                    onChangeComplete={(c) => handleColorChange(c.hex)}
                                />
                            </Box>
                        </Popover>

                        <Tooltip title="Choose color">
                            <Box
                                onClick={handleColorPickerClick}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    padding: 0,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    backgroundColor: strokeColor,
                                }}
                            />
                        </Tooltip>

                        <Divider orientation="vertical" flexItem />

                        {/* Stroke width */}
                        <NumberSpinner
                            size="small"
                            min={1}
                            max={2000}
                            value={strokeWidth}
                            tooltipTextType={isErasing ? 'eraser' : undefined}
                            // @ts-expect-error: it works
                            onValueChange={setStrokeWidth}
                        />

                        <Divider orientation="vertical" flexItem />

                        {/* Undo & Redo */}
                        <ButtonGroup size="small">
                            <Tooltip title="Undo">
                                <Button color='purple' onClick={handleUndo}>
                                    <Undo />
                                </Button>
                            </Tooltip>

                            <Tooltip title="Redo">
                                <Button color='purple' onClick={handleRedo}>
                                    <Redo />
                                </Button>
                            </Tooltip>
                        </ButtonGroup>

                        <Divider orientation="vertical" flexItem />

                        {/* Clear */}
                        <Tooltip title="Clear canvas">
                            <IconButton
                                color="error"
                                onClick={() => setClearCanvasConfirmationModalOpen(true)}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    padding: 0,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    cursor: 'pointer'
                                }}
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem />

                        {/* Download */}
                        <Tooltip title="Download to gallery">
                            <IconButton
                                // @ts-expect-error: color works
                                color="purple"
                                onClick={() => setFileUploadModalOpen(true)}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    padding: 0,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    cursor: 'pointer'
                                }}
                            >
                                <Download />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                {/* Canvas */}
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        borderBottomLeftRadius: 2,
                        borderBottomRightRadius: 2,
                        overflow: 'hidden',
                        bgcolor: THEME_COLORS.WHITE
                    }}
                >
                    <ReactSketchCanvas
                        ref={canvasRef}
                        width="100%"
                        height="100%"
                        strokeColor={strokeColor}
                        strokeWidth={strokeWidth}
                        eraserWidth={strokeWidth}
                        canvasColor={THEME_COLORS.WHITE}
                    />
                </Box>
            </Box>
            <ClearCanvasConfirmationModal
                open={clearCanvasConfirmationModalOpen}
                handleClear={handleClear}
                handleClose={() => setClearCanvasConfirmationModalOpen(false)}
            />
            <FileUploadModal
                open={fileUploadModalOpen}
                handleSave={handleDownload}
                handleClose={() => setFileUploadModalOpen(false)}
            />
        </ React.Fragment>
    );
};

const ClearCanvasConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    open,
    handleClear,
    handleClose
}) => {
    return (
        <Dialog open={open}>
            <DialogTitle>Clear canvas?</DialogTitle>
            <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
                <Button
                    color='purple'
                    variant='contained'
                    onClick={
                        () => {
                            handleClear();
                            handleClose();
                        }
                    }
                >
                    Yes
                </Button>
                <Button
                    color='error'
                    variant='outlined'
                    onClick={handleClose}
                >
                    No
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const FileUploadModal: React.FC<FileUploadModalProps> = ({
    open,
    handleSave,
    handleClose
}) => {
    const [storedFileNames, setStoredFileNames] = React.useState([]);
    const [inputFileName, setInputFileName] = React.useState<string | null>(null);
    const [dropdownOpen, setDropDownOpen] = React.useState(false);
    
    React.useEffect(() => {
        if (!open) return;

        fetch('http://localhost:3001/api/localImages')
            .then((response) => response.json())
            .then((data) => setStoredFileNames(data));
    }, [open]);

    return (
        <Dialog open={open}>
            <DialogTitle>Save file</DialogTitle>
            <Autocomplete
                open={dropdownOpen}
                onOpen={() => {
                    if (inputFileName) {
                        setDropDownOpen(true);
                    }
                }}
                onClose={() => setDropDownOpen(false)}
                options={storedFileNames}
                renderInput={(params) => <TextField {...params} label="Name your file" />}
                sx={{
                    ml: 2,
                    mr: 2,
                    mb: 1,
                    width: 350
                }}
                freeSolo
                onInputChange={(_event, newInputValue: string) => {
                    if (!newInputValue) setDropDownOpen(false);
                    return setInputFileName(newInputValue);
                }}
            />
            
            <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
                <Button
                    color='purple'
                    variant='contained'
                    disabled={!inputFileName}
                    onClick={
                        () => {
                            handleSave(inputFileName ?? 'drawing');
                            handleClose();
                        }
                    }
                >
                        Save
                </Button>
                <Button
                    color='error'
                    variant='outlined'
                    onClick={handleClose}
                >
                        Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DrawingCanvas;
