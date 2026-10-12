export type CameraStatus = "idle" | "starting" | "running" | "error";

export async function startCameraFeed(videoElement: HTMLVideoElement) {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  videoElement.srcObject = mediaStream;
  await videoElement.play();

  return mediaStream;
}

export function stopCameraFeed(mediaStream: MediaStream | null) {
  if (!mediaStream) return;

  for (const track of mediaStream.getTracks()) {
    track.stop();
  }
}
