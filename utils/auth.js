const jwt = require('jsonwebtoken');

// Create a JWT token for a student
const createToken = (student) => {
    return jwt.sign(
        { id: student._id, email: student.email },
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }  // Token valid for 1 day
    );
};

// Middleware to verify JWT token from cookies
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.student = decoded;  // Attach student info to request object
        next();  // Proceed to the next middleware/route
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = { createToken, verifyToken };
