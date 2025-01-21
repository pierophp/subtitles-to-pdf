export function imageFilename(time: string) {
  return time.replaceAll(":", "_").replaceAll(",", "_");
}
