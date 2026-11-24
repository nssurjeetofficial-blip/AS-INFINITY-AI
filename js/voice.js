// ======================================
// AS INFINITY AI — VOICE ENGINE
// ======================================

const WORKER_URL =
"https://as-infinity-ai.nssurjeetofficial.workers.dev";

let recorder = null;
let audioChunks = [];
let isListening = false;
let isProcessing = false;
let voiceOutputEnabled = false;

// ======================================
// MIC ICONS
// ======================================

function updateMicButton(button, state) {

button.classList.remove("recording", "processing");

if (state === "recording") {

    button.classList.add("recording");
    button.setAttribute("aria-label", "Stop recording");

    button.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3" width="6" height="11"
                rx="3" stroke="currentColor" stroke-width="1.8"/>
            <path d="M5.5 11.5V12a6.5 6.5 0 0 0 13 0v-.5"
                stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round"/>
            <path d="M12 18.5V22M9 22h6"
                stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round"/>
        </svg>
    `;

} else if (state === "processing") {

    button.classList.add("processing");
    button.setAttribute("aria-label", "Processing audio");

    button.innerHTML = `
        <svg class="mic-spinner" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9"
                stroke="currentColor" stroke-width="3"
                opacity=".2"/>
            <path d="M12 3a9 9 0 0 1 9 9"
                stroke="currentColor" stroke-width="3"
                stroke-linecap="round"/>
        </svg>
    `;

} else {

    button.setAttribute("aria-label", "Start voice recording");

    button.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none">
            <rect x="9" y="2.5" width="6" height="12"
                rx="3" stroke="currentColor" stroke-width="1.8"/>
            <path d="M5.5 11.5V12a6.5 6.5 0 0 0 13 0v-.5"
                stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round"/>
            <path d="M12 18.5V22M9 22h6"
                stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round"/>
        </svg>
    `;
}

}

// ======================================
// VOICE INPUT
// ======================================

export function setupVoiceInput(input, micButton) {

updateMicButton(micButton, "idle");

micButton.addEventListener("click", async () => {

    if (isProcessing) return;

    if (isListening) {
        recorder?.stop();
        return;
    }

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        audioChunks = [];

        recorder = new MediaRecorder(stream);

        recorder.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        recorder.onstart = () => {
            isListening = true;
            updateMicButton(micButton, "recording");
        };

        recorder.onstop = async () => {

            isListening = false;
            isProcessing = true;

            updateMicButton(micButton, "processing");

            stream.getTracks().forEach(track => track.stop());

            try {

                const audioBlob = new Blob(
                    audioChunks,
                    { type: recorder.mimeType || "audio/webm" }
                );

                const formData = new FormData();

                formData.append(
                    "audio",
                    audioBlob,
                    "recording.webm"
                );

                const response = await fetch(
                    WORKER_URL + "/transcribe",
                    {
                        method: "POST",
                        body: formData
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.error || "Transcription failed"
                    );
                }

                input.value = result.text || "";

                input.dispatchEvent(
                    new Event("input", { bubbles: true })
                );

            } catch (error) {

                console.error("Voice Error:", error);

            } finally {

                isProcessing = false;
                updateMicButton(micButton, "idle");

            }
        };

        recorder.start();

    } catch (error) {

        console.error("Microphone Error:", error);

        updateMicButton(micButton, "idle");

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
