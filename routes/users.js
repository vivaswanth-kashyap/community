import express from "express";
import xss from "xss";
import * as userData from "../data/users.js";

const router = express.Router();

router.post("/", async (req, res) => {
	const uid = xss(req.body.uid);
	const username = xss(req.body.username);

	try {
		await userData.createUser(uid, username);
		return res.status(201).json({ message: "user created successfully" });
	} catch (error) {
		console.error(`error: ${error} : Path: routes/users.js(router.post("/"))`);
		return res
			.status(500)
			.json({ error: "user creation unsuccessful", details: error.message });
	}
});

router.post("/follow", async (req, res) => {
	const followerId = xss(req.body.followerId);
	const followeeId = xss(req.body.followeeId);

	try {
		await userData.followUser(followerId, followeeId);
		return res.json({ message: "Follow relationship created" });
	} catch (error) {
		console.error(
			`error: ${error} : Path: routes/users.js(router.post("/follow"))`
		);
		return res.status(500).json({
			error: "follow relationship establishment unsuccessful",
			details: error.message,
		});
	}
});

router.get("/followers/:uid", async (req, res) => {
	const uid = xss(req.params.uid);
	const limit = req.query.limit;
	const skip = req.query.skip;

	try {
		const followers = await userData.getFollowers(uid, limit, skip);
		return res.status(200).json(followers);
	} catch (error) {
		console.error(
			`error: ${error} : Path: routes/users.js(router.get("/followers/:uid"))`
		);
		return res.status(500).json({
			error: "followers retrieval unsuccessful",
			details: error.message,
		});
	}
});

router.get("/following/:uid", async (req, res) => {
	const uid = xss(req.params.uid);
	const limit = xss(req.query.limit);
	const skip = xss(req.query.skip);

	try {
		const following = await userData.getFollowing(uid, limit, skip);
		return res.status(200).json(following);
	} catch (error) {
		console.error(
			`error: ${error} : Path: routes/users.js(router.get("/following/:uid"))`
		);
		return res.status(500).json({
			error: "following list retrieval unsuccessul",
			details: error.message,
		});
	}
});

export default router;
