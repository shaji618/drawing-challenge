import React from 'react';

import { Fab } from '@mui/material';
import ShuffleIcon from '@mui/icons-material/Shuffle';

const RandomCategoryButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <Fab
            variant="extended"
            color="lightPurple"
            onClick={onClick}
            sx={{
                position: 'relative',
                px: 5,
            }}
        >
            <ShuffleIcon
                fontSize="small"
                sx={{
                    position: 'absolute',
                    left: 15,
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
            />
            Random category
        </Fab>
    );
};

export default RandomCategoryButton;
