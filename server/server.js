import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";

dotenv.config({ path: '.env' }); 


console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT); 

const app = express();


try {
  await connectDB();
  console.log('✅ MongoDB Connected');
} catch (err) {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1); // Exit if DB connection fails
}


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Adjust for your frontend
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => res.send("Server is Running"));
app.use('/api/user', userRouter);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});


const PORT = process.env.PORT || 3000; // Note: Use uppercase PORT
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}\n`);
});


process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});