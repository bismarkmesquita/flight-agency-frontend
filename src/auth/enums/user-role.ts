export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SELLER = 'SELLER',
}

export const USER_ROLE_TO_LABEL = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.MANAGER]: 'Manager',
  [UserRole.SELLER]: 'Seller',
};
