import mongoose from 'mongoose';

const connectDB = async () => {

    try {
        // mongoose.connect() returns a promise, so we await it
        // process.env.MONGO_URI reads from our .env file
        const conn = await mongoose.connect(process.env.MONGO_URI)

        // conn.connection.host tells us WHICH MongoDB server we connected to
        // This is useful for debugging — are we on local or cloud Atlas?
        console.log(`✅ MongoDB Connected: ${conn.connections[0].host}`);

    } catch (error) {
        // If connection fails (wrong URI, network issue, wrong password)
        // we log the error and EXIT the process
        // WHY exit? There's no point running a server with no database
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1); // 1 means "exit with failure" 
    }
};

export default connectDB;