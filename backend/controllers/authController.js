const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};



const registerUser = async (req, res) => {
    try{

        
        const {name, email, password, profileImageUrl, adminInviteToken} = req.body

        if(!name || !email || !password){
            return res.status(400).json({message: "Please provide all required fields"})
        }

        // Check if user already exists
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(409).json({message: "User already exists"})
        }

        // Determine if the user is an admin based on the invite token

        let role = "member"
        if(adminInviteToken && adminInviteToken?.trim() === process.env.ADMIN_INVITE_TOKEN){
            role = "admin"
        }
         
        // Hash the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create the user
        const user = await User.create({
            name, 
            email, 
            password: hashedPassword,
            profileImageUrl,
            role
        })

        // Return the user data with JWT

        res.status(201).json({
            _id: user._id,
            name: user.name, 
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            role: user.role,
            token: generateToken(user._id)
        })

    }
    catch(error){
        return res.status(500).json({message: "Server error", error: error.message})
    }

}

const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body
        // Check if user exists
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message: "Invalid email or password"  })
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({message: "Invalid email or password"  })
        }

        // Return the user data with JWT
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            role: user.role,
            token: generateToken(user._id)
        })
    }
    catch(error){
        return res.status(500).json({message: "Server error", error: error.message})
    }
}

const getUserProfile = async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password")
        if(!user){
            return res.status(404).json({message: "User not found"})
        }
        return res.status(200).json(user)
    }
    catch(error){
        return res.status(500).json({message: "Server error", error: error.message})
    }
}

const updateUserProfile = async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password")
        
        if(!user){
            return res.status(404).json({message: "User not found"})

        }
        user.name = req.body.name || user.name
        user.email = req.body.email || user.email

        if(req.body.password){
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(req.body.password, salt)
        }

        const updatedUser = await user.save()

        return res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser._id)
        })
    }
    catch(error){
        res.status(500).json({message: "Server error", error: error.message})
    }
}

module.exports = {registerUser,  loginUser, getUserProfile, updateUserProfile   }

