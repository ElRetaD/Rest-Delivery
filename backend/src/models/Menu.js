// backend/src/models/Menu.js

import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du plat est obligatoire'],
    trim: true,
  },
  nameAr: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  descriptionAr: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['burger', 'pizza', 'pasta', 'tacos', 'sandwich', 'salad', 'dessert', 'drink'],
  },
  price: {
    type: Number,
    required: [true, 'Le prix est obligatoire'],
    min: 0,
  },
  image: {
    type: String,
  },
  ingredients: [{
    type: String,
  }],
  allergens: [{
    type: String,
  }],
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  preparationTime: {
    type: Number, // en minutes
    default: 15,
  },
  orderCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

menuSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Menu = mongoose.model('Menu', menuSchema);

export default Menu;