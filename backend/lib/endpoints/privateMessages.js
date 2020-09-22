const mongoose = require("mongoose");

const {
  createPrivateMessageSchema,
  createThread,
} = require("./schema/privateMessages");

/*
 * /api/private-messages
 */
async function routes(app) {
  const { mongo } = app;
  const Post = mongo.model("Post");
  const Message = mongo.model("Message");
  const Thread = mongo.model("Thread");
  const User = mongo.model("User");

  //   app.get(
  //     "/:threadId"
  //   )

  //   app.put(
  //       "/:threadId/readUpdate/:messageId"
  //   )

  app.post(
    "/:authorId/new/:postId",
    {
      prevalidation: [app.authenticate],
      schema: createPrivateMessageSchema,
    },
    async (req, reply) => {
      const { authorId, postId } = req.params;
      const { body: messageProps } = req;
      const [userErr, user] = await app.to(User.findById(authorId));
      if (userErr) {
        req.log.error(userErr, "Failed retrieving user");
        throw app.httpErrors.internalServerError();
      } else if (user === null) {
        req.log.error(userErr, "User does not exist");
        throw app.httpErrors.forbidden();
      }

      // Author defaults to user unless organisationId set
      let author = user;
      const { organisationId } = messageProps;
      if (organisationId) {
        const [orgErr, org] = await app.to(User.findById(organisationId));
        if (orgErr) {
          req.log.error(userErr, "Failed retrieving organisation");
          throw app.httpErrors.internalServerError();
        } else if (org === null) {
          req.log.error(userErr, "Organisation does not exist");
          throw app.httpErrors.forbidden();
        } else if (org.ownerId.toString() !== userId.toString()) {
          req.log.error(
            userErr,
            "User not allowed to post as this organisation",
          );
          throw app.httpErrors.forbidden();
        }
        author = org;
      }

      // Get the recipient Id from postId
      const [postErr, post] = await app.to(Post.findById(postId));
      const recipientId = post.author.id;
      const [recipientErr, recipient] = await app.to(
        User.findById(recipientId),
      );

      messageProps.postRef = {
        author: recipient,
        content: post.content,
        id: mongoose.Types.ObjectId(post.id),
        objective: post.objective,
        title: post.title,
      };

      const currentDate = new Date();

      let newAuthor = {
        id: mongoose.Types.ObjectId(author.id),
        lastAcess: currentDate,
        name: author.name,
        newMessages: false,
        type: author.type,
      };

      let newRecipient = {
        id: mongoose.Types.ObjectId(recipientId),
        lastAcess: currentDate,
        name: recipient.name,
        newMessages: false,
        type: recipient.type,
      };

      //   Search if there is already a thread otherwise create a new one
      const [threadErr, thread] = await app.to(
        Thread.findOne({
          "participants.id": {
            $in: [
              mongoose.Types.ObjectId(recipientId),
              mongoose.Types.ObjectId(authorId),
            ],
          },
        }),
      );

      // If not found a thread create new one
      if (!thread) {
        const [newThreadErr, newThread] = await app.to(
          new Thread({
            participants: [newAuthor, newRecipient],
          }).save(),
        );
        if (!newThreadErr) {
          console.log(newThread);
          messageProps.threadId = mongoose.Types.ObjectId(newThread.id);
        }
      } else {
        messageProps.threadId = mongoose.Types.ObjectId(thread.id);
      }

      messageProps.authorId = authorId;

      const [err, message] = await app.to(new Message(messageProps).save());

      if (err) {
        req.log.error(err, "Failed creating message");
        throw app.httpErrors.internalServerError();
      }

      reply.code(201);
      return message;
    },
  );
}

module.exports = routes;
