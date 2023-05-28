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

// users database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// url database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
  s9fhGs: {
    longURL: "https://www.yahoo.ca",
    userID: "userRandomID",
  },
  g6na7a: {
    longURL: "https://www.wikipedia.org",
    userID: "user2RandomID",
  },
  njd7ql: {
    longURL: "https://www.netflix.com",
    userID: "user2RandomID",
  },
};

// user lookup function
const userLookup = function (email) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID]
    }
  }
  return null;
}

// url lookup by user function
const urlsForUser = function (userID) {
  const filteredURLs = {};

  for (const key in urlDatabase) {
    const url = urlDatabase[key];
    if (url.userID === userID) {
      filteredURLs[key] = url;
    }
  }

  return filteredURLs;
}

/** Get Requests */
app.get("/", (req, res) => {
  res.send("Hello!");
});

// new registration page
app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"]; 
  if (userID) {
    return res.redirect("/urls")
  }
  const templateVars = {user : null};
  res.render("register", templateVars)
})

// login page
app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"]; 
  if (userID) {
    return res.redirect("/urls")
  }
  const templateVars = {user : null};
  res.render("login", templateVars)
})

// urls page
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"]; 

  if (userID) {
  // urlsForUser() function to filter out only urls associated with user
  const urls = urlsForUser(userID)

    const templateVars = { 
      urls: urls,
      user: users[userID] 
    };
    return res.render("urls_index", templateVars);
  }

  res.send("Log in or register first!");
});

// create a new URL page
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"]; 
  const templateVars = { 
    user: users[userID]
  };
  if (!userID) {
    return res.redirect("/login")
  }
  res.render("urls_new", templateVars);
});

// redirect new URL to long URL: route /u/shortURL to longURL
app.get("/u/:id", (req, res) => {
  const newURL = req.params.id;
  for (const urlID in urlDatabase) {
    if (urlID === newURL) {
      const longURL = urlDatabase[newURL].longURL;
      return res.redirect(longURL);
    }
  }
res.send("URL does not exist!");
});

// short URL page
app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const shortURLArray = Object.keys(urlDatabase)
  const userID = req.cookies["user_id"]; 

  // check if short URL is already stored before loading urls_show page
  if (shortURLArray.includes(id)) {
    const longURL = urlDatabase[id].longURL;
    const templateVars = { 
      id: id, 
      longURL: longURL,
      user: users[userID]
    };
    res.render("urls_show", templateVars);
  } else {
return res.send("URL does not exist!");
  }
});

/** Post Requests */

// new user register
app.post("/register", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const user = userLookup(email)

  // check if login credentials are valid
  if (!email || !password || user) {
    res.status(400).send('Error: Invalid credentials.');
  } else {
    const userID = generateRandomString()

    // Update the users database to store the new user id, email, password
    users[userID] = {
      id: userID,
      email: email,
      password: password
    }
    res.cookie("user_id", userID)
    res.redirect("/urls")
  }
});

// add new url function
app.post("/urls", (req, res) => {
  const newUrlID = generateRandomString()
  const userInput = req.body.longURL
  const userID = req.cookies["user_id"];
  if (!userID) {
    return res.send("Login first to shorten URL!");
  }
  urlDatabase[newUrlID] = { 
    longURL: userInput,
    userID: userID
  }
  res.redirect(`/urls/${newUrlID}`)
});

// delete url function
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id  // get dynamic part of URL (:id) and assign to variable id. 
  delete urlDatabase[id];
  res.redirect("/urls");
});

// edit url function
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const newURL = req.body.editURL;
  urlDatabase[id].longURL = newURL;
  res.redirect("/urls");
});

// cookie login function 
app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const user = userLookup(email)
  let validLogin = false

  // check if login credentials are valid
  if (user && user.password === password) {
    validLogin = true;
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } 

  if (!validLogin) {
    res.status(403).send('Error: Invalid credentials.');
  }
})

// cookie logout function - clear cookie
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/login");
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

