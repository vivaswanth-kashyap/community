export const mongoConfig = {
	serverUrl: "mongodb://0.0.0.0:27017/",
	database: "community",
};

export const neo4jConfig = {
	uri: process.env.NEO4J_URI || "neo4j://localhost:7687",
	user: process.env.NEO4J_USER || "neo4j",
	password: process.env.NEO4J_PASSWORD || "community",
};
