
import mongoose, {model, Schema} from "mongoose";
import {IUser} from "../interfaces/user.interface";

const userSchema: Schema = new Schema<IUser>({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    course: { type: String, required: true },
    course_format: { type: String, required: true },
    course_type: { type: String, required: true },
    status: { type: String, default: null },
    sum: { type: Number, default: null },
    alreadyPaid: { type: Number, default: null },
    created_at: { type: Date, default: () => new Date() },
    last_login: { type: Date, default: null },
    role: { type: String, enum: ["admin", "manager"], default: "manager" },
    isActive: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    actionToken: { type: String, default: null },
    actionTokenType: { type: String, default: null },
    actionTokenExpiresAt: { type: Date, default: null },
    password: { type: String, required: true },
});


export default mongoose.model<IUser & Document>("User", userSchema);
