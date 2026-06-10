import { APIResponse } from '@/base/services/api';
import { AccessToken } from './token';
import { User } from './user';

export type LoginResponse = APIResponse<{ user: User } & AccessToken>;
