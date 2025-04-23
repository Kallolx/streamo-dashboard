const mongoose = require('mongoose');

const ReleaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Single', 'EP', 'Album'],
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  tracks: [{
    title: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    audioFile: {
      type: String,
      required: true
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  genres: [{
    type: String
  }],
  description: {
    type: String
  },
  totalStreams: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Release', ReleaseSchema); 