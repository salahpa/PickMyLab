# TASHEEL HEALTHCARE PLATFORM - PROJECT STRUCTURE

## Recommended Project Structure

```
tasheel-platform/
│
├── backend/                          # Backend API Server
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   ├── database.js          # Database connection
│   │   │   ├── jwt.js                # JWT configuration
│   │   │   └── env.js                # Environment variables
│   │   │
│   │   ├── models/                   # Database models (if using ORM)
│   │   │   ├── User.js
│   │   │   ├── Booking.js
│   │   │   ├── Test.js
│   │   │   ├── LabPartner.js
│   │   │   ├── Report.js
│   │   │   └── ...
│   │   │
│   │   ├── controllers/             # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── testController.js
│   │   │   ├── reportController.js
│   │   │   ├── adminController.js
│   │   │   └── ...
│   │   │
│   │   ├── services/                 # Business logic
│   │   │   ├── authService.js
│   │   │   ├── bookingService.js
│   │   │   ├── paymentService.js
│   │   │   ├── notificationService.js
│   │   │   ├── smartReportService.js
│   │   │   └── ...
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   ├── auth.js               # JWT authentication
│   │   │   ├── validation.js         # Input validation
│   │   │   ├── errorHandler.js       # Error handling
│   │   │   ├── rateLimiter.js        # Rate limiting
│   │   │   └── auditLogger.js        # Audit logging
│   │   │
│   │   ├── routes/                   # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── testRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   └── index.js
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── logger.js
│   │   │   ├── email.js
│   │   │   ├── sms.js
│   │   │   ├── otp.js
│   │   │   ├── fileUpload.js
│   │   │   └── ...
│   │   │
│   │   ├── validators/               # Input validators
│   │   │   ├── authValidator.js
│   │   │   ├── bookingValidator.js
│   │   │   └── ...
│   │   │
│   │   ├── migrations/               # Database migrations
│   │   │   └── ...
│   │   │
│   │   ├── seeds/                    # Database seeders
│   │   │   ├── testCategories.js
│   │   │   ├── labPartners.js
│   │   │   └── ...
│   │   │
│   │   └── app.js                    # Express app setup
│   │   └── server.js                 # Server entry point
│   │
│   ├── tests/                        # Backend tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── .env.example                  # Environment variables template
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── frontend/                         # Frontend Web Application
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   │
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Layout.jsx
│   │   │   │
│   │   │   ├── booking/
│   │   │   │   ├── BookingCard.jsx
│   │   │   │   ├── BookingForm.jsx
│   │   │   │   ├── BookingTracking.jsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── test/
│   │   │   │   ├── TestCard.jsx
│   │   │   │   ├── TestDetail.jsx
│   │   │   │   ├── PriceComparison.jsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── report/
│   │   │   │   ├── ReportCard.jsx
│   │   │   │   ├── ReportViewer.jsx
│   │   │   │   ├── SmartReport.jsx
│   │   │   │   ├── BodyDiagram.jsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── BookingManagement.jsx
│   │   │       └── ...
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Tests.jsx
│   │   │   ├── TestDetail.jsx
│   │   │   ├── Bookings.jsx
│   │   │   ├── BookingDetail.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── ReportDetail.jsx
│   │   │   ├── Admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Bookings.jsx
│   │   │   │   └── ...
│   │   │   └── ...
│   │   │
│   │   ├── services/                 # API service layer
│   │   │   ├── api.js                # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── bookingService.js
│   │   │   ├── testService.js
│   │   │   ├── reportService.js
│   │   │   └── ...
│   │   │
│   │   ├── store/                    # State management (Redux/Zustand)
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── bookingSlice.js
│   │   │   │   └── ...
│   │   │   └── store.js
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useBooking.js
│   │   │   └── ...
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   ├── formatters.js
│   │   │   └── ...
│   │   │
│   │   ├── context/                  # React Context (if not using Redux)
│   │   │   ├── AuthContext.jsx
│   │   │   └── ...
│   │   │
│   │   ├── styles/                   # Global styles
│   │   │   ├── variables.css
│   │   │   ├── global.css
│   │   │   └── ...
│   │   │
│   │   ├── App.jsx                   # Main App component
│   │   ├── App.css
│   │   ├── index.jsx                 # Entry point
│   │   └── index.css
│   │
│   ├── .env                          # Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── database/                          # Database related files
│   ├── schema.sql                    # Main schema file
│   ├── migrations/                   # Migration files
│   ├── seeds/                        # Seed data
│   └── backups/                      # Backup scripts
│
├── docs/                             # Documentation
│   ├── API_STRUCTURE.md
│   ├── IMPLEMENTATION_ROADMAP.md
│   ├── PROJECT_STRUCTURE.md
│   ├── DEVELOPMENT_PROCESS.md
│   └── ...
│
├── scripts/                          # Utility scripts
│   ├── setup.sh                      # Initial setup script
│   ├── deploy.sh                     # Deployment script
│   └── ...
│
├── .gitignore
├── README.md
└── docker-compose.yml                # Docker setup (optional)
```

