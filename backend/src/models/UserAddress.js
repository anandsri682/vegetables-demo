import mongoose from 'mongoose';

const userAddressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tag: { type: String, default: 'Home' },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pin: { type: String, required: true },
  is_default: { type: Boolean, default: false }
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

export default mongoose.model('UserAddress', userAddressSchema);

