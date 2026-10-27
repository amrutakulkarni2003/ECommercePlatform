# ShopNet Frontend

React 19 + Vite single-page storefront for the ShopNet e-commerce platform.

See the [project README](../README.md) for full setup, API details, and screenshots.

## Run

```powershell
npm install
npm run dev
```

The app runs at http://localhost:5173 and calls the API at
`http://localhost:5000/api` by default.

To point it at a different backend, create `.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |
