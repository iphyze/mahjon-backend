import {getAllUsers, getUserById, deleteUsers, updateUserDetails} from '../services/users/usersService.js';


export const getAllUsersHandler = getAllUsers;
export const getSingleUserHandler = getUserById;
export const deleteUsersHandler = deleteUsers;
export const updateUserHandler = updateUserDetails;

