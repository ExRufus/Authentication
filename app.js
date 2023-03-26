const express = require('express');
const flash = require('express-flash');
const session = require('express-session');
require("dotenv").config();
const app = express();
const PORT = 8000;

// Middleware
app.use(express.urlencoded({extended: false}))
app.use(express.json());

// Atur session:
app.use(session({
    secret: 'Buat ini jadi rahasia',
    resave: false,
    saveUnitialized: false
}))

// // setting passport
// const passport = require();
// app.use(passport.initialize());
// app.use(passport.session());

// setting flash:
app.use(flash());
app.set('view engine', 'ejs');

app.get('/',  (req, res) => res.send('Hello World'))

app.listen(PORT, () => {
    console.log(`Server is running on port: http://localhost:${PORT}`)
})