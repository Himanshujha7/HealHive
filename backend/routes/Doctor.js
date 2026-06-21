import express from "express";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import verifyToken from "../middleware/verifyToken.js";
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

const router = express.Router();

/**
 * POST: Register Doctor
 */
router.post("/submit", verifyToken, async (req, res, next) => {
  try {
    // CHANGE THIS LINE:
    const uid = req.firebaseUser.uid;

    // prevent duplicate doctor
    const existingDoctor = await Doctor.findOne({ uid }).lean();
    if (existingDoctor) {
      return next(new AppError(400, "Doctor already registered"));
    }

    const doctor = new Doctor({
      uid,
      ...req.body,
      profileCompleted: true, // Mark profile as completed upon registration
    });

    await doctor.save();

    res.status(201).json({
      message: "Doctor registered successfully",
      doctor,
    });
  } catch (error) {
    next(error);
  }
});

// Public: list registered doctors (for search)
router.get("/public", async (_req, res, next) => {
  try {
    const doctors = await Doctor.find({ profileCompleted: true }).lean();
    const mapped = doctors.map((d) => ({
      id: d._id,
      name: d.fullName || "Doctor",
      specialty: d.specialty || "General Medicine",
      diseases: [],
      fee: d.consultationFee ? `₹${d.consultationFee}` : "₹500",
      availability: d.availableTimeSlots || "Slots",
      experience: d.experience ? `${d.experience} yrs` : "0 yrs",
      languages: d.languages || "English",
      timeSlots: Array.isArray(d.availableDays)
        ? d.availableDays.map((day) => ({ time: day, available: true }))
        : [],
      raw: d,
    }));
    res.json({ doctors: mapped });
  } catch (error) {
    next(error);
  }
});

// Patient selects/consults a doctor
router.post("/select/:doctorId", verifyToken, async (req, res, next) => {
  try {
    const uid = req.firebaseUser.uid;
    const patient = await User.findOne({ uid }).lean();
    if (!patient || patient.role !== "patient") {
      return next(
        new AppError(403, "Only patients can select a doctor")
      );
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.doctorId)) {
      return next(new AppError(400, "Invalid doctor ID"));
    }
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) {
      return next(
        new AppError(404, "Doctor not found")
      );;
    }

    const already = (doctor.interestedPatients || []).some((p) => p.uid === uid);
    if (!already) {
      doctor.interestedPatients = [
        ...(doctor.interestedPatients || []),
        { uid, name: patient.displayName, email: patient.email },
      ];
      await doctor.save();
    }

    res.json({ message: "Doctor selected", doctorId: doctor._id });
  } catch (error) {
    next(error);
  }
});

/**
 * GET: Fetch Doctor Profile
 */
router.get("/profile", verifyToken, async (req, res, next) => {
  try {
    const uid = req.firebaseUser.uid;
    console.log("🔍 /api/doctor/profile called for uid:", uid);

    const doctor = await Doctor.findOne({ uid }).lean();

    if (!doctor) {
      console.log("❌ Doctor profile not found for uid:", uid);
      return next(new AppError(404, "Doctor profile not found"));
    }

    console.log("✅ Doctor profile found:", doctor.fullName, "interestedPatients count:", doctor.interestedPatients?.length);
    console.log("📋 interestedPatients:", JSON.stringify(doctor.interestedPatients, null, 2));

    res.json({
      message: "Doctor profile retrieved successfully",
      doctor,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
