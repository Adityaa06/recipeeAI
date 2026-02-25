import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    otpHash: {
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '5m' } // Automatically delete document after 5 minutes
    }
}, {
    timestamps: true
});

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
