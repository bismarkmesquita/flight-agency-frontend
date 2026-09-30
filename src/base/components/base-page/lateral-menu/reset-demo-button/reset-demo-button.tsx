import MenuItem from '@/base/components/base-page/lateral-menu/menu-item/menu-item';
import { RestartAlt as ResetIcon } from '@mui/icons-material';

const resetDemo =
  process.env.NEXT_PUBLIC_USE_MOCK === 'true'
    ? async () => {
        const { resetDb } = await import('@/mock/db');
        resetDb();
        window.location.reload();
      }
    : null;

export default function ResetDemoButton() {
  if (!resetDemo) return null;

  return <MenuItem icon={<ResetIcon />} label='RESET DEMO' onClick={resetDemo} />;
}
