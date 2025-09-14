import { io } from 'socket.io-client';

// Create a singleton for Socket.io
class SocketService {
  constructor() {
    this.socket = null;
  }

  // Initialize the socket connection
  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:5000', {
        transports: ['websocket'],
      });
      
      this.socket.on('connect', () => {
        console.log('Socket connected');
      });
      
      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      
      this.socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });
    }
    return this.socket;
  }

  // Get the socket instance
  getSocket() {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  // Join a poll room to receive real-time updates
  joinPollRoom(pollId) {
    const socket = this.getSocket();
    socket.emit('join-poll', pollId);
  }

  // Leave a poll room
  leavePollRoom(pollId) {
    const socket = this.getSocket();
    socket.emit('leave-poll', pollId);
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();