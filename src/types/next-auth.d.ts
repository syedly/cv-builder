import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    userId: string;
  }

  interface JWT {
    userId?: string;
  }
}
