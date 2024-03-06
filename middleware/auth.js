const User = require('../models/user');
const jwt = require('../util/jwtToken');

exports.authorization = async (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        const ReqUser = jwt.verifyToken(token);
        const user = await User.findByPk(ReqUser.userId);
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ status: false, err: error, error: 'unauthorize access' });
    }

}