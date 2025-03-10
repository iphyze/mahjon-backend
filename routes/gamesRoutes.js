import { Router } from 'express';
import {createGameHandler, getAllGamesHandler, addUsersToGameHandler, 
    getUserPairingsHandler, getAllGamesWithPlayersHandler, updateGameHandler,
    deleteGameHandler, getAllPairsHandler, deletePairsHandler
} from '../controllers/gamesControllers.js';
import {verifyToken} from '../middleware/authMiddleware.js'
import { validateNewGame } from '../services/games/gamesService.js';


const router = Router();

router.post('/createGame', verifyToken, validateNewGame, createGameHandler);
router.post('/addGameUser', verifyToken, addUsersToGameHandler);
router.get('/getAllGames', verifyToken, getAllGamesHandler);
router.get('/getAllGamesWithPlayers', verifyToken, getAllGamesWithPlayersHandler);
router.get('/getUserPairing/:userId', verifyToken, getUserPairingsHandler);
router.put('/updateGame/:gameId', verifyToken, updateGameHandler);
router.delete('/deleteGame/:gameId', verifyToken, deleteGameHandler);
router.get('/getAllPairs', verifyToken, getAllPairsHandler);
router.delete('/deletePairs', verifyToken, deletePairsHandler);


export default router;
