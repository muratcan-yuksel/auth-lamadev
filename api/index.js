//write me an express server
const express = require("express");

const app = express();
const jwt = require("jsonwebtoken");
//you need this to be able to send json in the body of the request
app.use(express.json());

const port = 3000;

const users = [
  {
    name: "John",
    id: 1,
    password: "john1234",
    isAdmin: true,
  },
  {
    name: "Jane",
    id: 2,
    password: "jane1234",
    isAdmin: false,
  },
];

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/login", (req, res) => {
  const { name, password } = req.body;
  const user = users.find((u) => u.name === name);
  if (user && user.password === password) {
    // res.send({ message: "Login successful", user });
    //generate access  token
    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      "secretKey"
    );
    res.json({
      username: user.name,
      isAdmin: user.isAdmin,
      accessToken,
    });
  } else {
    res.send({ message: "Login failed" });
  }
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "secretKey", (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.send({ message: "token not found" });
  }
};

app.delete("/users/:id", verifyToken, (req, res) => {
  if (req.user.isAdmin) {
    res.send({ message: "user deleted" });
  } else {
    res.send({ message: "you are not an admin" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
