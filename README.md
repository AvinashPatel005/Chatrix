# Chatrix

A Real-Time Conversational Language Learning Platform.

## Setup Instructions

### 1. Backend

1. Navigate to `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` in the backend directory.
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend

1. Navigate to `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```

## Features

- **Auth**: JWT based Login/Register.
- **Matchmaking**: Find users learning your language.
- **Real-time Chat**: Socket.IO based messaging with streaks.
- **Translation**: Simulates real-time translation (Mock function).
- **Stats**: Tracks message counts and language pairs.

## Tech Stack

- MERN (MongoDB, Express, React, Node)
- Socket.IO
- TailwindCSS
