import amqp from "amqplib";
import { posts } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const QUEUE_NAME = "post_processing";

let connection;
let channel;

const connectRabbitMQ = async () => {
	connection = await amqp.connect("amqp://localhost");
	channel = await connection.createChannel();
	await channel.assertQueue(QUEUE_NAME, { durable: true });
	return channel;
};

const extractHashtags = (str) => {
	const hashtags = [];
	let start = -1;

	for (let i = 0; i < str.length; i++) {
		if (str[i] === "#" && (i === 0 || str[i - 1] === " ")) {
			start = i;
		} else if (start !== -1 && (str[i] === " " || i === str.length - 1)) {
			let end = i === str.length - 1 ? i + 1 : i;
			hashtags.push(str.slice(start + 1, end));
			start = -1;
		}
	}

	return hashtags;
};

const extractMentions = (str) => {
	const mentions = [];
	let start = -1;
	for (let i = 0; i < str.length; i++) {
		if (str[i] === "@" && (i === 0 || str[i - 1] === " ")) {
			start = i;
		} else if (start !== -1 && (str[i] === " " || i === str.length - 1)) {
			let end = i === str.length - 1 ? i + 1 : i;
			mentions.push(str.slice(start + 1, end));
			start = -1;
		}
	}
	return mentions;
};

const updatePostWithHashtagsAndMentions = async (
	postId,
	hashtags,
	mentions
) => {
	const postsCollection = await posts();
	await postsCollection.updateOne(
		{ _id: new ObjectId(postId) },
		{ $set: { hashtags: hashtags, mentions: mentions } }
	);
};

const processPost = async (post) => {
	const hashtags = extractHashtags(post.content);
	const mentions = extractMentions(post.content);
	await updatePostWithHashtagsAndMentions(post._id, hashtags, mentions);
	console.log(
		`Processed post ${post._id}, found hashtags: ${hashtags.join(
			", "
		)}, mentions: ${mentions.join(", ")}`
	);
	// will add logic for handling notifications
};

export const startConsumer = async () => {
	channel = await connectRabbitMQ();

	console.log("post processing consumer started. Waiting for messages...");

	channel.consume(QUEUE_NAME, async (msg) => {
		if (msg !== null) {
			const post = JSON.parse(msg.content.toString());
			await processPost(post);
			channel.ack(msg);
		}
	});
};

export const closeRabbitMQConnection = async () => {
	if (channel) {
		await channel.close();
	}
	if (connection) {
		await connection.close();
	}
};
