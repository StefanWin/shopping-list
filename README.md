# Shopping List

A simple shopping list web application built with React, TypeScript, and Convex.

## Features

- Add items with quantities
- Check off items as you shop
- Edit item names and quantities
- Delete items
- Private per-browser storage (each browser has its own list)

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Convex

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up Convex:
```bash
pnpm convex:dev
```

Follow the prompts to create a new Convex project. This will:
- Create a Convex account or log you in
- Set up your deployment
- Generate a `.env.local` file with your `VITE_CONVEX_URL`

3. In a separate terminal, start the dev server:
```bash
pnpm dev
```

4. Open your browser to `http://localhost:5173`

## Development

Run both servers concurrently:

- Terminal 1: `pnpm convex:dev` (Convex backend)
- Terminal 2: `pnpm dev` (Vite frontend)

## Build

```bash
pnpm build
```

## How It Works

The app uses `localStorage` to generate a unique device ID for each browser. All shopping list items are associated with this device ID, so each browser maintains its own separate list while data is stored in Convex.
