function Sidebar({
  users,
  selectedUser,
  onSelectUser,
  onlineUsers,
  currentUser,
  logout,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <h2>ConnectChat</h2>
          <span>{currentUser?.name}</span>
        </div>

        <button onClick={logout}>Logout</button>
      </div>

      <div className="sidebar-title">
        <h3>Chats</h3>
      </div>

      <div className="user-list">
        {users.length === 0 ? (
          <p className="no-users">No users found</p>
        ) : (
          users.map((user) => {
            const online = onlineUsers.includes(user._id);

            return (
              <div
                key={user._id}
                className={`user-item ${
                  selectedUser?._id === user._id
                    ? "active"
                    : ""
                }`}
                onClick={() => onSelectUser(user)}
              >
                <div className="avatar">
                  {user.name?.charAt(0).toUpperCase()}

                  {online && (
                    <span className="online-dot"></span>
                  )}
                </div>

                <div className="user-info">
                  <h4>{user.name}</h4>

                  <p>
                    {online ? "Online" : user.email}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

export default Sidebar;