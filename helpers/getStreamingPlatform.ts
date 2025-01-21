export function getStreamingPlatform(url: string) {
  if (url.includes("netflix")) {
    return "netflix";
  } else if (url.includes("primevideo")) {
    return "prime-video";
  }
}
