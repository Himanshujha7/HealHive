import express from "express";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * POST: Register Doctor
 */
router.post("/submit", verifyToken, async (req, res) => {
  try {
    // CHANGE THIS LINE:
    const uid = req.firebaseUser.uid; 

    // prevent duplicate doctor
    const existingDoctor = await Doctor.findOne({ uid }).lean();
    if (existingDoctor) {
      return res.status(400).json({
        message: "Doctor already registered",
      });
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
    console.error("Doctor submit error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Public: list registered doctors (for search)
router.get("/public", async (_req, res) => {
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
    console.error("Doctor public list error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Patient selects/consults a doctor
router.post("/select/:doctorId", verifyToken, async (req, res) => {
  try {
    const uid = req.firebaseUser.uid;
    const patient = await User.findOne({ uid }).lean();
    if (!patient || patient.role !== "patient") {
      return res.status(403).json({ message: "Only patients can select a doctor" });
    }

    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
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
    console.error("Doctor select error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET: Fetch Doctor Profile
 */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const uid = req.firebaseUser.uid;
    console.log("🔍 /api/doctor/profile called for uid:", uid);

    const doctor = await Doctor.findOne({ uid }).lean();

    if (!doctor) {
      console.log("❌ Doctor profile not found for uid:", uid);
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    console.log("✅ Doctor profile found:", doctor.fullName, "interestedPatients count:", doctor.interestedPatients?.length);
    console.log("📋 interestedPatients:", JSON.stringify(doctor.interestedPatients, null, 2));

    res.json({
      message: "Doctor profile retrieved successfully",
      doctor,
    });
  } catch (error) {
    console.error("Doctor profile fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
