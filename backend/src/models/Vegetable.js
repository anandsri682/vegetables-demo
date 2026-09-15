import mongoose from 'mongoose';

const vegetableSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  category_name: { type: String, default: '' },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  stock: { type: Number, default: 50 },
  availability: { type: String, enum: ['Available', 'Out of Stock', 'Temporarily Unavailable'], default: 'Available' },
  featured: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  image: { type: String, required: true }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id ? ret._id.toString() : ret.id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

export default mongoose.model('Vegetable', vegetableSchema);

