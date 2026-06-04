# 07 — BYOK (Bring Your Own Key) System

## Concept

The BYOK system lets users plug in their own OpenAI API key to get **unlimited CV generations** instead of being capped at 3 free tries.

---

## Flow Diagram

```
USER TRIES TO GENERATE CV
          │
          ▼
┌─────────────────────┐
│  Check freeTries    │
│  in MongoDB         │
└─────────┬───────────┘
          │
    ┌─────▼──────┐
    │ tries > 0? │
    └─────┬──────┘
   YES ◄──┘──► NO
    │            │
    ▼            ▼
Use system    Check: user has
OpenAI key    BYOK key stored?
    │            │
    │      YES ◄─┘──► NO
    │       │          │
    │    Decrypt     Show BYOK
    │    stored key  Modal
    │       │          │
    ▼       ▼        User enters
Use key  Use key    their key
    │       │          │
    │       │    Validate key
    │       │    (test API call)
    │       │          │
    │       │    ┌─────▼──────┐
    │       │    │ Key valid? │
    │       │    └─────┬──────┘
    │       │   YES ◄──┘──► NO
    │       │    │           │
    │       │  Encrypt     Show
    │       │  + Save      error
    │       │  to DB
    │       │    │
    └───────┴────┘
              │
         Run pipeline
         with this key
```

---

## Key Encryption

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes
const ALGORITHM = 'aes-256-gcm';

export function encryptAPIKey(plaintext: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag().toString('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag
  };
}

export function decryptAPIKey(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

---

## BYOK API Routes

### Save Key
```
POST /api/byok/save
Body: { apiKey: "sk-..." }

1. Validate format (starts with sk-)
2. Test with small OpenAI call (models list)
3. Encrypt the key
4. Save encrypted + IV + tag to user document
5. Return: { success: true }
```

### Delete Key
```
DELETE /api/byok/remove

1. Set byokKeyEncrypted = null
2. Set byokKeyIV = null
3. Return: { success: true }
```

### Get Status (no key exposed)
```
GET /api/byok/status

Return: {
  hasByok: true/false,
  freeTries: 2,
  // Never return the actual key
}
```

---

## Key Validation

```typescript
// lib/validateApiKey.ts
export async function validateOpenAIKey(key: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    return response.status === 200;
  } catch {
    return false;
  }
}
```

---

## UI: BYOK Modal

```
╔══════════════════════════════════════════════╗
║  🔑 Add Your OpenAI API Key                  ║
║                                              ║
║  You've used all 3 free generations.         ║
║  Add your own API key for unlimited access.  ║
║                                              ║
║  ┌────────────────────────────────────────┐  ║
║  │ sk-••••••••••••••••••••••••••••••••••  │  ║
║  └────────────────────────────────────────┘  ║
║                                              ║
║  🔒 Your key is encrypted and never shared  ║
║                                              ║
║  [ Cancel ]              [ Save & Continue ] ║
╚══════════════════════════════════════════════╝
```

---

## Security Rules

- API keys **never** returned in any API response
- Keys stored encrypted with AES-256-GCM
- Each user gets a unique IV per encryption
- ENCRYPTION_KEY lives only in server env vars
- Keys deleted immediately on user request
- Logs never contain API key values
