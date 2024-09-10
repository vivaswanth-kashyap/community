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

		socket.on("disconnect", () => {
			console.log("Client disconnected");
		});
	});

	console.log("Socket.IO initialized");
};

export const emitNewPost = (post) => {
	if (io) {
		io.emit("newPost", post);
	} else {
		console.warn("Socket.IO not initialized. Unable to emit new post.");
	}
};
