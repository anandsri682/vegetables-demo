import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  total_items: { type: Number, default: 5 },
  default_items: { type: Number, default: 2 },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  active: { type: Boolean, default: true },
  allow_duplicates: { type: Boolean, default: false },
  price_adjustment: { type: Number, default: 0 },
  default_vegetable_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vegetable' }],
  customizable_vegetable_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vegetable' }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false },
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

export default mongoose.model('Package', packageSchema);

