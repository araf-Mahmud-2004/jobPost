import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  sentBy: mongoose.Types.ObjectId;
  sentAt: Date;
  recipientCount: number;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    sentBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sentAt: { type: Date, default: Date.now },
    recipientCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IAnnouncement>("Announcement", announcementSchema);
