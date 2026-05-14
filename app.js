const STORAGE_KEY = "luma-data-v1";

const icons = {
  calendar: '<svg viewBox="0 0 24 24"><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
  left: '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  note: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  pencil: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="m16.5 3.5 4 4L7 21l-4 1 1-4 12.5-14.5Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>',
  users: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
};

const demoData = {
  partners: [
    {
      id: crypto.randomUUID(),
      name: "Sofia",
      alias: "S.",
      firstDate: toInputDate(addDays(new Date(), -55)),
      photo: "",
      tags: ["dolce", "ongoing"],
      notes: "Ama messaggi chiari e aftercare tranquillo.",
    },
    {
      id: crypto.randomUUID(),
      name: "Marta",
      alias: "M.",
      firstDate: toInputDate(addDays(new Date(), -30)),
      photo: "",
      tags: ["casual"],
      notes: "Preferisce organizzare con anticipo.",
    },
  ],
  encounters: [],
  notes: "Confini da rispettare, test periodici, cose che mi fanno stare bene.",
  profilePhoto: "",
};

const today = new Date();
demoData.encounters = [
  {
    id: crypto.randomUUID(),
    date: toInputDate(today),
    partnerId: demoData.partners[0].id,
    mood: 5,
    safe: "yes",
    tags: ["romantico", "aftercare"],
    notes: "Bella energia, da ripetere.",
  },
  {
    id: crypto.randomUUID(),
    date: toInputDate(addDays(today, -9)),
    partnerId: demoData.partners[1].id,
    mood: 3,
    safe: "no",
    tags: ["drink"],
    notes: "Divertente, ma ero un po' stanca.",
  },
  {
    id: crypto.randomUUID(),
    date: toInputDate(addDays(today, -21)),
    partnerId: demoData.partners[0].id,
    mood: 4,
    safe: "yes",
    tags: ["weekend"],
    notes: "",
  },
];

let state = loadState();
let activeTab = "dashboard";
let selectedSafe = "yes";
let selectedDate = toInputDate(new Date());
let calendarCursor = new Date();
let partnerPhotoData = "";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function boot() {
  $$("[data-icon]").forEach((node) => {
    node.innerHTML = icons[node.dataset.icon] || "";
  });

  wireEvents();
  render();
}

function wireEvents() {
  $$(".tab").forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tab));
  });

  $$("[data-tab-target]").forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tabTarget));
  });

  $("#quickAddButton").addEventListener("click", () => openEncounterDialog());
  $("#addEncounterButton").addEventListener("click", () => openEncounterDialog());
  $("#addPartnerButton").addEventListener("click", () => openPartnerDialog());
  $("#closeDialogButton").addEventListener("click", () => $("#entryDialog").close());
  $("#entryForm").addEventListener("submit", saveEntry);
  $("#deleteEntryButton").addEventListener("click", deleteCurrentEntry);
  $("#partnerPhoto").addEventListener("change", handlePartnerPhoto);
  $("#encounterPartnerName").addEventListener("input", updateNewPartnerHint);
  $("#searchInput").addEventListener("input", renderLists);
  $("#filterPartner").addEventListener("change", renderLists);
  $("#prevMonth").addEventListener("click", () => shiftMonth(-1));
  $("#nextMonth").addEventListener("click", () => shiftMonth(1));
  $("#addForSelectedDay").addEventListener("click", () => openEncounterDialog("", selectedDate));
  $("#statsScope").addEventListener("change", renderStats);
  $("#statsMonth").addEventListener("change", renderStats);
  $("#statsYear").addEventListener("change", renderStats);
  $("#profilePhoto").addEventListener("change", handleProfilePhoto);
  $("#exportButton").addEventListener("click", exportData);
  $("#importInput").addEventListener("change", importData);
  $("#wipeButton").addEventListener("click", wipeData);

  $$("#protectedGroup button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSafe = button.dataset.safe;
      $$("#protectedGroup button").forEach((item) => item.classList.toggle("active", item === button));
    });
  });

  buildStarRating();
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    saveState(demoData);
    return structuredClone(demoData);
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      partners: normalizePartners(parsed.partners || []),
      encounters: parsed.encounters || [],
      notes: parsed.notes || "",
      profilePhoto: parsed.profilePhoto || "",
    };
  } catch {
    return structuredClone(demoData);
  }
}

