# 12 — Deployment

## Environment Setup

### .env.local (Development)
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-cv-builder

# Auth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# OpenAI (system key for free trials)
OPENAI_API_KEY=sk-your-system-key-here

# Encryption (for BYOK keys)
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=64-char-hex-string-here
```

### Production (Vercel)
Same variables set in Vercel Dashboard → Project → Settings → Environment Variables

---

## package.json Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    
    // Database
    "mongoose": "^8.0.0",
    
    // Auth
    "next-auth": "^5.0.0-beta",
    "bcryptjs": "^2.4.3",
    
    // AI
    "openai": "^4.0.0",
    
    // File parsing
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    
    // PDF generation
    "pdf-lib": "^1.17.1",
    
    // DOCX generation
    "docx": "^8.0.0",
    
    // UI
    "lucide-react": "^0.400.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    
    // Validation
    "zod": "^3.0.0",
    
    // Utils
    "md5": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/bcryptjs": "^2.4.6",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

---

## Installation Steps

```bash
# 1. Clone and install
git clone <repo>
cd ai-cv-system
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. MongoDB Atlas setup
# - Create cluster at mongodb.com
# - Create database user
# - Whitelist IP (0.0.0.0/0 for Vercel)
# - Copy connection string to MONGODB_URI

# 4. Generate secrets
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# → paste as NEXTAUTH_SECRET

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# → paste as ENCRYPTION_KEY

# 5. Run development
npm run dev
# → http://localhost:3000

# 6. Deploy to Vercel
vercel deploy
# Set env vars in Vercel dashboard
```

---

## MongoDB Atlas Indexes (run once)

```javascript
// Run in MongoDB Atlas shell or Compass
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

db.cv_generations.createIndex({ userId: 1, createdAt: -1 });
db.cv_generations.createIndex({ createdAt: -1 });

db.job_analyses.createIndex({ jobHash: 1 }, { unique: true });
db.job_analyses.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
```

---

## Production Checklist

- [ ] MongoDB Atlas cluster created (M10+ for production)
- [ ] All environment variables set in Vercel
- [ ] ENCRYPTION_KEY securely stored (never changes after first deploy)
- [ ] NEXTAUTH_URL set to production domain
- [ ] OpenAI API key has sufficient credits for system trials
- [ ] MongoDB indexes created
- [ ] Error monitoring set up (Sentry optional)
- [ ] Rate limiting on API routes (Vercel edge config or upstash/ratelimit)
