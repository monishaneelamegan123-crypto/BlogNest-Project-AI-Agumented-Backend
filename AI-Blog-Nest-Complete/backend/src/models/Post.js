const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: "", maxlength: 500 },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    tags: [{ type: String, trim: true, lowercase: true }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "draft"
    },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
