import express from "express";
import User from "../models/User.js";
import { admin } from "../firebaseAdmin.js";
import AppError from "../utils/AppError.js";

const router = express.Router();

// Sync user from Firebase to MongoDB
router.post("/sync", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new AppError(401, "No token provided"));
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth.verifyIdToken(token);
    const { role, extra } = req.body;

    // 🔑 Check if user already exists
    let user = await User.findOne({ uid: decodedToken.uid });

    // 🆕 First-time user → role REQUIRED
    if (!user) {
      if (!role || !["patient", "doctor"].includes(role)) {
        return next(
          new AppError(
            400,
            "Role must be either 'patient' or 'doctor'"
          )
        );
      }

      // Inside router.post("/sync", ...)
      user = await User.create({
        uid: decodedToken.uid,
        email: decodedToken.email,
        // Check the token first, then the request body, then a fallback string
        displayName: decodedToken.name || extra?.name || "New User",
        role,
        provider: "password",
        metadata: { ...extra, emailVerified: decodedToken.email_verified },
        profileCompleted: false,
        lastSeen: new Date(),
      });
    }
    // 🔁 Existing user → NO role change
    else {
      user.lastSeen = new Date();
      await user.save();
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Get logged-in user role (for login redirect)
router.post("/login", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next(new AppError(401, "No token provided"));

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth.verifyIdToken(token);

    const user = await User.findOne({ uid: decodedToken.uid }).lean();

    if (!user) {
      return next(
        new AppError(404, "User not found")
      );
    }

    // If doctor, check doctor profile completion
    if (user.role === "doctor") {
      const Doctor = (await import("../models/Doctor.js")).default;
      const doctor = await Doctor.findOne({ uid: decodedToken.uid }).lean();

      return res.json({
        role: user.role,
        profileCompleted: doctor ? doctor.profileCompleted : false,
      });
    }

    res.json({
      role: user.role,
      profileCompleted: user.profileCompleted,
    });
  } catch (err) {
    next(err);
  }
});


export default router;
