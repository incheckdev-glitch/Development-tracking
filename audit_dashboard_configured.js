const defaultConfig = {
  layout: 'executive',
  client: 'SAS Horeca S.A.L',
  location: 'All Locations',
  template: 'Food Safety Audit',
  dateRange: '01 Jun - 22 Jun 2026',
  threshold: '80',
  urgent: '3',
  groupBy: 'Location',
  refresh: 'Manual',
  widgets: {
    locationPerformance: true,
    trend: true,
    passFail: true,
    sectionFailure: true,
    urgentFindings: true,
    topFailedItems: true,
    recentAudits: true
  }
};

const allowedWidgetIds = new Set(Object.keys(defaultConfig.widgets));
const clone = value => JSON.parse(JSON.stringify(value));
const q = selector => document.querySelector(selector);
const qa = selector => [...document.querySelectorAll(selector)];

function normalizeConfig(value){
  const config = clone(defaultConfig);
  if(value && typeof value === 'object') Object.assign(config, value);
  config.widgets = Object.assign({}, defaultConfig.widgets);
  Object.entries(value?.widgets || {}).forEach(([id, enabled]) => {
    if(allowedWidgetIds.has(id)) config.widgets[id] = enabled;
  });
  return config;
}

function saved(){
  try {
    return normalizeConfig(JSON.parse(localStorage.getItem('auditDashboardConfig')));
  } catch {
    return clone(defaultConfig);
  }
}

function persist(config){
  localStorage.setItem('auditDashboardConfig', JSON.stringify(normalizeConfig(config)));
}

function setVal(id, value){
  const element = q(`#${id}`);
  if(element) element.value = value;
}

function getVal(id){
  return q(`#${id}`)?.value || '';
}

function loadPanel(config){
  const layout = q(`input[name="layout"][value="${config.layout}"]`);
  if(layout) layout.checked = true;
  setVal('cfgClient', config.client);
  setVal('cfgLocation', config.location);
  setVal('cfgTemplate', config.template);
  setVal('cfgDate', config.dateRange);
  setVal('cfgThreshold', config.threshold);
  setVal('cfgUrgent', config.urgent);
  setVal('cfgGroupBy', config.groupBy);
  setVal('cfgRefresh', config.refresh);
  qa('[data-toggle-widget]').forEach(input => {
    input.checked = config.widgets?.[input.dataset.toggleWidget] !== false;
  });
}

function collect(){
  const widgets = {};
  qa('[data-toggle-widget]').forEach(input => {
    widgets[input.dataset.toggleWidget] = input.checked;
  });
  return normalizeConfig({
    layout: q('input[name="layout"]:checked')?.value || 'executive',
    client: getVal('cfgClient'),
    location: getVal('cfgLocation'),
    template: getVal('cfgTemplate'),
    dateRange: getVal('cfgDate'),
    threshold: getVal('cfgThreshold'),
    urgent: getVal('cfgUrgent'),
    groupBy: getVal('cfgGroupBy'),
    refresh: getVal('cfgRefresh'),
    widgets
  });
}

function apply(config){
  config = normalizeConfig(config);
  qa('[data-widget]').forEach(widget => {
    widget.classList.toggle('widget-hidden', config.widgets?.[widget.dataset.widget] === false);
  });
  const main = q('#dashboardMain');
  if(main) main.classList.toggle('compact', config.layout === 'compact');

  const filters = qa('.filters .filter b');
  if(filters[0]) filters[0].textContent = config.dateRange;
  if(filters[1]) filters[1].textContent = config.client;
  if(filters[3]) filters[3].textContent = config.location;
  if(filters[4]) filters[4].textContent = config.template;

  const passRateCard = qa('.kpis .card').find(card => card.querySelector('.kpi-label')?.textContent.trim() === 'Pass Rate');
  const caption = passRateCard?.querySelector('.kpi-caption');
  if(caption) caption.textContent = `Pass threshold ${config.threshold}%`;
}

function openConfig(){
  loadPanel(saved());
  q('#configOverlay')?.classList.add('open');
}

function closeConfig(){
  q('#configOverlay')?.classList.remove('open');
}

