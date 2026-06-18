'use client';

import { getAccessToken } from '@/auth/utils/token';
import { LoadingWrapper } from '@/base/components/loading-wrapper/loading-wrapper';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    goToDashboard(router);
  }, []);

  return <LoadingWrapper loading={false} absoluteCenter={true} />;
}

function goToDashboard(router: AppRouterInstance) {
  const token = getAccessToken();

  if (!token) {
    router.push('/login');
  } else {
    router.push('/dashboard');
  }
}
