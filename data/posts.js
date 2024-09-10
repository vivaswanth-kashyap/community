import { posts } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { sendToQueue } from "./producer.js";
import { getFollowing, getFollowers } from "./users.js";
import { emitNewPost } from "../config/socketio.js";

//// Add save post, W and L (as in "W take" for liking and "L take" for disliking), and also repuation changes feature after creating the user operations and routes

const newPost = async (uid, content) => {
	content = content.trim();

	const newPost = {
		uid: uid,
		content: content,
		created_at: new Date(),
		updated_at: null,
		W: 0,
		L: 0,
		reply_count: 0,
		repost_count: 0,
		mentions: [],
		isReposted: false,
		hashtags: [],
	};

	const postsCollection = await posts();
	const insertInfo = await postsCollection.insertOne(newPost);
	if (!insertInfo.acknowledged || !insertInfo.insertedId) {
		throw "could not create the post";
	}

	const newId = insertInfo.insertedId.toString();
	const post = await findPost(newId);

	await sendToQueue(post);
	emitNewPost(post);

	return post;
};

const findPost = async (id) => {
	const postsCollection = await posts();
	const post = await postsCollection.findOne({
		_id: new ObjectId(id),
	});
	if (!post) {
		throw "No post found";
	}
	post._id = post._id.toString();
	return post;
};

const repost = async (uid, originPostId) => {
	const postsCollection = await posts();

	const originalPost = await findPost(originPostId);
	if (!originalPost) {
		throw "original post not found to re-post; Path: data/posts.js(repost)";
	}

	const rePost = {
		uid: uid,
		originPostId: originPostId,
		originUid: originalPost.uid,
		content: originalPost.content,
		created_at: new Date(),
		isReposted: true,
		W: 0,
		L: 0,
		reply_count: 0,
		mentions: originalPost.mentions,
		hashtags: originalPost.hashtags,
	};

	const insertInfo = await postsCollection.insertOne(rePost);
	if (!insertInfo.acknowledged || !insertInfo.insertedId) {
		throw "re-post unsuccessful; Path: data/posts.js(repost)";
	}

	await postsCollection.updateOne(
		{ _id: new ObjectId(originPostId) },
		{ $inc: { repost_count: 1 } }
	);

	const newId = insertInfo.insertedId.toString();
	const createdRepost = await findPost(newId);

	return createdRepost;
};

const getFeed = async (uid, page = 1, limit = 20) => {
	const postsCollection = await posts();

	try {
		const following = await getFollowing(uid);
		const followeeIds = following.map((user) => user.id);
		followeeIds.push(uid);

		const feedPosts = await postsCollection
			.find(
				{ uid: { $in: followeeIds } },
				{ sort: { created_at: -1 }, skip: (page - 1) * limit, limit: limit }
			)
			.toArray();

		feedPosts.forEach((post) => {
			post._id = post._id.toString();
		});

		return feedPosts;
	} catch (error) {
		console.error("error in data/posts.js(getFeed)", error);
		throw error;
	}
};

export { newPost, findPost, repost, getFeed };
