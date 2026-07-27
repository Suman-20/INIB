


import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

function Chat() {
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastSeenMap, setLastSeenMap] = useState({});
  const [error, setError] = useState("");

  const wsRef = useRef(null);
  const selectedUserRef = useRef(null);

  // ==========================================
  // Keep selectedUser available inside WS
  // ==========================================

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // ==========================================
  // 1. LOAD USERS
  // ==========================================

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users");

        setUsers(data);

        // Existing lastSeen values
        const map = {};

        data.forEach((u) => {
          if (u.lastSeen) {
            map[u._id] = u.lastSeen;
          }
        });

        setLastSeenMap(map);
      } catch (error) {
        console.error("Users error:", error);

        setError(
          error.response?.data?.message ||
            "Could not load users"
        );
      }
    };

    fetchUsers();
  }, []);

  // ==========================================
  // 2. LOAD MESSAGE HISTORY
  // ==========================================

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setError("");

        const { data } = await api.get(
          `/messages/${selectedUser._id}`
        );

        setMessages(data);
      } catch (error) {
        console.error("Messages error:", error);

        setError(
          error.response?.data?.message ||
            "Could not load messages"
        );
      }
    };

    fetchMessages();
  }, [selectedUser]);

  // ==========================================
  // 3. WEBSOCKET
  // ==========================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !user) return;

    const wsURL = import.meta.env.VITE_WS_URL;

    const socket = new WebSocket(
      `${wsURL}?token=${encodeURIComponent(token)}`
    );

    wsRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");

      // যদি conversation already selected থাকে
      // তাহলে unread messages read করো
      if (selectedUserRef.current) {
        socket.send(
          JSON.stringify({
            type: "markRead",
            userId: selectedUserRef.current._id,
          })
        );
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log("WS:", data);

        // ====================================
        // ONLINE USERS
        // ====================================

        if (data.type === "onlineUsers") {
          setOnlineUsers(data.users || []);
          return;
        }

        // ====================================
        // NEW MESSAGE
        // ====================================

        if (data.type === "message") {
          const newMessage = data.message;

          const senderId =
            typeof newMessage.sender === "object"
              ? newMessage.sender._id
              : newMessage.sender;

          const receiverId =
            typeof newMessage.receiver === "object"
              ? newMessage.receiver._id
              : newMessage.receiver;

          const selected =
            selectedUserRef.current;

          if (!selected) return;

          const belongsToCurrentChat =
            (senderId === user._id &&
              receiverId === selected._id) ||
            (senderId === selected._id &&
              receiverId === user._id);

          if (belongsToCurrentChat) {
            setMessages((prev) => {
              const exists = prev.some(
                (message) =>
                  message._id === newMessage._id
              );

              if (exists) {
                return prev.map((message) =>
                  message._id === newMessage._id
                    ? newMessage
                    : message
                );
              }

              return [...prev, newMessage];
            });

            // Selected user আমাকে message পাঠালে
            // conversation open আছে → Seen
            if (
              senderId === selected._id &&
              receiverId === user._id &&
              socket.readyState === WebSocket.OPEN
            ) {
              socket.send(
                JSON.stringify({
                  type: "markRead",
                  userId: selected._id,
                })
              );
            }
          }

          return;
        }

        // ====================================
        // DELIVERED
        // gray ✓✓
        // ====================================

        if (data.type === "messagesDelivered") {
          const ids = data.messageIds || [];

          setMessages((prev) =>
            prev.map((message) =>
              ids.includes(message._id)
                ? {
                    ...message,
                    delivered: true,
                    deliveredAt:
                      data.deliveredAt ||
                      message.deliveredAt,
                  }
                : message
            )
          );

          return;
        }

        // ====================================
        // READ / SEEN
        // blue ✓✓
        // ====================================


        if (data.type === "messagesRead") {
  console.log("READ EVENT RECEIVED:", data);

  const ids = data.messageIds || [];

  setMessages((prev) =>
    prev.map((message) =>
      ids.includes(message._id)
        ? {
            ...message,
            delivered: true,
            read: true,
            readAt: data.readAt,
          }
        : message
    )
  );

  return;
}

        // ====================================
        // LAST SEEN
        // ====================================

        if (data.type === "userLastSeen") {
          setLastSeenMap((prev) => ({
            ...prev,
            [data.userId]: data.lastSeen,
          }));

          return;
        }
      } catch (error) {
        console.error(
          "WebSocket message error:",
          error
        );
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();

      if (wsRef.current === socket) {
        wsRef.current = null;
      }
    };
  }, [user]);

  // ==========================================
  // 4. SELECT USER
  // ==========================================

  const handleSelectUser = (selected) => {
    setSelectedUser(selected);

    selectedUserRef.current = selected;

    const socket = wsRef.current;

    // Chat open করলেই seen
    if (
      socket &&
      socket.readyState === WebSocket.OPEN
    ) {
      socket.send(
        JSON.stringify({
          type: "markRead",
          userId: selected._id,
        })
      );
    }
  };

  // ==========================================
  // 5. SEND MESSAGE
  // ==========================================

  const handleSendMessage = (text) => {
    if (!selectedUser) return;

    const socket = wsRef.current;

    if (
      !socket ||
      socket.readyState !== WebSocket.OPEN
    ) {
      setError(
        "Chat server is not connected. Please try again."
      );

      return;
    }

    socket.send(
      JSON.stringify({
        type: "message",
        receiverId: selectedUser._id,
        text,
      })
    );

    setError("");
  };

  return (
    <div className="chat-page">
      {error && (
        <div className="chat-error">
          {error}
        </div>
      )}

      <div className="chat-container">
        <Sidebar
          users={users}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          onlineUsers={onlineUsers}
          currentUser={user}
          logout={logout}
        />

        <ChatWindow
          selectedUser={selectedUser}
          messages={messages}
          currentUser={user}
          onlineUsers={onlineUsers}
          lastSeenMap={lastSeenMap}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default Chat;