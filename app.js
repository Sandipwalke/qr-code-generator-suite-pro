const qrTypeConfig = {
  url: [{ id: "url", label: "URL", type: "url", required: true }],
  text: [{ id: "text", label: "Text", type: "text", required: true }],
  email: [
    { id: "email", label: "Email", type: "email", required: true },
    { id: "subject", label: "Subject", type: "text" },
    { id: "body", label: "Body", type: "text" },
  ],
  phone: [{ id: "phone", label: "Phone", type: "text", required: true }],
  sms: [
    { id: "phone", label: "Phone", type: "text", required: true },
    { id: "message", label: "Message", type: "text" },
  ],
  wifi: [
    { id: "ssid", label: "SSID", type: "text", required: true },
    { id: "password", label: "Password", type: "text" },
    { id: "encryption", label: "Encryption (WPA/WEP/nopass)", type: "text", value: "WPA" },
  ],
  geo: [
    { id: "lat", label: "Latitude", type: "number", required: true },
    { id: "lng", label: "Longitude", type: "number", required: true },
  ],
  vcard: [
    { id: "name", label: "Full Name", type: "text", required: true },
    { id: "org", label: "Organization", type: "text" },
    { id: "title", label: "Title", type: "text" },
    { id: "phone", label: "Phone", type: "text" },
    { id: "email", label: "Email", type: "email" },
    { id: "website", label: "Website", type: "url" },
  ],
  calendar: [
    { id: "title", label: "Event Title", type: "text", required: true },
    { id: "start", label: "Start (YYYYMMDDTHHmmssZ)", type: "text", required: true },
    { id: "end", label: "End (YYYYMMDDTHHmmssZ)", type: "text", required: true },
    { id: "location", label: "Location", type: "text" },
  ],
};

const $ = (id) => document.getElementById(id);
const statusEl = $("status");
const qrTypeEl = $("qrType");
const dynamicFieldsEl = $("dynamicFields");
const presetListEl = $("presetList");
const apiKeysEl = $("apiKeys");
let qrCode;

class LocalRepository {
  constructor(prefix = "qr-suite") {
    this.prefix = prefix;
  }
  get(name, fallback = []) {
    const raw = localStorage.getItem(`${this.prefix}:${name}`);
    return raw ? JSON.parse(raw) : fallback;
  }
  set(name, value) {
    localStorage.setItem(`${this.prefix}:${name}`, JSON.stringify(value));
  }
}

const repo = new LocalRepository();

function toPayload(type, values) {
  switch (type) {
    case "url": return values.url;
    case "text": return values.text;
    case "email": return `mailto:${values.email}?subject=${encodeURIComponent(values.subject || "")}&body=${encodeURIComponent(values.body || "")}`;
    case "phone": return `tel:${values.phone}`;
    case "sms": return `SMSTO:${values.phone}:${values.message || ""}`;
    case "wifi": return `WIFI:T:${values.encryption || "WPA"};S:${values.ssid};P:${values.password || ""};;`;
    case "geo": return `geo:${values.lat},${values.lng}`;
    case "vcard":
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${values.name}\nORG:${values.org || ""}\nTITLE:${values.title || ""}\nTEL:${values.phone || ""}\nEMAIL:${values.email || ""}\nURL:${values.website || ""}\nEND:VCARD`;
    case "calendar":
      return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${values.title}\nDTSTART:${values.start}\nDTEND:${values.end}\nLOCATION:${values.location || ""}\nEND:VEVENT\nEND:VCALENDAR`;
    default:
      return "";
  }
}

function populateTypes() {
  Object.keys(qrTypeConfig).forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key.toUpperCase();
    qrTypeEl.append(option);
  });
  qrTypeEl.value = "url";
}

function renderFields() {
  dynamicFieldsEl.innerHTML = "";
  qrTypeConfig[qrTypeEl.value].forEach((field) => {
    const label = document.createElement("label");
    label.textContent = field.label;
    const input = document.createElement("input");
    input.type = field.type || "text";
    input.id = `field_${field.id}`;
    if (field.required) input.required = true;
    if (field.value) input.value = field.value;
    label.append(input);
    dynamicFieldsEl.append(label);
  });
}

function getFieldValues() {
  return qrTypeConfig[qrTypeEl.value].reduce((acc, field) => {
    acc[field.id] = $(`field_${field.id}`).value;
    return acc;
  }, {});
}

function currentDesign() {
  return {
    width: Number($("size").value),
    height: Number($("size").value),
    type: "svg",
    margin: Number($("margin").value),
    qrOptions: { errorCorrectionLevel: $("ecLevel").value },
    dotsOptions: { color: $("fgColor").value, type: $("dotStyle").value },
    cornersSquareOptions: { type: $("cornerSquareStyle").value, color: $("fgColor").value },
    cornersDotOptions: { type: $("cornerDotStyle").value, color: $("fgColor").value },
    backgroundOptions: { color: $("bgColor").value },
    image: $("logoUrl").value || undefined,
    imageOptions: { margin: 4, hideBackgroundDots: true, imageSize: 0.4 },
  };
}

function generateQR(customPayload) {
  const values = getFieldValues();
  const payload = customPayload || toPayload(qrTypeEl.value, values);
  if (!payload) {
    statusEl.textContent = "Please provide valid input fields.";
    return;
  }
  const options = { ...currentDesign(), data: payload };
  const target = $("qrCanvas");
  target.innerHTML = "";
  qrCode = new QRCodeStyling(options);
  qrCode.append(target);

  const history = repo.get("history");
  history.unshift({ type: qrTypeEl.value, payload, at: new Date().toISOString() });
  repo.set("history", history.slice(0, 100));
  statusEl.textContent = `Generated ${qrTypeEl.value.toUpperCase()} at ${new Date().toLocaleString()}`;
}

