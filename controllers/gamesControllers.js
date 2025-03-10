import {createNewGame, getAllGames, addUsersToGame, getUserPairings, 
    getAllGamesWithPlayers, updateGame, deleteGame, getAllPairs, deletePairs,
} from '../services/games/gamesService.js';


export const createGameHandler = createNewGame;
export const getAllGamesHandler = getAllGames;
export const addUsersToGameHandler = addUsersToGame;
export const getUserPairingsHandler = getUserPairings;
export const getAllGamesWithPlayersHandler = getAllGamesWithPlayers;
export const updateGameHandler = updateGame;
export const deleteGameHandler = deleteGame;
export const getAllPairsHandler = getAllPairs;
export const deletePairsHandler = deletePairs;

