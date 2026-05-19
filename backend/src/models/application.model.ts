import { model, Schema } from "mongoose";
import { IApplication, IApplicationComment } from "../interfaces/application.interface";

const commentSchema = new Schema<IApplicationComment>(
    {
        text: { type: String, required: true, trim: true },
        author: { type: String, required: true, trim: true },
        createdAt: { type: Date, required: true, default: () => new Date() },
    },
    { _id: false }
);

const applicationSchema = new Schema<IApplication>(
    {
        name: { type: String, required: true },
        surname: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        age: { type: Number, required: true },
        course: { type: String, required: true },
        course_format: { type: String, required: true },
        course_type: { type: String, required: true },
        manager: { type: String, default: "" },
        group: { type: String, default: "" },
        status: { type: String, default: null },
        sum: { type: Number, default: null },
        alreadyPaid: { type: Number, default: null },
        already_paid: { type: Number, default: null },
        msg: { type: String, default: "" },
        utm: { type: String, default: "" },
        comments: { type: [commentSchema], default: [] },
        created_at: { type: Date, required: true },
    },
    {
        strict: false,
    }
);

export const Application = model<IApplication>("Application", applicationSchema);
