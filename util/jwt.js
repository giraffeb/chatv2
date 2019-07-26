let jwt = require('jsonwebtoken');
let my_secret = "hellonewworld";

exports.verifyToken = function verifyToken(token){
    let result;
    console.log('my_secret ->', my_secret);
    try{
        result = jwt.verify(token, my_secret);
    }catch(e){
        console.log(e);
        return null;
    }
    return result;
}

exports.signinToken = function signinToken(user_info){
    console.log('my_secret ->', my_secret);
    let user_id = user_info.user_id;
    let expire_time = '1h';

    let token = jwt.sign({user_id: user_id, admin: "user"}, my_secret, {expiresIn: expire_time});

    return token;
}