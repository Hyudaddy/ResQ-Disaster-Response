# ResQ API Documentation

## Overview

The ResQ API provides a comprehensive set of endpoints for managing disaster response operations. All API endpoints are RESTful and return JSON responses. The base URL for all API requests is `https://api.resq-platform.com/v1`.

## Authentication

All API requests require authentication using JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API uses standard HTTP status codes and returns error responses in the following format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional error details
  }
}
```

## Endpoints

### Authentication

#### POST /auth/login
Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "role": "string",
    "name": "string"
  }
}
```

### Incidents

#### GET /incidents
Retrieves a list of incidents with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by incident status
- `priority` (optional): Filter by priority level
- `location` (optional): Filter by location
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Response:**
```json
{
  "incidents": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "string",
      "priority": "string",
      "location": {
        "latitude": "number",
        "longitude": "number",
        "address": "string"
      },
      "created_at": "string",
      "updated_at": "string"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

#### POST /incidents
Creates a new incident.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "priority": "string",
  "location": {
    "latitude": "number",
    "longitude": "number",
    "address": "string"
  }
}
```

**Response:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "location": {
    "latitude": "number",
    "longitude": "number",
    "address": "string"
  },
  "created_at": "string",
  "updated_at": "string"
}
```

### Resources

#### GET /resources
Retrieves available resources with optional filtering.

**Query Parameters:**
- `type` (optional): Filter by resource type
- `status` (optional): Filter by availability status
- `location` (optional): Filter by location
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Response:**
```json
{
  "resources": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "status": "string",
      "quantity": "number",
      "location": {
        "latitude": "number",
        "longitude": "number",
        "address": "string"
      }
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

### Teams

#### GET /teams
Retrieves a list of response teams.

**Query Parameters:**
- `status` (optional): Filter by team status
- `specialization` (optional): Filter by team specialization
- `location` (optional): Filter by location
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Response:**
```json
{
  "teams": [
    {
      "id": "string",
      "name": "string",
      "specialization": "string",
      "status": "string",
      "members": [
        {
          "id": "string",
          "name": "string",
          "role": "string"
        }
      ],
      "location": {
        "latitude": "number",
        "longitude": "number",
        "address": "string"
      }
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

### Communications

#### POST /communications/broadcast
Sends a broadcast message to all active users.

**Request Body:**
```json
{
  "message": "string",
  "priority": "string",
  "target_roles": ["string"]
}
```

**Response:**
```json
{
  "id": "string",
  "message": "string",
  "priority": "string",
  "sent_at": "string",
  "recipients": "number"
}
```

### Analytics

#### GET /analytics/incidents
Retrieves incident analytics data.

**Query Parameters:**
- `timeframe` (required): Time period for analytics (day, week, month, year)
- `type` (optional): Type of analytics data

**Response:**
```json
{
  "total_incidents": "number",
  "by_status": {
    "active": "number",
    "resolved": "number",
    "pending": "number"
  },
  "by_priority": {
    "high": "number",
    "medium": "number",
    "low": "number"
  },
  "response_times": {
    "average": "number",
    "min": "number",
    "max": "number"
  }
}
```

## Rate Limiting

API requests are subject to rate limiting:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in all responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1625097600
```

## WebSocket Events

The API provides real-time updates through WebSocket connections at `wss://api.resq-platform.com/v1/ws`.

### Event Types

1. **incident_update**
```json
{
  "type": "incident_update",
  "data": {
    "id": "string",
    "status": "string",
    "updated_at": "string"
  }
}
```

2. **resource_status**
```json
{
  "type": "resource_status",
  "data": {
    "id": "string",
    "status": "string",
    "location": {
      "latitude": "number",
      "longitude": "number"
    }
  }
}
```

3. **team_location**
```json
{
  "type": "team_location",
  "data": {
    "id": "string",
    "location": {
      "latitude": "number",
      "longitude": "number"
    }
  }
}
```

## Versioning

The API is versioned through the URL path. The current version is v1. Future versions will be released as v2, v3, etc. Each version will maintain backward compatibility for at least one year after the release of the next version.

## Support

For API support and questions, contact:
- Email: api-support@resq-platform.com
- Documentation: https://docs.resq-platform.com
- Status Page: https://status.resq-platform.com 