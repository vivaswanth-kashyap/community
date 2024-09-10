import amqp from "amqplib";

const QUEUE_NAME = "post_processing";

const connectRabbitMQ = async () => {
	const connection = await amqp.connect("amqp://localhost");
	const channel = await connection.createChannel();
	await channel.assertQueue(QUEUE_NAME, { durable: true });
	return channel;
};

export const sendToQueue = async (post) => {
	const channel = await connectRabbitMQ();

	// Send the post to RabbitMQ for processing
	channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(post)), {
		persistent: true,
	});

	console.log(`post sent to queue: ${post._id}`);
};
