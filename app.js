const express = require('express')
const app = express();

const userModel  = require("./models/user");
const cookieParser = require('cookie-parser');
const bcrypt  = require('bcrypt');
const jwt = require('jsonwebtoken')
const postModel  = require("./models/post")
const crypto  = require('crypto');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
   crypto.randomBytes(12, )
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

app.get("/",(req,resp)=>{
    resp.render("index");
})

app.get("/multer",(req,resp)=>{
  resp.render("multer");
})



app.get("/login", (req,resp)=>{
    resp.render("login");
})
app.get("/profile", async (req,resp)=>{  //isLoogedin,
let user = await userModel.findOne({email: req.user.email});
console.log(user);
resp.render("profile")
 

})

app.get("/logout", (req,resp)=>{
  resp.cookie("token", "") // log out ke liye bas cookie ko hata diya h jo set thi
  resp.redirect("login");
})

function isLoogedin(req,resp,next){  /// use for the protected route
 if(req.cookies.token === "") resp.redirect("/login");
 else{
  let data = jwt.verify(req.cookies.token, "sajid");
  req.user = data;
 
 next();
} 
}

app.post("/register", async (req,resp)=>{
    let{email,password,username,name,age} = req.body;

  let user = await userModel.findOne({email})
  if(user) return resp.status(500).send("user already register"); //check karenge user mail pahle se active hai ya nai

  bcrypt.genSalt(10, (err,salt)=>{
    bcrypt.hash(password,salt, async (err, hash)=>{
        let user =await userModel.create({ // user ayega ye sara data liya gya h user ka
            username,
            email,
            age,
            name,
            password: hash
        });
      let token = jwt.sign({email: email,userid: user._id}, "sajid")
      resp.cookie("token",token)
      resp.send("registered")

    })
  })
})

app.post("/login", async (req,resp)=>{
    let{email,password} = req.body;

  let user = await userModel.findOne({email})
  if(!user) return resp.status(500).send("somethng went wromng"); //check karenge user mail pahle se active hai ya nai
   
  bcrypt.compare(password, user.password, function(err, result){ //its  a bcrypt function for comparing password to log in
    if(result) {
      let token = jwt.sign ({email: email,userid: user._id}, "sajid");
      resp.cookie("token", token);
      resp.status(200).send("/profile")
    }
      else resp.redirect("/login")
    
  })
  
})





app.listen(3000);