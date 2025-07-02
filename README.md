# Knowledge Base Platform - Frontend

A modern, collaborative document platform built with Next.js, React, and TypeScript. This frontend application provides a rich user interface for creating, editing, sharing, and managing documents with real-time collaboration features.

## 🚀 Features

### ✅ Implemented Features

- **User Authentication System**

  - User registration with email verification
  - Login with email/password
  - Forgot password functionality with email reset
  - JWT-based authentication

- **Document Management**

  - Rich WYSIWYG editor with TipTap
  - Document creation, editing, and deletion
  - Auto-save functionality
  - Document listing with search and filters
  - Public document sharing with tokens

- **Collaboration Features**

  - User mentions with @username functionality
  - Document sharing with view/edit permissions
  - Real-time notifications
  - Document version history and restoration
  - Comment system support

- **Search & Discovery**

  - Global search across documents and users
  - Advanced filtering and sorting
  - Command palette (⌘K) for quick navigation
  - Starred documents for quick access

- **User Interface**
  - Responsive design with Tailwind CSS
  - Dark/Light theme support
  - Modern component library with Radix UI
  - Smooth animations with Framer Motion
  - Toast notifications with Sonner

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Editor**: TipTap (Rich text editor)
- **State Management**: Zustand + React Query
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Backend API running (Django Knowledge Base API)

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd knowledge-base-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Configuration**

   Create a `.env.local` file in the root directory:

   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

   # Optional: Analytics, monitoring, etc.
   # NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 🔌 API Integration

The frontend integrates with the Django backend API. Key API endpoints:

- **Authentication**: `/api/auth/`
- **Documents**: `/api/documents/`
- **Sharing**: `/api/sharing/`
- **Search**: `/api/search/`
- **Users**: `/api/users/`
- **Notifications**: `/api/notifications/`

### API Client Configuration

The API client is configured in `src/lib/api/client.ts` with:

- Automatic JWT token handling
- Request/response interceptors
- Error handling and token refresh
- TypeScript support

## 🎨 UI Components

Built with **shadcn/ui** components for consistency and accessibility:

- Forms with validation
- Data tables with sorting/filtering
- Modal dialogs and sheets
- Toast notifications
- Loading states and skeletons
- Responsive navigation

## 🔐 Authentication Flow

1. **Registration**: Email verification required
2. **Login**: JWT tokens stored in HTTP-only cookies
3. **Token Refresh**: Automatic background refresh
4. **Protected Routes**: Automatic redirection to login
5. **Logout**: Clean token removal

## 📱 Responsive Design

- **Mobile-first approach** with Tailwind CSS
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Touch-friendly** interfaces for mobile devices
- **Adaptive layouts** for different screen sizes

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.com
```

### Deployment Platforms

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Docker** with Nginx
- **AWS Amplify**
- **Firebase Hosting**

## 🧪 Development

### Code Quality

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for git hooks (optional)

### Folder Conventions

- Use kebab-case for file names
- Use PascalCase for component names
- Group related components in folders
- Keep components small and focused

### State Management

- **Server State**: React Query for API data
- **Client State**: Zustand for UI state
- **Form State**: React Hook Form
- **Theme State**: next-themes

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**

   - Check backend server is running
   - Verify `NEXT_PUBLIC_API_URL` in `.env.local`
   - Check CORS settings on backend

2. **Authentication Issues**

   - Clear browser cookies/localStorage
   - Check JWT token expiration
   - Verify backend authentication endpoints

3. **Build Errors**

   - Run `npm install` to update dependencies
   - Check TypeScript errors with `npm run type-check`
   - Clear Next.js cache: `rm -rf .next`

4. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS classes
   - Verify CSS variables in globals.css

## 📋 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please:

1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information
4. Join our community discussions

---

**Happy coding! 🎉**
