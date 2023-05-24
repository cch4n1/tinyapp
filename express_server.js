const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// generate random string for new URL
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/** Get Requests */

app.get("/", (req, res) => {
  res.send("Hello!");
});

// new user registration page
app.get("/register", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"] 
  };
  res.render("register", templateVars)
})

// urls page
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"] 
  };
  res.render("urls_index", templateVars);
  console.log(templateVars)
});

// create new URL page
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"] 
  };
  res.render("urls_new", templateVars);
});

// redirect new URL to long URL: route /u/shortURL to longURL
app.get("/u/:id", (req, res) => {
  const newURL = req.params.id;
  const longURL = urlDatabase[newURL]
  console.log(urlDatabase[newURL])
  res.redirect(longURL);
});

// short URL page
app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const shortURLArray = Object.keys(urlDatabase)
  // check if short URL is already stored before loading urls_show page
  if (shortURLArray.includes(id)) {
    const longURL = urlDatabase[id];
    const templateVars = { 
      id: id, 
      longURL: longURL,
      username: req.cookies["username"]  
    };
    res.render("urls_show", templateVars);
  } else {
return res.send("URL does not exist!");
  }
});

/** Post Requests */

// add new URL post request
app.post("/urls", (req, res) => {
  const newURL = generateRandomString()
  const userInput = req.body.longURL
  urlDatabase[newURL] = userInput
  res.redirect(`/urls/${newURL}`)
});

// delete functionality
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id  // get dynamic part of URL and assign to id variable. Extract the value of the "id" parameter from the request parameters using req.params.id. 
  delete urlDatabase[id]
  res.redirect("/urls");
});

// edit functionality
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id
  const newURL = req.body.editURL;
  urlDatabase[id] = newURL;
  res.redirect("/urls");
});

// cookie login function - get username from header
app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie("username", username);
  res.redirect("/urls");
})

// cookie logout function - clear cookie
app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls");
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

