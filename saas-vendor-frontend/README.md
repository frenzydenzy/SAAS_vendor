# SaaS Vendor Frontend

A complete React + TypeScript frontend for the SaaS Vendor marketplace application.

## Features

✅ User authentication (login, register, password reset)  
✅ Deal browsing and filtering  
✅ Deal details view with claim functionality  
✅ User profile management  
✅ Claims management  
✅ JWT-based authentication with token refresh  
✅ Protected routes  
✅ State management with Zustand  
✅ TypeScript strict mode  
✅ Responsive UI with inline styles

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Utility styles (via inline styles for now)

## Project Structure

```
src/
├── pages/              # Page components (Auth, Deals, User)
│   ├── Auth/          # Login, Register pages
│   ├── Deals/         # Deals list, Deal details pages
│   └── User/          # Profile, Claims pages
├── components/        # Reusable components (Navigation, ProtectedRoute, DealCard)
├── services/          # API service layer (6 services + Axios instance)
├── store/             # Zustand state management stores
├── hooks/             # Custom hooks (useAuth, useDeals, useClaims)
├── types/             # TypeScript type definitions (50+ interfaces)
├── utils/             # Utility functions (empty, ready for expansion)
├── App.tsx            # Main app component with routing
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd saas-vendor-frontend
npm install
```

### 2. Configure Environment

Edit `.env.local` and set the API base URL:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

For production, change to your deployed backend URL.

### 3. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## Available Pages

### Authentication
- `/login` - User login
- `/register` - User registration

### Protected Routes (require login)
- `/deals` - Browse all available deals
- `/deals/:dealId` - View deal details and create claim
- `/profile` - User profile with edit functionality
- `/claims` - User's claims list

## API Integration

The frontend integrates with the backend API at `http://localhost:8000/api` by default.

### Services

All API calls are organized into service files:

- **authService** - Authentication endpoints (login, register, logout, etc.)
- **userService** - User profile endpoints
- **dealService** - Deal browsing and management
- **claimService** - Claims management
- **adminService** - Admin operations (KYC approval, stats)

### Features

- Automatic JWT token refresh on 401 errors
- Request/response interceptors for token management
- Type-safe API calls with TypeScript
- Error handling with user-friendly messages

## State Management

Using Zustand for centralized state:

- **authStore** - Authentication state (user, tokens, login/logout)
- **dealsStore** - Deals state (deals list, current deal)
- **userStore** - User profile state
- **claimsStore** - Claims state

## Custom Hooks

- **useAuth** - Access authentication state and actions
- **useDeals** - Access deals state and actions
- **useClaims** - Access claims state and actions

## Running with Backend

1. **Start the backend**:
   ```bash
   cd saas-vendor-backend
   npm run start
   ```
   The backend will run on `http://localhost:8000`

2. **Start the frontend** (in another terminal):
   ```bash
   cd saas-vendor-frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. **Test the application**:
   - Navigate to http://localhost:3000
   - Register a new account
   - Log in
   - Browse deals
   - Create claims
   - Manage your profile

## Build Instructions

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Docker
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=0 /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

Build and run:
```bash
docker build -t saas-vendor-frontend .
docker run -p 3000:3000 saas-vendor-frontend
```

## Troubleshooting

### 401 Unauthorized Errors
- Make sure the backend is running on `http://localhost:8000`
- Check that your tokens are being stored in localStorage
- Verify the API_BASE_URL in .env.local

### CORS Errors
- Ensure the backend has CORS enabled for `http://localhost:3000`
- Check backend configuration

### Build Errors
- Delete `node_modules` and run `npm install` again
- Clear Vite cache: `rm -rf dist && npm run build`

## Development Tips

- Use React DevTools browser extension for debugging
- Check Network tab in DevTools to inspect API calls
- Console logs are available in the browser DevTools
- Zustand DevTools can be integrated for state debugging

## Next Steps

1. ✅ Clone/run the frontend with `npm install && npm run dev`
2. ✅ Ensure backend is running on `http://localhost:8000`
3. ✅ Test user flow: register → login → browse deals → claim → profile
4. ✅ Deploy frontend to Vercel/Netlify
5. ✅ Deploy backend (Heroku, Railway, or AWS)
6. ✅ Update `.env` with production API URL
7. ✅ Test integrated system in production

## Support

For issues or questions:
1. Check the backend logs: `npm run start` in backend folder
2. Check browser console for client-side errors
3. Verify environment variables are set correctly
4. Ensure both frontend and backend are running

---

**Ready to use!** Start developing with `npm run dev`
