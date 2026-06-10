import { Snackbar, Alert } from '@mui/material';

interface SnackbarProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
}

export default function SnackbarAlert({
  open,
  onClose,
  message,
  severity = 'info',
}: SnackbarProps) {
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
