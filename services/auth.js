const User = require("../model/user")
const dbService = require("../utils/dbServices");
const userTokens = require("../model/userTokens");
const { JWT, LOGIN_ACCESS,PLATFORM, MAX_LOGIN_RETRY_LIMIT,LOGIN_REACTIVE_TIME,FORGOT_PASSWORD_WITH} = require("../constants/authConstant");
const jwt = require("jsonwebtoken");
const common = require("../utils/comon");
const dayjs = require("dayjs");
const emailService = require("./email");
const ejs = require('ejs');
const uuid = require("uuid").v4;
const bcrypt = require("bcrypt");
const otpGenerator = require('otp-generator')

const generateToken = async (user, secret) => {
    return jwt.sign({ id: user.id, 'email': user.email }, secret, {
        expiresIn: JWT.EXPIRES_IN * 60
    });
}

/**
 * @description : login user.
 * @param {string} username : username of user.
 * @param {string} password : password of user.
 * @param {string} platform : platform.
 * @param {boolean} roleAccess: a flag to request user`s role access
 * @return {Object} : returns authentication status. {flag, data}
 */

const loginUser = async (username, password, platform, roleAccess) => {
    try {
        let where;
        if (Number(username)) {
            where = {phone: username };
        } else {
            where = { email: username };
        }
        where.isActive = true; 
        where.isDeleted = false; 
        let user = await dbService.findOne(User, where);

        if (user) {
            if (user.loginRetryLimit >= MAX_LOGIN_RETRY_LIMIT) {
                let now = dayjs();
                if (user.loginReactiveTime) {
                    let limitTime = dayjs(user.loginReactiveTime);
                    if (limitTime > now) {
                        let expireTime = dayjs().add(LOGIN_REACTIVE_TIME, 'minute');
                        if (!(limitTime > expireTime)) {
                            return {
                                flag: true,
                                data: `you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now, limitTime)}.`
                            };
                        }
                        await dbService.updateOne(User, { _id: user.id }, {
                            loginReactiveTime: expireTime.toISOString(),
                            loginRetryLimit: user.loginRetryLimit + 1
                        });
                        return {
                            flag: true,
                            data: `you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now, expireTime)}.`
                        };
                    } else {
                        user = await dbService.updateOne(User, { _id: user.id }, {
                            loginReactiveTime: '',
                            loginRetryLimit: 0
                        }, { new: true });
                    }
                } else {
                    // send error
                    let expireTime = dayjs().add(LOGIN_REACTIVE_TIME, 'minute');
                    await dbService.updateOne(User,
                        { _id: user.id, isActive: true, isDeleted: false },
                        {
                            loginReactiveTime: expireTime.toISOString(),
                            loginRetryLimit: user.loginRetryLimit + 1
                        });
                    return {
                        flag: true,
                        data: `you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now, expireTime)}.`
                    };
                }
            }
        if (password) {
                const isPasswordMatched = await user.isPasswordMatch(password);
                if (!isPasswordMatched) {
                    await dbService.updateOne(User,
                        { _id: user.id, isActive: true, isDeleted: false },
                        { loginRetryLimit: user.loginRetryLimit + 1 });
                    return { flag: true, data: 'Incorrect Password' }
                }
            }
            const userData = user.toJSON()
            let token;
            if (!user.userType) {
                return { flag: true, data: 'You have not been assigned any role' }
            }
            if (platform == PLATFORM.USERAPP) {
                if (!LOGIN_ACCESS[user.userType].includes(PLATFORM.USERAPP)) {
                    return { flag: true, data: 'you are unable to access this platform' }
                }
                token = await generateToken(userData, JWT.USERAPP_SECRET)
            }
            else if (platform == PLATFORM.ADMIN) {
                if (!LOGIN_ACCESS[user.userType].includes(PLATFORM.ADMIN)) {
                    return { flag: true, data: 'you are unable to access this platform' }
                }
                token = await generateToken(userData, JWT.ADMIN_SECRET)
            }
          
         
            let expire = dayjs().add(JWT.EXPIRES_IN, 'second').toISOString();
            await dbService.create(userTokens, { userId: user.id, token: token, tokenExpiredTime: expire });

            let userToReturn = { ...userData, token };
            return { flag: false, data: userToReturn }

        } else {
            return { flag: true, data: 'User not exists' }
        }
    } catch (error) {
        throw new Error(error.message)
    }
};

