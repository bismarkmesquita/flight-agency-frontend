'use client';

import { PropsWithChildren } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import { LateralMenuProvider } from './components/base-page/lateral-menu/provider';
import { SnackbarProvider } from '@/base/context/SnackbarContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1142d4',
    }
  },
  typography: {
    fontFamily: 'var(--inter)',
  },
  components: {
    MuiCheckbox: {
      // remove padding
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
          borderRadius: '12px',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

export function Providers({ children }: PropsWithChildren<unknown>) {
  return (
    <ThemeProvider theme={theme}>
      <LateralMenuProvider>
        <SnackbarProvider>{children}</SnackbarProvider>
      </LateralMenuProvider>
    </ThemeProvider>
  );
}
