import admin from "firebase-admin";

export default async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer (.*)$/);
  if (!match) return next(new AppError(401, "No token provided"));

  try {
    const decoded = await admin.auth().verifyIdToken(match[1]);
    req.firebaseUser = decoded;
    next();
  } catch (err) {
    next(new AppError(401, "Invalid token"));
  }
}
