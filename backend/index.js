
const express=require('express');

const mongoose=require('mongoose');

const cors=require('cors');

const cookieParser=require('cookie-parser');

const app= express();

app.use(cors({
    credentials:true,
    origin:['http://localhost:4200']
}));

app.use(cookieParser());

app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/E-Club",{
    useNewUrlParser:true,
    useUnifiedTopology: true
}).then(() => {
    console.log('connection sucsessful')
    app.listen(5000,()=>{
        console.log("app is listening 5000 port");
    })
  }).catch((error) => {
    console.log('somthing wrong', error)
  })

  const userRoute=require('./routes/userRoute');
  app.use("/",userRoute); 

//   const adminRoute=require('./routes/adminRoute');
//   app.use("/admin",adminRoute); 