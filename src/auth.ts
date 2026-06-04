import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await connectDB();
          const user = await User.findOne({
            email: (credentials.email as string).toLowerCase().trim(),
          });

          if (!user) return null;

          const valid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );
          if (!valid) return null;

          await User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (err) {
          console.error('Auth error:', err);
          return null;
        }
      },
    }),
  ],

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        (session as typeof session & { userId: string }).userId = token.userId as string;
      }
      return session;
    },
  },
});
