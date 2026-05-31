import React from 'react';

import { Fab } from '@mui/material';
import LoopIcon from '@mui/icons-material/Loop';

const SpinAllButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <Fab
            variant="extended"
            color="lightPurple"
            onClick={onClick}
            sx={{
                position: 'relative',
                px: 3,
            }}
        >
            <LoopIcon
                fontSize="small"
                sx={{
                    position: 'absolute',
                    left: 15,
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
            />
            Spin all
        </Fab>
    );
};

export default SpinAllButton;
