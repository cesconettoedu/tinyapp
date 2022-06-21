const express = require("express");
const app = express();

const PORT = 8080; //default port

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//the root or home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

//the urlDatabase info (obj)
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

