// Add curly braces here
import { admin } from "../firebaseAdmin.js";
import AppError from "../utils/AppError.js";

export const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];


  if (!token) {
    return next(new AppError(401, "No token provided"));
  }

  try {
    // Change 'admin.auth()' to 'admin.auth'
    const decoded = await admin.auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError(401, "Invalid token"));
  }
};