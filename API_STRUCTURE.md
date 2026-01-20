# TASHEEL HEALTHCARE PLATFORM - API STRUCTURE

## Base URL
```
Production: https://api.tasheel.health
Development: http://localhost:3000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. AUTHENTICATION & USER MANAGEMENT

### POST /api/auth/register
Register new patient user
```json
Request Body:
{
  "email": "user@example.com",
  "phone": "+971501234567",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-15",
  "gender": "male"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### POST /api/auth/login
Login with email/phone and password
```json
Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### POST /api/auth/otp/send
Send OTP for phone verification
```json
Request Body:
{
  "phone": "+971501234567"
}
```

### POST /api/auth/otp/verify
Verify OTP
```json
Request Body:
{
  "phone": "+971501234567",
  "otp": "123456"
}
```

### POST /api/auth/forgot-password
Request password reset
```json
Request Body:
{
  "email": "user@example.com"
}
```

### POST /api/auth/reset-password
Reset password with token
```json
Request Body:
{
  "token": "reset_token",
  "password": "newPassword123"
}
```

### GET /api/auth/me
Get current user profile
```json
Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "patient",
    ...
  }
}
```

### PUT /api/auth/profile
Update user profile
```json
Request Body:
{
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-15",
  "blood_type": "O+",
  "allergies": "Peanuts, Shellfish",
  "medications": "Aspirin 100mg daily"
}
```

---

## 2. ADDRESS MANAGEMENT

### GET /api/addresses
Get all user addresses
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "address_type": "home",
      "address_line1": "123 Main St",
      "city": "Dubai",
      "is_default": true,
      ...
    }
  ]
}
```

### POST /api/addresses
Create new address
```json
Request Body:
{
  "address_type": "home",
  "address_line1": "123 Main St",
  "address_line2": "Apt 4B",
  "city": "Dubai",
  "postal_code": "12345",
  "latitude": 25.2048,
  "longitude": 55.2708,
  "is_default": true
}
```

### PUT /api/addresses/:id
Update address

### DELETE /api/addresses/:id
Delete address

---

## 3. TEST CATALOG & SEARCH

### GET /api/tests/categories
Get all test categories
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "General Health",
      "slug": "general-health",
      "description": "...",
      "icon_url": "..."
    }
  ]
}
```

### GET /api/tests
Get all tests with filters
```
Query Parameters:
- category_id: Filter by category
- search: Search by test name
- lab_partner_id: Filter by lab
- min_price, max_price: Price range
- page, limit: Pagination

Response:
{
  "success": true,
  "data": {
    "tests": [
      {
        "id": "uuid",
        "name": "Complete Blood Count (CBC)",
        "code": "CBC",
        "category": { ... },
        "sample_type": "blood",
        "pricing": [
          {
            "lab_partner": { ... },
            "price": 150.00,
            "turnaround_time_hours": 24,
            "rating": 4.5
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

### GET /api/tests/:id
Get test details with all lab pricing
```json
Response:
{
  "success": true,
  "data": {
    "test": { ... },
    "pricing": [ ... ],
    "related_tests": [ ... ]
  }
}
```

### GET /api/tests/popular
Get popular/trending tests
```json
Response:
{
  "success": true,
  "data": [
    { ... }
  ]
}
```

### GET /api/tests/bundles
Get test bundles/packages
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Complete Health Package",
      "description": "...",
      "discount_percentage": 15,
      "tests": [ ... ],
      "total_price": 500.00,
      "discounted_price": 425.00
    }
  ]
}
```

---

## 4. LAB PARTNERS

### GET /api/labs
Get all lab partners
```json
Query Parameters:
- city: Filter by city
- service_zone: Filter by service zone
- min_rating: Minimum rating

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Advanced Diagnostics",
      "rating": 4.5,
      "total_reviews": 120,
      "service_zones": ["Dubai", "Abu Dhabi"],
      ...
    }
  ]
}
```

### GET /api/labs/:id
Get lab partner details

---

## 5. BOOKINGS

### POST /api/bookings
Create new booking
```json
Request Body:
{
  "tests": [
    {
      "test_id": "uuid",
      "lab_partner_id": "uuid"
    }
  ],
  "bundles": ["uuid"], // Optional
  "collection_type": "home",
  "collection_address_id": "uuid",
  "preferred_date": "2026-01-15",
  "preferred_time_slot": "09:00-12:00",
  "special_requirements": "Difficult vein, fasting required"
}

