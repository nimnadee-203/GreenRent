import express from 'express'
import { addToWishlist, checkWishlist, getUserData, getWishlist, removeFromWishlist } from '../controller/user.controller.js';
import userAuth from '../middleware/user.auth.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData)
userRouter.get('/wishlist', userAuth, getWishlist)
userRouter.get('/wishlist/check/:propertyId', userAuth, checkWishlist)
userRouter.post('/wishlist/:propertyId', userAuth, addToWishlist)
userRouter.delete('/wishlist/:propertyId', userAuth, removeFromWishlist)


export default userRouter;