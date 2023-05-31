const express = require("express");
const uRoute = express();

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');


const User = require('../models/user');

const upload=require('../middlewares/multer')


const userController=require("../controllers/userController")
const clubController=require("../controllers/clubController")

uRoute.post('/register',userController.userRegister)


uRoute.post('/gmail/register',userController.mailRegistration)


uRoute.post('/login',userController.userLogin)

uRoute.get('/user',userController.userAuth)

uRoute.post('/logout',userController.logOut)

uRoute.get('/profile',userController.viewProfile)


uRoute.post('/profile-upload-single',upload.single('image'),userController.profilePictureUpdate)

uRoute.post('/update/profile',userController.profileUpdating)

uRoute.post('/register/club',clubController.clubRegister)

uRoute.post('/join/club',clubController.joinClub)

uRoute.get('/club/:id',clubController.clubData)


uRoute.post('/club/pictureUpdate/:id',upload.single('image'),clubController.profilePictureUpdate)

uRoute.post('/club/addPost/:id',upload.single('image'),clubController.addPost)

uRoute.get('/club/posts/:id',clubController.getPosts)

uRoute.get('/club/deletePost/:id',clubController.deletePost)

uRoute.get('/club/roleAuthentication/:id',clubController.userRole)

uRoute.post('/club/addMember/:id',clubController.addMember)

uRoute.post('/club/members/:id',clubController.getMembers)

uRoute.post('/club/deleteMember',clubController.deleteMembers)



module.exports = uRoute;
