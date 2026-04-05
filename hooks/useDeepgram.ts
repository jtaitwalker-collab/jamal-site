"use client";

import { useState, useCallback, useRef } from "react";

export type DeepgramStatus = "idle" | "connecting" | "listening" | "error";

interface DeepgramMessage {
  channel?: {
    alternatives?: Array<{ transcript: string }>;
  };
  is_final?: boolean;
  type?: string;
}

export function useDeepgram() {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [status, setStatus] = useState<DeepgramStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopListening = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;

    if (wsRef.current) {
      wsRef.current.onclose = null; // prevent spurious state changes
      wsRef.current.close(1000, "User stopped");
      wsRef.current = null;
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setInterimTranscript("");
    setStatus("idle");
  }, []);

  const startListening = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
    if (!apiKey) {
      setErrorMessage("Deepgram API key not configured.");
      setStatus("error");
      return;
    }

    setStatus("connecting");
    setErrorMessage("");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err) {
      console.error("[Deepgram] mic error", err);
      setErrorMessage(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow mic access and try again."
          : "Could not start microphone. Please try again."
      );
      setStatus("error");
      return;
    }

    try {
      const params = new URLSearchParams({
        model: "nova-2",
        language: "en-GB",
        smart_format: "true",
        interim_results: "true",
        endpointing: "400",
      });

      // Deepgram browser auth: pass key as WebSocket subprotocol
      const ws = new WebSocket(
        `wss://api.deepgram.com/v1/listen?${params.toString()}`,
        ["token", apiKey]
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("listening");

        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "";

        const recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined
        );

        recorder.addEventListener("dataavailable", (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(e.data);
          }
        });

        recorder.start(200);
        mediaRecorderRef.current = recorder;
      };

      ws.onmessage = (event) => {
        try {
          const data: DeepgramMessage = JSON.parse(event.data as string);

          // Ignore metadata / speech_final / utterance_end frames
          if (data.type && data.type !== "Results") return;

          const alt = data.channel?.alternatives?.[0];
          if (!alt) return;

          const text = alt.transcript ?? "";
          const isFinal = data.is_final ?? false;

          if (isFinal && text) {
            setTranscript((prev) => (prev ? `${prev} ${text}` : text));
            setInterimTranscript("");
          } else {
            setInterimTranscript(text);
          }
        } catch {
          // non-JSON frames (keepalives, etc.) — ignore
        }
      };

      ws.onerror = () => {
        console.error("[Deepgram] WebSocket error — check API key and network");
        setErrorMessage("Transcription error. Please try again.");
        setStatus("error");
        stopListening();
      };

      ws.onclose = (event) => {
        // Only update state if we're still in an active session (not already stopped)
        if (event.code !== 1000 && wsRef.current !== null) {
          console.warn("[Deepgram] connection closed unexpectedly", event.code, event.reason);
          setErrorMessage("Connection lost. Please try again.");
          setStatus("error");
          stopListening();
        }
      };
    } catch (err) {
      console.error("[Deepgram] WebSocket setup error", err);
      setErrorMessage("Could not connect to transcription service. Please try again.");
      setStatus("error");
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [stopListening]);

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
