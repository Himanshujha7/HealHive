import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
// import admin from "firebase-admin";
import userRoutes from "./routes/users.js";
import patientRoutes from "./routes/Patient.js";
import doctorRoutes from "./routes/Doctor.js";
import paymentRoutes from "./routes/payments.js";


dotenv.config();

const app = express();
const httpServer = createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "https://healhive-df7bf.web.app",
  "https://healhive-df7bf.firebaseapp.com",
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

/* =========================
   Socket.IO
========================= */
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Initialize Firebase Admin
// admin.initializeApp({
//   credential: admin.credential.cert(
//     JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
//   ),
// });

// Connect to MongoDB
// Remove the options object entirely
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected to HealHive database");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use("/api/users", userRoutes);

app.use("/api/patient", patientRoutes);
app.use("/api/payments", paymentRoutes);


app.use("/api/doctor", doctorRoutes);



// Socket.IO signaling for chat and WebRTC
io.on("connection", (socket) => {
  console.log("🔌 Socket connected", socket.id);

  socket.on("joinRoom", (roomId) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.to(roomId).emit("system", { type: "join", id: socket.id });
  });

  socket.on("message", ({ roomId, message }) => {
    if (!roomId || !message) return;
    socket.to(roomId).emit("message", { from: socket.id, message });
  });

  // WebRTC signaling
  socket.on("offer", ({ roomId, offer }) => {
    if (!roomId || !offer) return;
    socket.to(roomId).emit("offer", { from: socket.id, offer });
  });
  socket.on("answer", ({ roomId, answer }) => {
    if (!roomId || !answer) return;
    socket.to(roomId).emit("answer", { from: socket.id, answer });
  });
  socket.on("ice-candidate", ({ roomId, candidate }) => {
    if (!roomId || !candidate) return;
    socket.to(roomId).emit("ice-candidate", { from: socket.id, candidate });
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

