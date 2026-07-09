# Customer Service Operations

**Portfolio Project**

Customer Service Operations is a portfolio web application built to simulate a real-world customer support environment.

The project focuses on the frontend architecture of a business application where different user roles — admin, manager and customer — interact with tickets, dashboards, notifications and user management workflows.

It was developed to demonstrate modern Angular development practices, including role-based access control, protected routes, reactive forms, API-driven data handling, reusable UI > components and dashboard-oriented interfaces.

 **Project Goals**
 
The goal of this project is to demonstrate the ability to build a structured Angular business application with:

- authentication and role-based authorization
- protected routing and route guards
- ticket lifecycle management
- role-specific dashboards
- CRUD operations for users and tickets
- Firebase integration
- maintainable frontend architecture
- reusable components and services
- Angular Signals and RxJS-based state handling

## Features

### Authentication & Authorization

- Firebase Authentication
- Role-based access control
- Protected routes with Angular Guards
- User session management

### Ticket Management

- Create support tickets
- Update ticket information
- Assign tickets to managers
- Claim unassigned tickets
- Track ticket lifecycle
- Priority management
- Department-based ticket routing

### User Management

- Create, edit and delete customers
- Create, edit and delete managers
- Department assignment for managers
- User administration dashboard

### Dashboards

#### Customer Dashboard

- Open tickets
- Assigned tickets
- Ongoing tickets
- Resolved tickets
- Closed tickets

#### Manager Dashboard

- Unassigned department tickets
- Assigned tickets
- High-priority tickets
- Overdue ticket monitoring
- Operational notifications

#### Admin Dashboard

- Ticket statistics
- Customer overview
- Manager overview
- Department analytics

### Notification System

- In-app activity feed
- Read / unread tracking
- Archive functionality
- Ticket-related system notifications

---

## Tech Stack

### Frontend

- Angular 21
- TypeScript
- RxJS
- Angular Signals
- Angular Material
- TailwindCSS

### Backend & Services

- Firebase Authentication
- Cloud Firestore

### Architecture & Design Patterns
- Feature-based Architecture
- Service-Oriented Design
- Dependency Injection
- Route Guards
- Role-Based Access Control (RBAC)
- Reactive Forms
- Reusable Components
- Data Mapping Layer

### State Management

- Angular Signals
- RxJS Observables
- Computed Signals

### Security

- Firebase Authentication
- Role-Based Authorization
- Route Protection
- User Session Management
---

## Authorization

Use the following credentials to access the application.

### Admin

Email: admin@admin.com
Password: admin.

### Manager

Email: firstName.lastName@manager.com
Password: firstName.lastName

### Customer

Email: firstName.lastName@companyName.com
Password: firstName.lastName


## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Angular CLI

### Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### Running the Application

```bash
npm start
```
## The Application wil be available at: 
 
 http://localhost:4200



