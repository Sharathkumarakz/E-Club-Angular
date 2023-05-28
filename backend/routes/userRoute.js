const express = require("express");
const uRoute = express();

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const User = require('../models/user');


uRoute.post('/register', async (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    const check = await User.findOne({ email: email })
    console.log("here");
    if (check) {
        return res.status(400).send({
            message: "Email is already registered"
        })
    } else {
        const changeP = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, changeP)
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        })
        const added = await user.save();
        //create jwt token
        const { _id } = await added.toJSON();
        const token = jwt.sign({ _id: _id }, "TheSecretKey")
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        })
        res.json({
            message: "success"
        })
    }

})



uRoute.post('/login', async (req, res) => {
    const GettingUser = await User.findOne({ email:req.body.email })
    if(!GettingUser){
        return res.status(404).send({
            message:"User not Found"
        })
    }
    if(!(await bcrypt.compare(req.body.password,GettingUser.password))){
        return res.status(404).send({
            message:"Password is Incorrect"
        })  
    }
    const token = jwt.sign({ _id: GettingUser._id }, "TheSecretKey")
    res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    })
    res.json({
        message: "success"
    })
}
)



uRoute.get('/user', async (req, res) => {
    try {
       console.log("lodding");
        const cookie=req.cookies['jwt']
        const claims=jwt.verify(cookie,"TheSecretKey")
        if(!claims){
            return res.status(401).send({
                message:"UnAuthenticated"
            })
        }
        const GettingUser = await User.findOne({ _id: claims._id })
        const {password,...data}=await GettingUser.toJSON()
        res.send(data)
    } catch (err) {
        return res.status(401).send({
            welcome:"UnAuthenticated" 
        })
    }
})

uRoute.post('/logout', async (req, res) => {
    console.log("getting");
    res.cookie("jwt","", {
        maxAge:0
    })
    res.send({message:"success"})
})

uRoute.get('/profile',async (req, res) => {
    try {
         const cookie=req.cookies['jwt']
         const claims=jwt.verify(cookie,"TheSecretKey")
         if(!claims){
             return res.status(401).send({
                 message:"UnAuthenticated"
             })
         }
         const GettingUser = await User.findOne({ _id: claims._id })
         const {password,...data}=await GettingUser.toJSON()
         res.send(data)
     } catch (err) {
         return res.status(401).send({
             welcome:"UnAuthenticated" 
         })
     }
})

// uRoute.post('/profile-upload-single',upload.single('image'),async (req, res, next) => {
//    console.log("nonnnnnnnnnnnn");
//   console.log(req.file.filename+"fffffss");
  
//     images=req.file.filename

//    console.log(images);
//     try {
//         console.log("lodding");
//          const cookie=req.cookies['jwt']
//          const claims=jwt.verify(cookie,"TheSecretKey")
//          if(!claims){
//              return res.status(401).send({
//                  message:"UnAuthenticated"
//              })
//          }
//          const updated = await User.updateOne({ _id: claims._id },{$set:{image:images}})
//          const GettingUser = await User.findOne({ _id: claims._id })
//          const {password,...data}=await GettingUser.toJSON()
//          res.send(data)
//      } catch (err) {
//          return res.status(401).send({
//              welcome:"UnAuthenticated" 
//          })
//      }
//     });


module.exports = uRoute;