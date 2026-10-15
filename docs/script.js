"use strict";

/* ==================================================================
   STAGE 0: GLOBAL constants available everywhere
   ======================================================*/

const TEI_NS = "http://www.tei-c.org/ns/1.0";
const SVG_NS = "http://www.w3.org/2000/svg";

// Build a DOM element in one line. We only ever use textContent / append(),
// never innerHTML, so odd characters in the data can't break the page.
function make(ns, tag, attrs = {}, ...children) {
  const node = ns
    ? document.createElementNS(ns, tag)
    : document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (name.startsWith("on")) node.addEventListener(name.slice(2), value);
    else node.setAttribute(name, value);
  }
  node.append(...children);
  return node;
}
const html = (tag, attrs, ...kids) => make(null, tag, attrs, ...kids);
const svg = (tag, attrs, ...kids) => make(SVG_NS, tag, attrs, ...kids);

const clean = (text) => (text || "").replace(/\s+/g, " ").trim();

/* =====================================================================
   STAGE 1: Parse our TEI Zotero export into plain JavaScript objects
   Remember: TEI lives in a namespace, so we use getElementsBy...NS() methods!

   ========================================================== */

// Direct children only (getElementsByTagNameNS would also find grandchildren).
function childrenNamed(parent, name) {
  return Array.from(parent.children).filter((c) => c.localName === name);
}

function parseItems(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("That file is not well-formed XML.");
  }
  const entries = Array.from(doc.getElementsByTagNameNS(TEI_NS, "biblStruct"));
  if (entries.length === 0) {
    throw new Error(
      "No <biblStruct> entries found. Is this a Zotero TEI export?",
    );
  }

  return entries.map((entry) => {
    const all = (name) =>
      Array.from(entry.getElementsByTagNameNS(TEI_NS, name));
    const withType = (name, type) =>
      all(name).find((n) => n.getAttribute("type") === type);

    // First <title> that isn't the "short" version.
    const titleEl = all("title").find(
      (t) => t.getAttribute("type") !== "short",
    );

    const authors = all("author").map((a) =>
      clean([...a.children].map((c) => c.textContent).join(" ")),
    );

    // Direct-child <note>s: one has type="tags", the rest are for your annotations.
    const notes = childrenNamed(entry, "note");
    const tagsNote = notes.find((n) => n.getAttribute("type") === "tags");
    const rawTags = tagsNote
      ? childrenNamed(tagsNote, "note")
          .map((n) => clean(n.textContent))
          .filter(Boolean)
      : [];
    const annotation = notes
      .filter((n) => !n.hasAttribute("type"))
      .map((n) => clean(n.textContent))
      .filter(Boolean)
      .join(" ");

    return {
      id: entry.getAttribute("xml:id") || "",
      type: entry.getAttribute("type") || "item",
      title: clean(titleEl && titleEl.textContent) || "(untitled)",
      authors,
      date: clean((all("date")[0] || {}).textContent),
      url: clean((withType("note", "url") || {}).textContent),
      annotation,
      rawTags,
    };
  });
}

/* =====================================================================
   STAGE 2: Count tags and co-occurrences
   Digit 400 house rule: our own (student) tags start with "#". Everything else is ignored
   (library catalogue subject headings) but reported in the housekeeping box.
   ===================================================================== */

