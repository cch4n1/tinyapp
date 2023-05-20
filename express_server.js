const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}

const newURL = generateRandomString()

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userInput = req.body.longURL
  urlDatabase[newURL] = userInput
  res.redirect(`/urls/${newURL}`)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// redirect new URL to long URL: route /u/shortURL to longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[newURL]
  console.log(urlDatabase[newURL])
  res.redirect(longURL);
});

// short URL page
app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const shortURLArray = Object.keys(urlDatabase)
  // check if short URL is stored
  if (shortURLArray.includes(id)) {
    const longURL = urlDatabase[id];
    const templateVars = { id: id, longURL: longURL };
    res.render("urls_show", templateVars);
  } else {
return res.send("URL does not exist!");
  }
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

