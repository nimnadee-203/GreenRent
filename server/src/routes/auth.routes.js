import express from 'express'
import { login, logout, register ,requestSeller,approveSeller} from '../controller/auth.controller.js';
import { isAdmin } from '../middleware/role.middleware.js'
import userAuth from '../middleware/user.auth.js';

const authRouter = express.Router();

authRouter.post('/register',register)

authRouter.post('/login',login)

authRouter.post('/logout',logout)

authRouter.post('/request-seller', userAuth, requestSeller);

authRouter.patch('/approve-seller/:id',userAuth,isAdmin,approveSeller);


export default authRouter;