# StudentFolio — React + Supabase Public Student Portfolios

Working MVP source code for public student registration, editing portfolios, projects, education, certifications, profile photo upload, publishing/unpublishing, downloading QR codes in PNG and SVG formats, managing account settings, and viewing privacy/terms.

## Key Features

### Authentication
- Email registration with verification
- Secure login/logout
- Password reset via email
- Account settings and deletion
- Session management with error boundary protection

### Portfolio Management
- Multi-step wizard for building portfolios
- Personal information (name, headline, bio, location, contact)
- Education records (institution, degree, CGPA)
- Skills with categories and proficiency levels
- Projects with tech stack and live demos
- Certifications and achievements
- Social links (GitHub, LinkedIn, Twitter, etc.)
- Portfolio templates (Minimal Professional, Modern Developer, Creative)
- Auto-save with form state persistence
- Profile completion tracking with progress bar

### Public Portfolios
- Publish/unpublish with permanent URL
- Public portfolio preview without login
- Template-based rendering
- Mobile-responsive design

### QR Code Generation
- Generate QR codes for published portfolios
- Download as PNG or SVG
- Stable, permanent QR URLs
- Portfolio URL display and copy-to-clipboard

### Dashboard
- Welcome panel with profile picture
- Profile completion percentage
- Statistics (projects, certifications, completion %)
- 6 quick action buttons (Edit, View Profile, Generate QR, Settings, Publish, etc.)
- Portfolio publication status
- One-click access to all features

### Account Management
- Change password with current password verification
- Account deletion with email confirmation
- View account creation date
- Email preference settings

### Additional Pages
- Privacy Policy (template)
- Terms of Service (template)
- Error boundaries with retry functionality
- Session expiry handling with form state restoration

## Prerequisites
- Node.js 18+ LTS and npm
- Supabase project with email authentication enabled
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Setup

### 1. Supabase Project
Create a Supabase project at https://supabase.com/dashboard.

### 2. Database Schema
Open **SQL Editor**, paste `supabase/schema.sql` and execute it **once on a new project**. Do not run twice; it creates tables, RLS policies, and triggers.

### 3. Authentication Configuration
Go to **Authentication → URL Configuration**:
- Add `http://localhost:5173/dashboard` as an allowed redirect during development
- Set the Site URL to `http://localhost:5173`
- Enable email/password authentication
- Enable email confirmation
- For production, configure SMTP email provider

### 4. Environment Variables
1. Copy `.env.example` to `.env.local`
2. Set the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL (from Connect dialog)
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your anon public key
   - `VITE_APP_URL`: Your deployed URL (production) or `http://localhost:5173` (development)

Never use the service_role key in the frontend.

### 5. Install Dependencies
```bash
npm install
```

### 6. Development Server
```bash
npm run dev
```
Open `http://localhost:5173` and register a test account.

### 7. Test Workflow
1. Register with email and verify
2. Log in to dashboard
3. Edit portfolio (personal info, add education, skills, project)
4. View profile completion
5. Publish portfolio
6. Generate and download QR code (PNG/SVG)
7. View public portfolio
8. Update account settings or password
9. Scan QR code on mobile device

## Build & Test

### TypeScript Validation
```bash
npx tsc --noEmit
```

### Production Build
```bash
npm run build
```

### Run Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run test:coverage
```

### PR Check (Full Verification)
```bash
npm run pr-check
```

## Deploy to Vercel

### 1. Git Repository
Push your code to GitHub, GitLab, or Bitbucket.

### 2. Vercel Import
1. Go to https://vercel.com/import
2. Select your repository
3. Set the following environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_APP_URL`: Set to your Vercel domain (e.g., `https://studentfolio.vercel.app`)

### 3. Deploy
Click Deploy. Vercel will automatically build and deploy your SPA.

### 4. Supabase Configuration for Production
1. Go to **Authentication → URL Configuration** in Supabase
2. Set Site URL to your Vercel domain
3. Add `https://your-domain.vercel.app/dashboard` to allowed redirects
4. Configure production email SMTP settings
5. Enable email confirmation for enhanced security

### 5. Verification
- Open your Vercel URL
- Register and verify email
- Test portfolio creation and QR code generation
- Scan QR code on real mobile devices (iOS/Android)

## Project Structure

