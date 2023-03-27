const bcrypt = require('bcrypt')
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();

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

module.exports = {register, login}

// class User {
//     static #encrypt = (password) => bcrypt.hashSync(password, 10);

//     static register = ({ username, password }) => {
//         const encryptedPassword = this.#encrypt(password);
//         return prisma.user.create({ data:{email, password: encryptedPassword}})
//     }
// }
// module.exports = User