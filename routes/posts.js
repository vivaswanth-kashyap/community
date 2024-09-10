import express from "express";
import xss from "xss";
import * as postsData from "../data/posts.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.post("/", async (req, res) => {
	try {
		const uid = xss(req.body.uid);
		const content = xss(req.body.content);

		const newPost = await postsData.newPost(uid, content);
		return res.status(200).json(newPost);
	} catch (error) {
		console.error(`error: ${error} : Path: routes/posts.js(router.post("/"))`);
		return res
			.status(500)
			.json({ error: "post creation unsuccessful", details: error.message });
	}
});

router.get("/feed/:userId", async (req, res) => {
	try {
		const userId = xss(req.params.userId);
		const page = parseInt(xss(req.query.page)) || 1;
		const limit = parseInt(xss(req.query.limit)) || 20;

		const feed = await postsData.getFeed(userId, page, limit);
		return res.status(200).json(feed);
	} catch (error) {
		console.error(
			`Error: ${error} : Path: routes/posts.js(router.get("/feed/:userId"))`
		);
		return res
			.status(500)
			.json({ error: "Feed retrieval unsuccessful", details: error.message });
	}
});

router.get("/:postId", async (req, res) => {
	try {
		const postId = xss(req.params.postId);
		const post = await postsData.findPost(postId);
		return post;
	} catch (error) {
		console.error(
			`error: ${error} : Path: routes/posts.js(router.get("/:postId"))`
		);
		return res
			.status(500)
			.json({ error: "find post unsuccessful", details: error.message });
	}
});

router.post("/repost", async (req, res) => {
	try {
		const uid = xss(req.body.uid);
		const originPostId = xss(req.body.originPostId);

		const newRepost = await postsData.repost(uid, originPostId);
		return res.status(200).json(newRepost);
	} catch (error) {
		console.error(
			`error: ${error} : Path: routes/posts.js(router.post("/repost"))`
		);
		return res
			.status(500)
			.json({ error: "repost unsuccessful", details: error.message });
	}
});

export default router;