function saveState(nextState = state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

function normalizePartners(partners) {
  return partners.map((partner) => ({
    id: partner.id || crypto.randomUUID(),
    name: partner.name || partner.alias || "Senza nome",
    alias: partner.alias || "",
    firstDate: partner.firstDate || "",
    photo: partner.photo || "",
    tags: partner.tags || [],
    notes: partner.notes || "",
  }));
}

function render() {
  renderPartnerOptions();
  renderDashboard();
  renderLists();
  renderPartners();
  renderCalendar();
  renderStats();
  renderProfilePhoto();
  document.body.dataset.tab = activeTab;
}

function renderDashboard() {
  const now = new Date();
  const monthItems = state.encounters.filter((item) => isSameMonth(parseDate(item.date), now));
  const safeItems = state.encounters.filter((item) => item.safe === "yes" || item.safe === "no");
  const safeRate = safeItems.length
    ? Math.round((safeItems.filter((item) => item.safe === "yes").length / safeItems.length) * 100)
    : 0;
  const moodAverage = state.encounters.length
    ? (state.encounters.reduce((sum, item) => sum + Number(item.mood || 0), 0) / state.encounters.length).toFixed(1)
    : "-";
  const sorted = sortedEncounters();

  $("#monthCount").textContent = monthItems.length;
  $("#partnerCount").textContent = state.partners.length;
  $("#safeRate").textContent = `${safeRate}%`;
  $("#moodAverage").textContent = moodAverage;
  $("#lastDate").textContent = sorted[0] ? shortDate(sorted[0].date) : "-";

  const bars = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(now, index - 6);
    return state.encounters.filter((item) => item.date === toInputDate(date)).length;
  });
  const max = Math.max(...bars, 1);
  $("#sparkline").innerHTML = bars
    .map((value) => `<span style="height:${Math.max(12, (value / max) * 100)}%"></span>`)
    .join("");

  $("#recentList").innerHTML = sorted.slice(0, 3).map(eventCard).join("") || emptyState("Nessun incontro registrato.");
  bindEventCards();
}

function renderStats() {
  const now = new Date();
  if (!$("#statsMonth").value) $("#statsMonth").value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (!$("#statsYear").value) $("#statsYear").value = now.getFullYear();

  const scope = $("#statsScope").value;
  const items = encountersForStats(scope);
  const partners = new Set(items.map((item) => item.partnerId));
  const safeItems = items.filter((item) => item.safe === "yes" || item.safe === "no");
  const safeRate = safeItems.length
    ? Math.round((safeItems.filter((item) => item.safe === "yes").length / safeItems.length) * 100)
    : 0;
  const moodAverage = items.length
    ? (items.reduce((sum, item) => sum + Number(item.mood || 0), 0) / items.length).toFixed(1)
    : "-";
  const firstTimes = items.filter((item) => isFirstEncounter(item)).length;

  $("#statsMonth").classList.toggle("hidden", scope !== "month");
  $("#statsYear").classList.toggle("hidden", scope !== "year");
  $("#profileSubtitle").textContent = `${items.length} incontri nel periodo selezionato`;
  $("#statsGrid").innerHTML = [
    statCard("Incontri", items.length),
    statCard("Partner", partners.size),
    statCard("Mood medio", moodAverage),
    statCard("Protetti", `${safeRate}%`),
    statCard("Prime volte", firstTimes),
    statCard("Tag diversi", uniqueTags(items).size),
  ].join("");

  renderTopPartners(items);
  renderMoodChart(items);
}

function encountersForStats(scope) {
  if (scope === "all") return sortedEncounters();

  if (scope === "year") {
    const year = Number($("#statsYear").value || new Date().getFullYear());
    return sortedEncounters().filter((item) => parseDate(item.date).getFullYear() === year);
  }

  const [year, month] = $("#statsMonth").value.split("-").map(Number);
  return sortedEncounters().filter((item) => {
    const date = parseDate(item.date);
    return date.getFullYear() === year && date.getMonth() === month - 1;
  });
}

