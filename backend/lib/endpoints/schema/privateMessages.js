const S = require("fluent-schema");
const { strictSchema } = require("./utils");

const { MESSAGE_STATUS_OPTIONS } = require("../../models/Message");
const { CONVERSATION_STATUS_OPTIONS } = require("../../models/Thread");

// const getPrivateMessageSchema = {};

const createPrivateMessageSchema = {
  body: strictSchema()
    .prop("content", S.string())
    .prop("organisationId", S.string())
    .prop("status", S.string().enum(MESSAGE_STATUS_OPTIONS))
    .prop("threadId", S.string()),
};

// const getPrivateMessageByIdSchema = {};

// const getThreadsByParticipant = {};

const createThread = {
  body: strictSchema()
    .prop("participants", S.array().items(S.string()).required())
    .prop("status", S.string().enum(CONVERSATION_STATUS_OPTIONS)),
};

module.exports = {
  createPrivateMessageSchema,
  createThread,
};
