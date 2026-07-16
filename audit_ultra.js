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

const baseWidgetRegistry = {
  locationPerformance: { title: "Location Performance", size: "full" },
  trend: { title: "Pass / Fail Trend", size: "medium" },
  passFail: { title: "Pass vs Fail", size: "medium" },
  sectionFailure: { title: "Section Failure Rate", size: "medium" },
  urgentFindings: { title: "Critical Findings", size: "medium" },
  topFailedItems: { title: "Top Failed Items", size: "full" },
  recentAudits: { title: "Recent Audits", size: "full" }
};

const customWidgetTemplates = {
  auditorAverage: { title: "Average Score by Auditor", size: "medium" },
  correctiveActions: { title: "Corrective Action Tracker", size: "medium" },
  scoreDistribution: { title: "Score Distribution", size: "medium" },
  offlineSync: { title: "Offline Sync Status", size: "small" }
};

const retiredWidgetIds = new Set(["riskMatrix", "heatmap", "scoringEngine", "triggerLogic"]);

const defaultDashboardConfig = {
  theme: "dark",
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
    trend: true,
    passFail: true,
    sectionFailure: true,
    urgentFindings: true,
    topFailedItems: true,
    recentAudits: true
  },
  sizes: {
    locationPerformance: "full",
    trend: "medium",
    passFail: "medium",
    sectionFailure: "medium",
    urgentFindings: "medium",
    topFailedItems: "full",
    recentAudits: "full"
  },
  order: [
    "locationPerformance",
    "trend",
    "passFail",
    "sectionFailure",
    "urgentFindings",
    "topFailedItems",
    "recentAudits"
  ],
  customWidgets: []
};

function cloneConfig(obj){
  return JSON.parse(JSON.stringify(obj));
}

function mergeConfig(saved){
  const merged = cloneConfig(defaultDashboardConfig);
  if(saved && typeof saved === "object") Object.assign(merged, saved);
  merged.widgets = Object.assign({}, defaultDashboardConfig.widgets, saved?.widgets || {});
  merged.sizes = Object.assign({}, defaultDashboardConfig.sizes, saved?.sizes || {});
  merged.order = Array.isArray(saved?.order) && saved.order.length ? saved.order.slice() : cloneConfig(defaultDashboardConfig.order);
  merged.customWidgets = Array.isArray(saved?.customWidgets)
    ? saved.customWidgets.filter(widget => widget?.type !== "completionCalendar")
    : [];

  retiredWidgetIds.forEach(id => {
    delete merged.widgets[id];
    delete merged.sizes[id];
  });
  merged.order = merged.order.filter(id => !retiredWidgetIds.has(id));
  const validIds = new Set([...Object.keys(baseWidgetRegistry), ...merged.customWidgets.map(widget => widget.id)]);
  merged.order = merged.order.filter(id => validIds.has(id));
  Object.keys(merged.widgets).forEach(id => { if(!validIds.has(id)) delete merged.widgets[id]; });
  Object.keys(merged.sizes).forEach(id => { if(!validIds.has(id)) delete merged.sizes[id]; });
  return merged;
}

function getSavedConfig(){
  try{
    return mergeConfig(JSON.parse(localStorage.getItem("incheck360AuditDashboardConfig")));
  }catch(err){
    return cloneConfig(defaultDashboardConfig);
  }
}

function saveConfig(config){
  localStorage.setItem("incheck360AuditDashboardConfig", JSON.stringify(mergeConfig(config)));
}

