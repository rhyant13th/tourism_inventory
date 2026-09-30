/**
 * SHARED SCREEN PARTS: icons, form fields, badges, pop-up windows, confirm dialogs, charts, filter bar.
 */

const Icon = ({d, size=16, color="currentColor"}) => (
  <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  plus: "M12 5v14M5 12h14",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
  x: "M18 6 6 18M6 6l12 12",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  pin: "M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  download: "M12 3v12M7 10l5 5 5-5M4 21h16",
  upload: "M12 21V9M7 14l5-5 5 5M4 3h16",
  eye: "M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
};

function Field({label, required, children}){
  return (<label className="field">
    <span className="field-label">{label}{required && <span className="req"> *</span>}</span>
    {children}
  </label>);
}

function Pill({children, tone="teal"}){
  return <span className={"pill pill-"+tone}>{children}</span>;
}

function StatCard({label, value}){
  return (<div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </div>);
}

function Modal({title, onClose, children}){
  return (<div className="modal-overlay" onMouseDown={(e)=>{ if(e.target===e.currentTarget) onClose(); }}>
    <div className="modal">
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="btn-ghost" onClick={onClose}><Icon d={ICONS.x} color="#5E6E6A" /></button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>);
}

function ConfirmDialog({text, onCancel, onConfirm}){
  return (<div className="modal-overlay" style={{alignItems:"center"}}>
    <div className="confirm-box">
      <p style={{fontSize:14,margin:0}}>{text}</p>
      <div className="confirm-actions">
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>);
}

function WarningDialog({text, onStay, onDiscard}){
  return (<div className="modal-overlay" style={{alignItems:"center", zIndex:60}}>
    <div className="confirm-box">
      <p style={{fontSize:14,margin:0}}>{text}</p>
      <div className="confirm-actions">
        <button className="btn btn-primary" onClick={onStay}>Stay and Continue Editing</button>
        <button className="btn btn-danger" onClick={onDiscard}>Discard Changes</button>
      </div>
    </div>
  </div>);
}

function ViewField({label, value}){
  const display = (value===undefined || value===null || value==="") ? "—" : value;
  return (<div className="view-field">
    <div className="view-field-label">{label}</div>
    <div className="view-field-value">{display}</div>
  </div>);
}

function BarList({data, color}){
  const max = Math.max(1, ...data.map(d=>d.count));
  return (<div>
    {data.map(d=>(
      <div className="bar-row" key={d.name}>
        <div className="bar-label" title={d.name}>{d.name}</div>
        <div className="bar-track"><div className="bar-fill" style={{width:(d.count/max*100)+"%", background:color}}></div></div>
        <div className="bar-count">{d.count}</div>
      </div>
    ))}
    {data.length===0 && <div style={{fontSize:13,color:"var(--subtext)"}}>No data yet.</div>}
  </div>);
}

function Donut({data, total}){
  let acc = 0;
  const stops = data.map((d,i)=>{
    const pct = total ? (d.value/total*100) : 0;
    const start = acc; acc += pct;
    return PIE_COLORS[i % PIE_COLORS.length] + " " + start.toFixed(2) + "% " + acc.toFixed(2) + "%";
  }).join(", ");
  return (<div className="donut-wrap">
    <div className="donut" style={{background: total ? ("conic-gradient(" + stops + ")") : "#EDEFEE"}}>
      <div className="donut-hole"><b>{total}</b><span>total</span></div>
    </div>
    <div>
      {data.map((d,i)=>(
        <div className="legend-item" key={d.name}>
          <span className="legend-dot" style={{background:PIE_COLORS[i % PIE_COLORS.length]}}></span>
          {d.name} — {d.value}
        </div>
      ))}
    </div>
  </div>);
}

function SingleSheetToolbar({ title, sheetName, headers, buildRows, data, setData, parseRow, dedupeKey, idPrefix, isAdmin, filenamePrefix }){
  const fileRef = useRef(null);

  const handleExport = () => {
    if (!isAdmin) { alert("View-only mode: only the admin can download data."); return; }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...buildRows(data)]);
    ws['!cols'] = headers.map(h => ({ wch: Math.max(14, h.length + 2) }));
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filenamePrefix + "-" + timestamp() + ".xlsx");
  };

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "array", cellDates: true });
        const rows = sheetToRows(wb, sheetName, headers);
        const existingKeys = new Set(data.map(dedupeKey));
        const toAdd = [];
        let skipped = 0, dup = 0;
        rows.forEach(row => {
          const parsed = parseRow(row);
          if(!parsed){ skipped++; return; }
          const key = dedupeKey(parsed);
          if(existingKeys.has(key)){ dup++; return; }
          existingKeys.add(key);
          toAdd.push({ ...parsed, id: idPrefix+"-import-"+Date.now()+"-"+Math.random().toString(36).slice(2,7) });
        });
        if(toAdd.length) setData(prev => [...prev, ...toAdd]);
        alert(
          title + " import complete.\n\n" +
          "Added: " + toAdd.length + "\n" +
          "Skipped (missing required fields): " + skipped + "\n" +
          "Skipped (already in list): " + dup
        );
      } catch(err){
        alert("Could not read this file. Please upload the .xlsx file with the original '" + sheetName + "' sheet, unedited headers.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (<div className="data-toolbar">
    <div className="grow"><b>Backup &amp; Import:</b> {isAdmin
      ? "Download this list as an Excel file to back up or edit offline, then upload it back to bulk-add records."
      : "You are in view-only mode. Download and upload actions are available only to the administrator."}
    </div>
    {isAdmin && (
      <button className="btn btn-outline-teal" onClick={handleExport}><Icon d={ICONS.download} size={14} color="#1C6B6E" /> Download Excel</button>
    )}
    {isAdmin && (
      <button className="btn btn-outline-gold" onClick={()=>fileRef.current.click()}><Icon d={ICONS.upload} size={14} color="#8A5F16" /> Upload Excel</button>
    )}
    <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} />
  </div>);
}

function FilterBar({filters, setFilters, options, fields}){
  const update = (k,v) => setFilters(prev=>({...prev, [k]: v}));
  return (<div className="filter-bar">
    {fields.map(fld=>(
      <div className="filter-field" key={fld.key}>
        <div className="filter-field-label">{fld.label}</div>
        {fld.type==="search" ? (
          <div className="search-wrap">
            <span className="search-icon"><Icon d={ICONS.search} size={13} /></span>
            <input type="text" value={filters[fld.key]||""} onChange={(e)=>update(fld.key, e.target.value)} placeholder={fld.placeholder} />
          </div>
        ) : (
          <select value={filters[fld.key]||""} onChange={(e)=>update(fld.key, e.target.value)}>
            <option value="">All</option>
            {(options[fld.key]||[]).map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        )}
      </div>
    ))}
    <button className="clear-btn" onClick={()=>setFilters({})}>Clear filters</button>
  </div>);
}

// =====================================================================
// RECORDS PRINT REPORTS (Enterprises, Accreditation, Attractions, CBTOs)
// Same print mechanism, header, look and generated-by note as the
// Directory print report (re-uses its .dir-print-root print styles).
// =====================================================================
function PrintIcon(){
  return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1C6B6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>);
}
