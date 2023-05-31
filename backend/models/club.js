const mongoose=require('mongoose');
const { ObjectId } = require("mongodb");
const clubSchema=new mongoose.Schema({
    clubName:{
        type:String,
        required:true
      },
      registerNo:{
        type:String,
        required:true
      },
      place:{
        type:String,
        required:true
      },
      category:{
        type:String,
        required:true
      },
      securityCode:{
        type:String,
        required:true
      },
      president:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      secretory:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      treasurer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      image:{
        type:String,
        default:null
      },
      members: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
        
      }
});

module.exports=mongoose.model("Club",clubSchema);