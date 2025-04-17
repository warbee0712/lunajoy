const { findUserById, createUser } = require('../models/db');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token missing' });

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const userId = payload.sub;

    let user = await findUserById(userId);
    if (!user) {
      user = await createUser(userId, payload.email, payload.name, payload.picture);
    }

    const jwtToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.json({ token: jwtToken, user });
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { googleLogin };
