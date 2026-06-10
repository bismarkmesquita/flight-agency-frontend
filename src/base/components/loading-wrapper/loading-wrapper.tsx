import { CircularProgress } from '@mui/material';
import { ReactNode } from 'react';

interface LoadingWrapperProps {
  loading: boolean;
  absoluteCenter?: boolean;
  className?: string;
  children?: ReactNode;
}

export function LoadingWrapper({
  loading,
  children,
  absoluteCenter = false,
  className,
}: LoadingWrapperProps) {
  const classNames = absoluteCenter
    ? 'global-absolute-center loading-wrapper'
    : className;
  return loading ? (
    <div className={classNames}>
      <CircularProgress size={60} />
    </div>
  ) : (
    <>{children}</>
  );
}
