const mongoose = require("mongoose");

const config = require("../../config/config");
const startServer = require("../../index");
const Logger = require("./library/Logger");

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongo.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        Logger.info("Connected successfully to MongoDB!\n");
        startServer();
    } catch (error) {
        Logger.error("Could not connect to MongoDB", error);
        process.exit(1);
    }
};

module.exports = connectDB();
