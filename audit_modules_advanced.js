(() => {
  const AKEY = 'incheck360CorrectiveActions';
  const defaultActions = [
    {id:'ca-1',finding:'Fridge temperature above threshold',location:'Dbayeh Branch',owner:'Location Manager',due:'2026-06-24',priority:'Urgent',status:'Open',evidence:'Missing',source:'Food Safety Audit'},
    {id:'ca-2',finding:'Expired food item found in storage',location:'Dbayeh Branch',owner:'Omar Chatila',due:'2026-06-24',priority:'Urgent',status:'In Progress',evidence:'Missing',source:'Food Safety Audit'},
    {id:'ca-3',finding:'Pest control proof missing',location:'Dbayeh Branch',owner:'Rana N.',due:'2026-06-25',priority:'High',status:'Review',evidence:'Uploaded',source:'Documentation'}
  ];
  const audits = [
    ['22 Jun','Dbayeh Branch','Omar Chatila','68%','Fail','Critical section failed: Food Safety'],
    ['21 Jun','Hamra Branch','Rana N.','94%','Pass','No critical failure'],
    ['20 Jun','Achrafieh Branch','Omar Chatila','88%','Pass','No critical failure'],
    ['19 Jun','Verdun Branch','Rana N.','72%','Fail','Formula threshold not reached']
  ];

  const clone = value => JSON.parse(JSON.stringify(value));
  const get = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || clone(fallback);
    } catch {
      return clone(fallback);
    }
  };
  const set = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const actions = () => get(AKEY, defaultActions);
  const toast = message => typeof showToast === 'function' ? showToast(message) : alert(message);
  const modal = (title, html) => typeof openDrilldown === 'function' ? openDrilldown(title, html) : alert(`${title}\n${html.replace(/<[^>]+>/g, ' ')}`);
  const close = () => typeof closeDrilldown === 'function' && closeDrilldown();
  const cards = items => typeof detailCards === 'function'
    ? detailCards(items)
    : `<div class="detail-grid">${items.map(item => `<div class="detail-card"><span>${item[0]}</span><b>${item[1]}</b></div>`).join('')}</div>`;

  function styles(){
    if(document.getElementById('auditModulesAdvancedStyles')) return;
    const style = document.createElement('style');
    style.id = 'auditModulesAdvancedStyles';
    style.textContent = `
      .advanced-modules{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:15px;margin-top:15px}
      .module-card{grid-column:span 6;border:1px solid var(--stroke);border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.105),rgba(255,255,255,.045));box-shadow:var(--shadow-soft);padding:19px;scroll-margin-top:20px}
      .module-card.full{grid-column:1/-1}
      .module-head{display:flex;justify-content:space-between;gap:12px;margin-bottom:14px}
      .module-title{font-size:19px;font-weight:1000}
      .module-sub{color:var(--muted);font-size:12px;line-height:1.45;margin-top:4px}
      .module-actions{display:flex;gap:8px;flex-wrap:wrap}
      .mini-btn{border:1px solid var(--stroke);background:rgba(255,255,255,.08);color:var(--text);border-radius:12px;padding:8px 10px;font-size:12px;font-weight:900;cursor:pointer}
      .form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
      .form-grid input,.form-grid select{width:100%;margin-top:6px;border:1px solid var(--stroke);border-radius:13px;background:rgba(2,6,23,.35);color:var(--text);padding:10px}
      .drill-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
      .drill-tabs button{border:1px solid var(--stroke);border-radius:999px;background:rgba(255,255,255,.07);color:var(--text);padding:9px 12px;font-weight:900;cursor:pointer}
      .drill-tabs button.active{background:rgba(103,232,249,.17);color:#cffafe}
      .drill-page-body{border:1px solid var(--stroke);border-radius:18px;background:rgba(255,255,255,.045);padding:14px}
      .risk-score{font-size:34px;font-weight:1000}
      .action-status{width:100%;border:1px solid var(--stroke);border-radius:12px;background:rgba(2,6,23,.35);color:var(--text);padding:8px}
      html[data-theme="light"] .module-card{background:rgba(255,255,255,.82);color:#172033}
      html[data-theme="light"] .module-sub{color:#667085}
      @media(max-width:1100px){.advanced-modules{grid-template-columns:1fr}.module-card,.module-card.full{grid-column:1/-1}.form-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function nav(){
    const sidebar = document.querySelector('.sidebar');
    if(!sidebar || document.getElementById('advancedAuditNav')) return;
    const block = document.createElement('div');
    block.id = 'advancedAuditNav';
    block.innerHTML = `<div class="nav-title">Advanced Audit</div>
      <a class="nav-link" href="#correctiveActionModule"><span class="nav-icon">🛠️</span><b>Corrective Actions</b></a>
      <a class="nav-link" href="#drilldownPagesModule"><span class="nav-icon">🔎</span><b>Drill-down Pages</b></a>`;
    const viewsTitle = [...sidebar.querySelectorAll('.nav-title')].find(item => item.textContent.trim() === 'Views');
    viewsTitle ? sidebar.insertBefore(block, viewsTitle) : sidebar.appendChild(block);
  }

  function render(){
    const main = document.getElementById('dashboardMain');
    if(!main) return;
    let section = document.getElementById('advancedAuditModules');
    if(!section){
      section = document.createElement('section');
      section.id = 'advancedAuditModules';
      section.className = 'advanced-modules';
      main.appendChild(section);
    }
    section.innerHTML = corrective() + drill('location');
    bind();
  }

  function corrective(){
    const list = actions();
    const open = list.filter(item => item.status !== 'Completed').length;
    return `<div class="module-card full" id="correctiveActionModule">
      <div class="module-head"><div><div class="module-title">Corrective Action Module</div><div class="module-sub">Track urgent findings, owners, due dates, evidence, and re-audit status.</div></div><div class="module-actions"><span class="chip bad">${open} Open</span><button class="mini-btn" id="newCorrectiveActionBtn">New Action</button></div></div>
      <table class="table"><tr><th>Finding</th><th>Location</th><th>Owner</th><th>Due</th><th>Status</th><th>Evidence</th><th>Action</th></tr>${list.map(item => `<tr><td>${item.finding}<br><small>${item.source}</small></td><td>${item.location}</td><td>${item.owner}</td><td>${item.due}</td><td><select class="action-status" data-action-status="${item.id}"><option ${item.status==='Open'?'selected':''}>Open</option><option ${item.status==='In Progress'?'selected':''}>In Progress</option><option ${item.status==='Review'?'selected':''}>Review</option><option ${item.status==='Completed'?'selected':''}>Completed</option></select></td><td><span class="status ${item.evidence==='Uploaded'?'pass':'warn'}">${item.evidence}</span></td><td><button class="mini-btn" data-open-action="${item.id}">Open</button></td></tr>`).join('')}</table>
    </div>`;
  }

  function drill(active){
    const safeActive = active === 'auditor' ? 'auditor' : 'location';
    return `<div class="module-card full" id="drilldownPagesModule"><div class="module-head"><div><div class="module-title">Drill-down Pages</div><div class="module-sub">Full detail views for location and auditor history.</div></div><span class="chip info">2 Pages</span></div><div class="drill-tabs"><button class="${safeActive==='location'?'active':''}" data-drill="location">Location</button><button class="${safeActive==='auditor'?'active':''}" data-drill="auditor">Auditor</button></div><div class="drill-page-body" id="drillPageBody">${drillContent(safeActive)}</div></div>`;
  }

  function drillContent(type){
    if(type === 'auditor') return `<div class="risk-score">87%</div><p class="module-sub">Average auditor score.</p><table class="table"><tr><th>Auditor</th><th>Audits</th><th>Pass Rate</th><th>Avg Score</th></tr><tr><td>Omar Chatila</td><td>9</td><td>72%</td><td>84%</td></tr><tr><td>Rana N.</td><td>7</td><td>86%</td><td>91%</td></tr></table>`;
    if(type === 'item') return `<div class="risk-score">6</div><p class="module-sub">Top repeated failed item count.</p><table class="table"><tr><th>Failed Item</th><th>Fails</th><th>Recommendation</th></tr><tr><td>Fridge temperature within range?</td><td>6</td><td>Add probe integration.</td></tr><tr><td>Cleaning log completed?</td><td>5</td><td>Require supervisor sign-off.</td></tr></table>`;
    if(type === 'section') return `<div class="risk-score">31%</div><p class="module-sub">Highest section failure rate.</p><table class="table"><tr><th>Section</th><th>Failure Rate</th><th>Critical</th><th>Trend</th></tr><tr><td>Food Safety</td><td>31%</td><td>Yes</td><td><span class="status fail">Worsening</span></td></tr><tr><td>Cleaning</td><td>24%</td><td>No</td><td><span class="status warn">Watch</span></td></tr></table>`;
    return `<div class="risk-score">Dbayeh</div><p class="module-sub">Location audit history and urgent finding profile.</p><table class="table"><tr><th>Date</th><th>Location</th><th>Score</th><th>Result</th><th>Reason</th></tr>${audits.map(row => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[3]}</td><td>${row[4]}</td><td>${row[5]}</td></tr>`).join('')}</table>`;
  }

  function bind(){
    document.getElementById('newCorrectiveActionBtn')?.addEventListener('click', newAction);
    document.querySelectorAll('[data-action-status]').forEach(select => {
      select.onchange = () => {
        const list = actions();
        const item = list.find(action => action.id === select.dataset.actionStatus);
        if(item) item.status = select.value;
        set(AKEY, list);
        render();
        toast('Corrective action updated');
      };
    });
    document.querySelectorAll('[data-open-action]').forEach(button => button.onclick = () => openAction(button.dataset.openAction));
    document.querySelectorAll('[data-drill]').forEach(button => button.onclick = () => {
      document.getElementById('drillPageBody').innerHTML = drillContent(button.dataset.drill);
      document.querySelectorAll('[data-drill]').forEach(item => item.classList.toggle('active', item === button));
    });
  }

  function newAction(){
    modal('New Corrective Action', `<div class="form-grid"><label>Finding<input id="naFinding" value="New urgent finding"></label><label>Location<select id="naLocation"><option>Dbayeh Branch</option><option>Hamra Branch</option></select></label><label>Owner<input id="naOwner" value="Location Manager"></label><label>Due Date<input id="naDue" type="date" value="2026-06-25"></label></div><div style="margin-top:14px"><button class="btn" id="saveNa">Save Action</button></div>`);
    document.getElementById('saveNa')?.addEventListener('click', () => {
      const list = actions();
      list.push({id:`ca-${Date.now()}`,finding:naFinding.value,location:naLocation.value,owner:naOwner.value,due:naDue.value,priority:'High',status:'Open',evidence:'Missing',source:'Manual'});
      set(AKEY, list);
      close();
      render();
      toast('Corrective action created');
    });
  }

  function openAction(id){
    const item = actions().find(action => action.id === id);
    if(!item) return;
    modal('Corrective Action Details', cards([['Finding',item.finding],['Location',item.location],['Owner',item.owner],['Due',item.due],['Priority',item.priority],['Status',item.status],['Evidence',item.evidence],['Source',item.source]]) + `<div style="margin-top:14px"><button class="btn" id="completeAction">Mark Completed</button></div>`);
    document.getElementById('completeAction')?.addEventListener('click', () => {
      const list = actions();
      const action = list.find(entry => entry.id === id);
      if(action){
        action.status = 'Completed';
        action.evidence = 'Uploaded';
      }
      set(AKEY, list);
      close();
      render();
      toast('Action completed');
    });
  }

  window.auditAdvancedModules = { render, actions };
  document.addEventListener('DOMContentLoaded', () => {
    styles();
    nav();
    render();
  });
})();
