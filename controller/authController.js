
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {

  if(process.env.NODE_ENV === "test"){
    next()
  }
  else{
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      req.userId = decoded.userId;
      next();
    });
  }
}

module.exports = authenticateToken;