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
  '403': '403: Forbidden - Email or Password empty'
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

// create template to do registration
app.get('/urls/register', (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
  };
  res.render("urls_register", templateVars);
});

//add new user to Users
app.post('/urls/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {  //if the box are unfiled
    errMsg = err[400];
    res.redirect('/urls/err');
    //res.status(400).send('Bad Request');
  } else if (checkEmail(req.body.email) !== undefined) {  //if find email already register
    errMsg = err[401];
    res.redirect('/urls/err');
  }

  let newUser = generateRandomString();
  users[newUser] = {};
  users[newUser].id = newUser;
  users[newUser].email = req.body.email;
  users[newUser].password = req.body.password;
  console.log(users);  // show the actual and new user add
  res.redirect('/urls/login');
});

// create template to do login
app.get('/urls/login', (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_login", templateVars);
});

// recieve and check if email is already register
app.post('/urls/login', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    errMsg = err[403];
    res.redirect('/urls/err'); //........... em trabalho error 403
  }                   //err[403]

  let id = checkEmail(req.body.email);

  if (id === undefined) {
    res.redirect('/urls/register'); //mandar para o erro 403
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

//get the urls_index_template
app.get('/urls', (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});



//adicionei para chamar os erros, ...................... em trabalho
app.get("/urls/err", (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
    err: errMsg
  };
  res.render("urls_err", templateVars);
});

//add get new routes needs to be before /urls/:id
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
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
    username: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

//update a longUrl when submit
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');  // redirect to MyUrls page
});