```
studentfolio-starter/
├── src/
│   ├── components/
│   │   ├── AuthProvider.tsx          # Auth context and session management
│   │   ├── ErrorBoundary.tsx         # Error boundary for error handling
│   │   ├── Layout.tsx                # Main layout wrapper
│   │   ├── Protected.tsx             # Route protection
│   │   ├── form/                     # Form components
│   │   ├── landing/                  # Landing page sections
│   │   ├── portfolio/                # Portfolio templates
│   │   ├── ui/                       # UI components (Button, Input, etc.)
│   │   └── wizard/                   # Multi-step form wizard
│   ├── pages/
│   │   ├── AuthPage.tsx              # Login/Register
│   │   ├── Dashboard.tsx             # Dashboard with quick actions
│   │   ├── Editor.tsx                # Portfolio editor
│   │   ├── ForgotPassword.tsx        # Password reset
│   │   ├── Home.tsx                  # Landing page
│   │   ├── Privacy.tsx               # Privacy Policy
│   │   ├── PublicPortfolio.tsx       # Public portfolio view
│   │   ├── QRPage.tsx                # QR code generation & download
│   │   ├── Settings.tsx              # Account settings
│   │   └── Terms.tsx                 # Terms of Service
│   ├── lib/
│   │   ├── file-storage.ts           # File upload utilities
│   │   ├── portfolio.ts              # Portfolio helpers
│   │   ├── qr-code.ts                # QR code generation
│   │   ├── supabase.ts               # Supabase client & interceptors
│   │   ├── toast.ts                  # Toast notifications
│   │   └── validation.ts             # Zod schemas for form validation
│   ├── hooks/
│   │   ├── useFileUpload.ts          # File upload hook
│   │   ├── useFormWithAutosave.ts    # Form with auto-save
│   │   └── useProfile.ts             # Profile data fetching
│   ├── utils/
│   │   ├── date-utils.ts             # Date formatting & calculations
│   │   ├── file-utils.ts             # File utilities
│   │   └── string-utils.ts           # String utilities
│   ├── types/
│   │   └── index.ts                  # TypeScript types
│   ├── styles/
│   │   └── index.css                 # Tailwind & global styles
│   ├── main.tsx                      # App entry point
│   └── index.css                     # Global styles
├── supabase/
│   └── schema.sql                    # Database migrations & RLS policies
├── tests/
│   └── integration/
│       ├── auth.test.tsx             # Auth flow tests
│       ├── portfolio-crud.test.tsx   # Portfolio CRUD tests
│       ├── file-upload.test.tsx      # File upload tests
│       └── dashboard.test.tsx        # Dashboard tests
├── .env.example                      # Environment variables template
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite configuration
├── vitest.config.ts                  # Vitest configuration
└── README.md                         # This file
```

## Security & Important Notes

### Database Security
- Row Level Security (RLS) policies enforce access control
- Private/draft profiles are hidden from anonymous users
- File uploads use secure paths with user IDs

### Public File Access
- The public `avatars` bucket serves files regardless of profile publication status
- Only upload photos intended for public visibility
- For confidential files, use signed URLs or a separate private bucket

### Privacy & Data
- Personal data (date of birth, city, etc.) is opt-in and private by default
- Public profiles only show information the student explicitly made public
- Student identity isn't verified beyond email ownership

### QR Code Deployment
- `VITE_APP_URL` must be a public URL for QR codes to work on other devices
- Localhost QR codes will only work on the developer machine
- QR codes use stable UUIDs; changing portfolio content doesn't break the QR code

### Email Limits
- Supabase free tier has email sending limits
- Configure production SMTP to handle volume
- Implement rate limiting before launching widely

### Authentication
- Passwords are handled only by Supabase Auth; never stored in your code
- Sessions are managed via Supabase JWT tokens
- 401 errors redirect to login with form state preserved

## Testing

### Test Coverage
- Validation schemas: 50+ test cases
- File storage utilities: 20+ test cases
- String & date utilities: 30+ test cases
- UI components: 40+ test cases
- Integration tests: Auth, Portfolio CRUD, File Upload, Dashboard

Target: 70%+ overall coverage, 80%+ for critical paths (auth, upload, forms)

### Run Tests
```bash
npm run test                # Run all tests
npm run test:ui            # Interactive test UI
npm run test:coverage      # Generate coverage report
npm run pr-check           # Full verification (build + test + coverage)
```

## Troubleshooting

### QR Code Not Scanning
- Verify `VITE_APP_URL` is set to your public domain
- QR code must point to a published portfolio
- Test QR code on real iOS/Android devices
- Check network connectivity on mobile device

### Email Not Sent
- Verify email authentication is enabled in Supabase
- Check SMTP configuration in Supabase Auth settings
- Test with a real email address (not localhost)
- Check spam/junk folder

### Build Fails
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version with `node --version` (should be 18+)
- Clear node_modules and reinstall if needed: `rm -rf node_modules && npm install`
- Run TypeScript validation: `npx tsc --noEmit`

### Portfolio Doesn't Save
- Check browser console for errors
- Verify user is logged in
- Check Supabase network tab in browser dev tools
- Ensure RLS policies allow INSERT/UPDATE for your user

## Contributing

Before submitting a PR:
1. Run `npm run pr-check` and ensure it passes
2. Verify test coverage is 70%+
3. Test all related features manually
4. Update documentation if adding new features

## License

MIT

