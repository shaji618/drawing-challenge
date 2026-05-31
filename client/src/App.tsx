import React from 'react';

import { ThemeProvider } from '@mui/material/styles';

import MainMenu from './components/MainMenu';
import { theme } from './themes';
import CloudBackground from './components/CloudBackground';

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CloudBackground />
            <MainMenu />
        </ThemeProvider>
    );
};

export default App;
