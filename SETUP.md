# Kabulig Portal - Setup Instructions

## Prerequisites

1. **Node.js** (v18 or higher) installed
2. **Supabase account** (free tier works for development)

## Database Setup (Supabase)

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string (URI format) - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
5. Update the `DATABASE_URL` in `.env.local` with your actual connection string
6. Run the database migration:
   ```bash
   npx prisma migrate dev --name init
   ```
   Or use `npx prisma db push` if you prefer (this is simpler for development)

## Environment Variables

Update `.env.local` with your actual values:

```env
# Database - Replace with your Supabase connection string
DATABASE_URL="postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres"

# NextAuth - Generate a secret with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe - Get keys from https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
STRIPE_SECRET_KEY="sk_test_your-key"
STRIPE_WEBHOOK_SECRET="whsec_your-key"
```

## Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database (after configuring DATABASE_URL):
   ```bash
   npx prisma migrate dev --name init
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

## Project Structure

```
kabulig.net/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/            # React components
│   ├── lib/                   # Utility functions
│   └── types/                 # TypeScript types
├── public/                    # Static assets
└── .env.local                 # Environment variables (not in git)
```

## Database Schema

The project includes 14 models:
- User (shared across all pillars)
- FarmerProfile & VerificationDocument
- CustomerProfile, Address & PaymentMethod
- ProductCategory, Product & ProductImage
- Order & OrderItem
- CropCycle
- EarlyWarning
- Transaction

## Next Steps After Setup

1. Create initial product categories in the database
2. Create a superadmin account manually (via Prisma Studio or seed script)
3. Set up Stripe test mode
4. Test the application

## Troubleshooting

### Prisma Migration Fails
- Ensure DATABASE_URL is correctly set in `.env.local`
- Check that your Supabase project is active
- Verify the connection string format

### Stripe Integration
- Use test mode keys during development
- Set up webhook endpoints in Stripe dashboard for production

### Image Upload
- Images are stored locally in `public/images/`
- Ensure the directory exists and has write permissions
