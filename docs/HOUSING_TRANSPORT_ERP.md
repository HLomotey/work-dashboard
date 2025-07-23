# Housing & Transport ERP System

## Overview

The Housing & Transport ERP system is integrated into the existing Corporate Dashboard to manage staff housing, transportation services, and related billing processes for BOH Concepts' hospitality operations.

## Setup Instructions

### 1. Environment Configuration

Copy the `.env.local.example` file to `.env.local` and configure your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Update the following variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### 2. Database Setup

The system uses Supabase PostgreSQL database. You'll need to create the following tables in your Supabase project:

- `properties` - Housing properties
- `rooms` - Individual rooms within properties
- `staff` - Staff/employee information
- `room_assignments` - Room assignment tracking
- `vehicles` - Transport vehicle registry
- `trips` - Trip logging and tracking
- `billing_periods` - Billing cycle management
- `charges` - Individual charges for staff
- `audit_logs` - System audit trail

### 3. Authentication

The system uses Supabase Auth with role-based access control:

- **Admin**: Full system access
- **HR Manager**: Staff management and self-service oversight
- **Property Manager**: Housing and room management
- **Transport Manager**: Vehicle and trip management
- **Finance Manager**: Billing and payroll export
- **Staff**: Self-service portal access

### 4. Navigation Structure

The Housing & Transport ERP is integrated into the existing Operations department:

```
/operations/
├── housing/
│   ├── properties/
│   ├── assignments/
│   └── analytics/
├── transport/
│   ├── vehicles/
│   ├── trips/
│   └── analytics/
└── billing/
    ├── periods/
    ├── charges/
    └── export/
```

## Features

### Housing Management
- Property and room registry
- Staff housing assignments
- Occupancy tracking and analytics
- Move-in/move-out processing

### Transport Management
- Vehicle registry and maintenance tracking
- Trip logging with passenger management
- Route optimization and cost analysis
- Fleet utilization analytics

### Billing & Payroll Integration
- Automated charge calculation with proration
- Billing period management
- Payroll export functionality
- Cost allocation and reporting

### Staff Self-Service
- Housing assignment viewing
- Billing transparency
- Profile management
- Request submission

## Development

### Custom Hooks

The system uses custom React hooks for data management:

- `useProperties()` - Property management
- `useRooms()` - Room management
- `useRoomAssignments()` - Assignment tracking
- `useVehicles()` - Vehicle registry
- `useTrips()` - Trip management
- `useBilling()` - Billing operations

### Component Structure

Components are organized by domain:

```
components/
├── housing/
├── transport/
├── billing/
└── shared/
```

### Type Safety

All data models are fully typed with TypeScript interfaces and Zod validation schemas for runtime type checking.

## Support

For technical support or questions about the Housing & Transport ERP system, please refer to the implementation documentation or contact the development team.