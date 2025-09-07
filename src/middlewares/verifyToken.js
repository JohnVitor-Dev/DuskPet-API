jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1] || null;
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, secret);

    if (!decoded) {
        return res.status(401).json({ message: 'Failed to authenticate token' });
    }
    req.user = decoded;
    next();
};

module.exports = verifyToken;