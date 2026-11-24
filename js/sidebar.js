export function renderSidebarHistory(chats, activeChatId, onChatSelect, onChatDelete) {
const container = document.getElementById("sidebarChatHistory");

if (!container) return;

container.replaceChildren();

chats.forEach(chat => {
    // Main row
    const row = document.createElement("div");

    row.style.cssText = `
        display:flex;
        align-items:center;
        gap:5px;
        width:100%;
        margin:5px 0;
    `;

    // Chat open button
    const button = document.createElement("button");

    button.type = "button";
    button.className = "history-item";

    button.style.cssText = `
        display:flex;
        align-items:center;
        flex:1;
        min-width:0;
        min-height:43px;
        padding:11px 13px;
        border:1px solid ${chat.id === activeChatId ? "#ff3fa4" : "rgba(255,80,170,.16)"};
        border-radius:10px;
        background:${chat.id === activeChatId ? "rgba(255,63,164,.18)" : "#17121a"};
        color:${chat.id === activeChatId ? "#ff80c5" : "#e8dce7"};
        font-size:13px;
        text-align:left;
        cursor:pointer;
    `;

    const title = document.createElement("span");

    title.textContent = chat.title || "New Chat";

    title.style.cssText = `
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        width:100%;
    `;

    button.appendChild(title);

    button.addEventListener("click", () => {
        onChatSelect(chat.id);
    });

    // Delete button
    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.textContent = "🗑️";
    deleteButton.setAttribute("aria-label", "Delete chat");

    deleteButton.style.cssText = `
        width:39px;
        min-width:39px;
        height:39px;
        border:1px solid rgba(255,63,100,.25);
        border-radius:10px;
        background:rgba(255,50,90,.08);
        color:#ff7090;
        cursor:pointer;
        font-size:15px;
    `;

    deleteButton.addEventListener("click", () => {
        if (typeof onChatDelete === "function") {
            onChatDelete(chat.id);
        }
    });

    row.append(button, deleteButton);
    container.appendChild(row);
});

}
