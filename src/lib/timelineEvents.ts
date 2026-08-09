export function formatEventDate(eventDate: string) {
  return new Date(`${eventDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
