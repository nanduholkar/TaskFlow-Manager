const jwt = require("jsonwebtoken");
const User = require("../models/User.js");


// Middleware to protect the routes

const protect = async (req, res, next) => {
    try{
        let token = req.headers.authorization;

        if(token && token.startsWith("Bearer ")){
            token = token.split(" ")[1]; // Extract the token from the "Bearer " prefix
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token      
            req.user = await User.findById(decoded.id).select("-password"); // Attach user to request object, excluding password
            next(); // Proceed to the next middleware or route handler
        }else{
            res.status(401).json({message: "Not authorized, no token"})
        }
    }catch(error){
        res.status(401).json({message: "Not authorized, token failed" , error: error.message})
    }
}

// middleware for Admin-only routes 

const adminOnly = (req, res, next) => {
    if(req.user && req.user.role === "admin"){
        next();
    }else{
        res.status(403).json({message: "Access denied, admin only"})
    }
}


module.exports = { protect, adminOnly}

