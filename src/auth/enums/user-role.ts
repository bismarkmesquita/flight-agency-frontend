export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SELLER = 'seller',
}

export const USER_ROLE_TO_LABEL = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.MANAGER]: 'Manager',
  [UserRole.SELLER]: 'Seller',
};
