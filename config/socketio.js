import { Server } from "socket.io";
let io;

export const initializeSocketIO = (server) => {
	io = new Server(server, {
		cors: {
			origin: [
				"https://jsprodigy.netlify.app",
				"https://jsprodigy.com",
				"http://localhost:3000",
			],
			methods: ["GET", "POST"],
			credentials: true,
		},
	});

	io.on("connection", (socket) => {
		console.log("New client connected");

		// Authenticate user and join their personal room
		const userId = authenticateUser(socket);
		if (userId) {
			socket.join(userId);
		}

		socket.on("disconnect", () => {
			console.log("Client disconnected");
		});
	});

	console.log("Socket.IO initialized");
};

//temp
const authenticateUser = (socket) => {
	return 2;
};

export const emitToUser = (userId, eventType, data) => {
	if (io) {
		console.log(`Emitting ${eventType} to user ${userId}`);
		io.to(userId).emit(eventType, data);
	} else {
		console.warn("Socket.IO not initialized. Unable to emit event.");
	}
};
