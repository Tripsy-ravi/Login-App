import ENV from '../config.js';
import jwt from 'jsonwebtoken'; 

export const Auth = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({message: "Unauthorized"});
    }
}

export const localVariables = async (req, res, next) => {
    req.app.locals = {
        OTP: null,
        resetSession: false,
    }
    next();
}
   
