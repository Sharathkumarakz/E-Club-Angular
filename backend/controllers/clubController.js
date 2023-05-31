



const express=require("express");
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');


const User = require('../models/user');
const Club= require('../models/club');
const Post = require('../models/post');

const upload=require('../middlewares/multer')

const { ObjectId } = require('mongodb');
const { request } = require('express');

const clubRegister = async (req, res, next) => {
    try {
        console.log(req.body);
        let clubName = req.body.clubName;
        let registerNo=req.body.registerNo;
        let place=req.body.place;
        let securityCode=req.body.securityCode;
        let category=req.body.category;
        let president=req.body.president
        let secretory=req.body.secretory
        let treasurer=req.body.treasurer
        const check = await Club.findOne({ clubName:clubName })
        console.log("here");
        if (check) {
            return res.status(400).send({
                message: "This club name is not available"
            })
        } else {
        let presidentActive= await  User.findOne({email:president}).exec()
        let secretoryActive= await  User.findOne({email:secretory}).exec()
        let treasurerActive= await  User.findOne({email:treasurer}).exec()
    
        if(!presidentActive){
            return res.status(400).send({
                message: "President not available"
            })
        }
        if(!secretoryActive){
            return res.status(400).send({
                message: "Secretory not available"
            })  
        }
        if(!treasurerActive){
            return res.status(400).send({
                message: "treasurer not available"
            })   
        }
        console.log(treasurerActive);
            const changeP = await bcrypt.genSalt(10)
            const hashedcode = await bcrypt.hash(securityCode, changeP)
            const club = new Club({
                clubName: clubName,
                securityCode: hashedcode,
                category: category,
                place: place,
                registerNo:registerNo,
                president:presidentActive._id,
                secretory:secretoryActive._id,
                treasurer:treasurerActive._id
            })
            const added = await club.save();
            res.json({
                message: "success"
            })
        }

    } catch (error) {
      next(error);
    }
  
  }


  let joinClub=async(req,res,next)=>{
    try {
   let found=await Club.findOne({clubName:req.body.clubName});
   if(found){
    if(!(await bcrypt.compare(req.body.securityCode,found.securityCode))){
        return res.status(404).send({
            message:"secretCode is Incorrect"
        })  
       }else{
        const cookie=req.cookies['jwt']
        const claims=jwt.verify(cookie,"TheSecretKey")
        if(!claims){
            return res.status(401).send({
                message:"UnAuthenticated"
            })
        }
        // const GettingUser = await User.findOne({ _id: claims._id })
       let isPresident=Club.findOne({ president:claims._id })
       let isSecretory=Club.findOne({ secretory:claims._id })
       let isTreasurer=Club.findOne({ treasurer:claims._id })
       
       if(isPresident){
        res.json({president: true,id:found._id});
       }
       if(isSecretory){
        res.json({ secretory: true,id:found._id })
       }
       if(isTreasurer){
        res.json({ treasurer: true ,id:found._id})
       }
       else{
        res.json({ notAllowed: true})
       }
       }
   }else{
    return res.status(404).send({
        message:"There is no such club"
    })  
   }
 
    } catch (error) {
        next(error);  
    }
  }


  