function analyze(items) {
  const tags = new Map(); // key -> { key, label, count, items: [item indexes] }
  const edges = new Map(); // "keyA|keyB" -> { a, b, weight }
  const spellings = new Map(); // key -> Set of spellings seen (to catch #Security vs #security)
  const ignored = new Map(); // non-# text -> number of uses
  const bare = []; // { raw, index } for each non-# tag, to spot a forgotten "#"

  items.forEach((item, index) => {
    const seen = new Set(); // a tag counts once per reading
    for (const raw of item.rawTags) {
      if (!raw.startsWith("#") || raw.length < 2) {
        ignored.set(raw, (ignored.get(raw) || 0) + 1);
        bare.push({ raw, index });
        continue;
      }
      const key = raw.toLowerCase();
      if (!spellings.has(key)) spellings.set(key, new Set());
      spellings.get(key).add(raw);
      if (seen.has(key)) continue;
      seen.add(key);
      if (!tags.has(key))
        tags.set(key, { key, label: raw, count: 0, items: [] });
      const tag = tags.get(key);
      tag.count += 1;
      tag.items.push(index);
    }
    item.tagKeys = [...seen];

    // Every pair of tags on the same reading adds 1 to that pair's weight.
    const keys = [...seen].sort();
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const id = keys[i] + "|" + keys[j];
        if (!edges.has(id))
          edges.set(id, { a: keys[i], b: keys[j], weight: 0 });
        edges.get(id).weight += 1;
      }
    }
  });

  // ---- housekeeping notes ----
  const missingHash = bare
    .filter(({ raw }) => tags.has("#" + raw.toLowerCase()))
    .map(
      ({ raw, index }) =>
        `"${raw}" on “${items[index].title}” looks like ${tags.get("#" + raw.toLowerCase()).label} without the #`,
    );

  const caseVariants = [...spellings]
    .filter(([, forms]) => forms.size > 1)
    .map(
      ([, forms]) =>
        `Different capitalization: ${[...forms].join(", ")} (counted together)`,
    );

  const untagged = items
    .filter((item) => item.tagKeys.length === 0)
    .map((item) => `No # tags: “${item.title}”`);

  const byUrl = new Map();
  items.forEach((item) => {
    if (!item.url) return;
    if (!byUrl.has(item.url)) byUrl.set(item.url, []);
    byUrl.get(item.url).push(item);
  });
  const duplicates = [...byUrl.values()]
    .filter((group) => group.length > 1)
    .map(
      (group) =>
        `Possible duplicate (${group.length} entries, same URL): “${group[0].title}”`,
    );

  return {
    tags,
    edges,
    ignored,
    notes: [...missingHash, ...caseVariants, ...untagged, ...duplicates],
  };
}

/* =====================================================================
   STAGE 3: App state + drawing
   One tiny rule: change `state`, then call renderAll().
   ===================================================================== */

const state = { items: [], data: null, selected: null, minCount: 1 };

function select(key) {
  state.selected = state.selected === key ? null : key; // click again to deselect
  renderAll();
}

function renderAll() {
  renderBars();
  renderNetwork();
  renderList();
}

// ---- frequency bars (plain HTML/CSS: a div whose width is a percentage) ----
function sortedTags() {
  return [...state.data.tags.values()].sort(
    (x, y) => y.count - x.count || x.label.localeCompare(y.label),
  );
}

function renderBars() {
  const list = sortedTags();
  const max = list.length ? list[0].count : 1;
  const box = document.getElementById("bars");
  box.replaceChildren(
    ...list.map((tag) =>
      html(
        "button",
        {
          class: "bar-row" + (tag.key === state.selected ? " selected" : ""),
          title: `${tag.label}: ${tag.count} reading${tag.count === 1 ? "" : "s"}`,
          onclick: () => select(tag.key),
        },
        html("span", { class: "bar-label" }, tag.label),
        html(
          "span",
          { class: "bar-track" },
          html("div", {
            class: "bar-fill",
            style: `width:${(tag.count / max) * 100}%`,
          }),
        ),
        html("span", { class: "bar-n" }, String(tag.count)),
      ),
    ),
  );
}

// ---- network (SVG, circular layout, no physics library) ----

// Order tags around the circle so strongly linked tags end up next to each other:
// start with the most-used tag, then keep stepping to its strongest unused partner.
function orderForCircle(list, edges) {
  const weight = (a, b) => {
    const edge = edges.get(a < b ? a + "|" + b : b + "|" + a);
    return edge ? edge.weight : 0;
  };
  const left = [...list].sort((x, y) => y.count - x.count);
  const ordered = [left.shift()];
  while (left.length) {
    const last = ordered[ordered.length - 1];
    let bestIndex = 0,
      bestWeight = -1;
    left.forEach((tag, i) => {
      const w = weight(last.key, tag.key);
      if (w > bestWeight) {
        bestWeight = w;
        bestIndex = i;
      }
    });
    ordered.push(left.splice(bestIndex, 1)[0]);
  }
  return ordered;
}

