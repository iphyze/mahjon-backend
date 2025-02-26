import {getAllUsers, getUserById, deleteUsers, updateUserDetails, 
    sendNotification, getUserNotifications, markNotificationAsRead, updatePushToken
} from '../services/users/usersService.js';


export const getAllUsersHandler = getAllUsers;
export const getSingleUserHandler = getUserById;
export const deleteUsersHandler = deleteUsers;
export const updateUserHandler = updateUserDetails;
export const notificationHandler = sendNotification;
export const getUserNoticeHandler = getUserNotifications;
export const markNoticeHandler = markNotificationAsRead;
export const updatePushTokenHandler = updatePushToken;

