#!/bin/sh

bun run drizzle-kit migrate

if [ "$NODE_ENV" = "production" ]; then
  # Run the production server
  bun run start
else
  # Run the development server
  bun run dev
fi
