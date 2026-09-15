import mongoose from 'mongoose';

const storeSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true }
}, {
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

export default mongoose.model('StoreSetting', storeSettingSchema);

