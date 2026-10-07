import user from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerUser = async(req, res) => {
    async(req,res) =>{
        const {name , email , password, mobileNumber} =req.body
        if(!name || !email || !password || !mobileNumber){
            return res.status(400).json({message:"Please fill all the fields"})
        }
        let user = await user.findone(email , mobileNumber)
        if(user){
            return res.status(400).json('User already Exists')
        }
        const hasspassword = await bcrypt.hash(password , 100)
         usewr = await user.create({name , email , password:hasspassword , mobileNumber});
         res.json({message :'User registered Successfully' , user})
    }
}

export const login = async(req,res) =>{
    async(req,res) =>{
        const { mobileNumber , password } = req.body
        if(!mobileNumber , !password){
            return res.status(400).json({message: "Enter all the fields"})
        }
        let check = await user.findone(mobileNumber)
        if(!check){
            return res.status(400).json({message :"Enter Mobile Number dont exist"})
        }
        const Validpass = await bcrypt.compare(password , user.password)
        if(!Validpass){
            return res.status(400).json({message:"Enter Correct Password"})
        }
        const token = jwt.sign({userID:user._id} , "#%$*$%^@%*#&");
        res.json({message : "User is Logged in successfully" , token , success:true})
    }
}