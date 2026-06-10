import { UserRole } from '../enums/user-role';

export interface User {
  name: string;
  email: string;
  role: UserRole;
}

export const userLocalStorageKey = '_USER';
