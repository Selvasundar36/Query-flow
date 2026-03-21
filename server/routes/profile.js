const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-profile", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "profile_pictures",
    });

    res.json({ imageUrl: result.secure_url });

  } catch (err) {
    console.log("UPLOAD ERROR:", err);
   const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");
const User = require("../models/User");   // 🔥 IMPORTANT

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ================= UPLOAD PROFILE IMAGE ================= */
router.post("/upload-profile", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "profile_pictures",
    });

    res.json({ imageUrl: result.secure_url });

  } catch (err) {
    console.log("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});


/* ================= UPDATE PROFILE ================= */
router.put("/update-profile", async (req, res) => {
  try {
    const { email, newName, imageUrl } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      {
        name: newName,
        picture: imageUrl,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);

  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router; res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;