function savePreset() {
  const presets = repo.get("presets");
  presets.push({
    id: crypto.randomUUID(),
    name: `${qrTypeEl.value}-${new Date().toLocaleTimeString()}`,
    type: qrTypeEl.value,
    design: currentDesign(),
    values: getFieldValues(),
  });
  repo.set("presets", presets);
  renderPresets();
}

function renderPresets() {
  presetListEl.innerHTML = "";
  repo.get("presets").forEach((preset) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `<span>${preset.name}</span><div><button data-load="${preset.id}">Load</button> <button data-del="${preset.id}">Delete</button></div>`;
    presetListEl.append(row);
  });
}

function loadPreset(id) {
  const preset = repo.get("presets").find((p) => p.id === id);
  if (!preset) return;
  qrTypeEl.value = preset.type;
  renderFields();
  Object.entries(preset.values).forEach(([k, v]) => {
    const el = $(`field_${k}`);
    if (el) el.value = v;
  });
  $("dotStyle").value = preset.design.dotsOptions.type;
  $("cornerSquareStyle").value = preset.design.cornersSquareOptions.type;
  $("cornerDotStyle").value = preset.design.cornersDotOptions.type;
  $("fgColor").value = preset.design.dotsOptions.color;
  $("bgColor").value = preset.design.backgroundOptions.color;
  $("size").value = preset.design.width;
  $("margin").value = preset.design.margin;
  $("ecLevel").value = preset.design.qrOptions.errorCorrectionLevel;
  $("logoUrl").value = preset.design.image || "";
  generateQR();
}

function deletePreset(id) {
  repo.set("presets", repo.get("presets").filter((p) => p.id !== id));
  renderPresets();
}

function randomKey() {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return `qrs_${Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

async function hashKey(raw) {
  const enc = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function createApiKey() {
  const label = $("apiLabel").value || "default";
  const scope = $("apiScope").value;
  const raw = randomKey();
  const hash = await hashKey(raw);
  const keys = repo.get("apiKeys");
  keys.push({ id: crypto.randomUUID(), label, scope, hash, createdAt: new Date().toISOString(), lastUsedAt: null });
  repo.set("apiKeys", keys);
  $("keyReveal").textContent = `Copy now (shown once): ${raw}`;
  renderApiKeys();
}

function renderApiKeys() {
  apiKeysEl.innerHTML = "";
  repo.get("apiKeys").forEach((k) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `<span>${k.label} • ${k.scope} • ${k.createdAt.slice(0, 10)}</span><button data-revoke="${k.id}">Revoke</button>`;
    apiKeysEl.append(row);
  });
}

function revokeKey(id) {
  repo.set("apiKeys", repo.get("apiKeys").filter((k) => k.id !== id));
  renderApiKeys();
}

async function runApiCall() {
  const key = prompt("Enter API key");
  if (!key) return;
  const hash = await hashKey(key.trim());
  const keys = repo.get("apiKeys");
  const found = keys.find((k) => k.hash === hash);
  if (!found) {
    $("apiResult").textContent = JSON.stringify({ ok: false, error: "Invalid API key" }, null, 2);
    return;
  }

  const payload = JSON.parse($("apiPayload").value);
  const values = { ...payload };
  const type = payload.type;
  if (!qrTypeConfig[type]) {
    $("apiResult").textContent = JSON.stringify({ ok: false, error: "Unsupported type" }, null, 2);
    return;
  }
  const data = toPayload(type, values);
  found.lastUsedAt = new Date().toISOString();
  repo.set("apiKeys", keys);

  $("apiResult").textContent = JSON.stringify(
    {
      ok: true,
      type,
      qrPayload: data,
      generatedAt: new Date().toISOString(),
      message: "Use this payload with POST /api/v1/qrcodes after backend migration.",
    },
    null,
    2
  );
}

async function batchGenerate() {
  const lines = $("batchInput").value.split("\n").map((s) => s.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i += 1) {
    generateQR(lines[i]);
    await new Promise((r) => setTimeout(r, 250));
    if (qrCode) await qrCode.download({ name: `batch-${i + 1}`, extension: "png" });
  }
}

function wireEvents() {
  qrTypeEl.addEventListener("change", renderFields);
  $("generateBtn").addEventListener("click", () => generateQR());
  $("savePresetBtn").addEventListener("click", savePreset);
  $("exportPngBtn").addEventListener("click", () => qrCode?.download({ name: "qr-code", extension: "png" }));
  $("exportSvgBtn").addEventListener("click", () => qrCode?.download({ name: "qr-code", extension: "svg" }));
  $("batchGenerateBtn").addEventListener("click", batchGenerate);
  $("createKeyBtn").addEventListener("click", createApiKey);
  $("runApiBtn").addEventListener("click", runApiCall);

  presetListEl.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.dataset.load) loadPreset(t.dataset.load);
    if (t.dataset.del) deletePreset(t.dataset.del);
  });

  apiKeysEl.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.dataset.revoke) revokeKey(t.dataset.revoke);
  });
}

function init() {
  populateTypes();
  renderFields();
  renderPresets();
  renderApiKeys();
  wireEvents();
  generateQR("https://example.com");
}

init();
