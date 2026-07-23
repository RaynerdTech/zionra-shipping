Zionra stabilization batch 4

Purpose:
Extract reusable frontend authentication components without changing routes,
API requests, database behavior, or approved responsive layouts.

Add:
apps/web/src/components/auth/shared/AuthBackArrowIcon.tsx
apps/web/src/components/auth/shared/AuthDecorativeCircles.tsx
apps/web/src/components/auth/shared/AuthPasswordField.tsx
apps/web/src/components/auth/shared/GoogleAuthButton.tsx

Replace:
apps/web/src/components/auth/CustomerLoginForm.tsx
apps/web/src/components/auth/CreateCustomerAccountForm.tsx
apps/web/src/components/auth/LinkGoogleAccountForm.tsx
apps/web/src/components/auth/CompleteGoogleProfileForm.tsx
apps/web/src/components/auth/AccountTypeSelector.tsx

After copying, run from the project root:
npm run build:web
npm test
