const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Club = require('../models/club');
const Finance=require('../models/finance');
const upload = require('../middlewares/multer');
const { ObjectId } = require('mongodb');


    const updateFinance = async (req, res, next) => {
        console.log(req.body);
        try {
            const { username,reason,date,amount,status } = req.body;
            const check = await Club.findOne({_id:req.params.id});
            
            const finance = new Finance({
                clubName:check._id,
                name:username,
                reason: reason,
                amount: amount,
                date: date,
                status:status
            })
            if(status===true){
           
              await Club.updateOne({_id:req.params.id},{$inc:{cash:amount}})
             }
            if(status===false){
            
               await Club.updateOne({_id:req.params.id},{$inc:{cash:-amount}})
             
             }
            const added = await finance.save();
            let financial=await Finance.find({clubName:req.params.id}).sort({date:1})
         res.send(financial)
        } catch (error) {
            next(error);
        }
    };
  
    
    const getFinancialData=async (req,res,next)=>{
        try {
         let financial=await Finance.find({clubName:req.params.id}).sort({date:1})
         res.send(financial)
        } catch (error) {
            next(error);
        }
    }

module.exports = {
    updateFinance,
    getFinancialData
  }
