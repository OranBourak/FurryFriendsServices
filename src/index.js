import Express from "express";
const app = new Express();

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log("Example app listening on port 3000!");
});
