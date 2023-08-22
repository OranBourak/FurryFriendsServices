import Express from "express";
import cors from "cors";
import fs from "fs";

const port = process.env.PORT || 5000;
const app =new Express();
app.use(Express.json()); // Parse JSON request bodies
app.use(Express.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(cors());

function checkLogin(email, password) {

  const rawData = fs.readFileSync('../DB/users.json');

  const data = JSON.parse(rawData);
  console.log(data);

  for (const user of data) {

    if (user.email === email && user.password === password) {

      return true;

    }

  }
  return false;
}

app.post('/login', (req, res) => {
  const formData = req.body;
  console.log(formData);
  res.status(200).json({ message: 'Form submitted successfully' });
  // {if (checkLogin(formData.email, formData.password))
  //   res.status(200).json({ message: 'Form submitted successfully' });
  // else 
  //   res.status(401).json({ message: 'Invalid credentials' });
  // }
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
