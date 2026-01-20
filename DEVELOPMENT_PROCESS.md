# TASHEEL HEALTHCARE PLATFORM - DEVELOPMENT PROCESS

## Overview
This document outlines the development process, coding standards, and best practices for building the Tasheel Healthcare Platform.

---

## 1. DEVELOPMENT WORKFLOW

### 1.1 Git Workflow
- **Main Branch**: `main` (production-ready code)
- **Development Branch**: `develop` (integration branch)
- **Feature Branches**: `feature/feature-name` (new features)
- **Hotfix Branches**: `hotfix/issue-name` (urgent fixes)

### 1.2 Branch Naming Convention
```
feature/user-authentication
feature/booking-system
bugfix/payment-gateway-error
hotfix/critical-security-patch
```

### 1.3 Commit Messages
Follow conventional commits:
```
feat: add user registration endpoint
fix: resolve booking status update issue
docs: update API documentation
refactor: improve error handling middleware
test: add unit tests for booking service
chore: update dependencies
```

---

## 2. CODING STANDARDS

### 2.1 JavaScript/Node.js

**Naming Conventions:**
- Variables and functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Classes: `PascalCase`
- Files: `camelCase.js` or `kebab-case.js`

**Example:**
```javascript
// Good
const userEmail = 'user@example.com';
const MAX_RETRY_ATTEMPTS = 3;

function calculateTotalPrice(items) {
  // ...
}

class BookingService {
  // ...
}

// Bad
const user_email = 'user@example.com';
const maxRetryAttempts = 3;
```

**Code Style:**
- Use 2 spaces for indentation
- Use single quotes for strings
- Always use semicolons
- Maximum line length: 100 characters
- Use async/await instead of callbacks

**Example:**
```javascript
// Good
async function createBooking(bookingData) {
  try {
    const validatedData = await validateBookingData(bookingData);
    const booking = await db.query(
      'INSERT INTO bookings (...) VALUES (...) RETURNING *',
      [validatedData]
    );
    return booking.rows[0];
  } catch (error) {
    logger.error('Error creating booking:', error);
    throw new Error('Failed to create booking');
  }
}

// Bad
function createBooking(bookingData, callback) {
  validateBookingData(bookingData, function(err, validatedData) {
    if (err) {
      callback(err);
      return;
    }
    db.query('INSERT INTO bookings...', function(err, result) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, result);
    });
  });
}
```

### 2.2 React/JSX

**Component Structure:**
```jsx
// Good
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './BookingCard.css';

const BookingCard = ({ booking, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Side effects
  }, []);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await onCancel(booking.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="booking-card">
      {/* JSX */}
    </div>
  );
};

BookingCard.propTypes = {
  booking: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default BookingCard;
```

**Hooks Usage:**
- Use custom hooks for reusable logic
- Keep hooks at the top level
- Include all dependencies in dependency arrays

### 2.3 SQL/PostgreSQL

**Query Formatting:**
```sql
-- Good: Use parameterized queries
SELECT * 
FROM bookings 
WHERE user_id = $1 
  AND status = $2 
  AND created_at >= $3
ORDER BY created_at DESC
LIMIT $4 OFFSET $5;

-- Bad: String concatenation (SQL injection risk)
SELECT * FROM bookings WHERE user_id = '${userId}';
```

**Naming:**
- Tables: `snake_case` (plural)
- Columns: `snake_case`
- Indexes: `idx_table_column`
- Foreign keys: `fk_table_referenced_table`

---

## 3. API DEVELOPMENT

### 3.1 Request/Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Email is required",
      "phone": "Phone number is invalid"
    }
  }
}
```

### 3.2 HTTP Status Codes
- `200 OK`: Successful GET, PUT, PATCH
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `422 Unprocessable Entity`: Business logic errors
- `500 Internal Server Error`: Server errors

### 3.3 API Versioning
Use URL versioning:
```
/api/v1/bookings
/api/v1/tests
```

---

## 4. DATABASE PRACTICES

### 4.1 Migrations
- Always use migrations for schema changes
- Never modify production schema directly
- Test migrations on staging first

**Migration Naming:**
```
20240110_create_users_table.js
20240115_add_booking_status_index.js
```

### 4.2 Query Optimization
- Use indexes for frequently queried columns
- Avoid SELECT * (select only needed columns)
- Use JOINs efficiently
- Implement pagination for large datasets

**Example:**
```javascript
// Good: Paginated query
const getBookings = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT id, booking_number, status, total_amount, created_at
    FROM bookings
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  return await db.query(query, [userId, limit, offset]);
};

