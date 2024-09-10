import { getSession } from "../config/neo4jConnection.js";
import neo4j from "neo4j-driver";

export const createUser = async (userId, username) => {
	const session = getSession();
	try {
		await session.run(
			"CREATE (u:User {userId: $userId, username: $username})",
			{ userId, username }
		);
	} finally {
		await session.close();
	}
};

export const followUser = async (followerId, followeeId) => {
	const session = getSession();
	try {
		await session.run(
			"MATCH (follower:User {userId: $followerId}), (followee:User {userId: $followeeId}) " +
				"CREATE (follower)-[:FOLLOWS]->(followee)",
			{ followerId, followeeId }
		);
	} finally {
		await session.close();
	}
};

export const getFollowers = async (userId, limit = 10, skip = 0) => {
	const session = getSession();
	try {
		// console.log(
		// 	"getFollowers input - userId:",
		// 	userId,
		// 	"limit:",
		// 	limit,
		// 	"skip:",
		// 	skip
		// );

		const intLimit = Math.floor(Math.max(0, Number(limit)));
		const intSkip = Math.floor(Math.max(0, Number(skip)));

		//console.log("Parsed values - intLimit:", intLimit, "intSkip:", intSkip);

		const result = await session.run(
			"MATCH (follower:User)-[:FOLLOWS]->(user:User {userId: $userId}) " +
				"RETURN follower.userId AS id, follower.username AS username " +
				"SKIP $skip LIMIT $limit",
			{
				userId,
				skip: neo4j.int(intSkip),
				limit: neo4j.int(intLimit),
			}
		);

		//console.log("Query result:", JSON.stringify(result, null, 2));

		return result.records.map((record) => ({
			id: record.get("id"),
			username: record.get("username"),
		}));
	} catch (error) {
		console.error("Error in getFollowers:", error);
		throw error;
	} finally {
		await session.close();
	}
};

export const getFollowing = async (userId, limit = 10, skip = 0) => {
	const session = getSession();
	try {
		// console.log(
		// 	"getFollowing input - userId:",
		// 	userId,
		// 	"limit:",
		// 	limit,
		// 	"skip:",
		// 	skip
		// );

		const intLimit = limit === "" ? 10 : Math.floor(Math.max(0, Number(limit)));
		const intSkip = skip === "" ? 0 : Math.floor(Math.max(0, Number(skip)));
		//console.log("Parsed values - intLimit:", intLimit, "intSkip:", intSkip);

		const query = `
      MATCH (user:User {userId: $userId})-[:FOLLOWS]->(followee:User)
      RETURN followee.userId AS id, followee.username AS username
      SKIP $skip LIMIT $limit
    `;
		//console.log("Query:", query);

		const result = await session.run(query, {
			userId,
			skip: neo4j.int(intSkip),
			limit: neo4j.int(intLimit),
		});

		//console.log("Query result:", JSON.stringify(result, null, 2));
		//console.log("Number of records:", result.records.length);

		const following = result.records.map((record) => ({
			id: record.get("id"),
			username: record.get("username"),
		}));
		//console.log("Processed following:", following);

		return following;
	} catch (error) {
		console.error("Error in getFollowing:", error);
		throw error;
	} finally {
		await session.close();
	}
};
