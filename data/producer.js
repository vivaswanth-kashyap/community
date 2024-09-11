import amqp from "amqplib";

const EXCHANGE_NAME = "feed_events";

const connectRabbitMQ = async () => {
	const connection = await amqp.connect("amqp://localhost");
	const channel = await connection.createChannel();
	await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
	return channel;
};

export const sendEvent = async (eventType, payload) => {
	const channel = await connectRabbitMQ();
	const message = JSON.stringify({ eventType, payload });
	channel.publish(EXCHANGE_NAME, eventType, Buffer.from(message));
	console.log(`Event sent to exchange: ${eventType}`);
};
