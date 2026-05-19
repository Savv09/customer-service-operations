export interface FirebaseSigninResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

export interface FirebaseSignupResponse {
  kind: 'identitytoolkit#SignupNewUserResponse';
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}
