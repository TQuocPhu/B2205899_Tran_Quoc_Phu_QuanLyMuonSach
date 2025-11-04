import mongoose from 'mongoose';

export const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true, useUnifiedTopology: true
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};