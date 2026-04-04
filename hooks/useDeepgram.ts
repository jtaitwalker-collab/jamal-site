"use client";

import { useState, useCallback, useRef } from "react";
import {
  createClient,
  LiveTranscriptionEvents,
  type LiveClient,
} from "@deepgram/sdk";

export type DeepgramStatus = "idle" | "connecting" | "listening" | "error";

export function useDeepgram() {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [status, setStatus] = useState<DeepgramStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const connectionRef = useRef<LiveClient | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startListening = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
    if (!apiKey) {
      setErrorMessage("Deepgram API key not configured.");
      setStatus("error");
      return;
    }

    setStatus("connecting");
    setErrorMessage("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const deepgram = createClient(apiKey);
      const connection = deepgram.listen.live({
        model: "nova-2",
        language: "en-GB",
        smart_format: true,
        interim_results: true,
        endpointing: 400,
      });

      connectionRef.current = connection;

      connection.on(LiveTranscriptionEvents.Open, () => {
        setStatus("listening");

        // Prefer audio/webm; fall back to whatever the browser supports
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "";

        const recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined
        );

        recorder.addEventListener("dataavailable", (e) => {
          if (e.data.size > 0 && connection.getReadyState() === 1) {
            connection.send(e.data);
          }
        });

        recorder.start(200);
        mediaRecorderRef.current = recorder;
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const alt = data?.channel?.alternatives?.[0];
        if (!alt) return;

        const text: string = alt.transcript ?? "";
        const isFinal: boolean = data.is_final ?? false;

        if (isFinal && text) {
          setTranscript((prev) =>
            prev ? `${prev} ${text}` : text
          );
          setInterimTranscript("");
        } else {
          setInterimTranscript(text);
        }
      });

      connection.on(LiveTranscriptionEvents.Error, (err) => {
        console.error("[Deepgram] error", err);
        setErrorMessage("Transcription error. Please try again.");
        setStatus("error");
        stopListening();
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        if (status === "listening") setStatus("idle");
      });
    } catch (err) {
      console.error("[Deepgram] setup error", err);
      const msg =
        err instanceof Error && err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow mic access and try again."
          : "Could not start microphone. Please try again.";
      setErrorMessage(msg);
      setStatus("error");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopListening = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;

    connectionRef.current?.finish();
    connectionRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setInterimTranscript("");
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    stopListening();
    setTranscript("");
    setInterimTranscript("");
    setErrorMessage("");
    setStatus("idle");
  }, [stopListening]);

  return {
    transcript,
    interimTranscript,
    status,
    errorMessage,
    startListening,
    stopListening,
    reset,
    isListening: status === "listening",
    isConnecting: status === "connecting",
  };
}
