// ======================================
// AS INFINITY AI — VOICE ENGINE
// ======================================

const WORKER_URL =
"https://as-infinity-ai.nssurjeetofficial.workers.dev";

let recorder = null;
let audioChunks = [];
let isListening = false;
let voiceOutputEnabled = false;

// ======================================
// VOICE INPUT
// ======================================

export function setupVoiceInput(input, micButton) {

    micButton.addEventListener("click", async () => {

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
                micButton.textContent = "🔴 Stop Recording";
            };

            recorder.onstop = async () => {

                isListening = false;
                micButton.textContent = "⏳ Processing...";

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

                    micButton.textContent = "🎤 Speak";

                } catch (error) {

                    console.error("Voice Error:", error);

                    micButton.textContent = "❌ Try Again";

                }
            };

            recorder.start();

        } catch (error) {

            console.error("Microphone Error:", error);

            micButton.textContent =
                error.name === "NotAllowedError"
                    ? "Allow Microphone"
                    : "Mic Unavailable";
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