function installAdvancedStyles(){
  if(document.getElementById("auditAdvancedStyles")) return;
  const style = document.createElement("style");
  style.id = "auditAdvancedStyles";
  style.textContent = `
    html[data-theme="light"]{
      --bg-0:#f5f7fb;--bg-1:#eef4fb;--bg-2:#e8eef7;--panel:rgba(255,255,255,.9);--panel-2:rgba(255,255,255,.96);--card:rgba(255,255,255,.86);--card-2:rgba(255,255,255,.96);--stroke:rgba(15,23,42,.13);--stroke-strong:rgba(15,23,42,.22);--text:#111827;--muted:#667085;--muted-2:#7b8798;--shadow:0 24px 70px rgba(15,23,42,.13);--shadow-soft:0 14px 34px rgba(15,23,42,.10);
    }
    html[data-theme="light"] body{background:radial-gradient(circle at 5% 0%, rgba(56,189,248,.22), transparent 28%),radial-gradient(circle at 95% 3%, rgba(167,139,250,.16), transparent 26%),linear-gradient(135deg,#f8fbff,#eef4fb 55%,#f7f4ff);}
    html[data-theme="light"] .sidebar,html[data-theme="light"] .card,html[data-theme="light"] .filter,html[data-theme="light"] .searchbox,html[data-theme="light"] .hero{background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(255,255,255,.72));color:var(--text)}
    html[data-theme="light"] .card-subtitle,html[data-theme="light"] .kpi-caption,html[data-theme="light"] .filter label,html[data-theme="light"] .searchbox input::placeholder,html[data-theme="light"] .side-module p,html[data-theme="light"] .hero p{color:#667085}
    html[data-theme="light"] .searchbox input,html[data-theme="light"] .config-panel,html[data-theme="light"] select,html[data-theme="light"] input{color:var(--text)}
    html[data-theme="light"] .btn.secondary{color:#172033;background:rgba(255,255,255,.78);border-color:rgba(15,23,42,.14)}
    html[data-theme="light"] .health-panel,html[data-theme="light"] .health-ring-inner,html[data-theme="light"] .donut-inner{background:rgba(255,255,255,.74);color:#111827}
    html[data-theme="light"] .health-item,html[data-theme="light"] .legend-row,html[data-theme="light"] .table td{color:#172033}
    html[data-theme="light"] .config-panel{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(244,248,255,.98));}
    html[data-theme="light"] .config-section,html[data-theme="light"] .preset-card,html[data-theme="light"] .widget-builder-row,html[data-theme="light"] .role-list label{background:rgba(15,23,42,.035);color:#172033}
    html[data-theme="light"] .config-grid label,html[data-theme="light"] .widget-builder-row label{color:#172033}
    html[data-theme="light"] .config-grid select,html[data-theme="light"] .config-grid input{background:#fff;color:#172033}
    html[data-theme="light"] .config-footer{background:rgba(255,255,255,.92)}
    .dashboard-canvas{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:15px;margin-top:15px;align-items:stretch}
    .dashboard-widget{grid-column:span 6;min-width:0;cursor:grab;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}
    .dashboard-widget:active{cursor:grabbing}.dashboard-widget.dragging{opacity:.45;transform:scale(.985)}.dashboard-widget.drag-over{border-color:rgba(103,232,249,.75)!important;box-shadow:0 0 0 2px rgba(103,232,249,.16),var(--shadow-soft)}
    .widget-size-small{grid-column:span 4}.widget-size-medium{grid-column:span 6}.widget-size-large{grid-column:span 8}.widget-size-full{grid-column:1 / -1}
    .widget-toolbar{display:flex;gap:8px;align-items:center;justify-content:flex-end;margin:-6px -4px 10px}.widget-remove{border:1px solid var(--stroke);background:rgba(255,255,255,.08);color:var(--text);border-radius:12px;padding:6px 9px;font-weight:900;cursor:pointer}
    .config-overlay{position:fixed;inset:0;z-index:9999;display:none;justify-content:flex-end;background:rgba(2,6,23,.64);backdrop-filter:blur(10px)}.config-overlay.open{display:flex}.config-panel{width:min(820px,100%);height:100vh;overflow:auto;background:radial-gradient(circle at 10% 0%,rgba(103,232,249,.18),transparent 32%),linear-gradient(180deg,rgba(15,28,51,.98),rgba(7,22,43,.98));border-left:1px solid var(--stroke-strong);box-shadow:-30px 0 90px rgba(0,0,0,.45);padding:22px;animation:slidePanel .22s ease-out}@keyframes slidePanel{from{transform:translateX(40px);opacity:.4}to{transform:translateX(0);opacity:1}}
    .config-header{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;padding-bottom:18px;border-bottom:1px solid var(--stroke)}.config-header h2{margin:10px 0 6px;font-size:28px;letter-spacing:-.045em}.config-header p{color:var(--muted);margin:0;line-height:1.5;max-width:620px}.icon-btn{width:42px;height:42px;border-radius:15px;border:1px solid var(--stroke);background:rgba(255,255,255,.08);color:var(--text);font-size:26px;line-height:1;cursor:pointer}.config-body{display:grid;gap:15px;padding:18px 0 90px}.config-section{border:1px solid var(--stroke);border-radius:22px;background:rgba(255,255,255,.06);padding:16px}.config-section h3{margin:0 0 13px;font-size:16px;letter-spacing:-.02em}.preset-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.preset-card{display:block;border:1px solid var(--stroke);border-radius:17px;padding:13px;background:rgba(255,255,255,.045);cursor:pointer}.preset-card span{font-weight:1000}.preset-card small{display:block;margin-top:7px;color:var(--muted);line-height:1.35}.preset-card:has(input:checked){border-color:rgba(103,232,249,.6);background:rgba(103,232,249,.12)}.config-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.config-grid label{color:#d9e7f8;font-size:12px;font-weight:900}.config-grid select,.config-grid input{display:block;margin-top:7px;width:100%;border:1px solid var(--stroke);border-radius:14px;background:rgba(2,6,23,.35);color:white;padding:11px 12px;outline:none}.config-grid option{background:#0b172c;color:white}.widget-builder-list{display:grid;gap:9px}.widget-builder-row{display:grid;grid-template-columns:32px 1fr 128px 88px;gap:10px;align-items:center;padding:10px;border:1px solid var(--stroke);border-radius:15px;background:rgba(255,255,255,.045)}.widget-builder-row select{width:100%;border:1px solid var(--stroke);border-radius:12px;background:rgba(2,6,23,.35);color:var(--text);padding:8px}.role-list{display:grid;grid-template-columns:repeat(5,1fr);gap:9px}.role-list label{display:flex;align-items:center;gap:9px;padding:10px 11px;border:1px solid var(--stroke);border-radius:14px;background:rgba(255,255,255,.045);font-size:13px;font-weight:800}.add-widget-row{display:grid;grid-template-columns:1fr auto;gap:10px;margin-top:12px}.config-footer{position:sticky;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:-70px -22px -22px;padding:15px 22px;background:rgba(7,22,43,.92);border-top:1px solid var(--stroke);backdrop-filter:blur(16px)}.config-footer span{color:var(--muted);font-size:12px}.widget-hidden{display:none!important}.main.compact-mode .card-pad{padding:14px}.main.compact-mode .hero{padding:20px}.main.compact-mode .kpi{padding:14px}.config-toast{position:fixed;right:24px;bottom:24px;z-index:10000;border:1px solid rgba(52,211,153,.32);background:rgba(6,78,59,.92);color:#dcfce7;padding:13px 16px;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.32);display:none}.config-toast.show{display:block}
    .drilldown-overlay{position:fixed;inset:0;background:rgba(2,6,23,.62);backdrop-filter:blur(10px);z-index:10001;display:none;align-items:center;justify-content:center;padding:18px}.drilldown-overlay.open{display:flex}.drilldown-panel{width:min(760px,100%);max-height:86vh;overflow:auto;border:1px solid var(--stroke);border-radius:24px;background:var(--panel-2);box-shadow:var(--shadow);padding:20px}.drilldown-head{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid var(--stroke);padding-bottom:12px;margin-bottom:14px}.drilldown-head h3{margin:0;font-size:22px}.detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.detail-card{border:1px solid var(--stroke);border-radius:16px;background:rgba(255,255,255,.06);padding:12px}.detail-card span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}.mini-bars{display:flex;align-items:end;gap:8px;height:145px}.mini-bars i{flex:1;border-radius:10px 10px 4px 4px;background:linear-gradient(180deg,var(--cyan),var(--blue))}.calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}.calendar-grid span{min-height:30px;border:1px solid var(--stroke);border-radius:10px;display:grid;place-items:center;font-size:11px}.calendar-grid .done{background:rgba(52,211,153,.15)}.calendar-grid .fail{background:rgba(251,113,133,.16)}
    @media(max-width:1100px){.dashboard-canvas{grid-template-columns:1fr}.widget-size-small,.widget-size-medium,.widget-size-large,.widget-size-full{grid-column:1 / -1}.preset-grid,.config-grid,.role-list,.detail-grid{grid-template-columns:1fr}.widget-builder-row{grid-template-columns:28px 1fr}.widget-builder-row select,.widget-builder-row button{grid-column:2}.config-footer{align-items:stretch;flex-direction:column}.add-widget-row{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

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

function ensureDashboardCanvas(){
  const main = document.getElementById("dashboardMain");
  if(!main) return null;

  /* Keep the four KPI cards and Pass vs Fail in their original top-summary layout. */
  const topSummary = main.querySelector(".top-summary-grid");
  let canvas = document.getElementById("dashboardCanvas");
  if(!canvas){
    canvas = document.createElement("section");
    canvas.id = "dashboardCanvas";
    canvas.className = "dashboard-canvas";
    if(topSummary) topSummary.insertAdjacentElement("afterend", canvas);
    else main.appendChild(canvas);
  } else if(topSummary && canvas.previousElementSibling !== topSummary){
    topSummary.insertAdjacentElement("afterend", canvas);
  }

  const widgets = Array.from(main.querySelectorAll("[data-widget]")).filter(el =>
    !el.closest("#configOverlay") &&
    !el.closest("#dashboardCanvas") &&
    !el.closest(".top-summary-grid")
  );
  widgets.forEach(widget => canvas.appendChild(widget));

  Array.from(main.querySelectorAll(".grid-main,.grid-three")).forEach(section => {
    if(!section.querySelector("[data-widget]")) section.style.display = "none";
  });
  return canvas;
}

function getDashboardWidgets(){
  return Array.from(document.querySelectorAll("#dashboardCanvas [data-widget]"));
}

function makeWidgetDraggable(widget){
  if(widget.dataset.dragReady === "true") return;
  widget.dataset.dragReady = "true";
  widget.classList.add("dashboard-widget");
  widget.setAttribute("draggable", "true");
  widget.addEventListener("dragstart", event => {
    widget.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", widget.dataset.widget);
  });
  widget.addEventListener("dragend", () => {
    widget.classList.remove("dragging");
    getDashboardWidgets().forEach(w => w.classList.remove("drag-over"));
    saveCurrentWidgetOrder();
  });
  widget.addEventListener("dragover", event => {
    event.preventDefault();
    widget.classList.add("drag-over");
  });
  widget.addEventListener("dragleave", () => widget.classList.remove("drag-over"));
  widget.addEventListener("drop", event => {
    event.preventDefault();
    const dragged = document.querySelector("#dashboardCanvas .dragging");
    if(dragged && dragged !== widget){
      widget.parentNode.insertBefore(dragged, widget);
      saveCurrentWidgetOrder();
      showToast("Widget layout order saved");
    }
    widget.classList.remove("drag-over");
  });
}

function saveCurrentWidgetOrder(){
  const config = getSavedConfig();
  config.order = getDashboardWidgets().map(widget => widget.dataset.widget);
  saveConfig(config);
}

function ensureTopButtons(){
  const actions = document.querySelector(".top-actions");
  if(!actions) return;
  if(!document.getElementById("themeToggleBtn")){
    const themeButton = document.createElement("button");
    themeButton.className = "btn secondary";
    themeButton.type = "button";
    themeButton.id = "themeToggleBtn";
    themeButton.textContent = "🌙 Dark";
    actions.insertBefore(themeButton, actions.lastElementChild);
  }
  if(!document.getElementById("fullscreenBtn")){
    const fullButton = document.createElement("button");
    fullButton.className = "btn secondary";
    fullButton.type = "button";
    fullButton.id = "fullscreenBtn";
    fullButton.textContent = "Fullscreen";
    actions.insertBefore(fullButton, actions.lastElementChild);
  }
}

function createConfigOverlay(){
  let overlay = document.getElementById("configOverlay");
  if(!overlay){
    overlay = document.createElement("div");
    overlay.id = "configOverlay";
    overlay.className = "config-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
  }
  return overlay;
}

function getAllWidgetDefinitions(config){
  const defs = Object.assign({}, baseWidgetRegistry);
  (config.customWidgets || []).forEach(widget => {
    defs[widget.id] = { title: widget.title, size: widget.size || "medium", custom: true, type: widget.type };
  });
  return defs;
}

function widgetRowHtml(id, def, config){
  const checked = config.widgets?.[id] !== false ? "checked" : "";
  const size = config.sizes?.[id] || def.size || "medium";
  const remove = def.custom ? `<button class="widget-remove" type="button" data-remove-custom="${id}">Remove</button>` : `<span class="chip info">Core</span>`;
  return `<div class="widget-builder-row">
    <input type="checkbox" data-toggle-widget="${id}" ${checked}>
    <label>${def.title}</label>
    <select data-size-widget="${id}">
      <option value="small" ${size === "small" ? "selected" : ""}>Small</option>
      <option value="medium" ${size === "medium" ? "selected" : ""}>Medium</option>
      <option value="large" ${size === "large" ? "selected" : ""}>Large</option>
      <option value="full" ${size === "full" ? "selected" : ""}>Full width</option>
    </select>
    ${remove}
  </div>`;
}

function buildConfigPanel(config){
  const overlay = createConfigOverlay();
  const defs = getAllWidgetDefinitions(config);
  const widgetRows = Object.keys(defs).map(id => widgetRowHtml(id, defs[id], config)).join("");
  const templateOptions = Object.keys(customWidgetTemplates).map(type => `<option value="${type}">${customWidgetTemplates[type].title}</option>`).join("");
  overlay.innerHTML = `<aside class="config-panel" role="dialog" aria-modal="true" aria-labelledby="configTitle">
    <div class="config-header"><div><span class="eyebrow">Dashboard Builder Pro</span><h2 id="configTitle">Configure Audit Dashboard</h2><p>Drag widgets directly on the dashboard, resize them here, add new widgets, switch light/dark mode, and save the layout locally.</p></div><button class="icon-btn" id="closeConfigBtn" type="button" aria-label="Close">×</button></div>
    <div class="config-body">
      <section class="config-section"><h3>Appearance</h3><div class="preset-grid"><label class="preset-card"><input type="radio" name="themeMode" value="dark" ${config.theme !== "light" ? "checked" : ""}><span>Dark Mode</span><small>Command center visual style</small></label><label class="preset-card"><input type="radio" name="themeMode" value="light" ${config.theme === "light" ? "checked" : ""}><span>Light Mode</span><small>Clean daytime dashboard</small></label><label class="preset-card"><input type="radio" name="layoutPreset" value="compact" ${config.layout === "compact" ? "checked" : ""}><span>Compact Density</span><small>More widgets on screen</small></label></div></section>
      <section class="config-section"><h3>Layout Preset</h3><div class="preset-grid"><label class="preset-card"><input type="radio" name="layoutPreset" value="executive" ${config.layout === "executive" ? "checked" : ""}><span>Executive</span><small>KPI + risk overview</small></label><label class="preset-card"><input type="radio" name="layoutPreset" value="operations" ${config.layout === "operations" ? "checked" : ""}><span>Operations</span><small>Critical queue + audit list</small></label><label class="preset-card"><input type="radio" name="layoutPreset" value="compact" ${config.layout === "compact" ? "checked" : ""}><span>Compact</span><small>Dense layout</small></label></div></section>
      <section class="config-section"><h3>Default Filters</h3><div class="config-grid"><label>Client<select id="cfgClient"><option ${config.client === "SAS Horeca S.A.L" ? "selected" : ""}>SAS Horeca S.A.L</option><option ${config.client === "Kcal DMCC" ? "selected" : ""}>Kcal DMCC</option><option ${config.client === "Lebanese Roaster" ? "selected" : ""}>Lebanese Roaster</option><option ${config.client === "All Clients" ? "selected" : ""}>All Clients</option></select></label><label>Location<select id="cfgLocation"><option ${config.location === "All Locations" ? "selected" : ""}>All Locations</option><option ${config.location === "Dbayeh Branch" ? "selected" : ""}>Dbayeh Branch</option><option ${config.location === "Hamra Branch" ? "selected" : ""}>Hamra Branch</option><option ${config.location === "Achrafieh Branch" ? "selected" : ""}>Achrafieh Branch</option></select></label><label>Checklist Template<select id="cfgTemplate"><option ${config.template === "Food Safety Audit" ? "selected" : ""}>Food Safety Audit</option><option ${config.template === "Cleaning Audit" ? "selected" : ""}>Cleaning Audit</option><option ${config.template === "Operations Audit" ? "selected" : ""}>Operations Audit</option><option ${config.template === "All Audit Templates" ? "selected" : ""}>All Audit Templates</option></select></label><label>Date Range<select id="cfgDateRange"><option ${config.dateRange === "01 Jun - 22 Jun 2026" ? "selected" : ""}>01 Jun - 22 Jun 2026</option><option ${config.dateRange === "This Week" ? "selected" : ""}>This Week</option><option ${config.dateRange === "This Month" ? "selected" : ""}>This Month</option><option ${config.dateRange === "Last 30 Days" ? "selected" : ""}>Last 30 Days</option></select></label></div></section>
      <section class="config-section" id="widgetBuilderSection"><h3>Widget Builder</h3><div class="widget-builder-list">${widgetRows}</div><div class="add-widget-row"><select id="addWidgetType">${templateOptions}</select><button class="btn" type="button" id="addWidgetBtn">Add Widget</button></div></section>
      <section class="config-section"><h3>Role Visibility</h3><div class="role-list"><label><input type="checkbox" checked> Admin</label><label><input type="checkbox" checked> GM</label><label><input type="checkbox" checked> HOO</label><label><input type="checkbox"> Location Manager</label><label><input type="checkbox"> Auditor</label></div></section>
      <section class="config-section"><h3>Widget Parameters</h3><div class="config-grid"><label>Score threshold<input id="cfgThreshold" type="number" min="0" max="100" value="${config.threshold}"></label><label>Critical alert threshold<input id="cfgUrgentThreshold" type="number" min="0" max="50" value="${config.urgentThreshold}"></label><label>Default group by<select id="cfgGroupBy"><option ${config.groupBy === "Location" ? "selected" : ""}>Location</option><option ${config.groupBy === "Client" ? "selected" : ""}>Client</option><option ${config.groupBy === "Group" ? "selected" : ""}>Group</option><option ${config.groupBy === "Auditor" ? "selected" : ""}>Auditor</option><option ${config.groupBy === "Checklist Template" ? "selected" : ""}>Checklist Template</option></select></label><label>Refresh mode<select id="cfgRefresh"><option ${config.refresh === "Manual" ? "selected" : ""}>Manual</option><option ${config.refresh === "Every 5 minutes" ? "selected" : ""}>Every 5 minutes</option><option ${config.refresh === "Every 15 minutes" ? "selected" : ""}>Every 15 minutes</option><option ${config.refresh === "Hourly" ? "selected" : ""}>Hourly</option></select></label></div></section>
    </div>
    <div class="config-footer"><span>Tip: drag widgets directly on the dashboard to reorder them.</span><div><button class="btn secondary" id="resetConfigBtn" type="button">Reset</button> <button class="btn" id="saveConfigBtn" type="button">Save Configuration</button></div></div>
  </aside>`;
  bindConfigPanelEvents();
}

function collectConfigFromPanel(){
  const config = getSavedConfig();
  const widgets = {};
  const sizes = Object.assign({}, config.sizes);
  document.querySelectorAll("[data-toggle-widget]").forEach(input => widgets[input.dataset.toggleWidget] = input.checked);
  document.querySelectorAll("[data-size-widget]").forEach(select => sizes[select.dataset.sizeWidget] = select.value);
  config.theme = document.querySelector('input[name="themeMode"]:checked')?.value || config.theme;
  config.layout = document.querySelector('input[name="layoutPreset"]:checked')?.value || config.layout;
  config.client = document.getElementById("cfgClient")?.value || config.client;
  config.location = document.getElementById("cfgLocation")?.value || config.location;
  config.template = document.getElementById("cfgTemplate")?.value || config.template;
  config.dateRange = document.getElementById("cfgDateRange")?.value || config.dateRange;
  config.threshold = document.getElementById("cfgThreshold")?.value || config.threshold;
  config.urgentThreshold = document.getElementById("cfgUrgentThreshold")?.value || config.urgentThreshold;
  config.groupBy = document.getElementById("cfgGroupBy")?.value || config.groupBy;
  config.refresh = document.getElementById("cfgRefresh")?.value || config.refresh;
  config.widgets = Object.assign({}, config.widgets, widgets);
  config.sizes = sizes;
  return mergeConfig(config);
}

function bindConfigPanelEvents(){
  document.getElementById("closeConfigBtn")?.addEventListener("click", closeConfigPanel);
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
    buildConfigPanel(fresh);
    applyConfig(fresh);
    showToast("Dashboard reset to default");
  });
  document.getElementById("addWidgetBtn")?.addEventListener("click", () => {
    const config = collectConfigFromPanel();
    const type = document.getElementById("addWidgetType")?.value || "auditorAverage";
    const template = customWidgetTemplates[type];
    const id = `custom_${type}_${Date.now()}`;
    config.customWidgets.push({ id, type, title: template.title, size: template.size });
    config.widgets[id] = true;
    config.sizes[id] = template.size;
    config.order.push(id);
    saveConfig(config);
    renderCustomWidgets(config);
    applyConfig(config);
    buildConfigPanel(config);
    setTimeout(() => document.getElementById("widgetBuilderSection")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    showToast("Widget added");
  });
  document.querySelectorAll("[data-toggle-widget], [data-size-widget], input[name='layoutPreset'], input[name='themeMode'], #cfgClient, #cfgLocation, #cfgTemplate, #cfgDateRange, #cfgThreshold, #cfgUrgentThreshold, #cfgGroupBy, #cfgRefresh").forEach(el => {
    el.addEventListener("change", () => applyConfig(collectConfigFromPanel()));
  });
}

function customWidgetHtml(widget){
  if(widget.type === "auditorAverage"){
    return `<div class="widget-toolbar"><button class="widget-remove" data-remove-custom="${widget.id}" type="button">Remove</button></div><div class="card-title-row"><div><div class="card-title">Average Score by Auditor</div><div class="card-subtitle">Static performance by team member.</div></div><span class="chip info">New</span></div><table class="table"><tr><th>Auditor</th><th>Audits</th><th>Avg Score</th></tr><tr><td>Omar Chatila</td><td>9</td><td>84%</td></tr><tr><td>Rana N.</td><td>7</td><td>91%</td></tr><tr><td>Khaled Y.</td><td>7</td><td>86%</td></tr></table>`;
  }
  if(widget.type === "correctiveActions"){
    return `<div class="widget-toolbar"><button class="widget-remove" data-remove-custom="${widget.id}" type="button">Remove</button></div><div class="card-title-row"><div><div class="card-title">Corrective Action Tracker</div><div class="card-subtitle">Open actions from critical findings.</div></div><span class="chip bad">3 Open</span></div><div class="progress-list"><div class="progress-row"><span>Temperature</span><div class="track"><span class="danger" style="width:25%"></span></div><b>Open</b></div><div class="progress-row"><span>Expired Items</span><div class="track"><span class="warn" style="width:60%"></span></div><b>In progress</b></div><div class="progress-row"><span>Pest Proof</span><div class="track"><span style="width:100%"></span></div><b>Done</b></div></div>`;
  }
  if(widget.type === "scoreDistribution"){
    return `<div class="widget-toolbar"><button class="widget-remove" data-remove-custom="${widget.id}" type="button">Remove</button></div><div class="card-title-row"><div><div class="card-title">Score Distribution</div><div class="card-subtitle">Audit count by score band.</div></div></div><div class="mini-bars"><i style="height:38%;background:linear-gradient(180deg,var(--red),var(--rose))"></i><i style="height:52%;background:linear-gradient(180deg,var(--amber),var(--orange))"></i><i style="height:72%"></i><i style="height:95%"></i><i style="height:68%"></i></div>`;
  }
  return `<div class="widget-toolbar"><button class="widget-remove" data-remove-custom="${widget.id}" type="button">Remove</button></div><div class="card-title-row"><div><div class="card-title">Offline Sync Status</div><div class="card-subtitle">Mobile uploads waiting for sync.</div></div><span class="chip warn">4 queued</span></div><table class="table"><tr><td>Dbayeh</td><td><span class="status warn">Queued</span></td></tr><tr><td>Hamra</td><td><span class="status pass">Synced</span></td></tr></table>`;
}

function renderCustomWidgets(config){
  const canvas = ensureDashboardCanvas();
  if(!canvas) return;
  canvas.querySelectorAll("[data-custom-widget='true']").forEach(el => el.remove());
  (config.customWidgets || []).forEach(widget => {
    const card = document.createElement("div");
    card.className = "card card-pad dashboard-widget";
    card.dataset.widget = widget.id;
    card.dataset.customWidget = "true";
    card.innerHTML = customWidgetHtml(widget);
    canvas.appendChild(card);
  });
}

function applyConfig(config){
  config = mergeConfig(config);
  document.documentElement.setAttribute("data-theme", config.theme || "dark");
  renderCustomWidgets(config);
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
  const passRateCard = Array.from(document.querySelectorAll(".kpi")).find(card => card.querySelector(".kpi-label")?.textContent.trim() === "Pass Rate");
  const passRateCaption = passRateCard?.querySelector(".kpi-caption");
  if(passRateCaption) passRateCaption.textContent = `Pass threshold ${config.threshold}%`;

  const orderMap = new Map((config.order || []).map((id, index) => [id, index]));
  getDashboardWidgets().forEach(widget => {
    const id = widget.dataset.widget;
    widget.classList.add("dashboard-widget");
    widget.classList.toggle("widget-hidden", config.widgets?.[id] === false);
    widget.classList.remove("widget-size-small", "widget-size-medium", "widget-size-large", "widget-size-full");
    widget.classList.add(`widget-size-${config.sizes?.[id] || "medium"}`);
    widget.style.order = orderMap.has(id) ? orderMap.get(id) : 999;
    makeWidgetDraggable(widget);
  });
  updateThemeButton(config.theme);
}

function updateThemeButton(theme){
  const button = document.getElementById("themeToggleBtn");
  if(button) button.textContent = theme === "light" ? "☀️ Light" : "🌙 Dark";
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
  const config = getSavedConfig();
  buildConfigPanel(config);
  const overlay = createConfigOverlay();
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
}

function openWidgetBuilder(){
  openConfigPanel();
  setTimeout(() => document.getElementById("widgetBuilderSection")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
}

function closeConfigPanel(){
  const overlay = document.getElementById("configOverlay");
  overlay?.classList.remove("open");
  overlay?.setAttribute("aria-hidden", "true");
}

function ensureDrilldownModal(){
  let modal = document.getElementById("drilldownModal");
  if(modal) return modal;
  modal = document.createElement("div");
  modal.id = "drilldownModal";
  modal.className = "drilldown-overlay";
  modal.innerHTML = `<div class="drilldown-panel"><div class="drilldown-head"><div><span class="eyebrow">Drill-down</span><h3 id="drilldownTitle">Details</h3></div><button class="icon-btn" id="closeDrilldownBtn" type="button">×</button></div><div id="drilldownBody"></div></div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click", event => { if(event.target.id === "drilldownModal") closeDrilldown(); });
  modal.querySelector("#closeDrilldownBtn").addEventListener("click", closeDrilldown);
  return modal;
}

