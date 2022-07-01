const express = require("express");
const app = express();
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const PORT = 8080; //default port
const MS_IN_A_DAY = 20 * 60 * 60 * 1000;  //use in cookie session
const { getUserByEmail } = require('./helpers');

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Middleware
/////////////////////////////////////////////////////////////////////////////////////////////////////
app.set('view engine', 'ejs'); // set the view engine to ejs
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['mdlasmd2d34klmddmskalmd3225',],  //should be a secret Key, bring from another file
  maxAge: MS_IN_A_DAY
}));

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Listener
/////////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Express Server listening on port ${PORT}!`);
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Database
/////////////////////////////////////////////////////////////////////////////////////////////////////
const urlDatabase = { };

const users = { }; // creating a user obj

const err = {
  '400': '400: Bad Request - Email or Password empty',
  '4001': '400: Bad Request - Email already registered ',
  '403': '403: Forbidden - Email or Password empty',
  '4031': '403: Forbidden - User is not found - Please register first.',
  '4032': '403: Forbidden - Wrong password.',
  '4033' : '403: Forbidden - Only Logged in users can do this action!',
  '404': '404: Not Found'
};

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

const urlsForUser = (id) => {
  let output = {};
  for (let y in urlDatabase) {
    if (urlDatabase[y].userID === id) {
      output[y] = urlDatabase[y];
    }
  }
  return output;
};

// const getUserByEmail = function(email, database) {
//   for (let userid in database) {
//     if (database[userid].email === email) {
//       return database[userid];
//     }
//   }
//   return undefined;
// };

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Routes
/////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/urls', (req, res) => {
  const templateVars = {
    username: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  };
  res.render("urls_index", templateVars);
});

//go to Create TinyUrl urls/new
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

// go to register page
app.get('/urls/register', (req, res) => {
  const templateVars = {
    username: users[req.session.user_id],
  };
  res.render("urls_register", templateVars);
});

// got to login template
app.get('/urls/login', (req, res) => {
  const templateVars = {
    username: users[req.session.user_id],
  };
  res.render("urls_login", templateVars);
});

// go to edit a new URL for a Short Url
app.get("/urls/:shortURL", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.status(403).send(err['4033']);
  } else {
    const templateVars = {
      username: users[req.session.user_id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render("urls_show", templateVars);
  }
});

//generate a link that will redirect to the appropriate longURL
app.get("/u/:shortURL", (req, res) => {
  
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404).send(err['404']);
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//////////////////////////////////////POST///////////////////////////////////////////////////////

//Add a POST Route to Receive the Form Submission from urls_new
app.post("/urls", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.status(403).send(err['4033']);
  } else {
    urlDatabase[generateRandomString()] = {longURL: req.body.longURL, userID: req.session.user_id};  // add new url to database
    res.redirect('/urls');
  }
});

//Add a POST to delete urls from urls_index
app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.status(403).send(err['4033']);
  } else {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');  // redirect to MyUrls page
  }
});

//Add a POST to edit urls from urls_index
app.post("/urls/:shortURL/edit", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.status(403).send(err['4033']);
  } else {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      username: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  }
});

//update a longUrl when submit from urls_show
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect('/urls');  // redirect to MyUrls page
});

//add new user in urls_register
app.post('/urls/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send(err['400']);
  } else if (getUserByEmail(req.body.email, users) !== undefined) {
    res.status(400).send(err['4001']);
  } else {

    let newUser = generateRandomString();
    users[newUser] = {};
    users[newUser].id = newUser;
    users[newUser].email = req.body.email;
    users[newUser].password = bcrypt.hashSync(req.body.password, 10); //used to incrypt password
    res.redirect('/urls/login');
  }
});

// recieve and check if email is already register
app.post('/urls/login', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send(err['400']);
  }
  let user = getUserByEmail(req.body.email, users);
  if (user === undefined) {
    res.status(403).send(err['4031']);
  } else if (bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else {
    res.status(403).send(err['4032']);
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});
