import express from "express";
import { v4 as uuidv4 } from "uuid";
import { verifyFirebaseToken } from "../middleware/auth.js";
import Stripe from "stripe";
import Doctor from "../models/Doctor.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

const router = express.Router();

// Initialize Stripe
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

// Dummy payment initiation: returns a consultationId for chat (kept for local testing)
router.post("/initiate", verifyFirebaseToken, async (req, res, next) => {
  try {
    const { doctorId, doctorName, slotTime, fee } = req.body || {};
    if (!doctorId || !slotTime) {
      return next(
        new AppError(400, "doctorId and slotTime are required")
      );
    }

    // Generate a consultation session id
    const consultationId = uuidv4();

    // For real flow: persist payment intent + consultation record in DB
    // Here, we simply return success for dummy payment
    // Attempt to record the interest on registered doctors
    try {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return next(new AppError(400, "Invalid doctor ID"));
      }
      const doctor = await Doctor.findById(doctorId);
      if (doctor) {
        const exists = (doctor.interestedPatients || []).some(p => p.uid === req.user?.uid);
        if (!exists) {
          doctor.interestedPatients.push({
            uid: req.user?.uid,
            name: req.user?.name || req.user?.email || "Patient",
            email: req.user?.email || "",
            slotTime,
            consultationId,
            paid: true, // dummy route assumes payment success
            paidAt: new Date(), // Add timestamp for 24h window
          });
          console.log("💰 Dummy payment: Added patient with paid=true, paidAt set");
        }
        await doctor.save();
        console.log("✅ Dummy payment: Doctor record updated");
      } else {
        console.log("⚠️ Dummy payment: Doctor not found for ID:", doctorId);
      }
    } catch (e) {
      // Non-blocking
      console.warn("initiate: doctor record update warning", e?.message);
    }
    return res.status(200).json({
      success: true,
      message: "Dummy payment approved",
      consultationId,
      doctorId,
      doctorName,
      slotTime,
      fee,
    });
  } catch (err) {
    next(err);
  }
});

// Create Stripe PaymentIntent (inline, no redirect)
router.post("/create-intent", verifyFirebaseToken, async (req, res, next) => {
  try {
    if (!stripe) {
      return next(
        new AppError(500, "Stripe not configured on server")
      );
    }

    const { doctorId, doctorName, slotTime, amount, currency = "inr" } = req.body || {};
    console.log("💳 create-intent called:", { doctorId, doctorName, slotTime, amount, patientUid: req.user?.uid });

    return next(
      new AppError(
        400,
        "doctorId, slotTime and amount are required"
      )
    );

    // Amount should be in smallest currency unit


    const intAmount = Math.max(1, parseInt(amount, 10) * 100);

    const consultationId = uuidv4();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: intAmount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        doctorId,
        doctorName: doctorName || "Doctor",
        slotTime,
        consultationId,
        patientUid: req.user?.uid || "",
        patientEmail: req.user?.email || "",
      },
    });

    // Pre-record interest for registered doctors (paid=false until confirm)
    try {
      const doctor = await Doctor.findById(doctorId);
      if (doctor) {
        console.log("✅ Found doctor for pre-record:", doctor._id, doctor.fullName);
        const exists = (doctor.interestedPatients || []).find(p => p.uid === req.user?.uid);
        if (!exists) {
          doctor.interestedPatients.push({
            uid: req.user?.uid,
            name: req.user?.name || req.user?.email || "Patient",
            email: req.user?.email || "",
            slotTime,
            consultationId,
            paid: false,
          });
          console.log("📝 Added new patient entry (paid=false)");
        } else {
          exists.slotTime = slotTime;
          exists.consultationId = consultationId;
          exists.paid = false;
          console.log("📝 Updated existing patient entry (paid=false)");
        }
        await doctor.save();
        console.log("✅ Doctor record saved with interestedPatients:", doctor.interestedPatients.length);
      } else {
        console.log("⚠️ Doctor not found in database for ID:", doctorId);
      }
    } catch (e) {
      console.warn("create-intent: doctor record update warning", e?.message);
    }

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      consultationId,
    });
  } catch (err) {
    next(err);
  }
});

// Confirm payment: mark doctor record as paid
router.post("/confirm", verifyFirebaseToken, async (req, res, next) => {
  try {
    const { doctorId, consultationId } = req.body || {};
    console.log("✅ confirm endpoint called:", { doctorId, consultationId, patientUid: req.user?.uid });

    if (!doctorId || !consultationId) {
      return next(
        new AppError(
          400,
          "doctorId and consultationId are required"
        )
      );
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return next(
        new AppError(400, "Invalid doctor ID")
      );
    }
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log("❌ Doctor not found for ID:", doctorId);
      return next(
        new AppError(404, "Doctor not found")
      );
    }

    console.log("✅ Doctor found:", doctor.fullName, "interestedPatients count:", doctor.interestedPatients?.length);

    const entry = (doctor.interestedPatients || []).find(
      (p) => p.uid === req.user?.uid && p.consultationId === consultationId
    );
    if (!entry) {
      console.log("❌ Consultation entry not found for patient:", req.user?.uid, "consultationId:", consultationId);
      return next(
        new AppError(
          404,
          "Consultation entry not found"
        )
      );
    }

    console.log("📝 Setting paid=true and paidAt for patient:", entry.name);
    entry.paid = true;
    entry.paidAt = new Date();
    await doctor.save();
    console.log("✅ Payment confirmed and doctor record updated");
    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Check consultation status (active within 24 hours)
router.get("/status/:consultationId", verifyFirebaseToken, async (req, res, next) => {
  try {
    const { consultationId } = req.params;
    if (!consultationId?.trim()) {
      return next(
        new AppError(
          400,
          "consultationId is required"
        )
      );
    }

    // Find doctor with this consultation
    const doctor = await Doctor.findOne({
      "interestedPatients.consultationId": consultationId,
      "interestedPatients.uid": req.user?.uid,
    }).lean();

    if (!doctor) {
      return res.status(404).json({ active: false, message: "Consultation not found" });
    }

    const entry = doctor.interestedPatients.find(
      (p) => p.consultationId === consultationId && p.uid === req.user?.uid
    );

    if (!entry || !entry.paid) {
      return res.status(200).json({ active: false, message: "Payment not completed" });
    }

    // Check if within 24 hours
    const now = new Date();
    const paidAt = entry.paidAt || entry.addedAt;
    const hoursSincePaid = (now - paidAt) / (1000 * 60 * 60);
    const active = hoursSincePaid <= 24;

    return res.status(200).json({
      active,
      consultationId,
      paidAt,
      hoursRemaining: active ? Math.max(0, 24 - hoursSincePaid).toFixed(1) : 0,
      doctor: {
        id: doctor._id,
        name: doctor.fullName,
        specialty: doctor.specialty,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;