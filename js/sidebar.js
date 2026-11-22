export function renderSidebarHistory(
    chats,
    activeChatId,
    onChatSelect
) {
    const container = document.getElementById(
        "sidebarChatHistory"
    );

    if (!container) return;

    container.replaceChildren();

    chats.forEach(chat => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "history-item";

        if (chat.id === activeChatId) {
            button.classList.add("active");
        }

        const title = document.createElement("span");

        title.textContent =
            chat.title || "New Chat";

        button.appendChild(title);

        button.addEventListener("click", () => {
            onChatSelect(chat.id);
        });

        container.appendChild(button);
    });
}
