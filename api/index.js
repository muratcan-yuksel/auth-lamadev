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

let refreshTokens = [];

app.post("/refresh", (req, res) => {
  //get refresh token from the user
  const refreshToken = req.body.token;
  //send error if no token or token is invalid
  if (!refreshToken) return res.status(401).json("you are not authenticated");
  //if token is valid, create a new access token, refresh token and send to the user
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("refresh token is not valid");
  }
  jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    const accessToken = generateAccessToken(user);
    res.json({
      username: user.name,
      isAdmin: user.isAdmin,
      accessToken,
    });
  });
});

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    "secretKey",
    //expiration time
    { expiresIn: "20s" }
  );
};
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    "myRefreshSecretKey"
    //expiration time
    // { expiresIn: "15m" }
  );
};

app.post("/login", (req, res) => {
  const { name, password } = req.body;
  const user = users.find((u) => u.name === name);
  if (user && user.password === password) {
    // res.send({ message: "Login successful", user });
    // //generate access  token
    // const accessToken = jwt.sign(
    //   { id: user.id, isAdmin: user.isAdmin },
    //   "secretKey",
    //   //expiration time
    //   { expiresIn: "20s" }
    // );
    // //generate refresh token
    // const refreshToken = jwt.sign(
    //   { id: user.id, isAdmin: user.isAdmin },
    //   "myRefreshSecretKey",
    //   //expiration time
    //   { expiresIn: "15m" }
    // );
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    //push to the refreshtokens array
    refreshTokens.push(refreshToken);
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

//see, I call verifyToken here
app.delete("/users/:id", verifyToken, (req, res) => {
  if (req.user.isAdmin || req.user.id === req.params.id) {
    // res.send({ message: "user deleted" });
    res.status(200).json({ message: "user deleted" });
  } else {
    // res.send({ message: "you are not an admin" });
    res.status(403).json({ message: "you are not an admin" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
