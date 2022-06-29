const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const PORT = 8080; //default port


/////////////////////////////////////////////////////////////////////////////////////////////////////
// Middleware
/////////////////////////////////////////////////////////////////////////////////////////////////////
app.set('view engine', 'ejs'); // set the view engine to ejs
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Listener
/////////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Express Server listening on port ${PORT}!`);
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Database
/////////////////////////////////////////////////////////////////////////////////////////////////////
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { }; // creating a user obj

const err = {
  '400': '400: Bad Request - Email or Password empty',
  '401': '401: Unauthorized - Email already registered ',
  '403': '403: Forbidden - Email or Password empty',
};
let errMsg = '';

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Help Function
/////////////////////////////////////////////////////////////////////////////////////////////////////

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

//check if exist email before register
const checkEmail = (email) => {
  for (let obj in users) {
    if (users[obj].email === email) {
      return users[obj].id;
    }
  }
  return undefined;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Routes
/////////////////////////////////////////////////////////////////////////////////////////////////////

// include a error 
app.get("/urls/err", (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
    err: errMsg
  };
  res.render("urls_err", templateVars);
});

//go to urls_index_template
app.get('/urls', (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//go to Create TinyUrl urls/new 
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]], 
  };
  res.render("urls_new", templateVars);
});

// go to register page 
app.get('/urls/register', (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
  };
  res.render("urls_register", templateVars);
});

// got to login template 
app.get('/urls/login', (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

// go to edit a new URL for a Short Url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

//generate a link that will redirect to the appropriate longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


//Add a POST Route to Receive the Form Submission from urls_new
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;  // add new url to database
  res.redirect('/urls');
});

//Add a POST to delete urls from urls_index
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');  // redirect to MyUrls page
});

//Add a POST to edit urls from urls_index
app.post("/urls/:shortURL/edit", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

//update a longUrl when submit from urls_show
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');  // redirect to MyUrls page
});

//add new user in urls_register
app.post('/urls/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {  
    errMsg = err[400];
    res.redirect('/urls/err');
  } else if (checkEmail(req.body.email) !== undefined) {  
    errMsg = err[401];
    res.redirect('/urls/err');
  }

  let newUser = generateRandomString();
  users[newUser] = {};
  users[newUser].id = newUser;
  users[newUser].email = req.body.email;
  users[newUser].password = req.body.password;
  res.redirect('/urls/login');
});

// recieve and check if email is already register
app.post('/urls/login', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    errMsg = err[403];
    res.redirect('/urls/err');
  }                   
  let id = checkEmail(req.body.email);
  if (id === undefined) {
    res.redirect('/urls/register');
  } else if (users[id].password === req.body.password) {
    res.cookie('user_id', id);
    res.redirect('/urls');
  } else {
    res.redirect('/urls/login');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});