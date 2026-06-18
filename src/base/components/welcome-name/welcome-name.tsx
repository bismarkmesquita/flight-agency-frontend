'use client';

import { getAccessInfo } from '@/auth/utils/auth';
import { useEffect, useState } from 'react';
import style from './welcome-name.module.scss';

export default function WelcomeName() {
  const [name, setName] = useState<string>('Manager');

  useEffect(() => {
    const user = getAccessInfo();
    if (user?.name) {
      setName(user.name.split(' ')[0]);
    }
  }, []);

  return <span className={style.title}>Welcome, {name}!</span>;
}
