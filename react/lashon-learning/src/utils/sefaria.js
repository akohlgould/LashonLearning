export function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed,link").forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith("on") || (attr.name === "href" && attr.value.trimStart().startsWith("javascript:"))) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return doc.body.innerHTML;
}

export function toSefariaUrl(ref) {
  const clean = ref.replace(/\s*\(.*\)\s*$/, "").trim();
  const m = clean.match(/^(.+?)\s+(\d+\w*:\d+)$/);
  if (!m)
    return `https://www.sefaria.org/${encodeURIComponent(clean.replace(/\s+/g, "_").replace(/:/g, "."))}?lang=bi`;
  const book = m[1].replace(/\s+/g, "_");
  const loc = m[2].replace(/:/g, ".");
  return `https://www.sefaria.org/${encodeURIComponent(book)}.${encodeURIComponent(loc)}?lang=bi`;
}
