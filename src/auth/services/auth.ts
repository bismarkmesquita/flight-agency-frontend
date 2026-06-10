'use client';

import { LoginFormInfo } from '@/auth/components/login-page/login-form/login-form';
import { usePrivateAPI, usePublicAPI } from '@/base/services/api';
import { AxiosInstance } from 'axios';
import { useMemo } from 'react';
import { LoginResponse } from '../models/login-response';

class AuthService {
  constructor(
    private publicAPI: AxiosInstance,
    private privateAPI: AxiosInstance
  ) {}

  async login(info: LoginFormInfo) {
    const payload = { ...info };
    const resp = await this.publicAPI.post<LoginResponse>(
      '/auth/login/',
      payload
    );
    console.log(resp)
    return resp.data;
  }

  async logout() {
    const resp = await this.privateAPI.post('/auth/logout/');
    return resp.data;
  }
}

export const useAuthService = () => {
  const privateAPI = usePrivateAPI();
  const publicAPI = usePublicAPI();
  const service = useMemo(
    () => new AuthService(publicAPI, privateAPI),
    [publicAPI, privateAPI]
  );
  return service;
};
