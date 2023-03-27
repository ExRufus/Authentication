const express = require('express');
const flash = require('express-flash');
const session = require('express-session');
require("dotenv").config();
const app = express();
const PORT = 8000;
const { PrismaClient } = require("@prisma/client");
const {register, login} = require("./models/user");
const passport = require("./lib/passport");
const prisma = new PrismaClient();

// Middleware
app.use(express.urlencoded({extended: false}))
app.use(express.json());

// Atur session:
app.use(session({
    secret: 'Buat ini jadi rahasia',
    resave: false,
    saveUninitialized: false
}))

// setting passport
app.use(passport.initialize());
app.use(passport.session());

// setting flash:
app.use(flash());
app.set('view engine', 'ejs');

function restrict(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.get('/', restrict, async(req, res) => {
    const users = await prisma.user.findMany();
    res.render('dashboard', {users});
});

app.get("/register", (req, res) => res.render("register"));
app.post("/register", async(req, res) => {
    await register({ email: req.body.email, password: req.body.password});
    res.redirect("/");
});

app.get("/whoami", restrict, async (req, res) => {
  res.render("whoami", {username: req.user.email});
//   const users = await prisma.user.findUnique();
})

app.get("/login", (req, res) => res.render("login"));
app.post("/login", passport.authenticate('local', {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: false,
  })
);

app.listen(PORT, () => { 
    console.log(`Server is running on port: http://localhost:${PORT}`)
});


// app.post("/login", async (req, res) => {
//     try {
//         await login({ email: req.body.email, password: req.body.password});
//         res.redirect("/");
//     } catch (error) {
//         console.log({error})
//         res.redirect("/login")
//     }
// });