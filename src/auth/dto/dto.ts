export type VerifyTokenDto = {
  id: string;
  tokenInput: number;
};

export type SendVerificationTokenDto = {
  id: string;
  email?: string;
  phoneNumber?: string;
};

export type SignupDto = {
  email: string;
  password: string;
}

export type PendingUser = {
  email: string;
  hashedPassword: string;
  verificationToken?: number;
  createdAt: Date;
  expiresAt: Date;
}