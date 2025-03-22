# Logistics Backend System

A modular backend system that powers a multi-platform logistics network, supporting different user roles and interfaces.

## System Overview

This backend system is designed to handle Shipments, Shipment Loads, and Load Items for a logistics company. It supports multiple platforms (web and mobile apps) for different user roles (Shippers, Forwarders, Admins) and provides a public API for the landing page.

### Core Domain Model

```
Shipment
└── Shipment Loads
    └── Load Items
```

Load Items can be of different types:

- FCL Containers (20ft, 40ft, 45ft)
- LCL Cargos/Pallets (by weight and CBM)
- RORO Cars/Machinery (by quantity and units)
- Air Freight Packages (by weight and CBM)

### Platform Support

The backend serves the following platforms:

- Shipper Web App
- Shipper Mobile App
- Forwarder Web App
- Forwarder Mobile App
- Admin Console
- Landing Page Website (public-facing)

### Role-Based Access

- **Shippers**: Can create and manage their own shipments
- **Forwarders**: Can view, assign, and update shipment loads
- **Admins**: Have full control over all resources
- **Public**: Read-only access to specific public data

## Technology Stack

- Node.js with TypeScript
- Express.js for API routes
- MongoDB with Mongoose ODM
- JWT for authentication
- Express-validator for input validation

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB
- Yarn or npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   yarn install
   ```
3. Configure environment variables (create a `.env` file based on `.env.example`)
4. Start the development server:
   ```
   yarn dev
   ```

### Build for Production

```
yarn transpile
yarn start
```

### Run Tests

```
yarn test
```

## API Documentation

API documentation is available in the `docs/api` directory and can be accessed at `/api-docs` when the server is running.

## Platform-Specific Behavior

The API detects the platform making the request via the `X-Platform` header and adjusts responses accordingly:

- **Web Apps**: Receive complete data with all available fields
- **Mobile Apps**: Receive optimized responses with essential fields only
- **Admin Console**: Receives additional administrative data
- **Public Website**: Has access only to specific public endpoints

## Assumptions and Decisions

1. **Authentication**: JWT-based authentication is used for security
2. **Database**: MongoDB is used for flexibility with different Load Item types
3. **API Structure**: RESTful design with consistent patterns
4. **Platform Detection**: Based on request headers
5. **Scalability**: Modular architecture with separation of concerns
