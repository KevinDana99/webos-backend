import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

import { UserCreate, UserPublic, User, JwtPayload } from './auth.types';
import { env } from '../../config/env';

const USERS_DB: Map<string, User> = new Map();

export class UserService {
  static async create(createData: UserCreate): Promise<UserPublic> {
    const existing = Array.from(USERS_DB.values()).find(u => u.email === createData.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(createData.password, 10);

    const user: User = {
      id,
      email: createData.email.toLowerCase(),
      username: createData.username,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    USERS_DB.set(id, user);
    return this.toPublic(user);
  }

  static async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = USERS_DB.get(Array.from(USERS_DB.entries()).find(([, u]) => u.email === email.toLowerCase())?.[0] || '');
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  static findById(id: string): User | undefined {
    return USERS_DB.get(id);
  }

  static findByEmail(email: string): User | undefined {
    return Array.from(USERS_DB.values()).find(u => u.email === email.toLowerCase());
  }

  static toPublic(user: User): UserPublic {
    const { passwordHash, ...publicFields } = user;
    return publicFields as UserPublic;
  }
}
