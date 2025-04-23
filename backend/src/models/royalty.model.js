const mongoose = require('mongoose');

const RoyaltySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  release: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Release'
  },
  amount: {
    type: Number,
    required: true
  },
  source: {
    type: String,
    required: true,
    enum: ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Other']
  },
  period: {
    month: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidDate: {
    type: Date
  },
  streamCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Royalty', RoyaltySchema); 