// Bad: Fetching all records
const getBookings = async (userId) => {
  const query = 'SELECT * FROM bookings WHERE user_id = $1';
  return await db.query(query, [userId]);
};
```

### 4.3 Transactions
Use transactions for operations that must succeed or fail together:

```javascript
const createBookingWithPayment = async (bookingData, paymentData) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    
    // Create booking
    const bookingResult = await client.query(
      'INSERT INTO bookings (...) VALUES (...) RETURNING *',
      [bookingData]
    );
    
    // Process payment
    const paymentResult = await client.query(
      'INSERT INTO payments (...) VALUES (...) RETURNING *',
      [paymentData]
    );
    
    await client.query('COMMIT');
    return { booking: bookingResult.rows[0], payment: paymentResult.rows[0] };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
```

---

## 5. ERROR HANDLING

### 5.1 Backend Error Handling

**Centralized Error Handler:**
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: err.details
      }
    });
  }

  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Record already exists'
      }
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : err.message
    }
  });
};
```

### 5.2 Frontend Error Handling

```javascript
// services/api.js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.error?.message || 'An error occurred';
    
    // Show user-friendly error message
    toast.error(errorMessage);
    
    // Handle specific errors
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
```

---

## 6. TESTING

### 6.1 Unit Tests
Test individual functions and methods:

```javascript
// tests/unit/bookingService.test.js
describe('BookingService', () => {
  describe('calculateTotalPrice', () => {
    it('should calculate total price correctly', () => {
      const tests = [
        { price: 100 },
        { price: 150 },
        { price: 200 }
      ];
      const total = BookingService.calculateTotalPrice(tests);
      expect(total).toBe(450);
    });

    it('should apply discount correctly', () => {
      const tests = [{ price: 100 }];
      const discount = 10;
      const total = BookingService.calculateTotalPrice(tests, discount);
      expect(total).toBe(90);
    });
  });
});
```

### 6.2 Integration Tests
Test API endpoints:

```javascript
// tests/integration/bookingRoutes.test.js
describe('POST /api/bookings', () => {
  it('should create a new booking', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tests: [{ test_id: 'test-uuid', lab_partner_id: 'lab-uuid' }],
        collection_type: 'home',
        preferred_date: '2026-01-15'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.booking).toHaveProperty('id');
  });
});
```

### 6.3 Test Coverage
- Aim for at least 70% code coverage
- Focus on critical business logic
- Test error cases as well as success cases

---

## 7. SECURITY BEST PRACTICES

### 7.1 Authentication & Authorization
- Always validate JWT tokens
- Use role-based access control (RBAC)
- Implement session timeout
- Store passwords with bcrypt (never plain text)

### 7.2 Input Validation
- Validate all user inputs
- Sanitize data before database operations
- Use parameterized queries (prevent SQL injection)
- Validate file uploads (type, size)

### 7.3 Data Protection
- Encrypt sensitive data at rest
- Use HTTPS in production
- Implement rate limiting
- Log security events
- Regular security audits

---

## 8. DEPLOYMENT

### 8.1 Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] API documentation updated
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Backup strategy in place

### 8.2 Deployment Steps
1. Run database migrations
2. Build frontend assets
3. Deploy backend
4. Deploy frontend
5. Verify deployment
6. Monitor for errors

### 8.3 Rollback Plan
- Keep previous version available
- Database migration rollback scripts
- Quick rollback procedure documented

---

## 9. DOCUMENTATION

### 9.1 Code Documentation
- Document all public functions/methods
- Include parameter descriptions
- Add examples for complex functions
- Keep README files updated

### 9.2 API Documentation
- Use Swagger/OpenAPI for API docs
- Include request/response examples
- Document error codes
- Keep documentation in sync with code

---

## 10. CODE REVIEW PROCESS

### 10.1 Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included
- [ ] Error handling is proper
- [ ] Security considerations addressed
- [ ] Performance optimized
- [ ] Documentation updated

### 10.2 Review Process
1. Developer creates feature branch
2. Developer opens pull request
3. At least one reviewer approves
4. All CI checks pass
5. Merge to develop branch
6. Deploy to staging
7. QA testing
8. Merge to main
9. Deploy to production

---

## 11. MONITORING & LOGGING

### 11.1 Logging
- Use structured logging
- Log levels: ERROR, WARN, INFO, DEBUG
- Include request IDs for tracing
- Don't log sensitive information

### 11.2 Monitoring
- Monitor API response times
- Track error rates
- Monitor database performance
- Set up alerts for critical errors

---

## 12. CONTINUOUS IMPROVEMENT

- Regular code reviews
- Refactor technical debt
- Update dependencies
- Performance optimization
- Security updates
- User feedback integration
