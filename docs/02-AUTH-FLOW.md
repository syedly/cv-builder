# 02 — Auth Flow

## Registration & Login Flow

```
REGISTRATION
─────────────────────────────────────────────────────────
User fills form:
  name, email, password, confirmPassword
         │
         ▼
Client validation (zod schema)
  • Email format
  • Password >= 8 chars
  • Passwords match
         │
         ▼
POST /api/auth/register
         │
         ▼
Server:
  1. Check email not already taken
  2. bcrypt.hash(password, 12)
  3. Create user in MongoDB:
     {
       name,
       email,
       passwordHash,
       freeTries: 3,          ← starts with 3
       byokKey: null,
       byokEncrypted: false,
       createdAt: Date.now()
     }
  4. Return success → auto-login via NextAuth
         │
         ▼
Redirect → /dashboard


LOGIN
─────────────────────────────────────────────────────────
User fills form:
  email, password
         │
         ▼
POST /api/auth/[...nextauth] (credentials provider)
         │
         ▼
NextAuth:
  1. Find user by email
  2. bcrypt.compare(password, hash)
  3. If match → create JWT session
  4. JWT contains: {userId, email, name}
         │
         ▼
Redirect → /dashboard


SESSION CHECK (Middleware)
─────────────────────────────────────────────────────────
Every request to /dashboard/*, /api/cv/*, /api/byok/*:

middleware.ts runs:
  1. getToken() from NextAuth
  2. Token valid? → allow
  3. Token missing/expired? → redirect to /login


JWT TOKEN STRUCTURE
─────────────────────────────────────────────────────────
{
  sub: "userId",
  email: "user@example.com",
  name: "John Doe",
  iat: 1234567890,
  exp: 1234567890  // 30 days
}
```

---

## MongoDB User Schema

```typescript
// models/User.ts
const UserSchema = new Schema({
  name:           { type: String, required: true },
  email:          { type: String, required: true, unique: true },
  passwordHash:   { type: String, required: true },
  
  // Trial system
  freeTries:      { type: Number, default: 3 },
  
  // BYOK
  byokKeyEncrypted: { type: String, default: null },
  byokKeyIV:        { type: String, default: null }, // AES-GCM IV
  
  // History
  cvGenerations:  [{ type: Schema.Types.ObjectId, ref: 'CVGeneration' }],
  
  createdAt:      { type: Date, default: Date.now },
  updatedAt:      { type: Date, default: Date.now },
});
```

---

## NextAuth Config

```typescript
// app/api/auth/[...nextauth]/route.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error('No user found');
        
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) throw new Error('Invalid password');
        
        return { id: user._id.toString(), email: user.email, name: user.name };
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      session.userId = token.userId;
      return session;
    }
  }
};
```

---

## Protected Route Middleware

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' }
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/builder/:path*',
    '/api/cv/:path*',
    '/api/byok/:path*',
    '/api/user/:path*',
  ]
};
```
