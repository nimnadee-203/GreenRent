import express from 'express'
import { getUserData } from '../controller/user.controller.js';
import userAuth from '../middleware/user.auth.js';

const userRouter = express.Router();

userRouter.get('/data',userAuth,getUserData)


export default userRouter;