---

## Backend Structure (Node.js/Express Example)

### Key Files:

**server.js**
```javascript
const app = require('./src/app');
const config = require('./src/config/env');

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**src/app.js**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

module.exports = app;
```

**src/routes/index.js**
```javascript
const express = require('express');
const authRoutes = require('./authRoutes');
const bookingRoutes = require('./bookingRoutes');
const testRoutes = require('./testRoutes');
const reportRoutes = require('./reportRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/bookings', bookingRoutes);
router.use('/tests', testRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
```

---

## Frontend Structure (React Example)

### Key Files:

**src/App.jsx**
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
// ... other imports

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            {/* ... other routes */}
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;
```

**src/services/api.js**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tasheel_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Email
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@tasheel.health

# SMS
SMS_SERVICE=twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Payment
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# File Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=tasheel-uploads
AWS_REGION=us-east-1

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
```

---

## Database Connection (Node.js/Express)

**src/config/database.js**
```javascript
const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
```

---

## Package.json Dependencies

### Backend (Node.js/Express)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "express-validator": "^7.0.1",
    "express-rate-limit": "^6.10.0",
    "nodemailer": "^6.9.4",
    "twilio": "^4.14.0",
    "stripe": "^13.0.0",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3"
  }
}
```

### Frontend (React)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "axios": "^1.5.0",
    "@reduxjs/toolkit": "^1.9.5",
    "react-redux": "^8.1.2",
    "react-hook-form": "^7.45.4",
    "date-fns": "^2.30.0",
    "recharts": "^2.8.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.4",
    "vite": "^4.4.5"
  }
}
```

---

## Development Workflow

1. **Setup**
   ```bash
   # Clone repository
   git clone <repo-url>
   cd tasheel-platform
   
   # Backend setup
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your values
   
   # Frontend setup
   cd ../frontend
   npm install
   cp .env.example .env
   
   # Database setup
   cd ../database
   psql -U postgres -d tasheel_db -f schema.sql
   ```

2. **Development**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

3. **Testing**
   ```bash
   # Backend tests
   cd backend
   npm test
   
   # Frontend tests
   cd frontend
   npm test
   ```

---

## Code Organization Principles

1. **Separation of Concerns**
   - Controllers handle HTTP requests/responses
   - Services contain business logic
   - Models handle data access
   - Utils contain reusable functions

2. **Error Handling**
   - Centralized error handling middleware
   - Consistent error response format
   - Proper HTTP status codes

3. **Validation**
   - Input validation at route level
   - Use validation libraries (express-validator, Joi)
   - Validate both request body and query parameters

4. **Security**
   - Always validate and sanitize inputs
   - Use parameterized queries (prevent SQL injection)
   - Implement rate limiting
   - Use HTTPS in production
   - Store sensitive data in environment variables

5. **Performance**
   - Use database indexes
   - Implement caching where appropriate
   - Optimize database queries
   - Use pagination for large datasets
