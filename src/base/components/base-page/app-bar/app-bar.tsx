import { AppBar as MuiAppBar } from '@mui/material';
import style from './app-bar.module.scss';
import { useLateralMenuContext } from '../lateral-menu/provider';

interface AppBarProps {
  title: string;
}

export default function AppBar({ title }: AppBarProps) {
  const { open } = useLateralMenuContext();

  return (
    <>
      <MuiAppBar
        position='sticky'
        className={
          open ? `${style.appBarMenuOpen} ${style.appBar}` : style.appBar
        }
      >
        <h3>{title}</h3>
      </MuiAppBar>
    </>
  );
}
