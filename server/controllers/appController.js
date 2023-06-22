import UserModel from '../model/User.model.js';
import bcrypt from 'bcryptjs';
import Jwt from 'jsonwebtoken';
import ENV from '../config.js';
import otpGenerator from 'otp-generator';


export async function verifyUser(req, res, next) {
    const {username} = req.method === 'GET' ? req.query : req.body;
    try {
        await UserModel.findOne({username}).then(user => {
            if(user) {
                req.user = user;
                next();
            }
            else {
                return res.status(409).json({message: "Invalid Username"});
            }
        }).catch(error => {
            console.log(error);
        });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}


export const register = async (req, res) => {
    try {
        const {username, password, profile, email} = req.body;
        await UserModel.findOne({username}).then(user => {
            if(user) {
                return res.status(409).json({message: "Username already exists with this username"});
            }
        }).catch(error => {
            console.log(error);
        });
        await UserModel.findOne({email}).then(user => {
            if(user) {
                return res.status(409).json({message: "Username already exists with this email"});
            }
        }).catch(error => {
            console.log(error);
        });
        const salt = await bcrypt.genSaltSync(10);
        const hash = await bcrypt.hashSync(password, salt);
        const user = new UserModel({username, password: hash, profile, email});
        await user.save();
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}


export const login = async (req, res) => {
    const {username, password} = req.body;
    try {
        await UserModel.findOne({username}).then(user => {
            if(user) {
                if(bcrypt.compareSync(password, user.password)) {
                    const token = Jwt.sign({
                        userId: user._id,
                        username: user.username,
                    }, ENV.JWT_SECRET, {expiresIn: '1h'});

                    return res.status(200).send({
                        msg: "Login Successful",
                        username: user.username,
                        token: token
                    });
                }
                else {
                    return res.status(409).json({message: "Invalid Password"});
                }
            }
            else {
                return res.status(409).json({message: "Invalid Username"});
            }
        }).catch(error => {
            console.log(error);
        });
    }catch(error) {
        res.status(409).json({ message: error.message });
    }
}

export async function getUser(req, res) {
    const {username} = req.params;
    try {
        await UserModel.findOne({username}).then(user => {
            if(user) {
                const {password, ...rest} = user._doc;
                return res.status(200).json(rest);
            }
            else {
                return res.status(409).json({message: "Invalid Username"});
            }
        }).catch(error => {
            console.log(error);
        });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export async function updateUser(req, res) {
    const body = req.body;
    const {userId} = req.user;
    try {
        await UserModel.findOneAndUpdate({_id: userId}, body).then(user => {
            if(user) {
                return res.status(200).json({message: "User Updated"});
            }
            else {
                return res.status(409).json({message: "Invalid Username"});
            }
        }).catch(error => {
            console.log(error);
        }
        );
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export async function generateOTP(req, res) {
    const OTP = await otpGenerator.generate(6, {lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false});
    req.app.locals.OTP = OTP;
    return res.status(200).json({ message: "OTP generated", code: OTP });
}

export async function verifyOTP(req, res) {
    const { OTP } = req.query;
    if (OTP === req.app.locals.OTP) {
        return res.status(200).json({ message: "OTP verified" });
    }
    else {
        return res.status(409).json({ message: "OTP not verified" });
    }
}

export async function createResetSession(req, res) {
    if(req.app.locals.resetSession) {
        req.app.locals.resetSession = false;
        return res.status(200).json({ message: "Reset session created" });
    }
    else {
        return res.status(409).json({ message: "Reset session not created" });
    }
}

export async function resetPassword(req, res) {
    const {username, password} = req.body;
    try {
        if(!req.app.locals.resetSession) {
            return res.status(409).json({message: "Reset session not created"});
        }
        await UserModel.findOne({username}).then(async (user) => {
            if(!user) {
                return res.status(409).json({message: "Invalid Username"});
            }else {
                const salt = await bcrypt.genSaltSync(10);
                const hash = await bcrypt.hashSync(password, salt);
                user.password = hash;
                user.save();
                return res.status(200).json({message: "Password Reset Successful"});
            }
        }).catch(error => {
            console.log(error);
        }
        );
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}


