import { UserRole } from '../enums/user-role';
import { AccessLevel } from '../enums/access-level';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  access_level: AccessLevel;
}

export const userLocalStorageKey = '_USER';
