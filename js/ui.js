export function showHome(main, homeContent) {
    if (!main) return;

    main.innerHTML = homeContent;
}

export function renderMessages(container, messages = []) {
    if (!container) return;

    container.replaceChildren();

    messages.forEach(message => {
        const wrapper = document.createElement("div");

        wrapper.className =
            message.role === "user"
                ? "chat-message user-message"
                : "chat-message ai-message";

        const content = document.createElement("div");
        content.className = "message-content";
        content.textContent = message.content || "";

        wrapper.appendChild(content);
        container.appendChild(wrapper);
    });
}
