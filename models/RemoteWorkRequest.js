import mongoose from 'mongoose';

const remoteWorkRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminComment: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const RemoteWorkRequest = mongoose.model('RemoteWorkRequest', remoteWorkRequestSchema);
export default RemoteWorkRequest;
