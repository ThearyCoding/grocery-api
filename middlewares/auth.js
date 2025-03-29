const jwt = require('jsonwebtoken');

exports.authMedddleware = (req,res,next) => {
    try {
        const token = req.header("Authorization");
        if(!token){
            return res.statusO(401).json({message: "Access denied, No token provided."});
        }
        const decorded = jwt.verify(token.replace("Bearer ",""),process.env.JWT_SCRET);
        req.user = decorded;
        next();
    } catch (error) {
        res.status(401).json({message: "Invalid or expired token."});
    }
}