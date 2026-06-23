const data = {
  locations: [
    { name: "Hamra", score: 92, result: "pass" },
    { name: "Achrafieh", score: 88, result: "pass" },
    { name: "Verdun", score: 84, result: "pass" },
    { name: "Dbayeh", score: 68, result: "fail" },
    { name: "Jounieh", score: 90, result: "pass" },
    { name: "Tripoli", score: 81, result: "pass" }
  ],
  audits: [
    ["22 Jun", "Dbayeh Branch", "Omar Chatila", "68%", "Fail", "Critical section failed: Food Safety"],
    ["21 Jun", "Hamra Branch", "Rana N.", "94%", "Pass", "No critical failure"],
    ["20 Jun", "Achrafieh Branch", "Omar Chatila", "88%", "Pass", "No critical failure"],
    ["19 Jun", "Verdun Branch", "Rana N.", "72%", "Fail", "Formula threshold not reached"]
  ]
};

function setBars(mode){
  document.querySelectorAll("[data-location-bar]").forEach((el, idx)=>{
    const loc = data.locations[idx];
    let score = loc.score;
    if(mode === "section") score = [96,81,78,55,87,75][idx];
    if(mode === "urgent") score = [1,2,2,5,1,3][idx] * 17;
    const h = Math.max(34, Math.round(score * 2.45));
    const bar = el.querySelector(".bar");
    if(!bar) return;
    bar.style.setProperty("--h", h + "px");
    bar.dataset.value = mode === "urgent" ? Math.round(score/17) + " flags" : score + "%";
    bar.classList.toggle("fail", score < 72 || (mode === "urgent" && score > 55));
    bar.classList.toggle("mid", score >= 72 && score < 84 && mode !== "urgent");
  });
}

const defaultDashboardConfig = {
  layout: "executive",
  client: "SAS Horeca S.A.L",
  location: "All Locations",
  template: "Food Safety Audit",
  dateRange: "01 Jun - 22 Jun 2026",
  threshold: "80",
  urgentThreshold: "3",
  groupBy: "Location",
  refresh: "Manual",
  widgets: {
    locationPerformance: true,
    riskMatrix: true,
    trend: true,
    passFail: true,
    sectionFailure: true,
    heatmap: true,
    urgentFindings: true,
    topFailedItems: true,
    scoringEngine: true,
    triggerLogic: true,
    recentAudits: true
  }
};

function cloneConfig(obj){
  return JSON.parse(JSON.stringify(obj));
}

function getSavedConfig(){
  try{
    return JSON.parse(localStorage.getItem("incheck360AuditDashboardConfig")) || cloneConfig(defaultDashboardConfig);
  }catch(err){
    return cloneConfig(defaultDashboardConfig);
  }
}

function saveConfig(config){
  localStorage.setItem("incheck360AuditDashboardConfig", JSON.stringify(config));
}

function setInputValue(id, value){
  const el = document.getElementById(id);
  if(el) el.value = value;
}

function loadConfigIntoPanel(config){
  const layoutInput = document.querySelector(`input[name="layoutPreset"][value="${config.layout}"]`);
  if(layoutInput) layoutInput.checked = true;

  setInputValue("cfgClient", config.client);
  setInputValue("cfgLocation", config.location);
  setInputValue("cfgTemplate", config.template);
  setInputValue("cfgDateRange", config.dateRange);
  setInputValue("cfgThreshold", config.threshold);
  setInputValue("cfgUrgentThreshold", config.urgentThreshold);
  setInputValue("cfgGroupBy", config.groupBy);
  setInputValue("cfgRefresh", config.refresh);

  document.querySelectorAll("[data-toggle-widget]").forEach(input => {
    input.checked = config.widgets?.[input.dataset.toggleWidget] !== false;
  });
}

