# Zionra customer Create Account screen

Copy the `apps` folder into the Zionra project root and allow the included files to replace files with the same paths.

## Included files

```text
apps/web/.env.local.example
apps/web/src/app/create-account/page.tsx
apps/web/src/components/auth/CreateCustomerAccountForm.tsx
apps/web/src/components/ui/LoadingSpinner.tsx
apps/web/src/config/env.ts
apps/web/src/config/routes.ts
apps/web/src/lib/api.ts
```

The implementation uses the existing global design system in `apps/web/src/app/globals.css`. It does not replace that file.

The following existing public assets are required:

```text
apps/web/public/images/logo-zionra.png
apps/web/public/images/man-smiling.svg
apps/web/public/images/woman.svg
apps/web/public/images/Ellipse.svg
```

`NEXT_PUBLIC_API_URL` defaults centrally to `http://localhost:4000`. To configure it explicitly, copy:

```text
apps/web/.env.local.example
```

to:

```text
apps/web/.env.local
```

Run from `apps/web`:

```powershell
npm run build
npm run dev
```

Open:

```text
http://localhost:3000/create-account
```
