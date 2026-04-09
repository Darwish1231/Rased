# Rased Platform (منصة راصد)

Professional electrical station monitoring and incident management platform.

## Project Structure
This repository uses a mono-repo structure:
- **/frontend**: Next.js (App Router) application.
- **/backend**: NestJS API with Firebase integration.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Firebase Account
- Google Maps API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd station-monitor
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Fill in your .env variables
   npm run start:dev
   ```

3. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Fill in your .env variables
   npm run dev
   ```

## Documentation
- [Firebase Setup Guide](./FIREBASE_SETUP.md): Instructions for configuring the database and auth.
- [API Documentation (Swagger)](http://localhost:4000/api): Accessible when the backend is running.

## Database Seeding
To populate the database with sample power stations:
```bash
cd backend
npm run seed
```

## Admin Bootstrap
To set the initial administrator, add the user's email to the `ADMIN_BOOTSTRAP_EMAIL` variable in `backend/.env`. When that user logs in, they will be granted Admin permissions automatically.
