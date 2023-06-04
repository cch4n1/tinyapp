////////////////////////////////////////////////////
//                  Requires                      //
////////////////////////////////////////////////////

const express = require("express");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");

// helper functions
const { getUserByEmail } = require("./helpers.js")

////////////////////////////////////////////////////
//                  Initialization                //
////////////////////////////////////////////////////

const app = express();
const PORT = 8080;

////////////////////////////////////////////////////
//                    Middleware                  //
////////////////////////////////////////////////////

app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['secret-key'],
  maxAge: 24 * 60 * 60 * 1000
}));

////////////////////////////////////////////////////
//                  Configuration                 //
////////////////////////////////////////////////////

app.set("view engine", "ejs");

////////////////////////////////////////////////////
//                     Server                     //
////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


////////////////////////////////////////////////////
//                    Databases                   //
////////////////////////////////////////////////////

/*****************
 * Users Database
 *****************/
const users = {};

/*****************
 * Url Database
 *****************/
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "1111",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "1111",
  },
  s9fhGs: {
    longURL: "https://www.yahoo.ca",
    userID: "1111",
  },
  g6na7a: {
    longURL: "https://www.wikipedia.org",
    userID: "2222",
  },
  njd7ql: {
    longURL: "https://www.netflix.com",
    userID: "2222",
  },
};

////////////////////////////////////////////////////
//                    Functions                   //
////////////////////////////////////////////////////


/**
 * Generate Random String Function: 
 * This function generates a random string. 
 * used for new short-URL and user-ID.
 * @returns {string} random 6-digit string
 */
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}



/**
 * Urls For User Function:
 * Takes user-ID, looks up and retrieves all URLs
 * in URL Databse associated with user-ID. 
 * Returns an object with all URLs.
 * @param {string} userID 
 * @returns {object} - object with all URLs
 */
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

////////////////////////////////////////////////////
//                    Routes                      //
////////////////////////////////////////////////////

/**************************************
 *            Get Requests
 **************************************/

app.get("/", (req, res) => {
  const userID = req.session.user_id; 

  if (userID) {
    return res.redirect("/urls")
  }

  res.redirect("/login")
});

//******* New Registration Page *******// 
app.get("/register", (req, res) => {
  const userID = req.session.user_id; 

  if (userID) {
    return res.redirect("/urls")
  }

  const templateVars = {user : null};
  res.render("register", templateVars)
})

//************* Login Page **************//
app.get("/login", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    return res.redirect("/urls")
  }

  const templateVars = {user : null};
  res.render("login", templateVars)
})

//************** URLS Page **************//
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
  const urls = urlsForUser(userID)

    const templateVars = { 
      urls: urls,
      user: users[userID] 
    };
    return res.render("urls_index", templateVars);
  }

  return res.status(403).send(`<a href="/login">Log in</a> or <a href="/register">register</a> first!`);
});

//******* Create a New URL Page *******//
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { 
    user: users[userID]
  };

  if (!userID) {
    return res.redirect("/login")
  }

  res.render("urls_new", templateVars);
});

/********* URL Redirection *********
 * redirects short-URL to long-URL: 
 * route: /u/shortURL to longURL
 */
app.get("/u/:id", (req, res) => {
  const newURL = req.params.id;

  for (const urlID in urlDatabase) {
    if (urlID === newURL) {
      const longURL = urlDatabase[newURL].longURL;
      return res.redirect(longURL);
    }
  }

  res.status(400).send('Error: Short URL does not exist!');
});

//********* Edit Short URL Page *********//
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;

  // check if user is logged in
  if (userID) {
    const id = req.params.id
    const usersUrls = urlsForUser(userID)
    const shortURLArray = Object.keys(usersUrls)

    // check if short URL is found in user's account
    if (shortURLArray.includes(id)) {
      const longURL = usersUrls[id].longURL;
      const templateVars = {
        id: id,
        longURL: longURL,
        user: users[userID]
      };
      return res.render("urls_show", templateVars);

    } else {
      return res.status(400).send('Error: Short URL does not exist!');
    }
  }
  res.status(403).send(`<a href="/login">Log in</a> or <a href="/register">register</a> first!`);
});

/**************************************
 *            Post Requests
 **************************************/

//********* Register New User *********//
app.post("/register", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = getUserByEmail(email, users)

  // check if login credentials are valid
  if (!email || !password) {
    return res.status(400).send(`Error: Invalid credentials. Please try again: <a href="/register">Register</a>`);
  } 

  if (user) {
    return res.status(403).send(`Username exists already! Please try again: <a href="/register">Register</a>`);
  }
    const userID = generateRandomString()

    // Update the users database to store the new user id, email, password
    users[userID] = {
      id: userID,
      email: email,
      password: hashedPassword
    }

    // Set user ID in session
    req.session.user_id = userID; 

    res.redirect("/urls")

});

//************* Cookie Login *************//
app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const user = getUserByEmail(email, users)

  // check if user is logged in and credentials are valid
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id; // Set user ID in the session
    res.cookie("user_id", user.id);
    return res.redirect("/urls");

  } else {
    return res.status(403).send(`Error: Invalid credentials. Return to <a href="/login">login</a> page.`);
  }
});

//************* Cookie Logout *************//
app.post("/logout", (req, res) => {
  req.session = null; // Clear the session
  res.redirect("/login");
})

//************* Add New URL *************//
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    
    urlDatabase[shortURL] = { 
      longURL: longURL,
      userID: userID
    };

    return res.redirect(`/urls/${shortURL}`);
  }

  return res.status(403).send(`login or register first!`);
});

//************* Edit URL *************//
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const id = req.params.id;
  const shortURLArray = Object.keys(urlDatabase)
  const usersUrls = urlsForUser(userID)
  const usersURLArray = Object.keys(usersUrls)

  if (!shortURLArray.includes(id)) {
    return res.status(400).send('Error: Short URL does not exist!');
  }

  if (!userID) {
    return res.status(401).send('Error: Invalid credentials.');
  }

  if (!usersURLArray.includes(id)) {
    return res.status(403).send('Error: Unauthorized User.');
  }

  const newURL = req.body.editURL;
  urlDatabase[id].longURL = newURL;
  res.redirect("/urls");
});

//************* Delete URL *************//
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  
  const id = req.params.id  // get dynamic part of URL (:id) and assign to variable id. 
  const shortURLArray = Object.keys(urlDatabase)
  const usersUrls = urlsForUser(userID)
  const usersURLArray = Object.keys(usersUrls)
  
  if (!shortURLArray.includes(id)) {
    return res.status(400).send('Error: Short URL does not exist!');
  }

  if (!userID) {
    return res.status(401).send('Error: Invalid credentials.');
  }

  if (!usersURLArray.includes(id)) {
    return res.status(403).send('Error: Unauthorized User.');
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


