export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
}

export interface UserPublic {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}