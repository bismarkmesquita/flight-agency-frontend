'use client';
import { useAuthService } from '@/auth/services/auth';
import { clearAuth } from '@/auth/utils/auth';
import MenuItem from '@/base/components/base-page/lateral-menu/menu-item/menu-item';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import style from './logout-button.module.scss';
import { useLateralMenuContext } from '../provider';

export default function LogoutButton() {
  const authService = useAuthService();
  const router = useRouter();
  const { open } = useLateralMenuContext();

  async function logout() {
    const resp = await authService.logout();
    if (resp.success) {
      clearAuth();
      router.push('/login');
    }
  }

  if (open)
    return (
      <div onClick={logout} className={style.logoutButton}>
        <LogoutIcon />
        <span className={style.logoutButtonText}>LOGOUT</span>
      </div>
    );

  return (
    <div className={style.logoutButton}>
      <MenuItem icon={<LogoutIcon />} label='LOGOUT' onClick={logout} />
    </div>
  );
}