function statCard(label, value) {
  return `
    <article class="metric-card stat-card">
      <p>${label}</p>
      <strong>${value}</strong>
    </article>
  `;
}

function uniqueTags(items) {
  return new Set(items.flatMap((item) => item.tags || []));
}

function renderTopPartners(items) {
  const counts = items.reduce((map, item) => {
    map.set(item.partnerId, (map.get(item.partnerId) || 0) + 1);
    return map;
  }, new Map());
  const rows = [...counts.entries()]
    .map(([partnerId, count]) => ({ partner: getPartner(partnerId), count }))
    .filter((row) => row.partner)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const max = Math.max(...rows.map((row) => row.count), 1);

  $("#topPartners").innerHTML =
    rows
      .map(
        (row) => `
          <div class="bar-row">
            <span>${escapeHtml(partnerLabel(row.partner))}</span>
            <strong>${row.count}</strong>
            <div><i style="width:${(row.count / max) * 100}%"></i></div>
          </div>
        `,
      )
      .join("") || emptyState("Nessun dato nel periodo.");
}

function renderMoodChart(items) {
  const chronological = [...items].sort((a, b) => a.date.localeCompare(b.date)).slice(-12);
  const max = 5;
  $("#moodChart").innerHTML =
    chronological
      .map((item) => {
        const height = Math.max(8, (Number(item.mood || 0) / max) * 100);
        return `<span style="height:${height}%" title="${shortDate(item.date)}"></span>`;
      })
      .join("") || emptyState("Aggiungi incontri per vedere il trend.");
}

function renderLists() {
  const query = $("#searchInput").value?.trim().toLowerCase() || "";
  const partnerFilter = $("#filterPartner").value;
  const items = sortedEncounters().filter((item) => {
    const partner = getPartner(item.partnerId);
    const haystack = [partner?.name, partner?.alias, item.notes, ...(item.tags || [])].join(" ").toLowerCase();
    return (!partnerFilter || item.partnerId === partnerFilter) && (!query || haystack.includes(query));
  });

  $("#encounterList").innerHTML = items.map(eventCard).join("") || emptyState("Nessun risultato.");
  bindEventCards();
}

function renderPartners() {
  $("#partnerList").innerHTML =
    state.partners
      .map((partner) => {
        const count = state.encounters.filter((item) => item.partnerId === partner.id).length;
        const last = sortedEncounters().find((item) => item.partnerId === partner.id);
        return `
          <article class="partner-card">
            <button class="edit-chip" data-edit-partner="${partner.id}" type="button" aria-label="Modifica partner">
              ${icons.pencil}
            </button>
            <div class="partner-row">
              ${avatarHtml(partner)}
              <div>
                <strong class="private-text">${escapeHtml(partner.name)}</strong>
                ${partner.alias ? `<p class="meta private-text">${escapeHtml(partner.alias)}</p>` : ""}
              </div>
            </div>
            <p class="meta">${count} incontri${last ? `, ultimo ${shortDate(last.date)}` : ""}</p>
            ${partner.firstDate ? `<p class="meta">Prima volta: ${shortDate(partner.firstDate)}</p>` : ""}
            <div class="tag-row">${tagsHtml(partner.tags)}</div>
            ${partner.notes ? `<p class="private-text">${escapeHtml(partner.notes)}</p>` : ""}
          </article>
        `;
      })
      .join("") || emptyState("Aggiungi il primo partner o alias.");

  $$("[data-edit-partner]").forEach((button) => {
    button.addEventListener("click", () => openPartnerDialog(button.dataset.editPartner));
  });
}