function toast(message){
  let element = q('.toast');
  if(!element){
    element = document.createElement('div');
    element.className = 'toast';
    document.body.appendChild(element);
  }
  element.textContent = message;
  element.classList.add('show');
  setTimeout(() => element.classList.remove('show'), 2200);
}

function setBars(mode){
  qa('[data-bar]').forEach((wrap, index) => {
    const scores = {
      score: [92,88,84,68,90,81],
      section: [96,81,78,55,87,75],
      urgent: [1,2,2,5,1,3]
    };
    const value = scores[mode][index];
    const bar = wrap.querySelector('.bar');
    if(!bar) return;
    const height = mode === 'urgent' ? Math.max(35, value * 42) : Math.max(35, value * 2.45);
    bar.style.setProperty('--h', `${height}px`);
    bar.dataset.value = mode === 'urgent' ? `${value} flags` : `${value}%`;
    bar.classList.toggle('fail', (mode !== 'urgent' && value < 72) || (mode === 'urgent' && value >= 4));
    bar.classList.toggle('mid', mode !== 'urgent' && value >= 72 && value < 84);
  });
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-segment]');
  if(!button) return;
  qa('[data-segment]').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  setBars(button.dataset.segment);
});


const failureBreakdownViews = {
  section: {
    title: 'Failure Rate by Section',
    subtitle: 'Top failing audit sections.',
    rows: [
      ['Food Safety', 31, 'danger'],
      ['Cleaning', 24, 'warn'],
      ['Staff Hygiene', 18, ''],
      ['Documents', 12, '']
    ]
  },
  location: {
    title: 'Section Failure by Location',
    subtitle: 'Section failure rates grouped by location.',
    rows: [
      ['Dbayeh Branch', 34, 'danger'],
      ['Verdun Branch', 27, 'warn'],
      ['Tripoli Branch', 21, 'warn'],
      ['Hamra Branch', 14, '']
    ]
  }
};

function renderFailureBreakdown(card, view){
  const data = failureBreakdownViews[view] || failureBreakdownViews.section;
  card.dataset.failureView = view;
  const title = card.querySelector('[data-failure-title]');
  const subtitle = card.querySelector('[data-failure-subtitle]');
  const list = card.querySelector('[data-failure-list]');
  if(title) title.textContent = data.title;
  if(subtitle) subtitle.textContent = data.subtitle;
  card.querySelectorAll('[data-failure-view-button]').forEach(button => {
    button.classList.toggle('active', button.dataset.failureViewButton === view);
  });
  if(list){
    list.innerHTML = data.rows.map(([label, rate, tone]) =>
      `<div class="progress-row"><span>${label}</span><div class="track"><span class="${tone}" style="width:${rate}%"></span></div><b>${rate}%</b></div>`
    ).join('');
  }
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-failure-view-button]');
  if(!button) return;
  const card = button.closest('[data-widget="sectionFailure"]');
  if(card) renderFailureBreakdown(card, button.dataset.failureViewButton);
});

document.addEventListener('DOMContentLoaded', () => {
  const config = saved();
  loadPanel(config);
  apply(config);
  setBars('score');

  q('#openConfigBtn')?.addEventListener('click', openConfig);
  q('#closeConfigBtn')?.addEventListener('click', closeConfig);
  q('#configOverlay')?.addEventListener('click', event => {
    if(event.target.id === 'configOverlay') closeConfig();
  });
  document.addEventListener('keydown', event => {
    if(event.key === 'Escape') closeConfig();
  });
  q('#saveConfigBtn')?.addEventListener('click', () => {
    const next = collect();
    persist(next);
    apply(next);
    closeConfig();
    toast('Dashboard configuration saved');
  });
  q('#resetConfigBtn')?.addEventListener('click', () => {
    const fresh = clone(defaultConfig);
    persist(fresh);
    loadPanel(fresh);
    apply(fresh);
    toast('Dashboard reset to default');
  });
  qa('[data-toggle-widget],input[name="layout"],#cfgClient,#cfgLocation,#cfgTemplate,#cfgDate,#cfgThreshold').forEach(element => {
    element.addEventListener('change', () => apply(collect()));
  });
});
