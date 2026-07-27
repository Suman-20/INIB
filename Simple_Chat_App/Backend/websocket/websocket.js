


const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Message = require("../models/Message");
const User = require("../models/User");

// userId -> Set<WebSocket>
const connectedUsers = new Map();

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  // -----------------------------------------
  // Send data to a user's ALL open sockets
  // -----------------------------------------
  const sendToUser = (userId, data) => {
    const sockets = connectedUsers.get(
      userId.toString()
    );

    if (!sockets) return false;

    let sent = false;

    sockets.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
        sent = true;
      }
    });

    return sent;
  };

  // -----------------------------------------
  // Broadcast online user IDs
  // -----------------------------------------
  const broadcastOnlineUsers = () => {
    const users = Array.from(
      connectedUsers.keys()
    );

    const payload = JSON.stringify({
      type: "onlineUsers",
      users,
    });

    connectedUsers.forEach((sockets) => {
      sockets.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(payload);
        }
      });
    });
  };

  // -----------------------------------------
  // When user comes online, old pending
  // messages become delivered
  // -----------------------------------------
  const deliverPendingMessages = async (
    userId
  ) => {
    const pending = await Message.find({
      receiver: userId,
      delivered: false,
    });

    if (pending.length === 0) return;

    const now = new Date();

    const ids = pending.map(
      (message) => message._id
    );

    await Message.updateMany(
      {
        _id: { $in: ids },
      },
      {
        $set: {
          delivered: true,
          deliveredAt: now,
        },
      }
    );

    // Sender-দের জানানো হবে যে messages delivered
    const senderGroups = new Map();

    pending.forEach((message) => {
      const senderId =
        message.sender.toString();

      if (!senderGroups.has(senderId)) {
        senderGroups.set(senderId, []);
      }

      senderGroups
        .get(senderId)
        .push(message._id.toString());
    });

    senderGroups.forEach(
      (messageIds, senderId) => {
        sendToUser(senderId, {
          type: "messagesDelivered",
          messageIds,
          deliveredAt: now,
        });
      }
    );
  };

  wss.on("connection", async (ws, req) => {
    let userId = null;
    let userName = null;

    try {
      // -------------------------------------
      // Authentication
      // -------------------------------------

      const url = new URL(
        req.url,
        `http://${req.headers.host}`
      );

      const token =
        url.searchParams.get("token");

      if (!token) {
        ws.close(1008, "Token required");
        return;
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      /*
        যদি তোমার JWT payload-এ decoded.id থাকে,
        তাহলে নিচে decoded.userId-এর বদলে
        decoded.id ব্যবহার করবে।
      */

      const user = await User.findById(
        decoded.userId
      );

      if (!user) {
        ws.close(1008, "User not found");
        return;
      }

      userId = user._id.toString();
      userName = user.name;

      // -------------------------------------
      // Add connection
      // -------------------------------------

      if (!connectedUsers.has(userId)) {
        connectedUsers.set(
          userId,
          new Set()
        );
      }

      connectedUsers.get(userId).add(ws);

      console.log(
        `${userName} connected`
      );

      broadcastOnlineUsers();

      // Offline অবস্থায় পাওয়া messages delivered
      await deliverPendingMessages(userId);

      // -------------------------------------
      // Incoming WebSocket messages
      // -------------------------------------

      ws.on("message", async (rawData) => {
        try {
          const data = JSON.parse(
            rawData.toString()
          );

          // =================================
          // SEND MESSAGE
          // =================================

          if (data.type === "message") {
            const receiverId =
              data.receiverId;

            const text = data.text?.trim();

            if (
              !receiverId ||
              !mongoose.Types.ObjectId.isValid(
                receiverId
              ) ||
              !text
            ) {
              return;
            }

            if (receiverId === userId) {
              return;
            }

            const receiver =
              await User.findById(
                receiverId
              );

            if (!receiver) return;

            // Receiver currently online?
            const receiverOnline =
              connectedUsers.has(receiverId);

            const now = new Date();

            // MongoDB save
            let message =
              await Message.create({
                sender: userId,
                receiver: receiverId,
                text,

                delivered: receiverOnline,

                deliveredAt:
                  receiverOnline
                    ? now
                    : null,
              });

            message =
              await Message.findById(
                message._id
              )
                .populate(
                  "sender",
                  "name email lastSeen"
                )
                .populate(
                  "receiver",
                  "name email lastSeen"
                );

            // Sender gets saved message
            sendToUser(userId, {
              type: "message",
              message,
            });

            // Receiver online হলে receiver gets it
            if (receiverOnline) {
              sendToUser(receiverId, {
                type: "message",
                message,
              });
            }

            return;
          }

          // =================================
          // MARK CONVERSATION AS READ
          // =================================

          if (data.type === "markRead") {
            const otherUserId =
              data.userId;

            if (
              !otherUserId ||
              !mongoose.Types.ObjectId.isValid(
                otherUserId
              )
            ) {
              return;
            }

            const now = new Date();

            // otherUser -> currentUser
            // unread messages
            const unreadMessages =
              await Message.find({
                sender: otherUserId,
                receiver: userId,
                read: false,
              });

            if (
              unreadMessages.length === 0
            ) {
              return;
            }

            const messageIds =
              unreadMessages.map(
                (message) => message._id
              );

            await Message.updateMany(
              {
                _id: {
                  $in: messageIds,
                },
              },
              {
                $set: {
                  delivered: true,
                  deliveredAt: now,

                  read: true,
                  readAt: now,
                },
              }
            );

            // Original sender-কে blue tick update
            sendToUser(otherUserId, {
              type: "messagesRead",

              messageIds:
                messageIds.map((id) =>
                  id.toString()
                ),

              readBy: userId,
              readAt: now,
            });

            // Current user-কেও status update পাঠাই
            sendToUser(userId, {
              type: "messagesRead",

              messageIds:
                messageIds.map((id) =>
                  id.toString()
                ),

              readBy: userId,
              readAt: now,
            });

            return;
          }
        } catch (error) {
          console.error(
            "WebSocket message error:",
            error.message
          );
        }
      });

      // -------------------------------------
      // Disconnect
      // -------------------------------------

      ws.on("close", async () => {
        if (!userId) return;

        const sockets =
          connectedUsers.get(userId);

        if (sockets) {
          sockets.delete(ws);

          // User-এর আর কোনো active tab/socket নেই
          if (sockets.size === 0) {
            connectedUsers.delete(userId);

            const lastSeen =
              new Date();

            await User.findByIdAndUpdate(
              userId,
              {
                lastSeen,
              }
            );

            console.log(
              `${userName} disconnected`
            );

            // অন্য connected users-কে lastSeen পাঠাই
            const payload =
              JSON.stringify({
                type: "userLastSeen",
                userId,
                lastSeen,
              });

            connectedUsers.forEach(
              (userSockets) => {
                userSockets.forEach(
                  (socket) => {
                    if (
                      socket.readyState ===
                      WebSocket.OPEN
                    ) {
                      socket.send(payload);
                    }
                  }
                );
              }
            );
          }
        }

        broadcastOnlineUsers();
      });

      ws.on("error", (error) => {
        console.error(
          "WebSocket error:",
          error.message
        );
      });
    } catch (error) {
      console.error(
        "WebSocket authentication error:",
        error.message
      );

      ws.close(
        1008,
        "Authentication failed"
      );
    }
  });

  console.log(
    "WebSocket server initialized"
  );
};

module.exports = setupWebSocket;