"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, RotateCcw } from "lucide-react";
import { WaveformVisualizer } from "./contribution/waveform-visualizer";
import { AddAudioTranslationRequest, Language } from "@/lib/types/api";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import { generateAudioFilename } from "@/utils/label-validation";
import Spinner from "./spinner";

// Wikimedia Commons supported formats
const WIKIMEDIA_FORMATS = [
  "audio/ogg;codecs=opus",
  "audio/ogg;codecs=vorbis",
  "audio/oga",
  "audio/flac",
  "audio/wav",
  "audio/opus",
  "audio/mpeg",
  "audio/mp3",
];

interface ContributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: Language | null;
  onSuccess?: () => void;
}

export default function ContributeAudioModal({
  open,
  onOpenChange,
  language,
  onSuccess,
}: ContributeModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { selectedLexeme, addAudioTranslation } = useApiWithStore();
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const audioChunksRef = useRef<Blob[]>([]);

  // Check for supported Wikimedia Commons formats
  const getSupportedMimeType = () => {
    for (const format of WIKIMEDIA_FORMATS) {
      if (MediaRecorder.isTypeSupported(format)) {
        return format;
      }
    }
    // Fallback to webm if none supported
    return "audio/webm;codecs=opus";
  };

  // Convert audio using Web Audio API if needed
  const convertAudioToOgg = async (blob: Blob): Promise<Blob> => {
    try {
      setIsConverting(true);

      // Create audio context
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Convert blob to array buffer
      const arrayBuffer = await blob.arrayBuffer();

      // Decode the audio
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Create offline context for rendering
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      // Create buffer source
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();

      // Render the audio
      const renderedBuffer = await offlineContext.startRendering();

      // Convert to WAV format (more compatible than OGG)
      const wavBlob = audioBufferToWav(renderedBuffer);

      return wavBlob;
    } catch (error) {
      console.error("Audio conversion failed:", error);
      // Return original blob if conversion fails
      return blob;
    } finally {
      setIsConverting(false);
    }
  };

  // Helper function to convert AudioBuffer to WAV
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(
          -1,
          Math.min(1, buffer.getChannelData(channel)[i])
        );
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
  };

  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      // Get the best supported format for Wikimedia Commons
      const supportedMimeType = getSupportedMimeType();
      setMimeType(supportedMimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType,
      });
      mediaRecorderRef.current = mediaRecorder;
      setRecordingTime(0);

      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) =>
        audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        // Create blob with the recorded format
        const originalBlob = new Blob(audioChunksRef.current, {
          type: supportedMimeType,
        });

        // Convert to WAV if not already in a Wikimedia Commons format
        let finalBlob = originalBlob;
        if (
          !supportedMimeType.includes("ogg") &&
          !supportedMimeType.includes("oga") &&
          !supportedMimeType.includes("wav")
        ) {
          finalBlob = await convertAudioToOgg(originalBlob);
          setMimeType("audio/wav");
        }

        setAudioBlob(finalBlob);

        // Convert blob to base64
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
          };
          reader.readAsDataURL(finalBlob);
        });
        setAudioBase64(base64Data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
      setAudioStream(null);
      // timer will be stopped by useEffect when isRecording becomes false
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      setIsPlaying(true);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioStream(null);
    setIsPlaying(false);
    setRecordingTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.src = "";
    }
  };

  /**
   * Handle the submission of the audio translation
   */
  const handleSubmit = async () => {
    if (!audioBase64) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate filename using the utility function
      const lexemeId = selectedLexeme?.lexeme?.id || "";
      const destinationLanguageCode = language?.lang_code || "";
      const destinationLanguageLexemeLabel =
        selectedLexeme?.glosses.find(
          (gl: any) => gl.gloss.language === destinationLanguageCode
        )?.gloss.value || "";

      // Determine file extension based on MIME type
      const getFileExtension = (mimeType: string) => {
        if (mimeType.includes("wav")) return "wav";
        if (mimeType.includes("ogg")) return "ogg";
        if (mimeType.includes("oga")) return "oga";
        if (mimeType.includes("flac")) return "flac";
        if (mimeType.includes("opus")) return "opus";
        if (mimeType.includes("mp3") || mimeType.includes("mpeg")) return "mp3";
        return "wav"; // default fallback
      };

      const fileExtension = getFileExtension(mimeType || "audio/wav");
      const filename = generateAudioFilename(
        lexemeId,
        destinationLanguageCode,
        destinationLanguageLexemeLabel,
        fileExtension
      );

      const request: AddAudioTranslationRequest[] = [
        {
          file_content: audioBase64,
          filename: filename,
          formid: selectedLexeme?.glosses[0]?.gloss.formId || "",
          lang_label: language?.lang_label || "",
          lang_wdqid: language?.lang_wd_id || "",
        },
      ];

      await addAudioTranslation(request);
      onSuccess?.();
      onOpenChange(false); // Close the modal on success
    } catch (error) {
      console.error("Error submitting audio:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Voice Contribution</DialogTitle>
          <DialogDescription>
            Record your voice to help improve our translations for{" "}
            {language ? language.lang_label : "the language"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center items-center space-x-4">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                size="lg"
                className="h-16 w-16 rounded-full"
              >
                <Mic className="h-8 w-8" />
              </Button>
            )}

            {isRecording && (
              <>
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                  className="h-16 w-16 rounded-full"
                >
                  <Square className="h-8 w-8" />
                </Button>
                <WaveformVisualizer
                  isRecording={isRecording}
                  audioStream={audioStream!}
                  className="ml-4 w-48 h-16"
                />
                <span className="ml-4 text-lg font-mono tabular-nums">
                  {recordingTime}s
                </span>
              </>
            )}

            {audioBlob && !isRecording && !isPlaying && (
              <>
                <Button
                  onClick={playRecording}
                  size="lg"
                  className="h-16 w-16 rounded-full"
                >
                  <Play className="h-8 w-8" />
                </Button>
                <Button
                  onClick={resetRecording}
                  size="lg"
                  variant="outline"
                  className="h-16 w-16 rounded-full"
                >
                  <RotateCcw className="h-8 w-8" />
                </Button>
              </>
            )}

            {audioBlob && isPlaying && !isRecording && (
              <audio
                controls
                autoPlay
                src={URL.createObjectURL(audioBlob)}
                onEnded={() => setIsPlaying(false)}
                className="w-full"
              />
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isConverting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!audioBlob || isSubmitting || isConverting}
            >
              <Spinner
                loading={isSubmitting || isConverting}
                content={
                  isConverting
                    ? "Converting..."
                    : isSubmitting
                    ? "Uploading..."
                    : "Submit"
                }
              />
            </Button>
          </div>

          {isConverting && (
            <div className="text-center text-sm text-gray-600">
              Converting audio to Wikimedia Commons format...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
