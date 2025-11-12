// backend/src/models/Deliverer.js

import mongoose from 'mongoose';

const delivererSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'scooter', 'car', 'motorcycle'],
    required: true,
  },
  vehicleNumber: {
    type: String,
  },
  currentLocation: {
    lat: {
      type: Number,
      default: 0,
    },
    lng: {
      type: Number,
      default: 0,
    },
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'offline',
  },
  currentOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  }],
  completedOrders: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 5,
    min: 0,
    max: 5,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Deliverer = mongoose.model('Deliverer', delivererSchema);

export default Deliverer;