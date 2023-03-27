const express = require('express');
const flash = require('express-flash');
const session = require('express-session');
require("dotenv").config();
const app = express();
const PORT = 8000;
const { PrismaClient } = require("@prisma/client");
const {register, login, generateToken, verifyToken} = require("./models/user");
const passport = require("./lib/passport");
const prisma = new PrismaClient();
const cookieParser = require('cookie-parser');
const { verify } = require('jsonwebtoken');

// Middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());

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

function restrictLocalStrategy(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Fungsi untuk menendang user ke halaman utama, kalau dia sudah Authenticate.
function pushToMainIfAuthed(req, res, next) {
  const cookie = req.cookies.Chap7;
  if (cookie === undefined) {
    return next()
  }
  const isTokenVerified = verifyToken(cookie)
  if (!isTokenVerified) {
    return next()
  }
  res.redirect("/")
}

// Fungsi untuk menendang user ke halaman login, kalau dia belum authenticate
function restrictByCheckCookie(req, res, next) {
  const cookie = req.cookies.Chap7;
  if (cookie === undefined) {
    res.redirect('/login') 
    return
  }
  const isTokenVerified = verifyToken(cookie)
  if (!isTokenVerified) {
    res.redirect("/login")
    return
  }
  next();
}

app.get("/", restrictByCheckCookie, async(req, res) => {
    const users = await prisma.user.findMany();
    res.render("dashboard", {users});
});

app.get("/register", (req, res) => res.render("register")); 
app.post("/register", async(req, res) => {
    await register({ email: req.body.email, password: req.body.password});
    res.redirect("/");
});

app.get("/whoami", restrictByCheckCookie, async (req, res) => {
  res.render("whoami", {username: req.user.email});
//   const users = await prisma.user.findUnique();
})

app.get("/login", pushToMainIfAuthed, (req, res) => res.render("login"));
app.post("/login", passport.authenticate('local', {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true ,
  })
);

app.post("/login/jwt", async (req, res) => {
  try {
    const user = await login(req.body)
    const token = generateToken(user)
    res.cookie('Chap7', token, { maxAge: 900000, httpOnly: true });
    res.redirect("/");
  } catch (error) {
    res.redirect("/login")
  }
})

app.listen(PORT, () => { 
  console.log(`Server is running on port: http://localhost:${PORT}`)
});

// app.post("/login/jwt", (req, res) => {
//   login(req.body)
//   .then(user => {
//    res.json({
//     id: user.id,
//     email: user.email,
//     accessToken: generateToken(user),
//    });
//   })
//   .catch((err) => {
//     res.status(400).json({
//       message: "failed to login",
//     })
//   })
// });

// app.post("/login", async (req, res) => { 
//     try {
//         await login({ email: req.body.email, password: req.body.password});
//         res.redirect("/");
//     } catch (error) {
//         console.log({error})
//         res.redirect("/login")
//     }
// });