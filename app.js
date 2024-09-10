import express from "express";
import http from "http";
import cors from "cors";
import configRoutes from "./routes/index.js";
import bodyParser from "body-parser";
import { startConsumer, closeRabbitMQConnection } from "./data/consumer.js";
import { initializeNeo4j, closeDriver } from "./config/neo4jConnection.js";
import { closeConnection } from "./config/mongoConnection.js";
import { initializeSocketIO } from "./config/socketio.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
	origin: [
		"https://jsprodigy.netlify.app",
		"https://jsprodigy.com",
		"http://localhost:3000",
	],
	methods: ["GET", "POST", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Neo4j
try {
	await initializeNeo4j();
	console.log("Neo4j initialized successfully");
} catch (error) {
	console.error("Failed to initialize Neo4j:", error);
	process.exit(1);
}

// Routes
configRoutes(app);

//Socket.IO
initializeSocketIO(server);

// Server and RabbitMQ consumer
const port = process.env.PORT || 4000;
server.listen(port, async () => {
	console.log(`Server is running on port ${port}`);
	try {
		await startConsumer();
		console.log("RabbitMQ consumer started successfully");
	} catch (error) {
		console.error("Failed to start RabbitMQ consumer:", error);
	}
});

server.on("error", (error) => {
	console.error("Server error:", error);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
	console.log("SIGTERM signal received: closing HTTP server");
	server.close(async () => {
		console.log("HTTP server closed");
		await closeDriver();
		console.log("Neo4j connection closed");
		await closeConnection();
		console.log("MongoDB connection closed");
		await closeRabbitMQConnection();
		console.log("RabbitMQ connection closed");
	});
});
