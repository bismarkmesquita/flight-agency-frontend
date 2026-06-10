'use client';
import { useMediaQuery } from '@mui/material';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

interface LateralMenuContext {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const context = createContext<LateralMenuContext>({
  open: true,
  setOpen: () => {},
});

export const useLateralMenuContext = () =>
  useContext<LateralMenuContext>(context);

export function LateralMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    if (isDesktop) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [isDesktop]);

  return (
    <context.Provider value={{ open, setOpen }}>{children}</context.Provider>
  );
}