function openDrilldown(title, html){
  const modal = ensureDrilldownModal();
  modal.querySelector("#drilldownTitle").textContent = title;
  modal.querySelector("#drilldownBody").innerHTML = html;
  modal.classList.add("open");
}

function closeDrilldown(){
  document.getElementById("drilldownModal")?.classList.remove("open");
}

function detailCards(items){
  return `<div class="detail-grid">${items.map(item => `<div class="detail-card"><span>${item[0]}</span><b>${item[1]}</b></div>`).join("")}</div>`;
}

function bindGlobalActions(){
  document.getElementById("openConfigBtn")?.addEventListener("click", openConfigPanel);
  document.getElementById("openWidgetBuilderBtn")?.addEventListener("click", event => { event.preventDefault(); openWidgetBuilder(); });
  document.getElementById("themeToggleBtn")?.addEventListener("click", () => {
    const config = getSavedConfig();
    config.theme = config.theme === "light" ? "dark" : "light";
    saveConfig(config);
    applyConfig(config);
    showToast(config.theme === "light" ? "Light mode enabled" : "Dark mode enabled");
  });
  document.getElementById("fullscreenBtn")?.addEventListener("click", () => {
    if(!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });
  const exportBtn = Array.from(document.querySelectorAll("button")).find(btn => btn.textContent.trim() === "Export CSV");
  exportBtn?.addEventListener("click", exportAuditCsv);
  document.getElementById("configOverlay")?.addEventListener("click", event => { if(event.target.id === "configOverlay") closeConfigPanel(); });
  document.addEventListener("keydown", event => { if(event.key === "Escape"){ closeConfigPanel(); closeDrilldown(); } });
  document.addEventListener("click", event => {
    const removeButton = event.target.closest("[data-remove-custom]");
    if(removeButton){
      const id = removeButton.dataset.removeCustom;
      const config = getSavedConfig();
      config.customWidgets = (config.customWidgets || []).filter(widget => widget.id !== id);
      delete config.widgets[id];
      delete config.sizes[id];
      config.order = (config.order || []).filter(item => item !== id);
      saveConfig(config);
      applyConfig(config);
      buildConfigPanel(config);
      showToast("Custom widget removed");
      return;
    }
    if(event.target.closest("button,a,input,select,label,.config-overlay,.drilldown-overlay")) return;
    const kpi = event.target.closest(".kpi");
    if(kpi){
      const title = kpi.querySelector(".kpi-label")?.textContent || "KPI";
      const value = kpi.querySelector(".kpi-value")?.textContent || "";
      openDrilldown(title, detailCards([["Current value", value],["Client", getSavedConfig().client],["Date range", getSavedConfig().dateRange],["Source", "Completed auditing checklists"]]));
      return;
    }
    const audit = event.target.closest(".audit-row");
    if(audit){
      openDrilldown("Audit Details", detailCards([["Location", audit.children[1]?.textContent || "-"],["Auditor", audit.children[2]?.textContent || "-"],["Score", audit.children[3]?.textContent || "-"],["Result", audit.children[4]?.textContent || "-"]]) + `<p class="card-subtitle" style="margin-top:14px">${audit.children[5]?.textContent || ""}</p>`);
      return;
    }
    const finding = event.target.closest(".finding-card");
    if(finding){
      openDrilldown("Critical Finding", detailCards([["Finding", finding.querySelector("b")?.textContent || "-"],["Status", finding.querySelector(".status")?.textContent || "Open"],["Priority", "Critical"],["Action", "Correct and repeat audit"]]));
      return;
    }
    const progress = event.target.closest(".progress-row");
    if(progress){
      openDrilldown("Section Failure Breakdown", detailCards([["Section", progress.children[0]?.textContent || "-"],["Failure rate", progress.children[2]?.textContent || "-"],["Top cause", "Repeated item failures"],["Recommended action", "Review failed questions"]]));
      return;
    }
  });
}

function exportAuditCsv(){
  const rows = [["date","location","auditor","score","result","reason"], ...data.audits];
  const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "incheck360-audit-dashboard-static.csv";
  link.click();
  URL.revokeObjectURL(url);
}

document.addEventListener("click", event => {
  const btn = event.target.closest("[data-segment]");
  if(!btn) return;
  const group = btn.parentElement;
  group.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  setBars(btn.dataset.segment);
});

document.addEventListener("DOMContentLoaded", () => {
  installAdvancedStyles();
  ensureDashboardCanvas();
  createConfigOverlay();
  ensureDrilldownModal();
  setBars("score");
  applyConfig(getSavedConfig());
  bindGlobalActions();
});
