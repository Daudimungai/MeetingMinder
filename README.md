# MeetingMinder

A comprehensive security management system for tracking and managing security operations.

## Features

- User authentication and role-based access control
- Dashboard with real-time statistics and performance metrics
- Guard management and scheduling
- Client and location management
- Activity tracking and reporting

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL with Drizzle ORM
- Authentication: JWT

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Daudimungai/MeetingMinder.git
cd MeetingMinder
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

4. Start the development server:
```bash
npm run dev
```

## Default Users

The system comes with the following default users:

1. Admin:
   - Username: `admin`
   - Password: `admin123`

2. Chief of Staff:
   - Username: `chief`
   - Password: `chief123`

3. Team Leader:
   - Username: `teamlead`
   - Password: `team123`

4. Guard:
   - Username: `guard1`
   - Password: `guard123`

## License

MIT 