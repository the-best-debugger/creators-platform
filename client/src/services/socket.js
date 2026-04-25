import { io } from 'socket.io-client';

// Server URL
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Read token from localStorage if available
const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

// Create socket instance (not connected yet)
const socket = io(SOCKET_URL, {
  autoConnect: false,   // Don't connect automatically
  withCredentials: true,
  auth: {
    token
  }
});

export default socket;