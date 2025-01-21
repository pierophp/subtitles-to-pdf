export function convertTimestampToMilliseconds(timestamp: string) {
  const [hours, minutes, secondsMilliseconds] = timestamp.split(":");
  const [seconds, milliseconds] = secondsMilliseconds.split(",");

  const hoursInMs = parseInt(hours) * 3600000;
  const minutesInMs = parseInt(minutes) * 60000;
  const secondsInMs = parseInt(seconds) * 1000;
  const millisecondsInMs = parseInt(milliseconds);

  return hoursInMs + minutesInMs + secondsInMs + millisecondsInMs;
}

export function convertTimestampToSeconds(timestamp: string) {
  return Math.round(convertTimestampToMilliseconds(timestamp) / 1000);
}
