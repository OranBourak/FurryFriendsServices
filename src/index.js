import Express from "express";


const port = process.env.PORT || 3000;
const app =new Express();
app.use(Express.json()); // Parse JSON request bodies
app.use(Express.urlencoded({ extended: true })); // Parse URL-encoded form data

app.post('/login', (req, res) => {
  const formData = req.body;
  console.log(formData);
  // Validate and process the formData
  
  // Send a response back to the client
  res.status(200).json({ message: 'Form submitted successfully' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// const app = new Express();

// const port = process.env.PORT || 3000;

// app.get("/", (req, res) => {
//     res.send("Hello World!");
// });

// app.get("/login", (req, res) => {
//     console.log('Hello world!');
// });




// app.listen(port, () => {
//     console.log("Example app listening on port 3000!");
// });
