import neo4j from "neo4j-driver";
import { neo4jConfig } from "./settings.js";

let driver;

export const initializeNeo4j = async () => {
	try {
		driver = neo4j.driver(
			neo4jConfig.uri,
			neo4j.auth.basic(neo4jConfig.user, neo4jConfig.password)
		);

		// Verify the connection using getServerInfo()
		const serverInfo = await driver.getServerInfo();
		console.log("Connected to Neo4j server:", serverInfo.address);
		console.log("Neo4j version:", serverInfo.protocolVersion);
	} catch (error) {
		console.error("Failed to create Neo4j driver:", error);
		throw error;
	}
};

export const getSession = () => {
	if (!driver) {
		throw new Error(
			"Neo4j driver not initialized. Call initializeNeo4j first."
		);
	}
	return driver.session();
};

export const closeDriver = async () => {
	if (driver) {
		await driver.close();
		console.log("Neo4j driver closed");
		driver = null;
	}
};
