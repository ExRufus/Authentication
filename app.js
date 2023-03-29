const express = require("express");
const session = require("express-session");
const flash = require("express-flash");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  loginController,
  registerController,
  logoutController,
  whoamiController,
} = require("./controllers/authController");
const morgan = require("morgan");
const { restrictPageAccess } = require("./middleware/restricPageAccess");
const { restrictLoginPage } = require("./middleware/restrictLoginPage");
const { createRoom, joinRoom, getAllRoomController, getRoomById, playGameController } = require("./controllers/roomController");

require("dotenv").config();

const app = express();

const { PORT } = process.env;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: "Buat ini jadi rahasia",
    resave: false,
    saveUninitialized: false,
  })
);

// log only 4xx and 5xx responses to console
app.use(morgan('dev', {
  skip: function (req, res) { return res.statusCode < 400 }
}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))


app.use(flash());
app.set("view engine", "ejs");

// Routing
app.get("/", restrictPageAccess, async (req, res) => {
  const users = await prisma.user.findMany();
  res.render("dashboard", { users });
});
app.get("/login", restrictLoginPage, (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));
app.post("/login", loginController);
app.post("/register", registerController);
app.post("/logout", logoutController);
app.get("/whoami", restrictPageAccess, whoamiController);

app.get("/api/rooms", getAllRoomController)
app.get("/api/room/:roomId", getRoomById)
app.post("/api/login", loginController);
app.post("/api/register", registerController);
app.post("/api/createroom", createRoom);
app.post("/api/joinroom/:roomId", joinRoom )
app.get("/api/whoami", restrictPageAccess, whoamiController);
app.post("/api/playgame/:roomId", playGameController)

app.listen(PORT, () => {
  console.log(`Server Running on port: http://localhost:${PORT}`);
});  


  // const cookie = req.cookies.Chap7;
  // const token = req.session.token;
  // if (token === undefined) {
  //   return res.redirect('/login') 
  // }
  // const isTokenVerified = verifyToken(token)
  // if (!isTokenVerified) {
  //   return res.redirect("/login")
  // }
  // req.userId = decodedToken.userId
  // next();
// }
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


// app.post("/login", passport.authenticate('local', {
//   successRedirect: "/",
//   failureRedirect: "/login",
//   failureFlash: true ,
//   })
// );