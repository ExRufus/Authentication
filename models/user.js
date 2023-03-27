const bcrypt = require('bcrypt')
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken')

function encrypt(password) {
    return bcrypt.hashSync(password, 10);
}

function checkPassword(incomingPassword, databasePassword) {
    return bcrypt.compareSync(incomingPassword, databasePassword)} 

async function register({ email, password}) {
  const encryptedPassword = encrypt(password);
  return await prisma.user.create({ 
    data: {email, password: encryptedPassword}, 
    })
}

async function login({email, password}) {
    try {
        const user = await prisma.user.findUnique({where: {email}})
        if (!user) return Promise.reject("User not found!")
        const isPasswordValid = checkPassword(password, user.password); // user.password password yg ada di database
        if (!isPasswordValid) return Promise.reject("Wrong password");
        return user;
    } catch (error) {
    return Promise.reject(error)
    }
}

async function findByPk(pk) {
  try {
    const user = await prisma.user.findUnique({ where: {id: pk}})
    return user;
  } catch (error) {
    return Promise.reject(error)
  }
}

const SECRET_KEY = "Ini rahasia ga boleh disebar-sebar";

function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
  }
  const token = jwt.sign(payload, SECRET_KEY) // payload => data si user yang ada di model
  console.log({token});
  return token;
}

function verifyToken(token) {
  const isVerified = jwt.verify(token, SECRET_KEY)
  console.log({isVerified})
  return isVerified;
}

module.exports = {register, login, findByPk, generateToken, verifyToken}

// class User {
//     static #encrypt = (password) => bcrypt.hashSync(password, 10);

//     static register = ({ username, password }) => {
//         const encryptedPassword = this.#encrypt(password);
//         return prisma.user.create({ data:{email, password: encryptedPassword}})
//     }
// }
// module.exports = User