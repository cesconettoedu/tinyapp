const express = require("express");
const app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

//install another piece of middleware, body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const PORT = 8080; //default port

app.listen(PORT, () => {
  console.log(`Express Server listening on port ${PORT}!`);
});

//generating string of 6 random alphanumeric characters:
let generateRandomString = () => {
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = "";
  let size = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * size));
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// add this to see if its redirect works
app.get('/', (req, res) => {
  res.status(301);
  res.redirect('/urls');
});

// receive a username 
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls');
});

//get the urls_index_template
app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//add get new routes needs to be before /urls/:id
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
});

//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;  // add new url to database
  res.redirect('/urls');
});

//generate a link that will redirect to the appropriate longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Add a POST to delete urls and redirect to /urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');  // redirect to MyUrls page
});

//add Edit to Myt URls and redirect to urls_show
app.post("/urls/:shortURL/edit", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

//update a longUrl when submit
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');  // redirect to MyUrls page
});





app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


