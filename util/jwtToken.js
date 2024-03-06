const jwt =  require('jsonwebtoken');

exports.generateToken =(id,name,premium)=>{
    return jwt.sign({userId:id,name:name,isPremium:premium},process.env.SECRET_KEY);
}

exports.verifyToken =(token)=>{
    return jwt.verify(token,process.env.SECRET_KEY);
}



