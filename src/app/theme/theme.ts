import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2b7fff',
      contrastText: '#fafafa',
    },
    secondary: {
      main: '#f8f8f9',
      contrastText: '#4e463f',
    },
    error: {
      main: '#e7000b',
      contrastText: '#fafafa',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#231d17',
      secondary: '#71717b',
    },
    divider: '#e4e4e7',
  },
  shape: {
    borderRadius: 10.4,
  },
  typography: {
    fontFamily: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
  },
});

export default theme;
