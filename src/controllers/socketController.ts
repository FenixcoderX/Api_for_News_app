import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { userSocketMap } from '../server'; // Убедитесь, что путь импорта корректен

/**
 * Initializes the socket connection and handles user authentication
 *
 * @param {Server} io - The socket.io server instance.
 */
export const initializeSocket = (io: Server) => {
  // Handle socket connection
  io.on('connection', (socket: Socket) => {
    console.log('A user connected');

    // Get the token from the cookies
    const cookiesStr = socket.handshake.headers.cookie;
    if (!cookiesStr) {
      console.log('No cookies provided. User disconnected');
      socket.disconnect();
      return;
    }
    const cookies = cookie.parse(cookiesStr);
    const token = cookies['access_token'];

    // Verify the token and authenticate the user
    let userId = '';
    if (token) {
      jwt.verify(token, process.env.TOKEN_SECRET as string, (err, decoded: any) => {
        if (err) {
          console.log('Authentication error. User disconnected:', err);
          socket.disconnect();
        } else {
          userId = decoded.id;
          userSocketMap.set(userId, socket.id);

          console.log(`User ${userId} is authenticated with socket ${socket.id}`);
        }
      });
    } else {
      console.log('No token provided. User disconnected');
      socket.disconnect();
    }

    // Handle socket disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected');
      if (userId) {
        userSocketMap.delete(userId);
      }
    });
  });
};
