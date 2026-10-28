// Event aliases become Cloudflare Pages redirects. The build writes site/dist/_redirects.
// An alias is a former slug. It is not a record. Status is 301.

export const SENNACHERIB_REDIRECT = '/events/sennacherib-first-invasion/ /events/sennacherib-besieges-jerusalem/ 301';

export function redirectLines(records) {
  const lines = [];
  for (const doc of records) {
    if (doc?.type !== 'event' || !Array.isArray(doc.aliases)) continue;
    for (const alias of doc.aliases) {
      const to = `/events/${doc.id}/`;
      lines.push(`/events/${alias}/ ${to} 301`);
      lines.push(`/events/${alias} ${to} 301`);
    }
  }
  return lines;
}

export function redirectsFileHasSennacherib(text) {
  return String(text).split('\n').some((line) => line.trim() === SENNACHERIB_REDIRECT);
}
