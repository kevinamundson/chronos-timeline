// Cloudflare Email Address Obfuscation rewrites visible text that looks like an
// address. TIPNR ids (Abraham@Gen.11.26-1Pe) are not mailboxes. Wrap each one so
// Scrape Shield leaves it alone. A real mailbox (letter-only final label, no
// verse number) stays unwrapped so a published address can still be obfuscated.
// https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/

const EMAIL_LIKE = /[A-Za-z0-9][A-Za-z0-9._%+\-]*@[A-Za-z0-9][A-Za-z0-9.\-]*\.[A-Za-z0-9][A-Za-z0-9.\-]*/g;
const PUBLIC_EMAIL = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/;
const SKIP_REGION = new Set(['script', 'style', 'noscript', 'textarea', 'xmp', 'head']);

export function isPublicEmail(token) {
  return PUBLIC_EMAIL.test(token);
}

export function protectNonEmails(text) {
  return text.replace(EMAIL_LIKE, (token) => (isPublicEmail(token) ? token : `<!--email_off-->${token}<!--/email_off-->`));
}

export function protectHtml(html) {
  let out = '';
  let i = 0;
  const skip = [];
  while (i < html.length) {
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i);
      if (end === -1) return out + html.slice(i);
      out += html.slice(i, end + 3);
      i = end + 3;
      continue;
    }
    if (html[i] === '<') {
      const end = html.indexOf('>', i);
      if (end === -1) return out + html.slice(i);
      const tag = html.slice(i, end + 1);
      const parsed = /^<\s*(\/)?\s*([a-zA-Z0-9]+)/.exec(tag);
      if (parsed) {
        const name = parsed[2].toLowerCase();
        if (!parsed[1] && SKIP_REGION.has(name) && !/\/\s*>$/.test(tag)) skip.push(name);
        else if (parsed[1] && skip[skip.length - 1] === name) skip.pop();
      }
      out += tag;
      i = end + 1;
      continue;
    }
    const next = html.indexOf('<', i);
    const end = next === -1 ? html.length : next;
    const text = html.slice(i, end);
    out += skip.length ? text : protectNonEmails(text);
    i = end;
  }
  return out;
}
