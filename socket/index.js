const io = require("socket.io")(8900, {
    cors: {
      origin: "http://localhost:3000",
    },
  });
  
  let users = [];
  
  const addUser = (userId, socketId) => {
    if (!users.some((user) => user.userId === userId)) {
      users.push({ userId, socketId });
      io.emit("updateUserList", users);
    }
  };
  
  
  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
    io.emit("updateUserList", users);
  };
  
  const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };
  
  io.on("connection", (socket) => {
    //when ceonnect
    console.log("a user connected.");
  
    //take userId and socketId from user
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
    });
    socket.on("newConversation", (conversation) => {
      // Get the members of the new conversation
      const members = conversation.members;
  
      // Notify each member of the new conversation
      members?.forEach((memberId) => {
        const userSocket = getUser(memberId);
        if (userSocket) {
          io.to(userSocket.socketId).emit("newConversation", conversation);
        }
      });
    });
    //send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
      const user = getUser(receiverId);
      if (user) {
        io.to(user.socketId).emit("getMessage", {
          senderId,
          text,
        });
      } else {
        // Handle the case where the user is not found
        console.log("User not found.");
      }
    });
  
    //when disconnect
    socket.on("disconnect", () => {
      console.log("a user disconnected!");
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });