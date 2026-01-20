# PickMyLab Backend API

Backend API server for the PickMyLab Healthcare Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials and other configuration.

4. Make sure PostgreSQL is running and the database is created:
```bash
createdb pickmylab_db
psql -U postgres -d pickmylab_db -f ../database_schema.sql
```

5. Create logs directory:
```bash
mkdir logs
```

6. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

- Health check: `GET /health`
- API info: `GET /api`

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utility functions
├── app.js           # Express app setup
└── server.js         # Server entry point
```

## Development

The server runs on `http://localhost:3000` by default.

## Environment Variables

See `.env.example` for all required environment variables.
