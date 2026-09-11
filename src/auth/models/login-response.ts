import { AccessToken } from './token';
import { User } from './user';

// Login's success payload comes straight from knox, un-enveloped (no "data" key) —
// unlike every other endpoint, so it can't reuse the generic APIResponse<T> shape.
export type LoginResponse = ({ user: User } & AccessToken) & {
  success?: boolean;
  reason?: string;
  message?: string;
};
