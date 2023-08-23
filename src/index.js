/* eslint-disable linebreak-style */
import Express from "express";
import cors from "cors";
import fs from "fs";

const port = process.env.PORT || 5000;
const app = new Express();
app.use(Express.json()); // Parse JSON request bodies
app.use(Express.urlencoded({extended: true})); // Parse URL-encoded form data
app.use(cors());

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


app.post("/login", (req, res) => {
    const formData = req.body;
    console.log(formData);
    const user = getUser(formData.email, formData.password);
    {
        if (user) {
            res.status(200).json({message: "Form submitted successfully", name: user});
        } else {
            res.status(401).json({message: "Invalid credentials"});
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