const clubData = async (req, res, next) => {
    try {
        console.log(req.params.id);
        console.log("getting club data");
        const gettingClub = await Club.findOne({ _id:req.params.id})
        const {password,...data}=await gettingClub.toJSON()
       
        res.send(data)
      
    } catch (error) {
      next(error);
    }
  
  }


  
  const profilePictureUpdate=async (req,res,next)=>{
            
    images=req.file.filename
try{
          const updated = await Club.updateOne({_id: req.params.id},{$set:{image:images}})
          const gettingClub = await Club.findOne({ _id: req.params.id })
          const {password,...data}=await gettingClub.toJSON()
          res.send(data)
      } catch (err) {
          return res.status(401).send({
              welcome:"UnAuthenticated" 
          })
      }

        }

          
  const addPost=async (req,res,next)=>{
            
    images=req.file.filename
try{
       console.log(images);
       const { textFieldName } = req.body;
    const user = JSON.parse(textFieldName);
    console.log(user.caption);
     let club=await Club.findOne({_id:req.params.id})
     console.log(club);
    //  let clubId=club._id;
    //  let caption=user.caption;
    //  let image=images
    // let add=await Post.insertOne({})
        //   const gettingClub = await Club.findOne({ _id: req.params.id })
        //   const {password,...data}=await gettingClub.toJSON()
        const post = new Post({
            clubName:club._id,
            caption:user.caption,
            image:images
        })
        const added = await post.save();
        const gettingPost = await Post.find({ clubName:req.params.id})
        res.send(gettingPost)  
      } catch (err) {
          return res.status(401).send({
              welcome:"UnAuthenticated" 
          })
      }
        }


        const getPosts=async(req,res,next)=>{
            try {
                const gettingPost = await Post.find({ clubName:req.params.id})

                // const {password,...data}=await gettingPost.toJSON()
                res.send(gettingPost)  
            } catch (error) {
                return res.status(401).send({
                    welcome:"UnAuthenticated" 
                }) 
            }
        }

        const deletePost=async(req,res,next)=>{
            try {

                let postdetail=await Post.findOne({ _id:req.params.id})
                const deleting = await Post.deleteOne({_id:req.params.id})
                const gettingPost = await Post.find({ clubName:postdetail.clubName})

                res.send(gettingPost)  
            } catch (error) {
                return res.status(401).send({
                    welcome:"UnAuthenticated" 
                }) 
            }
        }



        const userRole = async (req, res, next) => {
            try {
              let found = await Club.findOne({ _id: req.params.id });
          
              if (found) {
                const cookie = req.cookies['jwt'];
                const claims = jwt.verify(cookie, "TheSecretKey");
                if (!claims) {
                  return res.status(401).send({
                    message: "UnAuthenticated"
                  });
                }
          
                let isPresident = await Club.findOne({ president: claims._id });
                let isSecretary = await Club.findOne({ secretary: claims._id });
                let isTreasurer = await Club.findOne({ treasurer: claims._id });
          
                if (isPresident) {
                  return res.json({ president: true, id: found._id });
                }
                if (isSecretary) {
                  return res.json({ secretary: true, id: found._id });
                }
                if (isTreasurer) {
                  return res.json({ treasurer: true, id: found._id });
                }
              }
            } catch (error) {
              return res.status(401).send({
                welcome: "UnAuthenticated"
              });
            }
          };

          const addMember = async (req, res, next) => {
            try {          
              let found = await Club.findOne({ _id: req.params.id });
               let userFound=await User.findOne({email:req.body.member})
            if(!userFound) {
                return res.status(404).send({
                    message:"There is no such user"
                })  
            }
            let isAvailable=await Club.findOne({_id:req.params.id})
            if(!isAvailable.members.includes(userFound._id)){
              if (found) {
               let adding=await Club.updateOne({_id:req.params.id},{$push:{members:userFound._id}})
               let gettingMember=await Club.findById(req.params.id).populate('members').exec();
               res.send(gettingMember)  
            }}else{
                return res.status(404).send({
                    message:"user already in"
                })  
            }
            } catch (error) {
              return res.status(401).send({
                welcome: "UnAuthenticated"
              });
            }
          }

        
          
// const addMember = async (req, res, next) => {
//   try {
//     const found = await Club.findOne({ _id: req.params.id });
//     const userFound = await User.findOne({ email: req.body.member });

//     if (!userFound) {
//       return res.status(404).send({
//         message: "There is no such user"
//       });
//     }

//     const isAvailable = await Club.findOne({ _id: req.params.id });

//     if (!isAvailable.members.includes(userFound._id)) {
//       if (found.president.equals(userFound._id)) {
//         return res.status(409).send({
//           message: "This member is already the President"
//         });
//       }
//       if (found.secretary.equals(userFound._id)) {
//         return res.status(409).send({
//           message: "This member is already the Secretary"
//         });
//       }
//       if (found.treasurer.equals(userFound._id)) {
//         return res.status(409).send({
//           message: "This member is already the Treasurer"
//         });
//       }

//       found.members.push(userFound._id);
//       await found.save();
//       const updated = await Club.findOne({ _id: req.params.id });
//       res.send(updated);
//     } else {
//       return res.status(409).send({
//         message: "This member is already added"
//       });
//     }
//   } catch (error) {
//     return res.status(401).send({
//       message: "Unauthenticated"
//     });
//   }
// };

