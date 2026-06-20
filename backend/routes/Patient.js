import express from "express";
import Patient from "../models/Patient.js";
import User from "../models/User.js";
import { verifyFirebaseToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/submit", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;

    // 1. Save or Update Patient Info
    const patient = await Patient.findOneAndUpdate(
      { uid },
      { ...req.body, uid },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    // 2. Update the User's profileCompleted status
    await User.findOneAndUpdate(
      { uid }, 
      { profileCompleted: true }
    );

    res.status(200).json({
      success: true,
      message: "Patient data saved and profile marked as completed",
      patient,
    });
  } catch (err) {
    console.error("FULL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET patient data
router.get("/get", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const patient = await Patient.findOne({ uid }).lean();

    if (!patient) {
      return res.status(200).json({
        fullName: "",
        age: "",
        gender: "",
        bloodGroup: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        selectedDisease: "",
        otherDisease: "",
        specialty: "",
        symptoms: "",
        allergies: "",
        currentMedications: "",
        emergencyName: "",
        emergencyContact: "",
        medicalDocuments: [],
      });
    }

    res.status(200).json(patient);
  } catch (err) {
    console.error("Error fetching patient data:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE patient data
router.put("/update", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const patient = await Patient.findOneAndUpdate(
      { uid },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Patient data updated",
      patient,
    });
  } catch (err) {
    console.error("Error updating patient data:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;