# Tasheel Frontend

Frontend web application for the Tasheel Healthcare Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
VITE_API_URL=http://localhost:3000/api
```

3. Start development server:
```bash
npm run dev
```

The application will run on `http://localhost:3001`

## Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── services/       # API service layer
├── store/          # Redux store
├── utils/          # Utility functions
├── App.jsx         # Main App component
└── main.jsx        # Entry point
```
