const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createRoom(req, res) {
  try {
    if (req.body.email == null || req.body.email === "" ) {
      return res.status(400).json({ message: "email cannot be empty"})
    }
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email
      }
    })
  
    const game = await prisma.game.create({
      data: {
        playerOne: user.email
      }
    })
    res.status(200).json({ 
      message: "Room created successfully", id: game.id })
  } catch (error) {
    console.log(error)
    res.status(500).json({error})
  }
}

async function joinRoom(req, res) {
    if (req.body.email == null || req.body.email === "") {
      return res.status(400).json({ message: "email cannot be empty" })
    }
    if (req.params.roomId == null || req.params.roomId === "") {
      return res.status(400).json({ message: "roomId cannot be empty" })
    }
    if (isNaN(Number(req.params.roomId))) {
      return res.status(400).json({ message: "roomId not Number" })
    }
    if(req.body.choice == null || 
      req.body.choice === "" || 
      !["R", "P", "S"].includes(req.body.choice.toUpperCase())
    ) {
      return res.status(400).json({ message: "Invalid Choices"})
    }
    
    const email = req.body.email;
    const choice = req.body.choice.toUpperCase
    const roomId = Number(req.params.roomId);  // dapetin id roomnya
    try {
    // 1. get usernya terlebih dahulu dari database
    const user = await prisma.user.findUnique({where: { email} }); // lalu cari room dengan id yang sudah di dapatkan
    if (user === null) {
      return res.status(400).json({ message: "email not found"})
    }

    // 2. get room-nya
    const room = await prisma.game.findUnique({ where: {id: roomId}})
    if (room === null) {
      return res.status(400).json({ message: "room not found"})
    }
    if (room.playerOne === user.email || room.playerTwo === user.email ) {
      return res.status(400).json({ message: "user already in the room"})
    }
    if (room.playerTwo != null) {
      return res.status(400).json({ message: "room already full"})
    }

    // 3. update game-nya dengan current user sebagai player-two
    const updateRoom = await prisma.game.update({ data: {playerTwo: user.email}, where: {id: roomId}}) 
    
    // selesai 
    res.status(200).json({ message: "User2 berhasil join room", room: updateRoom});
  } catch (error) {
    console.log(error);
    res.status(500).json(error)
  }
}

async function getAllRoomController(req, res) {
  try {
    const rooms = await prisma.game.findMany(); // cari semua room yang ada
    res.json(rooms)
  } catch (error) {
    res.json([])
  }
}

async function getRoomById(req, res) {
  try {
    const roomId =  Number(req.params.roomId); // dapetin id roomnya 
    const room = await prisma.game.findUnique({where: {id: roomId} }); // lalu cari room dengan id yang sudah di dapatkan
    res.status(200).json(room)
  } catch (error) {
    res.json([])
  }
}

async function playGameController(req, res) {
  if (req.body.email == null || req.body.email === "") {
    return res.status(400).json({ message: "email cannot be empty" })
  }
  if (req.params.roomId == null || req.params.roomId === "") {
    return res.status(400).json({ message: "roomId cannot be empty" })
  }
  if (isNaN(Number(req.params.roomId))) {
    return res.status(400).json({ message: "roomId not Number" })
  }
  if(req.body.choice == null || 
    req.body.choice === "" || 
    !["R", "P", "S"].includes(req.body.choice.toUpperCase())
  ) {
    return res.status(400).json({ message: "Invalid Choices"})
  }

  const email = req.body.email;
  const choice = req.body.choice;
  const roomId = Number(req.params.roomId);

  try {
  // 1. get room
  const room = await prisma.game.findUnique({ where: {id: roomId}})

  if (room === null) {
    return res.status(400).json({ message: "room not found"})
  }

  // 2. cari tau apakah user yang input
  let CONDITION = null
  if (room.playerOne === email) {
    CONDITION = "playerOne"
  } else if (room.playerTwo === email) {
    CONDITION = "playerTwo"
  } else {
    return res
    .status(400)
    .json({ message: "bukan player yang bermain"})
  }

  const { playerOneChoices, playerTwoChoices} = room;

  if (playerOneChoices === 3 && playerTwoChoices === 3) {
    return res
    .status(400)
    .json({ message: "Game is finished! Please check the result"});
  }

  if (CONDITION === "playerOne") { 
    if (playerOneChoices.length > playerTwoChoices.length) {
      return res
      .status(400)
      .json({ message: "Please wait your turn, player 1!"})
    }
    if (playerOneChoices.length === 3) {
      return res
      .status(400)
      .json({ message: "Pertandingan sudah berakhir, Mohon Tunggu hasil-nya"})
    }
    const updatedGame = await prisma.game.update({ 
      data: {
        playerOneChoices: playerOneChoices.concat(choice),
      }, 
        where: {id: roomId},
    }); 
    return res
    .status(200)
    .json({ message: "game update", game: updatedGame});
  }

  if (
    playerOneChoices.length === 0 || 
    playerOneChoices.length === playerTwoChoices.length
    ) {
    return res.status(400).json({ message: "Please wait your turn, player 2!"})
  }
  if (playerTwoChoices.length === 3) { //
    return res
    .status(400)
    .json({ message: "Pertandingan sudah berakhir, Mohon Tunggu hasil-nya"})
  }
  const updatedGame = await prisma.game.update({ 
    data: {
      playerTwoChoices: playerTwoChoices.concat(choice),
    }, 
      where: {id: roomId},
  });
  return res
  .status(200)
  .json({ message: "game update", game: updatedGame});

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error })
  }
}

module.exports = {createRoom, joinRoom, getAllRoomController, getRoomById, playGameController}