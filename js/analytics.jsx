/**
 * ANALYTICS SCREEN: summary numbers, charts and the analytics report.
 */

function AnalyticsSection({establishments, attractions, cbtos}){
  const REPORTS = [
    {id:"estab-muni", label:"Enterprises by Municipality", desc:"Enterprise counts per municipality with accreditation status, operating status, rooms and employees.",
     note:"Accredited / Expired / Not Accredited are computed from each enterprise's accreditation history. Rooms and employee counts exclude entries marked N/A (e.g., Tour Guides)."},
    {id:"estab-type", label:"Enterprises by Type", desc:"Enterprise counts per type with accreditation status, operating status, rooms and employees.",
     note:"Accredited / Expired / Not Accredited are computed from each enterprise's accreditation history. Rooms and employee counts exclude entries marked N/A (e.g., Tour Guides)."},
    {id:"attr-muni",  label:"Attractions by Municipality", desc:"Attraction counts per municipality by status and declaration status.",
     note:"Status refers to Existing, Potential or Emerging attractions as encoded in the inventory."},
    {id:"attr-cat",   label:"Attractions by Category", desc:"Attraction counts per category by status and physical condition.",
     note:"Status refers to Existing, Potential or Emerging attractions as encoded in the inventory."},
    {id:"cbto-muni",  label:"CBTOs by Municipality", desc:"Community-Based Tourism Organizations and their membership per municipality.",
     note:"Total Members is the sum of male and female members of each CBTO."},
  ];
  const [report, setReport] = useState("estab-muni");
  const [filters, setFilters] = useState({});
  const [now, setNow] = useState(new Date());

  useEffect(()=>{
    const h = ()=>setNow(new Date());
    window.addEventListener("beforeprint", h);
    return ()=>window.removeEventListener("beforeprint", h);
  }, []);

  const n = v => Number(v)||0;
  const sum = (list, fn) => list.reduce((a,d)=>a+fn(d), 0);
  const ALL_TYPES = [...PRIMARY_TYPES, ...SECONDARY_TYPES];
  const CATS = Object.keys(ATTRACTION_CATEGORIES);

  const munis = [...MUNICIPALITIES];
  [...establishments, ...attractions, ...cbtos].forEach(d=>{
    if(d.municipality && !munis.includes(d.municipality)) munis.push(d.municipality);
  });

  // ----- build the selected report -----
  let title = "", cols = [], rows = [], numStart = 1, fields = [];
  const cur = REPORTS.find(r=>r.id===report);

  const estabList = establishments.filter(d =>
    (!filters.classification || d.classification===filters.classification) &&
    (!filters.type || d.type===filters.type) &&
    (!filters.estatus || d.status===filters.estatus) &&
    (!filters.municipality || d.municipality===filters.municipality));
  const estabCounts = list => {
    const st = list.map(getAccredState);
    return [
      list.length,
      st.filter(s=>s==="Accredited").length,
      st.filter(s=>s==="Expired").length,
      st.filter(s=>s==="Not Accredited").length,
      list.filter(d=>d.status==="Active").length,
      list.filter(d=>d.status==="Not Active").length,
      list.filter(d=>d.status==="Others").length,
      sum(list, d=>n(d.rooms)),
      sum(list, d=>n(d.maleEmployees)),
      sum(list, d=>n(d.femaleEmployees)),
      sum(list, d=>n(d.maleEmployees)+n(d.femaleEmployees)),
    ];
  };
  const attrList = attractions.filter(d =>
    (!filters.category || d.category===filters.category) &&
    (!filters.selection || d.selection===filters.selection) &&
    (!filters.municipality || d.municipality===filters.municipality));
  const attrCounts = list => [
    list.length,
    list.filter(d=>d.selection==="Existing").length,
    list.filter(d=>d.selection==="Potential").length,
    list.filter(d=>d.selection==="Emerging").length,
  ];

  if(report==="estab-muni"){
    title = "Tourism Enterprises by Municipality";
    cols = ["Municipality","Total","Primary","Secondary","Accredited","Expired","Not Accredited","Active","Not Active","Others","Rooms","Male Emp.","Female Emp.","Total Emp."];
    rows = munis.map(m=>{
      const l = estabList.filter(d=>d.municipality===m);
      const c = estabCounts(l);
      return [m, c[0], l.filter(d=>d.classification==="Primary Enterprises").length, l.filter(d=>d.classification==="Secondary Enterprises").length, ...c.slice(1)];
    });
    fields = [{key:"classification",all:"All Classifications"},{key:"type",all:"All Types"},{key:"estatus",all:"All Enterprise Statuses"}];
  } else if(report==="estab-type"){
    title = "Tourism Enterprises by Type";
    cols = ["Type","Class","Total","Accredited","Expired","Not Accredited","Active","Not Active","Others","Rooms","Male Emp.","Female Emp.","Total Emp."];
    numStart = 2;
    const types = [...ALL_TYPES];
    estabList.forEach(d=>{ if(d.type && !types.includes(d.type)) types.push(d.type); });
    rows = types.map(t=>{
      const l = estabList.filter(d=>d.type===t);
      return [t, PRIMARY_TYPES.includes(t) ? "Primary" : (SECONDARY_TYPES.includes(t) ? "Secondary" : "—"), ...estabCounts(l)];
    }).filter(r=>r[2] > 0);
    fields = [{key:"municipality",all:"All Municipalities"},{key:"estatus",all:"All Enterprise Statuses"}];
  } else if(report==="attr-muni"){
    title = "Tourism Attractions by Municipality";
    cols = ["Municipality","Total","Existing","Potential","Emerging","Nationally Declared","Locally Declared","Registered","Unregistered / For Validation"];
    rows = munis.map(m=>{
      const l = attrList.filter(d=>d.municipality===m);
      return [m, ...attrCounts(l), ...DECLARATION_STATUSES.map(s=>l.filter(d=>d.declarationStatus===s).length)];
    });
    fields = [{key:"category",all:"All Categories"},{key:"selection",all:"All Statuses"}];
  } else if(report==="attr-cat"){
    title = "Tourism Attractions by Category";
    cols = ["Category","Total","Existing","Potential","Emerging", ...PHYSICAL_CONDITIONS];
    const cats = [...CATS];
    attrList.forEach(d=>{ if(d.category && !cats.includes(d.category)) cats.push(d.category); });
    rows = cats.map(c=>{
      const l = attrList.filter(d=>d.category===c);
      return [c, ...attrCounts(l), ...PHYSICAL_CONDITIONS.map(p=>l.filter(d=>d.physicalCondition===p).length)];
    });
    fields = [{key:"municipality",all:"All Municipalities"},{key:"selection",all:"All Statuses"}];
  } else {
    title = "Community-Based Tourism Organizations (CBTOs) by Municipality";
    cols = ["Municipality","No. of CBTOs","Male Members","Female Members","Total Members"];
    rows = munis.map(m=>{
      const l = cbtos.filter(d=>d.municipality===m);
      return [m, l.length, sum(l,d=>n(d.maleMembers)), sum(l,d=>n(d.femaleMembers)), sum(l,d=>cbtoTotalMembers(d))];
    });
  }

  const totals = cols.map((c,j)=> j===0 ? "TOTAL" : (j<numStart ? "" : sum(rows, r=>n(r[j]))));
  const chartData = rows.map(r=>({name:r[0], count:n(r[numStart])})).filter(d=>d.count>0);
  const chartMax = Math.max(1, ...chartData.map(d=>d.count));
  const options = {
    classification: CLASSIFICATIONS, type: ALL_TYPES, estatus: ESTAB_STATUSES,
    municipality: munis, category: CATS, selection: ATTRACTION_SELECTIONS,
  };
  const FILTER_LABELS = {classification:"Classification", type:"Type", estatus:"Enterprise Status", municipality:"Municipality", category:"Category", selection:"Status"};
  const filterText = fields.filter(f=>filters[f.key]).map(f=>FILTER_LABELS[f.key]+": "+filters[f.key]).join("  |  ") || "None (all records)";
  const generated = now.toLocaleString("en-PH", {year:"numeric", month:"long", day:"numeric", hour:"numeric", minute:"2-digit"});
  const fmt = c => typeof c==="number" ? c.toLocaleString() : c;
  const numCls = j => (j>=numStart ? " ar-r" : "") + (j===numStart ? " ar-key" : "");

  const handlePrint = () => { setNow(new Date()); setTimeout(()=>window.print(), 80); };

  return (<div className="analytics-report">
    <div className="print-report-header">
      <img src={PGO_LOGO_URI} alt="Official Seal of the Province of Occidental Mindoro" />
      <div className="prh-text">
        <div className="prh-l1">Republic of the Philippines</div>
        <div className="prh-l2">Provincial Government of Occidental Mindoro</div>
        <div className="prh-l3">Provincial Tourism, Culture and Arts Division</div>
        <div className="prh-l4">Planning Development, Data Banking and Administrative Section</div>
      </div>
    </div>

    <div className="ar-noprint ar-pills">
      {REPORTS.map(r=>(
        <button key={r.id} className={"ar-pill" + (report===r.id ? " active" : "")}
          onClick={()=>{ setReport(r.id); setFilters({}); }}>{r.label}</button>
      ))}
    </div>

    <div className="ar-noprint ar-card ar-toolbar">
      <div>
        <h2 className="ar-h2">{cur.label}</h2>
        <p className="ar-sub">{cur.desc}</p>
      </div>
      <div className="ar-controls">
        {fields.map(f=>(
          <select key={f.key} className="ar-select" value={filters[f.key]||""}
            onChange={e=>{ const v=e.target.value; setFilters(prev=>({...prev,[f.key]:v})); }}>
            <option value="">{f.all}</option>
            {(options[f.key]||[]).map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        <button className="ar-btn-print" onClick={handlePrint}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print Report
        </button>
      </div>
    </div>

    <div className="ar-card ar-print-card">
      <div className="ar-title-block">
        <h3 className="ar-h3">{title}</h3>
        <p className="ar-sub">Filters applied: <b>{filterText}</b></p>
      </div>
      <div className="ar-scroll">
        <table className="ar-table">
          <thead>
            <tr>{cols.map((c,j)=><th key={j} className={numCls(j).trim()}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} className={(j===0 ? "ar-first" : numCls(j)).trim()}>{fmt(c)}</td>)}</tr>
            ))}
          </tbody>
          <tfoot>
            <tr>{totals.map((c,j)=><td key={j} className={(j===0 ? "ar-first" : numCls(j)).trim()}>{fmt(c)}</td>)}</tr>
          </tfoot>
        </table>
      </div>
      <p className="ar-foot-note">Note: {cur.note}</p>
    </div>

    {chartData.length>0 && (
      <div className="ar-card ar-chart-card">
        <h3 className="ar-h3s">Distribution — {cols[numStart]}</h3>
        {chartData.map(d=>(
          <div className="ar-bar-row" key={d.name}>
            <div className="ar-bar-label" title={d.name}>{d.name}</div>
            <div className="ar-bar-track"><div className="ar-bar-fill" style={{width:(d.count/chartMax*100)+"%"}}></div></div>
            <div className="ar-bar-count">{d.count.toLocaleString()}</div>
          </div>
        ))}
      </div>
    )}

    <div className="report-generated-note">
      <p>This report was generated through the Tourism Enterprise &amp; Attraction Inventory by the <strong>Provincial Tourism, Culture and Arts Division – Planning Development, Data Banking and Administrative Section</strong>. Figures reflect the records encoded in the system as of the date generated.</p>
      <p style={{marginTop:4}}>Prepared by: <strong>RYAN R. TAJONERA</strong>, Tourism Operations Officer II &nbsp;|&nbsp; Date generated: {generated}</p>
    </div>
  </div>);
}
