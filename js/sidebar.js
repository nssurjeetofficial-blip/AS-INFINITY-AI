export function renderSidebarHistory(chats, activeChatId, onChatSelect) {
const container = document.getElementById("sidebarChatHistory");

if (!container) return;

container.replaceChildren();

chats.forEach(chat => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "history-item";

    button.style.cssText = `
        display:flex;
        align-items:center;
        width:100%;
        min-height:43px;
        padding:11px 13px;
        margin:5px 0;
        border:1px solid rgba(255,80,170,.16);
        border-radius:10px;
        background:${chat.id === activeChatId ? "rgba(255,63,164,.18)" : "#17121a"};
        color:${chat.id === activeChatId ? "#ff80c5" : "#e8dce7"};
        font-size:13px;
        text-align:left;
        cursor:pointer;
        transition:background .2s, border-color .2s;
    `;

    if (chat.id === activeChatId) {
        button.classList.add("active");
        button.style.borderColor = "#ff3fa4";
    }

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

    button.addEventListener("mouseenter", () => {
        button.style.background = "rgba(255,63,164,.13)";
        button.style.borderColor = "#ff3fa4";
    });

    button.addEventListener("mouseleave", () => {
        button.style.background =
            chat.id === activeChatId
                ? "rgba(255,63,164,.18)"
                : "#17121a";

        button.style.borderColor =
            chat.id === activeChatId
                ? "#ff3fa4"
                : "rgba(255,80,170,.16)";
    });

    container.appendChild(button);
});

}
