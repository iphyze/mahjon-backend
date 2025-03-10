import db from '../../config/db.js';
import dotenv from 'dotenv';
import { check, validationResult } from 'express-validator';
import { paymentConfirmationTemplate } from '../../utils/paymentEmailTemplates.js';
import nodemailer from 'nodemailer';
import axios from 'axios';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: process.env.NODE_ENV !== 'production',
});

export const validateNewGame = [
    check('userEmail').notEmpty().withMessage('user email is required!').isEmail().withMessage('Please provide a valid email address!').trim().escape(),
    check('groupName').notEmpty().withMessage('Game name is required!').trim().escape(),
];


export const createNewGame = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { groupName, userEmail } = req.body;

        const createdBy = userEmail;
        const updatedBy = userEmail;

        // Check if game already exists
        const checkGameQuery = 'SELECT groupName FROM games WHERE groupName = ?';

        db.query(checkGameQuery, [groupName], async (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });

            if (results.length > 0) {
                return res.status(400).json({ message: `${groupName} already exists on the game lists!` });
            }

            // Insert new game
            const insertGameQuery = `INSERT INTO games (groupName, createdBy, updatedBy) VALUES (?, ?, ?)`;

            db.query(insertGameQuery, [groupName, createdBy, updatedBy], async (err, insertResult) => {
                if (err) {
                    return res.status(500).json({ message: 'Error creating game', error: err });
                }

                // Successfully created game
                return res.status(200).json({
                    message: 'Game successfully created!',
                    data: {
                        gameId: insertResult.insertId,
                        groupName,
                        createdBy,
                        updatedBy
                    }
                });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getAllGames = async (req, res) => {
    try {
      const query = 'SELECT * FROM games ORDER BY createdAt DESC';
      db.query(query, (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }
        res.status(200).json({ message: 'Successfully fetched all games', data: results });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const addUsersToGame = async (req, res) => {
    try {
        const { gameId, groupName, users, createdBy, updatedBy } = req.body; // users is an array of userIds

        if (!Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ message: "Users list must be a non-empty array." });
        }

        // Check if game exists
        const checkGameQuery = "SELECT id, groupName FROM games WHERE id = ? AND groupName = ?";
        db.query(checkGameQuery, [gameId, groupName], (err, gameResults) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });
            if (gameResults.length === 0) return res.status(404).json({ message: "Game not found." });

            // Count current players in the game
            const countPlayersQuery = "SELECT COUNT(*) AS playerCount FROM pairs WHERE gameId = ?";
            db.query(countPlayersQuery, [gameId], (err, countResults) => {
                if (err) return res.status(500).json({ message: "Database error", error: err });

                const currentPlayers = countResults[0].playerCount;
                if (currentPlayers + users.length > 5) {
                    return res.status(400).json({ message: "Cannot add more than 5 players to a game." });
                }

                // Check if any of the users are already in the game
                const userIds = users.map(user => user.userId);
                const checkExistingUsersQuery = `SELECT userId FROM pairs WHERE gameId = ? AND userId IN (?)`;

                db.query(checkExistingUsersQuery, [gameId, userIds], (err, existingUsers) => {
                    if (err) return res.status(500).json({ message: "Database error", error: err });

                    const existingUserIds = existingUsers.map(user => user.userId);
                    const newUsers = users.filter(user => !existingUserIds.includes(user.userId));

                    if (newUsers.length === 0) {
                        return res.status(400).json({ message: "All users are already added to this game." });
                    }

                    // Fetch user details for the new users
                    const fetchUsersQuery = `SELECT id AS userId, userName, image FROM users WHERE id IN (?)`;

                    db.query(fetchUsersQuery, [newUsers.map(user => user.userId)], (err, userResults) => {
                        if (err) return res.status(500).json({ message: "Database error", error: err });

                        if (userResults.length !== newUsers.length) {
                            return res.status(400).json({ message: "One or more users not found." });
                        }

                        // Insert new users into the pairs table
                        const insertPairsQuery = `
                            INSERT INTO pairs (gameId, groupName, image, userName, userId, createdBy, updatedBy) 
                            VALUES ?`;

                        const values = userResults.map(user => [
                            gameId,
                            groupName,
                            user.image || null, // If image is NULL, keep it NULL
                            user.userName,
                            user.userId,
                            createdBy,
                            updatedBy
                        ]);

                        db.query(insertPairsQuery, [values], (err, insertResult) => {
                            if (err) return res.status(500).json({ message: "Error adding users to game", error: err });

                            return res.status(200).json({
                                message: "Users successfully added to the game!",
                                addedUsers: userResults
                            });
                        });
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUserPairings = async (req, res) => {
    try {
        const { userId } = req.params; // Get userId from URL params
        const loggedInUserId = req.user.id; // Get logged-in user ID from token

        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // Prevent access if the logged-in user is not the owner of the data
        if (parseInt(userId) !== parseInt(loggedInUserId)) {
            return res.status(403).json({ message: "Access denied. You can only view your own pairings." });
        }

        // Fetch all games where the user is a player
        const userGamesQuery = `
            SELECT g.id, g.groupName, g.scheduleDate, g.gameStatus, u.image AS userImage, u.skillLevel
            FROM games g
            JOIN pairs p ON g.id = p.gameId
            JOIN users u ON p.userId = u.id
            WHERE p.userId = ?`;

        db.query(userGamesQuery, [userId], (err, games) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (games.length === 0) {
                return res.status(404).json({ message: "No games found for this user." });
            }

            // Get all pair members for these games
            const gameIds = games.map(game => game.id);

            const pairMembersQuery = `
                SELECT p.gameId, p.dataId, u.image, u.userName, u.id AS userId
                FROM pairs p
                JOIN users u ON p.userId = u.id
                WHERE p.gameId IN (?)`;

            db.query(pairMembersQuery, [gameIds], (err, pairMembers) => {
                if (err) return res.status(500).json({ message: "Database error", error: err });

                // Format the response
                const formattedData = games.map(game => ({
                    id: game.id,
                    groupName: game.groupName,
                    userImage: game.userImage || null,
                    skillLevel: game.skillLevel || "Not specified",
                    scheduledDate: game.scheduleDate,
                    gameStatus: game.gameStatus,
                    pairMembersData: pairMembers
                        .filter(member => member.gameId === game.id && member.userId !== parseInt(userId)) // Exclude current user
                        .map(member => ({
                            dataId: member.dataId,
                            image: member.image || null,
                            userName: member.userName
                        }))
                }));

                return res.status(200).json(formattedData);
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getAllGamesWithPlayers = async (req, res) => {
    try {
        // Fetch all games
        const gamesQuery = `
            SELECT g.id, g.groupName, g.scheduleDate, g.gameStatus
            FROM games g
        `;

        db.query(gamesQuery, (err, games) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (games.length === 0) {
                return res.status(404).json({ message: "No games found." });
            }

            // Get player details for each game
            const gameIds = games.map(game => game.id);

            const playersQuery = `
                SELECT p.gameId, p.dataId, u.id AS userId, u.userName, u.image, u.skillLevel
                FROM pairs p
                JOIN users u ON p.userId = u.id
                WHERE p.gameId IN (?)
            `;

            db.query(playersQuery, [gameIds], (err, players) => {
                if (err) return res.status(500).json({ message: "Database error", error: err });

                // Format response
                const formattedData = games.map(game => ({
                    id: game.id,
                    groupName: game.groupName,
                    scheduledDate: game.scheduleDate,
                    gameStatus: game.gameStatus,
                    players: players
                        .filter(player => player.gameId === game.id)
                        .map(player => ({
                            userId: player.userId,
                            dataId: player.dataId,
                            userName: player.userName,
                            image: player.image || null,
                            skillLevel: player.skillLevel || "Not specified"
                        }))
                }));

                return res.status(200).json(formattedData);
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const deleteGame = async (req, res) => {
    try {
        const { gameId } = req.params;

        if (!gameId) {
            return res.status(400).json({ message: "Game ID is required." });
        }

        // Check if the game exists
        const checkGameQuery = `SELECT * FROM games WHERE id = ?`;
        db.query(checkGameQuery, [gameId], (err, games) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (games.length === 0) {
                return res.status(404).json({ message: "Game not found." });
            }

            // Delete pairs associated with this game
            const deletePairsQuery = `DELETE FROM pairs WHERE gameId = ?`;
            db.query(deletePairsQuery, [gameId], (err) => {
                if (err) return res.status(500).json({ message: "Error deleting pairs", error: err });

                // Delete the game after deleting pairs
                const deleteGameQuery = `DELETE FROM games WHERE id = ?`;
                db.query(deleteGameQuery, [gameId], (err) => {
                    if (err) return res.status(500).json({ message: "Error deleting game", error: err });

                    return res.status(200).json({ message: "Game and related pairs deleted successfully!" });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const updateGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { gameStatus, scheduledDate, groupName, sendNotification } = req.body; // Include sendNotification

        if (!gameStatus && !scheduledDate && !groupName) {
            return res.status(400).json({ message: "At least one field must be updated." });
        }

        const checkGameQuery = `SELECT * FROM games WHERE id = ?`;
        db.query(checkGameQuery, [gameId], async (err, games) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (games.length === 0) {
                return res.status(404).json({ message: "Game not found." });
            }

            const currentGame = games[0];

            // If updating groupName, check if it already exists
            if (groupName && groupName !== currentGame.groupName) {
                const checkNameQuery = `SELECT id FROM games WHERE groupName = ? AND id <> ?`;
                db.query(checkNameQuery, [groupName, gameId], (err, existingGames) => {
                    if (err) return res.status(500).json({ message: "Database error", error: err });

                    if (existingGames.length > 0) {
                        return res.status(400).json({ message: "This group name already exists. Please choose a different name." });
                    }

                    updateGameDetails(gameId, gameStatus, scheduledDate, groupName, sendNotification, res);
                });
            } else {
                updateGameDetails(gameId, gameStatus, scheduledDate, groupName, sendNotification, res);
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Helper function to update the game
const updateGameDetails = (gameId, gameStatus, scheduledDate, groupName, sendNotification, res) => {
    let updateFields = [];
    let values = [];

    if (gameStatus) {
        updateFields.push("gameStatus = ?");
        values.push(gameStatus);
    }

    if (scheduledDate) {
        updateFields.push("scheduleDate = ?");
        values.push(scheduledDate);
    }

    if (groupName) {
        updateFields.push("groupName = ?");
        values.push(groupName);
    }

    values.push(gameId);

    const updateGameQuery = `UPDATE games SET ${updateFields.join(", ")} WHERE id = ?`;
    db.query(updateGameQuery, values, (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        if (groupName) {
            const updatePairsQuery = `UPDATE pairs SET groupName = ? WHERE gameId = ?`;
            db.query(updatePairsQuery, [groupName, gameId], (err, pairsResult) => {
                if (err) return res.status(500).json({ message: "Error updating pairs table", error: err });

                // If sendNotification is "Yes", send notifications
                if (sendNotification === 'Yes') {
                    sendGameNotifications(gameId);
                }

                return res.status(200).json({ message: "Game updated successfully, including dependent tables!" });
            });
        } else {
            if (sendNotification === 'Yes') {
                sendGameNotifications(gameId);
            }
            return res.status(200).json({ message: "Game updated successfully!" });
        }
    });
};

// Function to send notifications to all users of the game
const sendGameNotifications = (gameId) => {
    const getUsersQuery = `SELECT u.id, u.expoPushToken, u.email 
                           FROM users u
                           JOIN user_games ug ON u.id = ug.userId
                           WHERE ug.gameId = ?`;

    db.query(getUsersQuery, [gameId], async (err, users) => {
        if (err) {
            console.error("Error fetching game users:", err);
            return;
        }

        if (users.length === 0) {
            console.log("No users found for this game.");
            return;
        }

        const title = "Game Update";
        const message = "The game details have been updated. Check for new changes.";

        for (const user of users) {
            const { id: userId, expoPushToken, email } = user;

            // Store the notification in the database
            await storeNotification(userId, title, message, email);

            // Send push notification if token exists
            if (expoPushToken) {
                await sendPushNotification(expoPushToken, title, message);
            }
        }
    });
};



export const getAllPairs = async (req, res) => {
    try {
        const getPairsQuery = `SELECT * FROM pairs`;
        
        db.query(getPairsQuery, (err, pairs) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            return res.status(200).json({ message: "Pairs fetched successfully", data: pairs });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
  

export const deletePairs = async (req, res) => {
    try {
        const { pairIds } = req.body; // Expecting an array of pair IDs

        if (!pairIds || !Array.isArray(pairIds) || pairIds.length === 0) {
            return res.status(400).json({ message: "An array of pair IDs is required." });
        }

        // Convert array to comma-separated placeholders (for SQL IN clause)
        const placeholders = pairIds.map(() => '?').join(',');
        
        // Check if all pairs exist before deleting
        const checkPairsQuery = `SELECT dataId FROM pairs WHERE dataId IN (${placeholders})`;
        db.query(checkPairsQuery, pairIds, (err, existingPairs) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (existingPairs.length === 0) {
                return res.status(404).json({ message: "No matching pairs found." });
            }

            // Delete pairs
            const deletePairsQuery = `DELETE FROM pairs WHERE dataId IN (${placeholders})`;
            db.query(deletePairsQuery, pairIds, (err) => {
                if (err) return res.status(500).json({ message: "Error deleting pairs", error: err });

                return res.status(200).json({
                    message: `Successfully deleted ${existingPairs.length} pair(s).`
                });
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