function renderCalendar() {
  const monthStart = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
  const gridStart = addDays(monthStart, -((monthStart.getDay() + 6) % 7));
  $("#calendarTitle").textContent = monthStart.toLocaleDateString("it-IT", { month: "long", year: "numeric" });

  const weekdays = ["L", "M", "M", "G", "V", "S", "D"].map((day) => `<div class="weekday">${day}</div>`).join("");
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    const inputDate = toInputDate(date);
    const hasEvent = state.encounters.some((item) => item.date === inputDate);
    const classes = [
      "day",
      date.getMonth() !== calendarCursor.getMonth() ? "muted" : "",
      hasEvent ? "has-event" : "",
      inputDate === selectedDate ? "selected" : "",
    ]
      .filter(Boolean)
      .join(" ");
    return `<button class="${classes}" data-date="${inputDate}" type="button">${date.getDate()}</button>`;
  }).join("");

  $("#calendarGrid").innerHTML = weekdays + days;
  $$("#calendarGrid .day").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDate = button.dataset.date;
      renderCalendar();
    });
  });

  const dayItems = sortedEncounters().filter((item) => item.date === selectedDate);
  $("#selectedDayTitle").textContent = parseDate(selectedDate).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  $("#dayList").innerHTML = dayItems.map(eventCard).join("") || emptyState("Niente in questa data.");
  bindEventCards();
}

function renderPartnerOptions() {
  const selectOptions = state.partners
    .map((partner) => `<option value="${partner.id}">${escapeHtml(partnerLabel(partner))}</option>`)
    .join("");
  const suggestions = state.partners
    .map((partner) => `<option value="${escapeHtml(partnerLabel(partner))}"></option>`)
    .join("");
  $("#filterPartner").innerHTML = '<option value="">Tutti</option>' + selectOptions;
  $("#partnerSuggestions").innerHTML = suggestions;
}

function eventCard(item) {
  const partner = getPartner(item.partnerId);
  const safeText = item.safe === "yes" ? "Protetto" : "Non protetto";
  const safeClass = item.safe === "yes" ? "safe" : item.safe === "no" ? "risk" : "";
  const isFirst = isFirstEncounter(item);
  return `
    <article class="event-card">
      <button class="edit-chip" data-edit-encounter="${item.id}" type="button" aria-label="Modifica incontro">
        ${icons.pencil}
      </button>
      <div class="event-top">
        <strong class="private-text">${escapeHtml(partner ? partnerLabel(partner) : "Senza nome")}</strong>
        <span class="meta">${shortDate(item.date)}</span>
      </div>
      <div class="tag-row">
        ${isFirst ? '<span class="pill first-time">Prima volta</span>' : ""}
        <span class="pill ${safeClass}">${safeText}</span>
        <span class="pill">Mood ${moodStars(Number(item.mood || 0))}</span>
        ${tagsHtml(item.tags)}
      </div>
      ${item.notes ? `<p class="private-text">${escapeHtml(item.notes)}</p>` : ""}
    </article>
  `;
}

function tagsHtml(tags = []) {
  return tags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("");
}

function emptyState(text) {
  return `<p class="empty">${text}</p>`;
}

function avatarHtml(partner) {
  if (partner.photo) {
    return `<img class="avatar" src="${partner.photo}" alt="" />`;
  }

  return `<span class="avatar">${escapeHtml((partner.alias || partner.name || "?").slice(0, 1).toUpperCase())}</span>`;
}

function partnerLabel(partner) {
  return partner.alias ? `${partner.name} (${partner.alias})` : partner.name;
}

function findPartnerByName(value) {
  const needle = value.trim().toLowerCase();
  return state.partners.find((partner) => {
    const labels = [partner.name, partner.alias, partnerLabel(partner)].filter(Boolean).map((item) => item.toLowerCase());
    return labels.includes(needle);
  });
}

function isFirstEncounter(item) {
  const partnerItems = sortedEncounters().filter((encounter) => encounter.partnerId === item.partnerId);
  return partnerItems.length > 0 && partnerItems[partnerItems.length - 1].id === item.id;
}

function moodStars(value) {
  const full = Math.floor(value);
  const half = value % 1 >= 0.5;
  return `${"★".repeat(full)}${half ? "½" : ""}${value === 0 ? "0" : ""}`;
}