function renderNetwork() {
  const net = document.getElementById("net");
  const visible = [...state.data.tags.values()].filter(
    (t) => t.count >= state.minCount,
  );
  if (visible.length === 0) {
    net.replaceChildren(
      svg(
        "text",
        { x: 380, y: 350, "text-anchor": "middle", fill: "currentColor" },
        "No tags meet that minimum.",
      ),
    );
    return;
  }

  const ordered = orderForCircle(visible, state.data.edges);
  const cx = 380,
    cy = 350,
    ring = 235;
  const pos = new Map(); // key -> { x, y, angle }
  ordered.forEach((tag, i) => {
    const angle = (2 * Math.PI * i) / ordered.length - Math.PI / 2; // start at 12 o'clock
    pos.set(tag.key, {
      x: cx + ring * Math.cos(angle),
      y: cy + ring * Math.sin(angle),
      angle,
    });
  });

  // Which tags are linked to the selected one?
  const sel = state.selected;
  const neighbors = new Set();
  if (sel) {
    for (const e of state.data.edges.values()) {
      if (e.a === sel) neighbors.add(e.b);
      if (e.b === sel) neighbors.add(e.a);
    }
  }

  // Edges first, so the circles are drawn on top of them.
  const edgeEls = [];
  for (const e of state.data.edges.values()) {
    if (!pos.has(e.a) || !pos.has(e.b)) continue;
    const p = pos.get(e.a),
      q = pos.get(e.b);
    const touches = sel && (e.a === sel || e.b === sel);
    const cls = "edge" + (sel ? (touches ? " hot" : " faded") : "");
    edgeEls.push(
      svg(
        "line",
        {
          class: cls,
          x1: p.x,
          y1: p.y,
          x2: q.x,
          y2: q.y,
          "stroke-width": 1 + e.weight * 1.4,
        },
        svg(
          "title",
          {},
          `${state.data.tags.get(e.a).label} + ${state.data.tags.get(e.b).label}: ${e.weight} reading${e.weight === 1 ? "" : "s"}`,
        ),
      ),
    );
  }

  const nodeEls = ordered.map((tag) => {
    const { x, y, angle } = pos.get(tag.key);
    const r = 5 + 4 * Math.sqrt(tag.count); // area grows with count
    const cos = Math.cos(angle);
    const anchor = cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle";
    const labelDist = r + 8;
    const faded = sel && tag.key !== sel && !neighbors.has(tag.key);
    const cls =
      "node" + (tag.key === sel ? " selected" : "") + (faded ? " faded" : "");
    const activate = () => select(tag.key);
    return svg(
      "g",
      {
        class: cls,
        tabindex: "0",
        role: "button",
        "aria-label": `${tag.label}, ${tag.count} readings`,
        onclick: activate,
        onkeydown: (ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            activate();
          }
        },
      },
      svg("rect", { x: x-r, y: y-r, width: r * 2, height: r * 2 }),
      svg(
        "text",
        {
          x: x + labelDist * Math.cos(angle),
          y: y + labelDist * Math.sin(angle),
          "text-anchor": anchor,
          "dominant-baseline": "middle",
        },
        `${tag.label} (${tag.count})`,
      ),
    );
  });

  net.replaceChildren(...edgeEls, ...nodeEls);
}

