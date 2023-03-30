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
    
    const email = req.body.email;
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
  const { email, choice } = req.body;
  const roomId = Number(req.params.roomId);

  if (!email) {
    return res.status(400).json({ message: "Email cannot be empty" });
  }

  if (!roomId || isNaN(roomId)) {
    return res.status(400).json({ message: "Invalid room ID" });
  }

  if (!choice || !["R", "P", "S"].includes(choice.toUpperCase())) {
    return res.status(400).json({ message: "Invalid choice" });
  }

  try {
    const game = await prisma.game.findUnique({ where: { id: roomId } });

    if (!game) {
      return res.status(400).json({ message: "Room not found" });
    }

    const { playerOne, playerTwo, playerOneChoices, playerTwoChoices } = game;

    if (![playerOne, playerTwo].includes(email)) {
      return res
        .status(400)
        .json({ message: "You are not a player in this room" });
    }

    if (playerOneChoices.length === 3 && playerTwoChoices.length === 3) {
      return res
        .status(400)
        .json({ message: "Game is finished! Please check the result" });
    }

    if (email === playerOne) {
      if (playerOneChoices.length > playerTwoChoices.length) {
        return res
          .status(400)
          .json({ message: "Please wait for your turn, player 1!" });
      }

      if (playerOneChoices.length === 3) {
        return res
          .status(400)
          .json({ message: "Game is over, please wait for the result" });
      }

      const updatedGame = await prisma.game.update({
        where: { id: roomId },
        data: {
          playerOneChoices: [...playerOneChoices, choice],
        },
      });

      return res
        .status(200)
        .json({ message: "Game updated", game: updatedGame });
    }

    if (playerOneChoices.length === playerTwoChoices.length || playerTwoChoices.length === 3) {
      return res
        .status(400)
        .json({ message: "Please wait for your turn, player 2!" });
    }

    const updatedGame = await prisma.game.update({
      where: { id: roomId },
      data: {
        playerTwoChoices: [...playerTwoChoices, choice],
      },
    });
  
    return res
      .status(200)
      .json({ message: "Game updated", game: updatedGame });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function gameResultController(req, res) {
  const roomId = parseInt(req.params.roomId);
  try {
    const getRoom = await prisma.game.findUnique({
      where: {
        id: Number(roomId),
      }, 
    });
    if (!getRoom) {
      return res.status(400).json({ message: "room not found" });
    }

    let playerOneScore = 0;
    let playerTwoScore = 0;

    getRoom.playerOneChoices.forEach((pick, index) => {
      const playerOne = pick[index];
      const playerTwo = getRoom.playerTwoChoices[index];
      if (playerOne === playerTwo) {
        playerOneScore === 0 || playerTwoScore === 0;
        getRoom.result.push("Draw");
      } 
      if (
        (playerOne === "P" && playerTwo  === "R") ||
        (playerOne === "S" && playerTwo  === "P") ||
        (playerOne === "R" && playerTwo  === "S")
      ) {
        getRoom.result.push(`player one wins`);
        playerOneScore++;
      } 
      if (
        (playerTwo === "P" && playerOne  === "R") ||
        (playerTwo === "S" && playerOne  === "P") ||
        (playerTwo === "R" && playerOne  === "S")
      ){
        getRoom.result.push(`player two wins`);
        playerTwoScore++;
      }
    });
    if (playerOneScore === playerTwoScore) {
      getRoom.winner = "draw";
    } else if (playerOneScore > playerTwoScore) {
      getRoom.winner = `player one: ${getRoom.playerOne} is champion`;
    } else {
      getRoom.winner = `player two: ${getRoom.playerTwo} is champion`;
    }
    const winner = await prisma.game.update({
      where: {
        id: roomId,
      },
      data: {
        winner: getRoom.winner,
      },
    });


    res.status(200).json({ message: "succes update data! yeay", data: winner });
  } catch (error) {
    res.send(error.message);
  }
}


module.exports = {createRoom, joinRoom, getAllRoomController, getRoomById, playGameController, gameResultController}


// async function playGameController(req, res) {
//   if (req.body.email == null || req.body.email === "") {
//     return res.status(400).json({ message: "email cannot be empty" })
//   }
//   if (req.params.roomId == null || req.params.roomId === "") {
//     return res.status(400).json({ message: "roomId cannot be empty" })
//   }
//   if (isNaN(Number(req.params.roomId))) {
//     return res.status(400).json({ message: "roomId not Number" })
//   }
//   if(req.body.choice == null || 
//     req.body.choice === "" || 
//     !["R", "P", "S"].includes(req.body.choice.toUpperCase())
//   ) {
//     return res.status(400).json({ message: "Invalid Choices"})
//   }

//   const email = req.body.email;
//   const choice = req.body.choice;
//   const roomId = Number(req.params.roomId);

//   try {
//   // 1. get room
//   const room = await prisma.game.findUnique({ where: {id: roomId}})

//   if (room === null) {
//     return res.status(400).json({ message: "room not found"})
//   }

//   // 2. cari tau apakah user yang input
//   let CONDITION = null
//   if (room.playerOne === email) {
//     CONDITION = "playerOne"
//   } else if (room.playerTwo === email) {
//     CONDITION = "playerTwo"
//   } else {
//     return res
//     .status(400)
//     .json({ message: "bukan player yang bermain"})
//   }

//   const { playerOneChoices, playerTwoChoices} = room;

//   if (playerOneChoices === 3 && playerTwoChoices === 3) {
//     return res
//     .status(400)
//     .json({ message: "Game is finished! Please check the result"});
//   }

//   if (CONDITION === "playerOne") { 
//     if (playerOneChoices.length > playerTwoChoices.length) {
//       return res
//       .status(400)
//       .json({ message: "Please wait your turn, player 1!"})
//     }
//     if (playerOneChoices.length === 3) {
//       return res
//       .status(400)
//       .json({ message: "Pertandingan sudah berakhir, Mohon Tunggu hasil-nya"})
//     }
//     const updatedGame = await prisma.game.update({ 
//       data: {
//         playerOneChoices: playerOneChoices.concat(choice),
//       }, 
//         where: {id: roomId},
//     }); 
//     return res
//     .status(200)
//     .json({ message: "game update", game: updatedGame});
//   }

//   if (
//     playerOneChoices.length === 0 || 
//     playerOneChoices.length === playerTwoChoices.length
//     ) {
//     return res.status(400).json({ message: "Please wait your turn, player 2!"})
//   }
//   if (playerTwoChoices.length === 3) { //
//     return res
//     .status(400)
//     .json({ message: "Pertandingan sudah berakhir, Mohon Tunggu hasil-nya"})
//   }
//   const updatedGame = await prisma.game.update({ 
//     data: {
//       playerTwoChoices: playerTwoChoices.concat(choice),
//     },  
//       where: {id: roomId},
//   });
//   return res
//   .status(200)
//   .json({ message: "game update", game: updatedGame});

//   } catch (error) {
//     console.log(error)
//     return res.status(500).json({ message: error })
//   }
// }