import express from "express";
import cors from "cors";
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";

import userRoutes from "./routes/User";

// start .env file
dotenv.config();

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({extended: true})); // Parse URL-encoded form data
app.use(cors());

app.use("/client", userRoutes);
app.use("/service-provider", serviceProviderRoutes);

/**
 * checks if the user exists in the db
 * @param {string} email - user's email.
 * @param {string} password - user's password.
 * @return {string} The name of the user.
 */
function getUser(email, password) {
    const rawData = fs.readFileSync("./DB/users.json");

    const data = JSON.parse(rawData);
    console.log(data);

    for (const user of data) {
        if (user.email === email && user.password === password) {
            return user.name;
        }
    }
    return "";
}

// connect to the database

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        // listen for requests
        app.listen(port, () => {
            console.log("connected to db & listening on port", port);
        });
    })
    .catch((error) => {
        console.log(error);
    });

app.post("/login", (req, res) => {
    const formData = req.body;
    console.log(formData);
    const user = getUser(formData.email, formData.password);
    {
        if (user) {
            res
                .status(200)
                .json({message: "Form submitted successfully", name: user});
        } else {
            res.status(401).json({message: "Invalid credentials"});
        }
    }
});

app.post("/signup", (req, res) => {
    // the new user
    const formData = req.body;
    try {
        // Read users list from the JSON file
        const data = fs.readFileSync("./DB/users.json", "utf-8");
        const arr = JSON.parse(data);

        // Add the new user to the users list
        arr.push(formData);

        // Save the updated users list in the JSON file
        fs.writeFileSync("./DB/users.json", JSON.stringify(arr, null, 2), "utf-8");
        res.status(200).send("Registration succeeded");
    } catch (err) {
        console.error("An error occurred:", err);
        res.status(500).send("An error occurred during registration.");
    }
});
