import express from 'express'
import { addToWishlist, checkWishlist, getPendingSellerRequests, getPublicSellerProfile, getUserData, getWishlist, removeFromWishlist } from '../controllers/user.controller.js';
import userAuth from '../middleware/user.auth.js';
import { isAdmin } from '../middleware/role.middleware.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData)
userRouter.get('/admin/seller-requests', userAuth, isAdmin, getPendingSellerRequests)
userRouter.get('/public/:userId', getPublicSellerProfile)
userRouter.get('/wishlist', userAuth, getWishlist)
userRouter.get('/wishlist/check/:propertyId', userAuth, checkWishlist)
userRouter.post('/wishlist/:propertyId', userAuth, addToWishlist)
userRouter.delete('/wishlist/:propertyId', userAuth, removeFromWishlist)


export default userRouter;
