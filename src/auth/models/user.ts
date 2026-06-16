import { UserRole } from '../enums/user-role';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export const userLocalStorageKey = '_USER';