// OTP Notifications Via Email and Sms

/**
 * @description : send notification on reset password.
 * @param {Object} user : user document
 * @return {}  : returns status where notification is sent or not
 */
const sendResetPasswordOtpNotification = async (user) => {
    let resultOfEmail = false;
    try {
        let where = {
            _id: user.id,
            isActive: true, isDeleted: false,
        }
       // let token = uuid();
        let token = otpGenerator.generate(6, { digits:true,lowerCaseAlphabets:false ,upperCaseAlphabets: false, specialChars: false });
        console.log(token)
        let expires = dayjs();
        expires = expires.add(FORGOT_PASSWORD_WITH.EXPIRE_TIME, "minute").toISOString();
        await dbService.updateOne(User, where,
            { resetPasswordLink: { code: token, expireTime: expires } });
        if (user.email) {
            let viewType = "/reset-password/";
        
            let mailObj = {
                subject: "Nsfashion Reset Password OTP",
                to: user.email,
                template: "/views/email/OTP/resetPasswordOtp",
                data: {
                    isWidth: true,
                    user: user || '-',
                    token:token
                }
            };
            try {
                await emailService.sendMail(mailObj);
                resultOfEmail = true;
            } catch (error) {
                console.log(error);
            }
        }
      
        return { resultOfEmail };
    } catch (error) {
        throw new Error(error.message);
    }
};






/**
 * @description : reset password.
 * @param {Object} user : user document
 * @param {string} newPassword : new password to be set.
 * @return {}  : returns status whether new password is set or not. {flag, data}
 */
const resetPassword = async (user, newPassword) => {
    try {
        let where = {
            _id: user.id,
            isActive: true, isDeleted: false,
        }
        const dbUser = await dbService.findOne(User, where);
        if (!dbUser) {
            return {
                flag: true,
                data: "User not found",
            };
        }
        newPassword = await bcrypt.hash(newPassword, 8);
        await dbService.updateOne(User, where, {
            "password": newPassword,
            resetPasswordLink: {},
            loginRetryLimit: 0
        });
     
        return {
            flag: false,
            data: "Password reset successfully",
        };
    } catch (error) {
        throw new Error(error.message)
    }
};











/**
  * @description :  send Welcome via SMS By Register.
  * @param {string} user : user document.
  * @return {boolean}  : returns status whether Email is sent or not.
  */

const sendWelcomeRegisterByEmail = async (user) => {
    try {
       
        let mailObj = {
            subject: 'Welcome To Techpyro',
            to: user.email,
            template: '/views/email/WelcomeUser/register',   
            data: {
                isWidth: true,
                user: user || '-',
                message: "Welcome to Techpyro"
            }
        };
        try {
            await emailService.sendMail(mailObj);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};







/**
   * @description :  Social Login.
   * @param {string} email : email of user.
   * @param {platform} platform : platform that user wants to access.
   * @return {boolean}  : returns status whether SMS is sent or not.
   */
const socialLogin = async (email, platform="userapp") => {
    try {
        const user = await dbService.findOne(User, { email });
        if (user && user.email) {
            const { ...userData } = user.toJSON();
            if (!user.userType) {
                return { flag: true, data: 'You have not been assigned any role' }
            }
            if (platform === undefined) {
                return { flag: true, data: 'Please login through Platform' }
            }
            if (!PLATFORM[platform.toUpperCase()] || !JWT[`${platform.toUpperCase()}_SECRET`]) {
                return {
                    flag: true,
                    data: 'Platform not exists'
                };
            }
            if (!LOGIN_ACCESS[user.userType].includes(PLATFORM[platform.toUpperCase()])) {
                return {
                    flag: true,
                    data: 'you are unable to access this platform'
                };
            }
            let token = await generateToken(userData, JWT[`${platform.toUpperCase()}_SECRET`]);
            let expire = dayjs().add(JWT.EXPIRES_IN, 'second').toISOString();
            await dbService.create(userTokens, { userId: user.id, token: token, tokenExpiredTime: expire });
            const userToReturn = { ...userData, token };
            return { flag: false, data: userToReturn };
        }
        else {
            return { flag: true, data: 'User/Email not exists' }
        }
    } catch (error) {
        throw new Error(error.message);
    }
}


module.exports = {loginUser,sendResetPasswordOtpNotification,resetPassword,sendWelcomeRegisterByEmail,socialLogin }