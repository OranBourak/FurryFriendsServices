/* eslint-disable comma-dangle */
/* eslint-disable object-curly-spacing */
/* eslint-disable no-tabs */
/* eslint-disable indent */
/* eslint-disable new-cap */
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");

const serviceProviderRoutes = require("./routes/ServiceProvider.js");
const clientRoutes = require("./routes/Client.js");
const appointmentRoutes = require("./routes/Appointment.js");
const reviewRoutes = require("./routes/Review.js");
const blockedTimeSlotRoutes = require("./routes/BlockedTimeSlot.js");
const Logger = require("./lib/Logger.js");
const config = require("./config/config.js");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

		// useNewUrlParser: true,
		// useUnifiedTopology: true,
mongoose
  .connect(config.mongo.url, { retryWrites: true, w: "majority" })
  .then(() => {
    Logger.info("Connected successfully to MongoDB!\n");
    startServer();
  })
  .catch((error) => {
		Logger.error("Could not connect to MongoDB", error);
    Logger.error(error);
  });

const startServer = () => {
	/** Setup db connection */
	/** Show socket info */
	app.use((req, res, next) => {
		// log the request
		Logger.info(
			`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`
		);

		res.on("finish", () => {
			Logger.info(
				`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`
			);
		});
		next();
	});
	/** Set Headers */
	app.use((req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept, Authorization"
		);

		if (req.method == "OPTIONS") {
			res.header(
				"Access-Control-Allow-Methods",
				"PUT, POST, PATCH, DELETE, GET"
			);
			return res.status(200).json({});
		}
		next();
	});

	/** Routes */
	app.use("/serviceProvider", serviceProviderRoutes);
	app.use("/client", clientRoutes);
	app.use("/review", reviewRoutes);
	app.use("/appointment", appointmentRoutes);
	app.use("/blockedTimeSlot", blockedTimeSlotRoutes);

	/** Healthcheck */
	app.get("/ping", (req, res, next) =>
		res.status(200).json({ message: "pong" })
	);

	/** Error Handling */
	app.use((req, res, next) => {
		const error = new Error("not found");
		Logger.error(error);
		return res.status(404).json({ message: error.message });
	});

	/** Run sever and  */
	http
		.createServer(app)
		.listen(config.server.port, () =>
			Logger.info(`Server is running on port ${config.server.port}`)
		);
};
