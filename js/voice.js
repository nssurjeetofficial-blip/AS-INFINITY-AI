// ======================================
// AS INFINITY AI — VOICE ENGINE
// ======================================

let recognition = null;
let isListening = false;
let voiceOutputEnabled = false;

export function isVoiceSupported() {
    return (
        "speechSynthesis" in window &&
        (
            "SpeechRecognition" in window ||
            "webkitSpeechRecognition" in window
        )
    );
}

// ======================================
// VOICE INPUT
// ======================================

export function setupVoiceInput(input, micButton) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        micButton.disabled = true;
        micButton.textContent = "Mic unsupported";
        return;
    }

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        isListening = true;
        micButton.textContent = "🔴 Listening...";
    };

    recognition.onresult = event => {
        const transcript =
            event.results[0][0].transcript;

        input.value = transcript;

        input.dispatchEvent(
            new Event("input", { bubbles: true })
        );

        micButton.textContent = "✅ Done";
    };

    recognition.onerror = event => {
        isListening = false;

        const errors = {
            "not-allowed": "Allow Mic Permission",
            "audio-capture": "Mic Not Found",
            "no-speech": "No Voice Detected",
            "network": "Network Error",
            "service-not-allowed": "Mic Service Blocked"
        };

        micButton.textContent =
            errors[event.error] || "Mic Error";

        console.error("Voice Error:", event.error);
    };

    recognition.onend = () => {
        isListening = false;

        if (
            micButton.textContent === "🔴 Listening..."
        ) {
            micButton.textContent = "🎤 Speak";
        }
    };

    micButton.addEventListener("click", () => {

        if (isListening) {
            recognition.stop();
            return;
        }

        micButton.textContent = "Starting...";

        try {
            recognition.start();
        } catch (error) {
            micButton.textContent = "Try Again";
            console.error(error);
        }
    });
}

// ======================================
// VOICE OUTPUT
// ======================================

export function setVoiceOutput(enabled) {
    voiceOutputEnabled = Boolean(enabled);

    if (!voiceOutputEnabled) {
        window.speechSynthesis.cancel();
    }
}

export function isVoiceOutputEnabled() {
    return voiceOutputEnabled;
}

export function speakAI(text) {

    if (!voiceOutputEnabled || !text) return;

    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
        String(text)
    );

    speech.lang = "en-IN";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);
}

export function stopSpeaking() {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
}
