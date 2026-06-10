import { ReactNode } from 'react';
import {
  ListItemText,
  ListItem,
  ListItemIcon,
  ListItemButton,
} from '@mui/material';
import { useLateralMenuContext } from '../provider';
import style from './menu-item.module.scss';
import { usePathname, useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export interface MenuItemProps {
  icon: ReactNode;
  label: string;
  selected?: (route: string) => boolean;
  onClick: (router: AppRouterInstance) => void;
}

export default function MenuItem({
  icon,
  label,
  selected,
  onClick,
}: MenuItemProps) {
  const { open } = useLateralMenuContext();
  const pathname = usePathname();
  const router = useRouter();
  const isSelected = selected ? selected(pathname) : false;
  let classes = !open
    ? `${style.listItem} ${style.closedMenuItem}`
    : style.listItem;

  if (isSelected) {
    classes += ` ${style.selected}`;
  }

  return (
    <ListItem key={label} onClick={() => onClick(router)} className={classes}>
      <ListItemButton>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={label} />
      </ListItemButton>
    </ListItem>
  );
}
