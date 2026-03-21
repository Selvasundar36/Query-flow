// routes/auth.js

const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client("509891504581-fiqbg3mp90kc33npivbi7q2d1b8v8r0a.apps.googleusercontent.com");

router.post("/google", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "509891504581-fiqbg3mp90kc33npivbi7q2d1b8v8r0a.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();

    const user = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };

    res.json({ user });

  } catch (error) {
    res.status(400).json({ error: "Invalid Token" });
  }
});

module.exports = router;