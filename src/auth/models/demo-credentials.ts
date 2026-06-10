import { UserRole } from "../enums/user-role";

type DemoCredentials = {
  login: string;
  password: string;
};

export type LoginRole = UserRole.MANAGER | UserRole.SELLER;

export const DEMO_CREDENTIALS: Record<LoginRole, DemoCredentials> = {
  [UserRole.MANAGER]: {
    login: 'manager@agency.dev',
    password: 'manager123',
  },
  [UserRole.SELLER]: {
    login: 'seller@agency.dev',
    password: 'seller123',
  },
};