function bindEventCards() {
  $$("[data-edit-encounter]").forEach((button) => {
    button.addEventListener("click", () => openEncounterDialog(button.dataset.editEncounter));
  });
}

function buildStarRating() {
  const zero = '<button type="button" data-mood="0" aria-label="Mood 0">0</button>';
  $("#starRating").innerHTML = zero + Array.from({ length: 10 }, (_, index) => {
    const value = (index + 1) / 2;
    const label = value % 1 === 0 ? `${value}` : `${Math.floor(value)}.5`;
    return `<button type="button" data-mood="${value}" aria-label="Mood ${label}">★</button>`;
  }).join("");

  $$("#starRating button").forEach((button) => {
    button.addEventListener("click", () => {
      $("#encounterMood").value = button.dataset.mood;
      updateStarRating();
    });
  });
}

function updateStarRating() {
  const mood = Number($("#encounterMood").value || 0);
  $$("#starRating button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.mood) <= mood);
    button.classList.toggle("half-step", Number(button.dataset.mood) % 1 !== 0);
  });
  $("#moodValue").textContent = `${mood.toFixed(mood % 1 ? 1 : 0)} / 5`;
}

function updateNewPartnerHint() {
  const value = $("#encounterPartnerName").value.trim();
  if (!value) {
    $("#newPartnerHint").textContent = "";
    return;
  }

  $("#newPartnerHint").textContent = findPartnerByName(value)
    ? "Partner già presente"
    : "Nuovo partner: verrà aggiunto salvando l'incontro";
}

function handlePartnerPhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    partnerPhotoData = String(reader.result || "");
    renderPhotoPreview();
  };
  reader.readAsDataURL(file);
}

function renderPhotoPreview() {
  $("#partnerPhotoPreview").innerHTML = partnerPhotoData
    ? `<img src="${partnerPhotoData}" alt="" />`
    : icons.users;
}

function handleProfilePhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    state.profilePhoto = String(reader.result || "");
    saveState();
    renderProfilePhoto();
  };
  reader.readAsDataURL(file);
}

function renderProfilePhoto() {
  $(".profile-avatar").innerHTML = state.profilePhoto
    ? `<img src="${state.profilePhoto}" alt="" /><input id="profilePhoto" type="file" accept="image/*" />`
    : `${icons.heart}<input id="profilePhoto" type="file" accept="image/*" />`;
  $("#profilePhoto").addEventListener("change", handleProfilePhoto);
}

function setTab(tab) {
  activeTab = tab;
  $$(".tab").forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === `view-${tab}`));
  if (tab === "calendar") renderCalendar();
  if (tab === "profile") renderStats();
  document.body.dataset.tab = tab;
}

function openEncounterDialog(id = "", date = "") {
  $("#entryType").value = "encounter";
  $("#dialogTitle").textContent = id ? "Modifica incontro" : "Nuovo incontro";
  $("#entryId").value = id;
  syncDialogMode();

  const item = state.encounters.find((encounter) => encounter.id === id);
  const partner = item ? getPartner(item.partnerId) : null;
  $("#encounterDate").value = item?.date || date || selectedDate || toInputDate(new Date());
  $("#encounterPartnerName").value = partner ? partnerLabel(partner) : "";
  $("#encounterMood").value = item?.mood || 4;
  $("#encounterTags").value = (item?.tags || []).join(", ");
  $("#encounterNotes").value = item?.notes || "";
  selectedSafe = item?.safe === "no" ? "no" : "yes";
  $$("#protectedGroup button").forEach((button) => {
    button.classList.toggle("active", button.dataset.safe === selectedSafe);
  });
  updateStarRating();
  updateNewPartnerHint();
  $("#deleteEntryButton").classList.toggle("hidden", !id);
  $("#entryDialog").showModal();
}

