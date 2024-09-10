import postRoutes from "./posts.js";
import userRoutes from "./users.js";

const constructorMethod = (app) => {
	app.use("/posts", postRoutes);
	app.use("/users", userRoutes);

	app.use("*", (req, res) => {
		return res.json("Not found");
	});
};

export default constructorMethod;
