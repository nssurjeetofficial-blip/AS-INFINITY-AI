// AS INFINITY AI - Main JavaScript

document.addEventListener("DOMContentLoaded", () => {

    const chatInput = document.querySelector(".chat-box input");
    const sendButton = document.querySelector(".chat-box button");
    const featureCards = document.querySelectorAll(".feature-card");
    const navLinks = document.querySelectorAll("nav a");

    // Notification
    function notify(message) {
        let oldToast = document.querySelector(".toast");
        if (oldToast) oldToast.remove();

        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 2500);
    }

    // Chat button
    function sendMessage() {
        const message = chatInput.value.trim();

        if (!message) {
            notify("Please enter your message.");
            return;
        }

        notify("AI connection will be activated in the next phase.");

        chatInput.value = "";
    }

    sendButton.addEventListener("click", sendMessage);

    chatInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    // Feature cards
    featureCards.forEach((card) => {
        card.addEventListener("click", () => {
            const title = card.querySelector("h3").textContent;
            notify(title + " module is coming soon.");
        });
    });

    // Navigation
    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            navLinks.forEach(item => {
                item.classList.remove("active");
            });

            link.classList.add("active");

            const name = link.querySelector("span").textContent;

            if (name === "Home") {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            } else {
                notify(name + " module is coming soon.");
            }
        });
    });

});