function collectConfigFromPanel(){
  const widgets = {};
  document.querySelectorAll("[data-toggle-widget]").forEach(input => {
    widgets[input.dataset.toggleWidget] = input.checked;
  });

  return {
    layout: document.querySelector('input[name="layoutPreset"]:checked')?.value || "executive",
    client: document.getElementById("cfgClient")?.value || defaultDashboardConfig.client,
    location: document.getElementById("cfgLocation")?.value || defaultDashboardConfig.location,
    template: document.getElementById("cfgTemplate")?.value || defaultDashboardConfig.template,
    dateRange: document.getElementById("cfgDateRange")?.value || defaultDashboardConfig.dateRange,
    threshold: document.getElementById("cfgThreshold")?.value || defaultDashboardConfig.threshold,
    urgentThreshold: document.getElementById("cfgUrgentThreshold")?.value || defaultDashboardConfig.urgentThreshold,
    groupBy: document.getElementById("cfgGroupBy")?.value || defaultDashboardConfig.groupBy,
    refresh: document.getElementById("cfgRefresh")?.value || defaultDashboardConfig.refresh,
    widgets
  };
}

function applyConfig(config){
  document.querySelectorAll("[data-widget]").forEach(widget => {
    const key = widget.dataset.widget;
    widget.classList.toggle("widget-hidden", config.widgets?.[key] === false);
  });

  const main = document.getElementById("dashboardMain");
  if(main){
    main.classList.toggle("compact-mode", config.layout === "compact");
    main.classList.toggle("operations-mode", config.layout === "operations");
  }

  const filters = document.querySelectorAll(".filters .filter b");
  if(filters[0]) filters[0].textContent = config.dateRange;
  if(filters[1]) filters[1].textContent = config.client;
  if(filters[3]) filters[3].textContent = config.location;
  if(filters[4]) filters[4].textContent = config.template;

  const passRateCaption = Array.from(document.querySelectorAll(".kpi-caption")).find(el => el.textContent.includes("override"));
  if(passRateCaption) passRateCaption.textContent = `After override rules • Pass threshold ${config.threshold}%`;
}

function showToast(message){
  let toast = document.querySelector(".config-toast");
  if(!toast){
    toast = document.createElement("div");
    toast.className = "config-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2300);
}

function openConfigPanel(){
  const overlay = document.getElementById("configOverlay");
  loadConfigIntoPanel(getSavedConfig());
  overlay?.classList.add("open");
  overlay?.setAttribute("aria-hidden", "false");
}

function closeConfigPanel(){
  const overlay = document.getElementById("configOverlay");
  overlay?.classList.remove("open");
  overlay?.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event)=>{
  const btn = event.target.closest("[data-segment]");
  if(!btn) return;
  const group = btn.parentElement;
  group.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  setBars(btn.dataset.segment);
});

document.addEventListener("DOMContentLoaded", ()=>{
  setBars("score");

  const savedConfig = getSavedConfig();
  loadConfigIntoPanel(savedConfig);
  applyConfig(savedConfig);

  document.getElementById("openConfigBtn")?.addEventListener("click", openConfigPanel);
  document.getElementById("closeConfigBtn")?.addEventListener("click", closeConfigPanel);

  document.getElementById("configOverlay")?.addEventListener("click", event => {
    if(event.target.id === "configOverlay") closeConfigPanel();
  });

  document.addEventListener("keydown", event => {
    if(event.key === "Escape") closeConfigPanel();
  });

  document.getElementById("saveConfigBtn")?.addEventListener("click", () => {
    const config = collectConfigFromPanel();
    saveConfig(config);
    applyConfig(config);
    closeConfigPanel();
    showToast("Dashboard configuration saved");
  });

  document.getElementById("resetConfigBtn")?.addEventListener("click", () => {
    const fresh = cloneConfig(defaultDashboardConfig);
    saveConfig(fresh);
    loadConfigIntoPanel(fresh);
    applyConfig(fresh);
    showToast("Dashboard reset to default");
  });

  document.querySelectorAll("[data-toggle-widget], input[name='layoutPreset'], #cfgClient, #cfgLocation, #cfgTemplate, #cfgDateRange, #cfgThreshold").forEach(el => {
    el.addEventListener("change", () => applyConfig(collectConfigFromPanel()));
  });
});
