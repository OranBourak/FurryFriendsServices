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
function checkLogin(email, password) {
    const rawData = fs.readFileSync("./DB/users.json");

    const data = JSON.parse(rawData);
    console.log(data);

    for (const user of data) {
        if (user.email === email && user.password === password) {
            return true;
        }
    }
    return false;
}


app.post("/login", (req, res) => {
    const formData = req.body;
    console.log(formData);
    const testLogin = checkLogin(formData.email, formData.password);
    {
        if (testLogin) {
            res.status(200).json({message: "Form submitted successfully"});
        } else {
            res.status(401).json({message: "Invalid credentials"});
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


