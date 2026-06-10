'use client';

import { ReactNode } from 'react';
import LateralMenu from '@/base/components/base-page/lateral-menu/lateral-menu';
import style from './base-page.module.scss';
import AppBar from './app-bar/app-bar';

interface BasePageProps {
  children: ReactNode;
  title: string;
}

export default function BasePage({
  children,
  title,
}: BasePageProps) {
  return (
    <div className={style.basePage}>
      <AppBar title={title} />
      <LateralMenu>
        <div className={style.content}>
          {children}
        </div>
      </LateralMenu>
    </div>
  );
}
