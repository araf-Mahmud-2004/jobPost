import { Document } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
        name: string;
      } & Document;
    }
  }
}

export interface IRequestWithUser extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
    name: string;
  };
}
