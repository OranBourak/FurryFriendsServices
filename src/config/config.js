const dotenv = require("dotenv");

dotenv.config({path: __dirname + "/../../.env"});

const MONGO_USERNAME = process.env.MONGO_USERNAME || "";
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || "";
const MONGO_CLUSTER = process.env.MONGO_CLUSTER || "";
const MONGO_URI = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_CLUSTER}.w4jphaj.mongodb.net/`;

const SERVER_PORT = process.env.PORT ?
    Number(process.env.PORT) :
    process.env.SERVER_PORT;

module.exports = {
    mongo: {
        url: MONGO_URI,
    },
    server: {
        port: SERVER_PORT,
    },
};