const getMembers = async (req, res, next) => {
    try {
        const club = await Club.findById(req.params.id).populate('members').exec();
        res.send(club);
    } catch (error) {
      return res.status(401).send({
        message: "Unauthenticated"
      });
    }
  };

  const  deleteMembers = async (req, res, next) => {
    try {
      let adding=await Club.updateOne({_id:req.body.club},{$pull:{members:req.body.user}})
console.log(adding,"nnnnnnnnnnnnnnnnnnnnnnnnn");
        const club = await Club.findById(req.body.club).populate('members').exec();
        res.send(club);
    } catch (error) {
      return res.status(401).send({
        message: "Unauthenticated"
      });
    }
  };
module.exports = {

    clubRegister,
    joinClub,
    clubData,
    profilePictureUpdate,
    addPost,
    getPosts,
    deletePost,
    userRole,
    addMember,
    getMembers,
    deleteMembers
  }
// const Club = require('../models/club');
// const Post = require('../models/post');
// const User = require('../models/user');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const upload = require('../middlewares/multer');

// const clubRegister = async (req, res, next) => {
//   try {
//     const { clubName, registerNo, place, securityCode, category, president, secretory, treasurer } = req.body;
//     const check = await Club.findOne({ clubName });
//     if (check) {
//       return res.status(400).send({
//         message: "This club name is not available"
//       });
//     }
//     const [presidentActive, secretoryActive, treasurerActive] = await Promise.all([
//       User.findOne({ email: president }).exec(),
//       User.findOne({ email: secretory }).exec(),
//       User.findOne({ email: treasurer }).exec()
//     ]);
//     if (!presidentActive) {
//       return res.status(400).send({
//         message: "President not available"
//       });
//     }
//     if (!secretoryActive) {
//       return res.status(400).send({
//         message: "Secretary not available"
//       });
//     }
//     if (!treasurerActive) {
//       return res.status(400).send({
//         message: "Treasurer not available"
//       });
//     }
//     const changeP = await bcrypt.genSalt(10);
//     const hashedCode = await bcrypt.hash(securityCode, changeP);
//     const club = new Club({
//       clubName,
//       securityCode: hashedCode,
//       category,
//       place,
//       registerNo,
//       president: presidentActive._id,
//       secretory: secretoryActive._id,
//       treasurer: treasurerActive._id
//     });
//     const added = await club.save();
//     res.json({
//       message: "Success"
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const joinClub = async (req, res, next) => {
//   try {
//     const { clubName, securityCode } = req.body;

//     const found = await Club.findOne({ clubName });

//     if (!found || !(await bcrypt.compare(securityCode, found.securityCode))) {
//       return res.status(404).send({
//         message: "Secret code is incorrect or the club does not exist"
//       });
//     }

//     const cookie = req.cookies['jwt'];
//     const claims = jwt.verify(cookie, "TheSecretKey");

//     if (!claims) {
//       return res.status(401).send({
//         message: "Unauthenticated"
//       });
//     }

//     const isPresident = await Club.findOne({ president: claims._id });
//     const isSecretory = await Club.findOne({ secretory: claims._id });
//     const isTreasurer = await Club.findOne({ treasurer: claims._id });

//     if (isPresident) {
//       res.json({ president: true, id: found._id });
//     } else if (isSecretory) {
//       res.json({ secretary: true, id: found._id });
//     } else if (isTreasurer) {
//       res.json({ treasurer: true, id: found._id });
//     } else {
//       res.json({ notAllowed: true });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// const clubData = async (req, res, next) => {
//   try {
//     const gettingClub = await Club.findOne({ _id: req.params.id });
//     const { password, ...data } = gettingClub.toJSON();
//     res.send(data);
//   } catch (error) {
//     next(error);
//   }
// };

// const profilePictureUpdate = async (req, res, next) => {
//   try {
//     const images = req.file.filename;
//     const updated = await Club.updateOne({ _id: req.params.id }, { $set: { image: images } });
//     const gettingClub = await Club.findOne({ _id: req.params.id });
//     const { password, ...data } = gettingClub.toJSON();
//     res.send(data);
//   } catch (err) {
//     return res.status(401).send({
//       message: "Unauthenticated"
//     });
//   }
// };

// const addPost = async (req, res, next) => {
//   try {
//     const images = req.file.filename;
//     const { textFieldName } = req.body;
//     const user = JSON.parse(textFieldName);

//     const club = await Club.findOne({ _id: req.params.id });

//     const post = new Post({
//       clubName: club._id,
//       caption: user.caption,
//       image: images
//     });

//     const added = await post.save();
//     const gettingPost = await Post.find({ clubName: req.params.id });
//     res.send(gettingPost);
//   } catch (err) {
//     return res.status(401).send({
//       message: "Unauthenticated"
//     });
//   }
// };

// const getPosts = async (req, res, next) => {
//   try {
//     const gettingPost = await Post.find({ clubName: req.params.id });
//     res.send(gettingPost);
//   } catch (error) {
//     return res.status(401).send({
//       message: "Unauthenticated"
//     });
//   }
// };

// const deletePost = async (req, res, next) => {
//   try {
//     const postdetail = await Post.findOne({ _id: req.params.id });
//     const deleting = await Post.deleteOne({ _id: req.params.id });
//     const gettingPost = await Post.find({ clubName: postdetail.clubName });
//     res.send(gettingPost);
//   } catch (error) {
//     return res.status(401).send({
//       message: "Unauthenticated"
//     });
//   }
// };

// const userRole = async (req, res, next) => {
//   try {
//     const found = await Club.findOne({ _id: req.params.id });

//     if (found) {
//       const cookie = req.cookies['jwt'];
//       const claims = jwt.verify(cookie, "TheSecretKey");

//       if (!claims) {
//         return res.status(401).send({
//           message: "Unauthenticated"
//         });
//       }

//       const isPresident = await Club.findOne({ president: claims._id });
//       const isSecretary = await Club.findOne({ secretary: claims._id });
//       const isTreasurer = await Club.findOne({ treasurer: claims._id });

//       if (isPresident) {
//         return res.json({ president: true, id: found._id });
//       }
//       if (isSecretary) {
//         return res.json({ secretary: true, id: found._id });
//       }
//       if (isTreasurer) {
//         return res.json({ treasurer: true, id: found._id });
//       }
//     }
//   } catch (error) {
//     return res.status(401).send({
//       welcome: "Unauthenticated"
//     });
//   }
// };

// const addMember = async (req, res, next) => {
//   try {
//     const found = await Club.findOne({ _id: req.params.id });
//     const userFound = await User.findOne({ email: req.body.member });

//     if (!userFound) {
//       return res.status(404).send({
//         message: "There is no such user"
//       });
//     }

//     const isAvailable = await Club.findOne({ _id: req.params.id });

//     if (!isAvailable.members.includes(userFound._id)) {
//       if (found.president.equals(userFound._id)) {
//         return res.status(409).send({
//           message: "This member is already the President"
//         });
//       }
//       if (found.secretary.equals(userFound._id)) {
//         return res.status(409).send({
//           message: "This member is already the Secretary"
//         });
//       }
//       if (found.treasurer.equals(userFound._id)) {
//         return res.status(409).send({
//           message: "This member is already the Treasurer"
//         });
//       }

//       found.members.push(userFound._id);
//       await found.save();
//       const updated = await Club.findOne({ _id: req.params.id });
//       res.send(updated);
//     } else {
//       return res.status(409).send({
//         message: "This member is already added"
//       });
//     }
//   } catch (error) {
//     return res.status(401).send({
//       message: "Unauthenticated"
//     });
//   }
// };

// const getMembers = async (req, res, next) => {
//     try {
//         console.log("hhhh");
//         const club = await Club.findById(req.params.id).populate('members').exec();
//         res.send(club);
//     } catch (error) {
//       return res.status(401).send({
//         message: "Unauthenticated"
//       });
//     }
//   };


// module.exports = {
//   clubRegister,
//   joinClub,
//   clubData,
//   profilePictureUpdate,
//   addPost,
//   getPosts,
//   deletePost,
//   userRole,
//   addMember,
//   getMembers
// };

