const express = require("express");
const app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

//install another piece of middleware, body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const PORT = 8080; //default port

//generating string of 6 random alphanumeric characters:
function generateRandomString() {
  var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = ""
  var size = characters.length;
  for ( var i = 0; i < 6 ; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * size));
  }
  return result
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//the root or home page
// app.get("/", (req, res) => {
//   res.send("Hello!");
// });


// add this to see if its redirect works
app.get('/', (req, res) => {
  res.status(301);
  res.redirect('/urls');
});


//get the urls_index_template   
app.get('/urls', (req, res) => {
  const templateVars = { 
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

//add get new routes needs to be before /urls/:id
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {                     
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL]=req.body.longURL  // add new url to database
  console.log(urlDatabase) //just to make sure that are add
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
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