function openPartnerDialog(id = "") {
  $("#entryType").value = "partner";
  $("#dialogTitle").textContent = id ? "Modifica partner" : "Nuovo partner";
  $("#entryId").value = id;
  syncDialogMode();

  const partner = state.partners.find((item) => item.id === id);
  partnerPhotoData = partner?.photo || "";
  $("#partnerName").value = partner?.name || "";
  $("#partnerAlias").value = partner?.alias || "";
  $("#partnerFirstDate").value = partner?.firstDate || "";
  $("#partnerTags").value = (partner?.tags || []).join(", ");
  $("#partnerNotes").value = partner?.notes || "";
  $("#partnerPhoto").value = "";
  renderPhotoPreview();
  $("#deleteEntryButton").classList.toggle("hidden", !id);
  $("#entryDialog").showModal();
}

function syncDialogMode() {
  const isPartner = $("#entryType").value === "partner";
  $("#partnerFields").classList.toggle("hidden", !isPartner);
  $("#encounterFields").classList.toggle("hidden", isPartner);
}

function saveEntry(event) {
  event.preventDefault();
  const type = $("#entryType").value;
  const id = $("#entryId").value;

  if (type === "partner") {
    const name = $("#partnerName").value.trim();
    if (!name) return;
    const payload = {
      id: id || crypto.randomUUID(),
      name,
      alias: $("#partnerAlias").value.trim(),
      firstDate: $("#partnerFirstDate").value,
      photo: partnerPhotoData,
      tags: splitTags($("#partnerTags").value),
      notes: $("#partnerNotes").value.trim(),
    };
    state.partners = id ? state.partners.map((item) => (item.id === id ? payload : item)) : [payload, ...state.partners];
  } else {
    const partnerName = $("#encounterPartnerName").value.trim();
    if (!partnerName) return;
    let partner = findPartnerByName(partnerName);
    if (!partner) {
      partner = {
        id: crypto.randomUUID(),
        name: partnerName,
        alias: "",
        firstDate: $("#encounterDate").value || toInputDate(new Date()),
        photo: "",
        tags: [],
        notes: "",
      };
      state.partners = [partner, ...state.partners];
    }

    const payload = {
      id: id || crypto.randomUUID(),
      date: $("#encounterDate").value || toInputDate(new Date()),
      partnerId: partner.id,
      mood: Number($("#encounterMood").value),
      safe: selectedSafe,
      tags: splitTags($("#encounterTags").value),
      notes: $("#encounterNotes").value.trim(),
    };
    state.encounters = id
      ? state.encounters.map((item) => (item.id === id ? payload : item))
      : [payload, ...state.encounters];
  }

  saveState();
  $("#entryDialog").close();
  render();
}

function deleteCurrentEntry() {
  const type = $("#entryType").value;
  const id = $("#entryId").value;
  if (!id || !confirm("Eliminare questa voce?")) return;

  if (type === "partner") {
    state.partners = state.partners.filter((item) => item.id !== id);
    state.encounters = state.encounters.filter((item) => item.partnerId !== id);
  } else {
    state.encounters = state.encounters.filter((item) => item.id !== id);
  }

  saveState();
  $("#entryDialog").close();
  render();
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `luma-${toInputDate(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      state = {
        partners: normalizePartners(imported.partners || []),
        encounters: imported.encounters || [],
        notes: imported.notes || "",
        profilePhoto: imported.profilePhoto || "",
      };
      saveState();
      render();
    } catch {
      alert("File non valido.");
    }
  };
  reader.readAsText(file);
}

function wipeData() {
  if (!confirm("Cancellare tutti i dati salvati su questo dispositivo?")) return;
  state = { partners: [], encounters: [], notes: "", profilePhoto: "" };
  saveState();
  render();
}

function shiftMonth(delta) {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + delta, 1);
  renderCalendar();
}

function sortedEncounters() {
  return [...state.encounters].sort((a, b) => b.date.localeCompare(a.date));
}

function getPartner(id) {
  return state.partners.find((partner) => partner.id === id);
}

function splitTags(value) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isSameMonth(date, other) {
  return date.getMonth() === other.getMonth() && date.getFullYear() === other.getFullYear();
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toInputDate(date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function shortDate(value) {
  return parseDate(value).toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

boot();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
