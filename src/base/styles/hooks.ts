import { useMediaQuery } from '@mui/material';

const MOBILE_WIDTH = 768;

export const useIsMobile = () => {
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_WIDTH}px)`);
  return isMobile;
};
