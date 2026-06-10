import { createContext, ReactNode, useContext, useState } from 'react';
import SnackbarAlert from '../components/snackbar/snackbar';

interface SnackbarContextProps {
  showSnackbar: (
    message: string,
    severity?: 'error' | 'warning' | 'info' | 'success'
  ) => void;
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(
  undefined
);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: 'error' | 'warning' | 'info' | 'success';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = (
    message: string,
    severity: 'error' | 'warning' | 'info' | 'success' = 'info'
  ) => {
    setSnackbarState({ open: true, message, severity });
  };

  const handleClose = () => {
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <SnackbarAlert
        open={snackbarState.open}
        onClose={handleClose}
        message={snackbarState.message}
        severity={snackbarState.severity}
      />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
