# API Documentation

## Overview

The API is built on Supabase and provides endpoints for authentication, user management, and financial operations.

## Authentication

### Login
```typescript
POST /auth/login
Content-Type: application/json

{
  "email": string,
  "password": string
}

Response: {
  "user": User,
  "session": Session
}
```

### Register
```typescript
POST /auth/register
Content-Type: application/json

{
  "email": string,
  "password": string,
  "name": string
}

Response: {
  "user": User,
  "session": Session
}
```

## User Management

### Get User Profile
```typescript
GET /users/profile
Authorization: Bearer <token>

Response: {
  "id": string,
  "email": string,
  "name": string,
  "created_at": string
}
```

### Update User Profile
```typescript
PATCH /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": string,
  "avatar_url": string
}

Response: {
  "id": string,
  "email": string,
  "name": string,
  "avatar_url": string
}
```

## Financial Operations

### Get Balance
```typescript
GET /wallet/balance
Authorization: Bearer <token>

Response: {
  "balance": number,
  "currency": string
}
```

### Create Transaction
```typescript
POST /transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": number,
  "type": "DEPOSIT" | "WITHDRAWAL",
  "currency": string
}

Response: {
  "id": string,
  "amount": number,
  "type": string,
  "status": string,
  "created_at": string
}
```

## Launchpad Operations

### Get Launchpad Projects
```typescript
GET /launchpad/projects
Authorization: Bearer <token>

Response: {
  "projects": Array<{
    "id": string,
    "name": string,
    "description": string,
    "status": string,
    "start_date": string,
    "end_date": string
  }>
}
```

### Participate in Project
```typescript
POST /launchpad/projects/:id/participate
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": number
}

Response: {
  "id": string,
  "project_id": string,
  "amount": number,
  "status": string,
  "created_at": string
}
```

## Error Handling

All API endpoints follow a consistent error response format:

```typescript
{
  "error": {
    "code": string,
    "message": string,
    "details": object
  }
}
```

Common error codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- User endpoints: 60 requests per minute
- Financial endpoints: 30 requests per minute
- Launchpad endpoints: 30 requests per minute

## WebSocket Events

The API provides real-time updates through WebSocket connections:

```typescript
// Connect to WebSocket
const ws = new WebSocket('wss://api.example.com/ws')

// Subscribe to events
ws.send(JSON.stringify({
  type: 'SUBSCRIBE',
  channels: ['transactions', 'balance']
}))

// Event types
interface WebSocketEvent {
  type: 'TRANSACTION' | 'BALANCE_UPDATE',
  data: any
}
``` 