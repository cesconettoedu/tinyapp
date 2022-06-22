const express = require("express");
const app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

const PORT = 8080; //default port

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//the root or home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

//get the urls_index_template
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {                     
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});






app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

