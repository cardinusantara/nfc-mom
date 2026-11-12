# Cardi NFC MoM  -  Standalone NFC Digital Portal (`nfc.cardi.co.id`)

Canonical digital identity and NFC smart card portal for the Cardi MoM ecosystem.

## Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with React 19 & Turbopack
- **Styling**: Tailwind CSS & Lucide React icons
- **Backend API**: Centralized AWS DynamoDB & API Gateway (`mom app/packages/backend`)

## Architecture & Core Features

```
nfc mom/
├── src/
│   ├── app/
│   │   ├── [username]/           # Dynamic public vCard profile with live tap tracking
│   │   ├── activate/             # Card activation with automatic coin crediting
│   │   ├── dashboard/card/       # Digital card management & customization
│   │   ├── api/vcard/[username]/ # Serverless RFC 6350 .vcf contact card download
│   │   └── ...
│   └── lib/
│       ├── api.ts                # Client API adapter connected to AWS backend
│       └── profiles.ts           # Types & utilities
```

### Core Flows

1. **Card Tap (`/[username]`)**:
   - NFC card or QR code redirects to `https://nfc.cardi.co.id/<username>`.
   - Fires background tap counter to `POST /nfc/profile/:username/tap`.
   - Displays verified badges, social links, bio, and downloadable `.vcf`.
   - Displays friendly empty state if the card has not yet been registered.

2. **Card Activation (`/activate`)**:
   - Accepts Card ID, Email (MoM Account), Full Name, Desired Username, and Selected Package.
   - Packages:
     - **Kartu Saja**: Rp 49.000 (Physical NFC Card only)
     - **Kartu + Quick**: Rp 139.000 (Includes 500 MoM Coins)
     - **Kartu + Bulk**: Rp 399.000 (Includes 2,500 MoM Coins)
   - Synchronizes with DynamoDB and automatically provisions coin balance to the user's MoM account.

3. **Digital Profile Editor (`/dashboard/card`)**:
   - Authenticated users can modify display name, role, company, bio, phone, email, and social links in real time.

## Available Scripts

```bash
# Start Next.js development server
pnpm dev

# Build production application with Turbopack
pnpm build

# Start production server
pnpm start
```
