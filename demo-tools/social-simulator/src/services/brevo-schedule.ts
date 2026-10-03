/** Convert a Copenhagen wall-clock value without depending on the browser timezone. */
export function copenhagenSchedule(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const wall = Date.parse(`${date}T${time}:00Z`);
  if (!Number.isFinite(wall)) return null;
  const formatter = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/Copenhagen',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  function local(timestamp: number) {
    const parts = Object.fromEntries(formatter.formatToParts(timestamp).map(part => [part.type,part.value]));
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00Z`;
  }
  let candidate = wall;
  for (let count=0;count<3;count++) candidate += wall - Date.parse(local(candidate));
  if (local(candidate) !== `${date}T${time}:00Z`) return null;
  return new Date(candidate).toISOString();
}
