'use client';

import * as React from 'react';
import {
  Box,
  Drawer as MuiDrawer,
  List,
  Divider,
  IconButton,
  DrawerProps,
} from '@mui/material';
import {
  HomeOutlined,
  MenuOpen,
  Menu,
  FlightTakeoff,
  AirplaneTicket,
  People,
  Business,
} from '@mui/icons-material';
import MenuItem from './menu-item/menu-item';
import { useLateralMenuContext } from './provider';
import LogoutButton from './logout-button/logout-button';
import style from './lateral-menu.module.scss';
import { useIsMobile } from '@/base/styles/hooks';
import { UserRole } from '@/auth/enums/user-role';
import { useEffect } from 'react';
import { getAccessInfo } from '@/auth/utils/auth';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Logo from '../../logo/logo';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick: (router: AppRouterInstance) => void;
  selected: (route: string) => boolean;
  roleFilter?: (role?: UserRole) => boolean;
}

interface LateralMenuProps {
  children: React.ReactNode;
}

export default function LateralMenu({ children }: LateralMenuProps) {
  const { open, setOpen } = useLateralMenuContext();
  const [role, setRole] = React.useState<UserRole | undefined>(undefined);

  useEffect(() => {
    const user = getAccessInfo();
    if (user?.role) {
      setRole(user.role);
    }
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const mainMenuItems: MenuItem[] = [
    {
      icon: <HomeOutlined />,
      label: 'Dashboard',
      onClick: (router: AppRouterInstance) => {
        router.push('/dashboard');
      },
      selected: (route) => route === '/dashboard',
    },
    {
      icon: <AirplaneTicket />,
      label: 'Reservations',
      onClick: (router: AppRouterInstance) => {
        router.push('/reservations');
      },
      selected: (route) => route === '/reservations',
    },
    {
      icon: <People />,
      label: 'Customers',
      onClick: (router: AppRouterInstance) => {
        router.push('/customers');
      },
      selected: (route) => route === '/customers',
    },
  ];

  const subMenuItems: MenuItem[] = [
    {
      icon: <FlightTakeoff />,
      label: 'Next Flights',
      onClick: (router: AppRouterInstance) => {
        router.push('/flights');
      },
      selected: (route) => route === '/flights',
    },
    {
      icon: <Business />,
      label: 'Management',
      onClick: (router: AppRouterInstance) => {
        router.push('/management');
      },
      selected: (route) => route === '/management',
      roleFilter: (role) =>
        [UserRole.ADMIN, UserRole.MANAGER].includes(role ?? UserRole.SELLER),
    },
  ];

  const isMobile = useIsMobile();
  const menuVariant = isMobile ? 'temporary' : 'permanent';
  const actualIcon = open ? <MenuOpen /> : <Menu />;

  return (
    <Box className={style.root}>
      <Drawer
        open={open}
        variant={menuVariant}
        anchor='left'
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        <DrawerHeader open={open}>
          {open && (
            <Logo />
          )}
          <IconButton onClick={open ? handleDrawerClose : handleDrawerOpen}>
            {actualIcon}
          </IconButton>
        </DrawerHeader>
        <Divider className={style.divider} />
        <List>
          {mainMenuItems
            .filter((item) => !item.roleFilter || item.roleFilter(role))
            .map((item) => (
              <MenuItem key={item.label} {...item} />
            ))}
        </List>
        <Divider className={style.divider} />
        <List>
          {subMenuItems
            .filter((item) => !item.roleFilter || item.roleFilter(role))
            .map((item) => (
              <MenuItem key={item.label} {...item} />
            ))}
        </List>
        <Divider className={style.divider} />
        <LogoutButton />
      </Drawer>
      <Box className={style.main}>{children}</Box>
    </Box>
  );
}

const Drawer = ({ open, ...props }: { open: boolean } & DrawerProps) => {
  return (
    <div className={style.drawer}>
      <MuiDrawer
        {...props}
        open={open}
        className={open ? style.openedDrawer : style.closedDrawer}
      />
    </div>
  );
};

const DrawerHeader = ({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) => {
  const classes = open
    ? `${style.drawerHeader} ${style.drawerHeaderJustifyBetween}`
    : style.drawerHeader;

  return <div className={classes}>{children}</div>;
};