Response:
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "TAS-2026-001234",
      "total_amount": 500.00,
      "final_amount": 425.00,
      "payment_status": "pending",
      ...
    }
  }
}
```

### GET /api/bookings
Get user bookings
```json
Query Parameters:
- status: Filter by status
- page, limit: Pagination

Response:
{
  "success": true,
  "data": {
    "bookings": [ ... ],
    "pagination": { ... }
  }
}
```

### GET /api/bookings/:id
Get booking details
```json
Response:
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "TAS-2026-001234",
      "status": "confirmed",
      "tests": [ ... ],
      "phlebotomist": { ... },
      "collection_address": { ... },
      "timeline": [
        {
          "event": "booking_created",
          "timestamp": "2026-01-10T10:00:00Z"
        },
        {
          "event": "phlebotomist_assigned",
          "timestamp": "2026-01-10T11:00:00Z"
        }
      ]
    }
  }
}
```

### PUT /api/bookings/:id/cancel
Cancel booking
```json
Request Body:
{
  "reason": "Change of plans"
}
```

### GET /api/bookings/:id/tracking
Get real-time booking tracking
```json
Response:
{
  "success": true,
  "data": {
    "current_status": "sample_collected",
    "phlebotomist": {
      "name": "Ahmed Ali",
      "phone": "+971501234567",
      "location": {
        "latitude": 25.2048,
        "longitude": 55.2708,
        "last_updated": "2026-01-15T10:30:00Z"
      },
      "eta_minutes": 15
    },
    "timeline": [ ... ]
  }
}
```

---

## 6. PAYMENTS

### POST /api/payments/initiate
Initiate payment
```json
Request Body:
{
  "booking_id": "uuid",
  "payment_method": "card" // or "cash", "wallet"
}

Response:
{
  "success": true,
  "data": {
    "payment_intent_id": "...",
    "client_secret": "...",
    "amount": 425.00
  }
}
```

### POST /api/payments/confirm
Confirm payment
```json
Request Body:
{
  "booking_id": "uuid",
  "payment_intent_id": "...",
  "transaction_id": "..."
}
```

### GET /api/payments/history
Get payment history

---

## 7. REPORTS

### GET /api/reports
Get all user reports
```json
Query Parameters:
- test_id: Filter by test
- date_from, date_to: Date range
- page, limit: Pagination

Response:
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "uuid",
        "report_number": "RPT-2026-001234",
        "report_date": "2026-01-15",
        "lab_partner": { ... },
        "tests": [ ... ],
        "status": "ready",
        "report_file_url": "...",
        "smart_report": {
          "id": "uuid",
          "body_system_analysis": { ... },
          "health_insights": "...",
          "recommendations": { ... }
        }
      }
    ],
    "pagination": { ... }
  }
}
```

### GET /api/reports/:id
Get report details
```json
Response:
{
  "success": true,
  "data": {
    "report": {
      "id": "uuid",
      "report_number": "RPT-2026-001234",
      "report_file_url": "...",
      "test_results": [
        {
          "test_name": "Complete Blood Count",
          "parameters": [
            {
              "parameter_name": "White Blood Cells",
              "result_value": "7.2",
              "unit": "K/μL",
              "reference_range": "4.5-11.0",
              "status": "normal"
            }
          ]
        }
      ],
      "smart_report": { ... }
    }
  }
}
```

### GET /api/reports/:id/smart
Get smart report with insights
```json
Response:
{
  "success": true,
  "data": {
    "smart_report": {
      "body_system_analysis": {
        "heart": { "status": "normal", "related_tests": [...] },
        "blood": { "status": "normal", "related_tests": [...] },
        "digestive": { "status": "caution", "related_tests": [...] }
      },
      "health_insights": "...",
      "recommendations": {
        "nutrition": [ ... ],
        "lifestyle": [ ... ],
        "medical": [ ... ]
      },
      "trend_analysis": {
        "comparison_with_previous": [ ... ],
        "charts": [ ... ]
      }
    }
  }
}
```

### GET /api/reports/:id/download
Download report PDF
```
Response: PDF file
```

### POST /api/reports/:id/share
Share report
```json
Request Body:
{
  "email": "doctor@example.com",
  "expiry_days": 7
}

