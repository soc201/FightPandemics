const { Schema, model, ObjectId } = require("mongoose");
const { schema: authorSchema } = require("./Author");
const { setElapsedTimeText } = require("../utils");

const privateMessageSchema = new Schema(
  {
    author: Object,
    content: {
      required: true,
      trim: true,
      type: String,
    },
    likes: {
      // TODO: how to guarantee unique ids?
      default: [],
      ref: "User",
      type: [ObjectId],
    },
    parentId: {
      ref: "PrivateMessage",
      type: ObjectId,
    },
    postId: {
      ref: "Post",
      required: true,
      type: ObjectId,
    },
  },
  { collection: "privateMessages", timestamps: true },
);

/* eslint-disable */
// Indexes for displaying PrivateMessage tree of a post, also servers as post's foreign
// key index
PrivateMessageSchema.index({
  postId: 1,
  parentId: 1,
  createdAt: -1,
});

// Index for parent PrivateMessage's foreign key for lookup performance
PrivateMessageSchema.index({ parentId: 1, createdAt: -1 });

// Index for author's foreign key for lookup performance
PrivateMessageSchema.index({ "author.id": 1, createdAt: -1 });

// Index for like's foreign key for lookup performance
PrivateMessageSchema.index({ likes: 1 });
/* eslint-enable */

PrivateMessageSchema.set("toObject", { virtuals: true });
PrivateMessageSchema.set("toJSON", { virtuals: true });

//set virtual 'elapsedTimeText' property on PrivateMessage POST and PrivateMessage PATCH.
PrivateMessageSchema.virtual("elapsedTimeText").get(function () {
  return setElapsedTimeText(this.createdAt, this.updatedAt);
});

const PrivateMessage = model("PrivateMessage", PrivateMessageSchema);

module.exports = {
  model: PrivateMessage,
  schema: PrivateMessageSchema,
};
