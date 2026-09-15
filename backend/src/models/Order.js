import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  vegetable_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vegetable' },
  package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  name_snapshot: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit_snapshot: { type: String, default: 'kg' },
  price: { type: Number, required: true },
  item_type: { type: String, required: true, enum: ['vegetable', 'package'] },
  image: { type: String, default: '' },
  customized_items: [{
    vegetable_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vegetable' },
    name_snapshot: String,
    quantity_snapshot: String
  }]
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id ? ret._id.toString() : ret.id;
      delete ret.__v;
      return ret;
    }
  }
});

const orderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer_name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pin: { type: String, required: true },
  instructions: { type: String, default: '' },
  subtotal: { type: Number, required: true },
  delivery_charge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  payment_method: { type: String, default: 'COD' },
  payment_status: { type: String, default: 'Pending' },
  status: { type: String, default: 'New' },
  tracking_updates: [{
    status: String,
    note: String,
    time: String
  }],
  items: [orderItemSchema]
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id ? ret._id.toString() : ret.id;
      ret.created_at = ret.createdAt || ret.created_at;
      delete ret.__v;
      return ret;
    }
  },

  toObject: { virtuals: true }
});

export default mongoose.model('Order', orderSchema);

