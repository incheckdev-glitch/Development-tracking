(() => {
  const STORAGE_KEY = 'incheck360WidgetLayoutControlsV1';
  let refreshTimer = null;
  let activeMaximized = null;

  function loadState(){
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        orders: value && typeof value.orders === 'object' ? value.orders : {},
        collapsed: value && typeof value.collapsed === 'object' ? value.collapsed : {}
      };
    } catch {
      return { orders: {}, collapsed: {} };
    }
  }

  function saveState(state){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function widgetId(widget, index = 0){
    if(widget.dataset.layoutWidgetId) return widget.dataset.layoutWidgetId;
    const id = widget.dataset.widget || widget.id || `widget_${index}`;
    widget.dataset.layoutWidgetId = id;
    return id;
  }

  function groupId(group){
    return group.id || group.dataset.layoutGroup || 'dashboardWidgets';
  }

  function addStyles(){
    if(document.getElementById('widgetLayoutControlsStyles')) return;
    const style = document.createElement('style');
    style.id = 'widgetLayoutControlsStyles';
    style.textContent = `
      .dashboard-canvas{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:15px;margin-top:15px;align-items:stretch}
      .dashboard-widget{position:relative;min-width:0;grid-column:span 6}
      .dashboard-widget.widget-size-small{grid-column:span 4}
      .dashboard-widget.widget-size-medium{grid-column:span 6}
      .dashboard-widget.widget-size-large{grid-column:span 8}
      .dashboard-widget.widget-size-full{grid-column:1/-1}
      .widget-layout-toolbar{display:flex;align-items:center;justify-content:flex-end;gap:6px;margin:-4px -2px 8px;min-height:30px;position:relative;z-index:6}
      .widget-layout-btn{width:30px;height:30px;padding:0;border:1px solid var(--stroke,rgba(255,255,255,.14));border-radius:10px;background:rgba(255,255,255,.07);color:var(--text,#fff);display:grid;place-items:center;font-size:15px;font-weight:900;line-height:1;cursor:pointer;transition:background .15s ease,transform .15s ease,border-color .15s ease}
      .widget-layout-btn:hover{background:rgba(103,232,249,.14);border-color:rgba(103,232,249,.45);transform:translateY(-1px)}
      .widget-drag-handle{cursor:grab;touch-action:none}
      .widget-drag-handle:active{cursor:grabbing}
      .dashboard-widget.dragging,.module-card.dragging{opacity:.5;transform:scale(.99)}
      .dashboard-widget.drag-over,.module-card.drag-over{outline:2px solid rgba(103,232,249,.65);outline-offset:3px}
      .widget-collapsed{min-height:0!important;height:auto!important}
      .widget-collapsed > *:not(.widget-layout-toolbar):not(.card-title-row):not(.title-row):not(.module-head){display:none!important}
      .widget-collapsed .card-title-row,.widget-collapsed .title-row,.widget-collapsed .module-head{margin-bottom:0!important}
      .widget-maximized{position:fixed!important;inset:18px!important;z-index:20001!important;width:auto!important;max-width:none!important;height:auto!important;max-height:calc(100vh - 36px)!important;overflow:auto!important;grid-column:auto!important;margin:0!important;box-shadow:0 35px 120px rgba(0,0,0,.62)!important}
      .widget-maximized .widget-layout-toolbar{position:sticky;top:0;padding:4px;background:linear-gradient(180deg,var(--panel-2,rgba(15,28,51,.98)) 70%,transparent);border-radius:12px}
      .widget-layout-backdrop{position:fixed;inset:0;z-index:20000;background:rgba(2,6,23,.70);backdrop-filter:blur(10px)}
      body.widget-modal-open{overflow:hidden}
      html[data-theme="light"] .widget-layout-btn{background:rgba(15,23,42,.045);color:#172033;border-color:rgba(15,23,42,.14)}
      html[data-theme="light"] .widget-maximized .widget-layout-toolbar{background:linear-gradient(180deg,rgba(255,255,255,.98) 70%,transparent)}
      @media(max-width:1100px){.dashboard-canvas{grid-template-columns:1fr}.dashboard-widget,.dashboard-widget.widget-size-small,.dashboard-widget.widget-size-medium,.dashboard-widget.widget-size-large,.dashboard-widget.widget-size-full{grid-column:1/-1}.widget-maximized{inset:8px!important;max-height:calc(100vh - 16px)!important}}
    `;
    document.head.appendChild(style);
  }

  function ensureConfiguredCanvas(){
    const main = document.getElementById('dashboardMain');
    if(!main) return null;
    let canvas = document.getElementById('dashboardCanvas');
    if(canvas) return canvas;

    canvas = document.createElement('section');
    canvas.id = 'dashboardCanvas';
    canvas.className = 'dashboard-canvas';
    const topSummary = main.querySelector('.top-summary-grid');
    if(topSummary) topSummary.insertAdjacentElement('afterend', canvas);
    else main.appendChild(canvas);

    const widgets = Array.from(main.querySelectorAll('[data-widget]')).filter(widget =>
      !widget.closest('.top-summary-grid') &&
      !widget.closest('#configOverlay') &&
      !widget.closest('#dashboardCanvas')
    );

    widgets.forEach(widget => {
      widget.classList.add('dashboard-widget');
      const id = widget.dataset.widget || '';
      if(['locationPerformance', 'recentAudits'].includes(id)) widget.classList.add('widget-size-full');
      else if(!Array.from(widget.classList).some(name => name.startsWith('widget-size-'))) widget.classList.add('widget-size-medium');
      canvas.appendChild(widget);
    });

    main.querySelectorAll('.grid-main,.grid-three').forEach(section => {
      if(!section.querySelector('[data-widget]')) section.style.display = 'none';
    });
    return canvas;
  }

  function movableGroups(){
    const groups = [];
    const canvas = document.getElementById('dashboardCanvas') || ensureConfiguredCanvas();
    if(canvas) groups.push(canvas);
    const advanced = document.getElementById('advancedAuditModules');
    if(advanced) groups.push(advanced);
    return groups;
  }

  function groupWidgets(group){
    if(group.id === 'advancedAuditModules') return Array.from(group.children).filter(child => child.classList.contains('module-card'));
    return Array.from(group.children).filter(child => child.matches('[data-widget],.dashboard-widget'));
  }

  function saveGroupOrder(group){
    const state = loadState();
    const widgets = groupWidgets(group);
    state.orders[groupId(group)] = widgets.map((widget, index) => widgetId(widget, index));
    widgets.forEach((widget, index) => { widget.style.order = String(index); });
    saveState(state);

    if(group.id === 'dashboardCanvas' && typeof window.saveCurrentWidgetOrder === 'function'){
      try { window.saveCurrentWidgetOrder(); } catch {}
    }
  }

  function applySavedOrder(group){
    const state = loadState();
    const widgets = groupWidgets(group);
    const saved = state.orders[groupId(group)] || [];
    const orderMap = new Map(saved.map((id, index) => [id, index]));
    widgets.sort((a, b) => {
      const aOrder = orderMap.has(widgetId(a)) ? orderMap.get(widgetId(a)) : 10000;
      const bOrder = orderMap.has(widgetId(b)) ? orderMap.get(widgetId(b)) : 10000;
      return aOrder - bOrder;
    });
    widgets.forEach((widget, index) => {
      group.appendChild(widget);
      widget.style.order = String(index);
    });
  }

  function restoreMaximized(widget){
    if(!widget?.classList.contains('widget-maximized')) return;
    widget.classList.remove('widget-maximized');
    widget.querySelector('[data-widget-maximize]')?.setAttribute('aria-label', 'Maximize widget');
    const maxButton = widget.querySelector('[data-widget-maximize]');
    if(maxButton){
      maxButton.textContent = '⛶';
      maxButton.title = 'Maximize';
    }
    document.querySelector('.widget-layout-backdrop')?.remove();
    document.body.classList.remove('widget-modal-open');
    activeMaximized = null;
  }

  function maximizeWidget(widget){
    if(widget.classList.contains('widget-maximized')){
      restoreMaximized(widget);
      return;
    }
    if(activeMaximized) restoreMaximized(activeMaximized);

    if(widget.classList.contains('widget-collapsed')) toggleCollapsed(widget, false);
    const backdrop = document.createElement('div');
    backdrop.className = 'widget-layout-backdrop';
    backdrop.addEventListener('click', () => restoreMaximized(widget));
    document.body.appendChild(backdrop);
    widget.classList.add('widget-maximized');
    document.body.classList.add('widget-modal-open');
    activeMaximized = widget;
    const button = widget.querySelector('[data-widget-maximize]');
    if(button){
      button.textContent = '↙';
      button.title = 'Restore';
      button.setAttribute('aria-label', 'Restore widget');
    }
  }

  function toggleCollapsed(widget, force){
    const id = widgetId(widget);
    const state = loadState();
    const shouldCollapse = typeof force === 'boolean' ? force : !widget.classList.contains('widget-collapsed');
    widget.classList.toggle('widget-collapsed', shouldCollapse);
    state.collapsed[id] = shouldCollapse;
    saveState(state);
    const button = widget.querySelector('[data-widget-minimize]');
    if(button){
      button.textContent = shouldCollapse ? '+' : '−';
      button.title = shouldCollapse ? 'Expand' : 'Minimize';
      button.setAttribute('aria-label', shouldCollapse ? 'Expand widget' : 'Minimize widget');
    }
  }

  function addGenericDrag(widget, group){
    if(widget.dataset.layoutDragReady === 'true') return;
    widget.dataset.layoutDragReady = 'true';

    widget.addEventListener('dragstart', event => {
      if(widget.draggable !== true){
        event.preventDefault();
        return;
      }
      widget.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', widgetId(widget));
    });

    widget.addEventListener('dragend', () => {
      widget.classList.remove('dragging');
      groupWidgets(group).forEach(item => item.classList.remove('drag-over'));
      widget.draggable = false;
      saveGroupOrder(group);
    });

    widget.addEventListener('dragover', event => {
      const dragged = group.querySelector('.dragging');
      if(!dragged || dragged === widget) return;
      event.preventDefault();
      widget.classList.add('drag-over');
    });

    widget.addEventListener('dragleave', () => widget.classList.remove('drag-over'));

    widget.addEventListener('drop', event => {
      const dragged = group.querySelector('.dragging');
      if(!dragged || dragged === widget) return;
      event.preventDefault();
      const bounds = widget.getBoundingClientRect();
      const insertAfter = event.clientY > bounds.top + bounds.height / 2 || event.clientX > bounds.left + bounds.width / 2;
      group.insertBefore(dragged, insertAfter ? widget.nextSibling : widget);
      widget.classList.remove('drag-over');
      saveGroupOrder(group);
    });
  }

  function prepareWidget(widget, group, index){
    widgetId(widget, index);
    if(group.id === 'dashboardCanvas') widget.classList.add('dashboard-widget');
    widget.draggable = false;

    if(!widget.querySelector(':scope > .widget-layout-toolbar')){
      const toolbar = document.createElement('div');
      toolbar.className = 'widget-layout-toolbar';
      toolbar.innerHTML = `
        <button class="widget-layout-btn widget-drag-handle" type="button" title="Drag to move" aria-label="Drag widget">↕</button>
        <button class="widget-layout-btn" type="button" data-widget-minimize title="Minimize" aria-label="Minimize widget">−</button>
        <button class="widget-layout-btn" type="button" data-widget-maximize title="Maximize" aria-label="Maximize widget">⛶</button>
      `;
      widget.insertBefore(toolbar, widget.firstChild);

      const handle = toolbar.querySelector('.widget-drag-handle');
      handle.addEventListener('pointerdown', event => {
        event.stopPropagation();
        widget.draggable = true;
      });
      handle.addEventListener('pointerup', () => {
        setTimeout(() => { if(!widget.classList.contains('dragging')) widget.draggable = false; }, 0);
      });
      handle.addEventListener('click', event => event.preventDefault());

      toolbar.querySelector('[data-widget-minimize]').addEventListener('click', event => {
        event.stopPropagation();
        toggleCollapsed(widget);
      });
      toolbar.querySelector('[data-widget-maximize]').addEventListener('click', event => {
        event.stopPropagation();
        maximizeWidget(widget);
      });
      toolbar.addEventListener('pointerdown', event => event.stopPropagation());
    }

    const state = loadState();
    toggleCollapsed(widget, state.collapsed[widgetId(widget)] === true);
    addGenericDrag(widget, group);
  }

  function refresh(){
    addStyles();
    const groups = movableGroups();
    groups.forEach(group => {
      groupWidgets(group).forEach((widget, index) => prepareWidget(widget, group, index));
      applySavedOrder(group);
    });
  }

  function scheduleRefresh(){
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refresh, 40);
  }

  document.addEventListener('keydown', event => {
    if(event.key === 'Escape' && activeMaximized) restoreMaximized(activeMaximized);
  });

  document.addEventListener('DOMContentLoaded', () => {
    refresh();
    const main = document.getElementById('dashboardMain');
    if(main){
      const observer = new MutationObserver(scheduleRefresh);
      observer.observe(main, { childList: true, subtree: true });
    }
  });
})();
