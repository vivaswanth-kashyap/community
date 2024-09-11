import { getFollowers } from "./users.js";
import { emitToUser } from "../config/socketio.js";

export const processFeedEvent = async (eventType, payload) => {
	console.log(`Processing event: ${eventType}`, payload);

	switch (eventType) {
		case "post.created":
			await fanOutNewPost(payload);
			break;
		// Add cases for other event types when implemented
		default:
			console.log(`Unhandled event type: ${eventType}`);
	}
};

const fanOutNewPost = async (post) => {
	const followers = await getFollowers(post.uid);
	console.log(`Fanning out post to ${followers.length} followers`);

	for (const follower of followers) {
		await updateUserFeed(follower.id, post);
	}
};

const updateUserFeed = async (userId, post) => {
	console.log(`Updating feed for user: ${userId}`);
	emitToUser(userId, "feed_update", { type: "new_post", post });
};
