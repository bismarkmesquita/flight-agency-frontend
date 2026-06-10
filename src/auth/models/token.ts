export interface AccessToken {
  token: string;

  /** String in ISO format. */
  expiry: string;
}

export const accessTokenStorageKey = '_ACCESS_TOKEN';