Response:
{
  "success": true,
  "data": {
    "share_link": "https://tasheel.health/reports/shared/abc123",
    "expires_at": "2026-01-22T00:00:00Z"
  }
}
```

---

## 8. NOTIFICATIONS

### GET /api/notifications
Get user notifications
```json
Query Parameters:
- unread_only: true/false
- page, limit: Pagination

Response:
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "booking_confirmation",
        "title": "Booking Confirmed",
        "message": "Your booking TAS-2026-001234 has been confirmed",
        "read": false,
        "created_at": "2026-01-10T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### PUT /api/notifications/:id/read
Mark notification as read

### PUT /api/notifications/preferences
Update notification preferences
```json
Request Body:
{
  "email_enabled": true,
  "sms_enabled": true,
  "push_enabled": true,
  "whatsapp_enabled": false,
  "booking_confirmation": true,
  "report_ready": true
}
```

---

## 9. RATINGS & REVIEWS

### POST /api/ratings
Submit rating
```json
Request Body:
{
  "booking_id": "uuid",
  "rated_entity_type": "phlebotomist",
  "rated_entity_id": "uuid",
  "rating": 5,
  "review_text": "Excellent service!"
}
```

### GET /api/ratings
Get ratings (for lab partners, phlebotomists)

---

## 10. ADMIN ENDPOINTS

### GET /api/admin/dashboard/stats
Get dashboard statistics
```json
Response:
{
  "success": true,
  "data": {
    "total_bookings": 1250,
    "pending_bookings": 45,
    "today_bookings": 23,
    "revenue_today": 11500.00,
    "revenue_month": 250000.00,
    "active_phlebotomists": 15,
    "active_labs": 8
  }
}
```

### GET /api/admin/bookings
Get all bookings (admin view)
```json
Query Parameters:
- status: Filter by status
- date_from, date_to: Date range
- phlebotomist_id: Filter by phlebotomist
- lab_partner_id: Filter by lab
- page, limit: Pagination
```

### PUT /api/admin/bookings/:id/assign-phlebotomist
Assign phlebotomist to booking
```json
Request Body:
{
  "phlebotomist_id": "uuid"
}
```

### PUT /api/admin/bookings/:id/status
Update booking status
```json
Request Body:
{
  "status": "confirmed",
  "notes": "Optional notes"
}
```

### GET /api/admin/phlebotomists
Get all phlebotomists
```json
Query Parameters:
- available_only: true/false
- service_zone: Filter by zone
```

### GET /api/admin/phlebotomists/:id/stock
Get phlebotomist stock levels

### GET /api/admin/reports/analytics
Get analytics and reports

---

## 11. CONTENT MANAGEMENT

### GET /api/content/faqs
Get FAQs
```json
Query Parameters:
- category: Filter by category

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "question": "How do I book a test?",
      "answer": "...",
      "category": "booking"
    }
  ]
}
```

### GET /api/content/about
Get about us content

### GET /api/content/contact
Get contact information

### GET /api/content/terms
Get terms and conditions

---

## ERROR RESPONSES

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... } // Optional additional details
  }
}
```

### Common Error Codes:
- `AUTH_REQUIRED`: Authentication required
- `AUTH_INVALID`: Invalid credentials
- `AUTH_EXPIRED`: Token expired
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `PERMISSION_DENIED`: Insufficient permissions
- `PAYMENT_FAILED`: Payment processing failed
- `BOOKING_CONFLICT`: Booking time conflict
- `SERVER_ERROR`: Internal server error

---

## RATE LIMITING

- Public endpoints: 100 requests per 15 minutes
- Authenticated endpoints: 1000 requests per 15 minutes
- Admin endpoints: 5000 requests per 15 minutes

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```
