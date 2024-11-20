import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // load
const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) throw 'need MONGODB_URI to be set.';

mongoose
	.connect(MONGO_URI, {
		dbName: 's-train-chats',
	})
	.then(() => console.log('Connected to Mongo DB.'))
	.catch((err) => console.log(err));

const Schema = mongoose.Schema;

const chatSchema = new Schema({
	username: String,
	password: String,
	start_time: Date,
	opponentId: Number,
	conversation: [{ role: String, content: String }],
});

// create chat schema
export const Chat = mongoose.model('chat', chatSchema);