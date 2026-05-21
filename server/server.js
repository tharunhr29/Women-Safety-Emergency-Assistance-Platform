// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// Connect to Database
connectDB().then(async () => {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    let admin = await User.findOne({ email: 'admin@safeguard.com' });
    if (!admin) {
      await User.create({
        name: 'System Admin',
        email: 'admin@safeguard.com',
        password: hashedPassword,
        phone: '0000000000',
        role: 'admin',
        isVerified: true
      });
      console.log('--- DEFAULT ADMIN ACCOUNT CREATED ---');
    } else {
      await User.updateOne(
        { email: 'admin@safeguard.com' },
        { 
          $set: { 
            password: hashedPassword,
            role: 'admin'
          }
        }
      );
      console.log('--- DEFAULT ADMIN PASSWORD RESET TO admin123 ---');
    }
  } catch (error) {
    console.log("Failed to seed admin user:", error.message);
  }
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: "*",
    methods: ["GET", "POST"]
  } 
});

app.use(cors());
app.use(express.json());

// Attach io to app to allow controllers to emit events
app.set("io", io);

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Socket logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("join_volunteer", () => {
    socket.join('volunteers');
    console.log(`Volunteer joined volunteers room`);
  });

  socket.on("join_admin", () => {
    socket.join('admins');
    console.log(`Admin joined admins room`);
  });

  socket.on("send_alert", (alertData) => {
    // Broadcast alert to volunteers and admins
    io.to('volunteers').emit("receive_alert", alertData);
    io.to('admins').emit("receive_alert_admin", alertData);
    // Also broadcast generally for demonstration/nearby logic if needed
    io.emit("receive_alert_general", alertData);
  });

  socket.on("volunteer_responding", (data) => {
    // data should contain { userId: string, volunteerId: string, volunteerName: string }
    io.to(data.userId).emit("volunteer_responding", data);
  });

  socket.on("update_responder_status", (data) => {
    // data should contain { userId: string, volunteerId: string, status: string }
    io.to(data.userId).emit("responder_status_updated", data);
  });

  socket.on("update_location", (locationData) => {
    io.emit("location_updated", locationData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));