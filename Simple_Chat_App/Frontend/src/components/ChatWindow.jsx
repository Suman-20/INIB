// import { useEffect, useRef, useState } from "react";

// function ChatWindow({
//   selectedUser,
//   messages,
//   currentUser,
//   onlineUsers,
//   onSendMessage,
// }) {
//   const [text, setText] = useState("");

//   const bottomRef = useRef(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({
//       behavior: "smooth",
//     });
//   }, [messages]);

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const value = text.trim();

//     if (!value) return;

//     onSendMessage(value);

//     setText("");
//   };

//   if (!selectedUser) {
//     return (
//       <main className="empty-chat">
//         <div>
//           <h1>ConnectChat</h1>

//           <p>Select a conversation to start messaging.</p>
//         </div>
//       </main>
//     );
//   }

//   const online = onlineUsers.includes(selectedUser._id);

//   return (
//     <main className="chat-window">
//      <div className="chat-header">
//   <div className="chat-person-right">
//     <div className="chat-user-details">
//       <h3>{selectedUser?.name}</h3>
//       <p>{online ? "Online" : "Offline"}</p>
//     </div>

//     <div className="avatar">
//       {selectedUser?.name?.charAt(0).toUpperCase()}
//     </div>
//   </div>
// </div>

//       <div className="messages">
//         {messages.length === 0 && (
//           <div className="start-chat">
//             <p>Start your conversation with {selectedUser.name}</p>
//           </div>
//         )}

//         {messages.map((message) => {
//           const senderId =
//             typeof message.sender === "object"
//               ? message.sender._id
//               : message.sender;

//           const mine = senderId === currentUser._id;

//           return (
//             <div
//               key={message._id}
//               className={`message-row ${mine ? "mine" : "theirs"}`}
//             >
//               <div className="message-bubble">
//                 {!mine && (
//                   <p className="message-sender">
//                     {message.sender?.name || selectedUser.name}
//                   </p>
//                 )}

//                 <p className="message-text">{message.text}</p>

//                 <span className="message-time">
//                   {new Date(message.createdAt).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </span>
//               </div>
//             </div>
//           );
//         })}

//         <div ref={bottomRef}></div>
//       </div>

//       <form className="message-form" onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder={`Message ${selectedUser.name}`}
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//         />

//         <button type="submit">Send</button>
//       </form>
//     </main>
//   );
// }

// export default ChatWindow;

import { useEffect, useRef, useState } from "react";

function ChatWindow({
  selectedUser,
  messages,
  currentUser,
  onlineUsers,
  lastSeenMap,
  onSendMessage,
}) {
  const [text, setText] = useState("");

  const bottomRef = useRef(null);

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ==========================================
  // SEND
  // ==========================================

  const handleSubmit = (e) => {
    e.preventDefault();

    const value = text.trim();

    if (!value) return;

    onSendMessage(value);

    setText("");
  };

  // ==========================================
  // MESSAGE TIME
  // ==========================================

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // LAST SEEN
  // ==========================================

  const formatLastSeen = (date) => {
    if (!date) {
      return "Offline";
    }

    const lastSeen = new Date(date);
    const now = new Date();

    const isToday = lastSeen.toDateString() === now.toDateString();

    if (isToday) {
      return `Last seen today at ${lastSeen.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return `Last seen ${lastSeen.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    })} at ${lastSeen.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // ==========================================
  // NO USER SELECTED
  // ==========================================

  if (!selectedUser) {
    return (
      <main className="empty-chat">
        <div>
          <h1>ConnectChat</h1>

          <p>Select a conversation to start messaging.</p>
        </div>
      </main>
    );
  }

  const online = onlineUsers.includes(selectedUser._id);

  const lastSeen = lastSeenMap?.[selectedUser._id] || selectedUser.lastSeen;

  return (
    <main className="chat-window">
      {/* =====================================
          HEADER
      ====================================== */}

      <div className="chat-header">
        <div className="chat-person-right">
          <div className="chat-user-details">
            <h3>{selectedUser.name}</h3>

            <p className={online ? "user-online-status" : "user-last-seen"}>
              {online ? "Online" : formatLastSeen(lastSeen)}
            </p>
          </div>

          <div className="avatar">
            {selectedUser.name?.charAt(0).toUpperCase()}

            {online && <span className="online-dot" />}
          </div>
        </div>
      </div>

      {/* =====================================
          MESSAGES
      ====================================== */}

      <div className="messages">
        {messages.length === 0 && (
          <div className="start-chat">
            <p>Start your conversation with {selectedUser.name}</p>
          </div>
        )}

        {messages.map((message) => {
          const senderId =
            typeof message.sender === "object"
              ? message.sender._id
              : message.sender;

          const mine = senderId === currentUser._id;

          const senderName =
            typeof message.sender === "object"
              ? message.sender.name
              : selectedUser.name;

          return (
            <div
              key={message._id}
              className={`message-row ${mine ? "mine" : "theirs"}`}
            >
              <div className="message-bubble">
                {/* Receiver message-এর sender name */}

                {!mine && <p className="message-sender">{senderName}</p>}

                <p className="message-text">{message.text}</p>

                <div className="message-footer">
                  <span className="message-time">
                    {formatTime(message.createdAt)}
                  </span>

                  {mine && (
                    <span className="message-status">
                      {message.read === true ? (
                        <span className="ticks read-tick">✓✓</span>
                      ) : message.delivered === true ? (
                        <span className="ticks delivered-tick">✓✓</span>
                      ) : (
                        <span className="ticks sent-tick">✓</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* =====================================
          INPUT
      ====================================== */}

      <form className="message-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={`Message ${selectedUser.name}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button type="submit">Send</button>
      </form>
    </main>
  );
}

export default ChatWindow;