// ---- article list ----
function renderList() {
  const { items, data, selected } = state;
  const tag = selected ? data.tags.get(selected) : null;
  const indexes = tag ? tag.items : items.map((_, i) => i);
  const shown = indexes
    .map((i) => items[i])
    .sort((a, b) => a.title.localeCompare(b.title));

  document.getElementById("listTitle").textContent = tag
    ? `Readings tagged ${tag.label} (${shown.length})`
    : `All readings (${shown.length})`;
  document.getElementById("clear").hidden = !tag;

  document.getElementById("items").replaceChildren(
    ...shown.map((item) => {
      const meta = [item.type, item.authors.join(", "), item.date]
        .filter(Boolean)
        .join(" · ");
      const titleNode = item.url
        ? html(
            "a",
            { href: item.url, target: "_blank", rel: "noopener" },
            item.title,
          )
        : html("span", {}, item.title);
      const chips = item.tagKeys.map((key) => {
        const t = data.tags.get(key);
        return html(
          "button",
          {
            class: "chip" + (key === selected ? " selected" : ""),
            onclick: () => select(key),
          },
          t.label,
        );
      });
      return html(
        "li",
        {},
        html("div", { class: "title" }, titleNode),
        html(
          "div",
          { class: "meta" },
          meta + (item.url ? "" : (meta ? " · " : "") + "no link"),
        ),
        item.annotation ? html("p", { class: "note" }, item.annotation) : "",
        html("div", { class: "chips" }, ...chips),
      );
    }),
  );
}

// ---- summary + housekeeping ----
function renderSummary() {
  const { items, data } = state;
  document.getElementById("summary").textContent =
    `${items.length} readings · ${data.tags.size} different # tags · ${data.edges.size} tag pairings`;

  const n = data.notes.length;
  const details = document.getElementById("housekeeping");
  details.hidden = false;
  document.getElementById("hkSummary").textContent =
    `Tag housekeeping (${n} note${n === 1 ? "" : "s"})`;

  const ignoredList = [...data.ignored.keys()].sort((a, b) =>
    a.localeCompare(b),
  );
  const body = document.getElementById("hkBody");
  body.replaceChildren(
    n
      ? html("ul", {}, ...data.notes.map((text) => html("li", {}, text)))
      : html("p", {}, "Nothing to fix. Nice tagging!"),
    ignoredList.length
      ? html(
          "p",
          { class: "small" },
          `Ignored ${ignoredList.length} tag${ignoredList.length === 1 ? "" : "s"} without a leading # ` +
            `(library subject headings, or tags missing their #): ${ignoredList.join("; ")}`,
        )
      : "",
  );
}

/* =====================================================================
   STAGE 4: Wire it up (file picker, drag-and-drop, controls)
   ===================================================================== */

function init(items) {
  state.items = items;
  state.data = analyze(items);
  state.selected = null;
  state.minCount = 1;

  const maxCount = Math.max(
    1,
    ...[...state.data.tags.values()].map((t) => t.count),
  );
  const slider = document.getElementById("minCount");
  slider.max = String(maxCount);
  slider.value = "1";
  document.getElementById("minOut").textContent = "1";

  document.getElementById("app").hidden = false;
  renderSummary();
  renderAll();
}

async function loadFile(file) {
  const status = document.getElementById("status");
  status.className = "";
  try {
    const text = await file.text();
    init(parseItems(text));
    status.textContent = `Loaded ${file.name}`;
  } catch (err) {
    status.className = "error";
    status.textContent = err.message;
  }
}

// Everything that touches the page's elements waits for window.onload,
// so the HTML is guaranteed to exist before we attach listeners to it.
window.onload = function () {
  const drop = document.getElementById("drop");
  const fileInput = document.getElementById("file");

  drop.addEventListener("click", (ev) => {
    if (ev.target !== fileInput) fileInput.click();
  });
  fileInput.addEventListener(
    "change",
    () => fileInput.files[0] && loadFile(fileInput.files[0]),
  );

  ["dragenter", "dragover"].forEach((name) =>
    drop.addEventListener(name, (ev) => {
      ev.preventDefault();
      drop.classList.add("over");
    }),
  );
  ["dragleave", "drop"].forEach((name) =>
    drop.addEventListener(name, (ev) => {
      ev.preventDefault();
      drop.classList.remove("over");
    }),
  );
  drop.addEventListener(
    "drop",
    (ev) => ev.dataTransfer.files[0] && loadFile(ev.dataTransfer.files[0]),
  );

  document.getElementById("minCount").addEventListener("input", (ev) => {
    state.minCount = Number(ev.target.value);
    document.getElementById("minOut").textContent = ev.target.value;
    renderNetwork();
  });
  document
    .getElementById("clear")
    .addEventListener("click", () => select(state.selected));
};
