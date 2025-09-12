import prisma from "../prisma/db.mjs"

const addGame = async (req, res, next) => {
// Add validation


const game = await prisma.game.create({
    data: {
        name: req.body.name,
        minPlayer: req.body.minPlayer,
        maxPlayer: req.body.maxPlayer
    }
})
res.json({ msg: "successfull", game})
}

const listGame = async(req, res, next) => {
    const games = await prisma.game.findMany()
    res.json({ msg: "successfull", games})
}

export { addGame, listGame}