import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/asset_manager_game';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const leaderboardSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  levelReached: { type: Number, required: true },
  totalTimeTaken: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now },
});

const levelSchema = new mongoose.Schema({
  levelNumber: { type: Number, required: true, unique: true },
  solution: { type: [Number], required: true },
  hints: { type: [String] },
});

export const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
export const Level = mongoose.model('Level', levelSchema);
