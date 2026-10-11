/**
 * Video Compression and Bandwidth Optimization Utility
 * Compress videos client-side before upload to conserve bandwidth,
 * and provide helper functions to detect video media.
 */

export const isVideoUrl = (url?: string | null): boolean => {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".m4v") ||
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com") ||
    url.includes("/video/")
  );
};

export interface CompressVideoOptions {
  maxWidth?: number;
  maxHeight?: number;
  targetBitrate?: number; // bits per second (e.g. 1_800_000 = 1.8 Mbps)
  fps?: number;
  onProgress?: (percent: number) => void;
}

/**
 * Compresses a video file in the browser using HTML5 Canvas & MediaRecorder.
 * Downscales resolution and caps bitrate to ensure fast downloads and zero bandwidth waste.
 * If transcoding is not supported by the browser, safely falls back to the original file.
 */
export const compressVideo = async (
  file: File,
  options: CompressVideoOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1280,
    maxHeight = 720,
    targetBitrate = 1_800_000, // 1.8 Mbps ensures sharp HD with small footprint
    fps = 24,
    onProgress
  } = options;

  // If the file is already small (under 3.5 MB) and in webm format, return as is
  if (file.size <= 3.5 * 1024 * 1024 && file.type.includes("webm")) {
    return file;
  }

  // Check MediaRecorder support
  if (typeof window === "undefined" || !window.MediaRecorder) {
    console.warn("MediaRecorder is not supported in this browser; using original video file.");
    return file;
  }

  const mimeTypes = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4"
  ];

  let selectedMime = mimeTypes.find(m => {
    try {
      return MediaRecorder.isTypeSupported(m);
    } catch {
      return false;
    }
  });

  if (!selectedMime) {
    console.warn("No suitable MediaRecorder mime type found; using original file.");
    return file;
  }

  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => {
      try {
        URL.revokeObjectURL(objectUrl);
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {
        // ignore
      }
    };

    video.onerror = () => {
      cleanup();
      console.warn("Failed to load video for compression; falling back to original.");
      resolve(file);
    };

    video.onloadedmetadata = async () => {
      try {
        let width = video.videoWidth || 1280;
        let height = video.videoHeight || 720;
        const duration = video.duration || 0;

        // Calculate scaled dimensions keeping aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Ensure even dimensions for video codecs
        width = width % 2 === 0 ? width : width - 1;
        height = height % 2 === 0 ? height : height - 1;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: false });

        if (!ctx) {
          cleanup();
          return resolve(file);
        }

        const stream = canvas.captureStream(fps);
        
        // Add audio track if present in source video
        try {
          const audioStream = (video as any).captureStream ? (video as any).captureStream() : null;
          if (audioStream && audioStream.getAudioTracks().length > 0) {
            audioStream.getAudioTracks().forEach((track: MediaStreamTrack) => stream.addTrack(track));
          }
        } catch {
          // Audio track optional for background palace videos
        }

        const recorder = new MediaRecorder(stream, {
          mimeType: selectedMime,
          videoBitsPerSecond: targetBitrate
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          cleanup();
          const ext = selectedMime.includes("mp4") ? "mp4" : "webm";
          const blob = new Blob(chunks, { type: selectedMime });
          
          // If compressed is somehow larger than original, return original
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const compressedFile = new File([blob], `${baseName}-compressed.${ext}`, {
            type: selectedMime,
            lastModified: Date.now()
          });

          onProgress?.(100);
          resolve(compressedFile);
        };

        recorder.start(100);

        let animationFrameId: number;
        const drawFrame = () => {
          if (!video.paused && !video.ended) {
            ctx.drawImage(video, 0, 0, width, height);
            if (duration > 0 && onProgress) {
              const progress = Math.min(Math.round((video.currentTime / duration) * 100), 99);
              onProgress(progress);
            }
            animationFrameId = requestAnimationFrame(drawFrame);
          }
        };

        video.onended = () => {
          cancelAnimationFrame(animationFrameId);
          setTimeout(() => {
            if (recorder.state === "recording") {
              recorder.stop();
            }
          }, 200);
        };

        // Fallback max timeout in case video gets stuck
        const maxTimeout = setTimeout(() => {
          cancelAnimationFrame(animationFrameId);
          if (recorder.state === "recording") {
            recorder.stop();
          }
        }, Math.max(30000, (duration + 5) * 1000));

        recorder.onerror = () => {
          clearTimeout(maxTimeout);
          cancelAnimationFrame(animationFrameId);
          cleanup();
          resolve(file);
        };

        await video.play();
        drawFrame();
      } catch (err) {
        console.warn("Video compression error:", err);
        cleanup();
        resolve(file);
      }
    };
  });
};
