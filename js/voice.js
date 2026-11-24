// ======================================
// AS INFINITY AI — VOICE ENGINE
// ======================================

let recognition = null;
let isListening = false;
let voiceOutputEnabled = false;

// ======================================
// BROWSER SUPPORT
// ======================================

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
        micButton.textContent = "Mic unavailable";
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
    };

    recognition.onerror = event => {
        console.error("Voice Input Error:", event.error);
    };

    recognition.onend = () => {
        isListening = false;
        micButton.textContent = "🎤 Speak";
    };

    micButton.addEventListener("click", () => {

        if (isListening) {
            recognition.stop();
            return;
        }

        try {
            recognition.start();
        } catch (error) {
            console.error("Microphone Error:", error);
        }

    });
}

// ======================================
// VOICE OUTPUT CONTROL
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

// ======================================
// AI SPEAKING ENGINE
// ======================================

export function speakAI(text) {

    if (!voiceOutputEnabled || !text) return;

    if (!("speechSynthesis" in window)) {
        console.error("Speech output is unavailable.");
        return;
    }

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

// ======================================
// STOP SPEAKING
// ======================================

export function stopSpeaking() {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
}
