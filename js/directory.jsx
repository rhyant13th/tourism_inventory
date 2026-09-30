/**
 * DIRECTORY SCREEN: tourism officers / contacts directory, list and form.
 */

const emptyDirectoryRecord = {
  provinceCity: "", municipality: "", name: "", position: "", officeAgency: "",
  contact: "", email: "", category: "Tourism Officer", year: String(new Date().getFullYear()),
  status: "Active",
};

function DirectoryForm({initial, onCancel, onSave, existingData, officeOptions}){
  const [f, setF] = useState(() => normalizeDirectoryRecord(initial || emptyDirectoryRecord));
  const [dupeWarning, setDupeWarning] = useState(null);
  const set = (k) => (e) => {
    const v = e && e.target ? e.target.value : e;
    setF(prev=>({...prev, [k]: v}));
  };

  const finalizeSave = (cleaned) => onSave(cleaned);

  const submit = () => {
    if(!f.name || !f.municipality || !f.category || !f.year){
      alert("Please complete name, municipality, category, and year.");
      return;
    }
    const dupes = findPossibleDirectoryDuplicates(f, existingData, f.id);
    if(dupes.length){
      setDupeWarning(dupes);
      return;
    }
    finalizeSave(f);
  };
  const confirmSaveAnyway = () => {
    setDupeWarning(null);
    finalizeSave(f);
  };

  if(dupeWarning){
    return (<div>
      <div style={{background:"var(--danger-soft)", border:"1px solid var(--danger)", borderRadius:10, padding:16}}>
        <div style={{fontWeight:700, color:"var(--danger)", fontSize:15, marginBottom:6}}>Possible Duplicate Record</div>
        <div style={{fontSize:13, color:"var(--text)", marginBottom:12}}>
          A directory record with the same or similar name already exists for this municipality, year, and category. Please review before saving.
        </div>
        <div style={{background:"#fff", border:"1px solid var(--border)", borderRadius:8, overflow:"hidden"}}>
          {dupeWarning.map(d=>(
            <div key={d.id} style={{padding:"8px 12px", borderTop:"1px solid var(--border)"}}>
              <div style={{fontWeight:600, fontSize:13}}>{d.name} — {d.position || "No position on record"}</div>
              <div style={{fontSize:12, color:"var(--subtext)"}}>{d.municipality || "—"} · {d.year || "—"} · {d.category || "—"}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button className="btn" onClick={()=>setDupeWarning(null)}>Cancel / Go Back</button>
        <button className="btn btn-primary" onClick={confirmSaveAnyway}>Continue Saving Anyway</button>
      </div>
    </div>);
  }

  return (<div>
    <div className="form-grid">
      <Field label="Province/City"><input type="text" value={f.provinceCity} onChange={set("provinceCity")} placeholder="e.g. Occidental Mindoro" /></Field>
      <Field label="Municipality" required>
        <input type="text" list="directory-municipality-options" value={f.municipality} onChange={set("municipality")} placeholder="e.g. Mamburao, or any municipality/province" />
        <datalist id="directory-municipality-options">
          {MUNICIPALITIES.map(m=><option key={m} value={m} />)}
        </datalist>
      </Field>
      <Field label="Name" required><input type="text" value={f.name} onChange={set("name")} placeholder="Full name" /></Field>
      <Field label="Position/Designation"><input type="text" value={f.position} onChange={set("position")} placeholder="e.g. Municipal Tourism Officer II" /></Field>
      <Field label="Office/Agency">
        <input type="text" list="directory-office-options" value={f.officeAgency} onChange={set("officeAgency")} placeholder="e.g. Municipal Tourism Office, MENRO, MSWDO" />
        <datalist id="directory-office-options">
          {(officeOptions||[]).map(o=><option key={o} value={o} />)}
        </datalist>
      </Field>
      <Field label="Contact Number"><input type="text" value={f.contact} onChange={set("contact")} /></Field>
      <Field label="Email Address"><input type="email" value={f.email} onChange={set("email")} /></Field>
      <Field label="Category" required>
        <select value={f.category} onChange={set("category")}>
          {DIRECTORY_CATEGORIES.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Year" required><input type="text" inputMode="numeric" value={f.year} onChange={set("year")} placeholder="e.g. 2026" /></Field>
      <Field label="Status">
        <select value={f.status} onChange={set("status")}>
          {DIRECTORY_STATUSES.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      </Field>
    </div>
    <div className="form-actions">
      <button className="btn" onClick={onCancel}>Cancel</button>
      <button className="btn btn-primary" onClick={submit}>Save Record</button>
    </div>
  </div>);
}

function directoryCategoryTone(category){
  if(category==="Elected Official") return "gold";
  if(category==="Department Head") return "navy";
  if(category==="Others") return "grey";
  return "teal"; // Tourism Officer, PTC Member
}

function DirectoryViewInfo({item, onEdit, onClose, isAdmin}){
  if(!item) return null;
  return (<div>
    <div className="view-readonly-banner"><Icon d={ICONS.eye} size={14} color="#1C6B6E" /> Read-only view — no changes can be made here. Use Edit to modify this record.</div>
    <div className="view-grid">
      <ViewField label="Province/City" value={item.provinceCity} />
      <ViewField label="Municipality" value={item.municipality} />
      <ViewField label="Name" value={item.name} />
      <ViewField label="Position/Designation" value={item.position} />
      <ViewField label="Office/Agency" value={item.officeAgency} />
      <ViewField label="Contact Number" value={item.contact} />
      <ViewField label="Email Address" value={item.email} />
      <ViewField label="Category" value={item.category} />
      <ViewField label="Year" value={item.year} />
      <ViewField label="Status" value={item.status} />
    </div>
    <div className="form-actions">
      <button className="btn" onClick={onClose}>Close</button>
      {isAdmin && (
        <button className="btn btn-primary" onClick={onEdit}><Icon d={ICONS.edit} size={13} color="#fff" /> Edit This Record</button>
      )}
    </div>
  </div>);
}

// Directory: general directory of tourism-related personnel (formerly "Tourism Officers
// Directory"). All records are non-destructively normalized via normalizeDirectoryRecord
// so existing officer entries keep working and display as "Tourism Officer".
function DirectorySection({data: rawData, setData, isAdmin}){
  const data = useMemo(()=>rawData.map(normalizeDirectoryRecord), [rawData]);

  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [banner, setBanner] = useState(null);
  const pageSize = 15;
  const [printing, setPrinting] = useState(false);

  const flashBanner = (type, text) => {
    setBanner({type, text});
    setTimeout(()=>setBanner(b => (b && b.text===text) ? null : b), 3500);
  };

  const options = useMemo(()=>({
    provinceCity: [...new Set(data.map(d=>d.provinceCity).filter(Boolean))].sort(),
    municipality: [...new Set(data.map(d=>d.municipality).filter(Boolean))].sort(),
    category: DIRECTORY_CATEGORIES,
    officeAgency: [...new Set(data.map(d=>d.officeAgency).filter(Boolean))].sort(),
    year: [...new Set(data.map(d=>d.year).filter(Boolean))].sort().reverse(),
    status: DIRECTORY_STATUSES,
  }), [data]);

  const filtered = useMemo(()=>{
    const q = search.trim().toLowerCase();
    return data.filter(d=>{
      if(filters.provinceCity && d.provinceCity!==filters.provinceCity) return false;
      if(filters.municipality && d.municipality!==filters.municipality) return false;
      if(filters.category && d.category!==filters.category) return false;
      if(filters.officeAgency && d.officeAgency!==filters.officeAgency) return false;
      if(filters.year && d.year!==filters.year) return false;
      if(filters.status && d.status!==filters.status) return false;
      if(q){
        const hay = [d.name,d.position,d.officeAgency,d.contact,d.email].join(" ").toLowerCase();
        if(!hay.includes(q)) return false;
      }
      return true;
    }).sort((a,b)=>(String(b.year)+a.name).localeCompare(String(a.year)+b.name));
  }, [data, filters, search]);

  useEffect(()=>{ setPage(1); }, [filters, search, data.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageClamped = Math.min(page, totalPages);
  const paged = filtered.slice((pageClamped-1)*pageSize, pageClamped*pageSize);

  const byMunicipality = useMemo(()=>{
    const m = {}; filtered.forEach(d=>{ if(d.municipality) m[d.municipality]=(m[d.municipality]||0)+1; });
    return Object.entries(m).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count);
  }, [filtered]);
  const byCategory = useMemo(()=>{
    const m = {}; filtered.forEach(d=>{ m[d.category]=(m[d.category]||0)+1; });
    return Object.entries(m).map(([name,value])=>({name,value}));
  }, [filtered]);

  const officeOptions = options.officeAgency;

  // ---- Print Report (Directory records) ----
  useEffect(()=>{
    if(!printing) return;
    const st = document.createElement("style");
    st.id = "dir-page-style";
    st.textContent = "@page { margin: 12mm; }";
    document.head.appendChild(st);
    document.body.classList.add("printing-directory");
    const cleanup = () => {
      document.body.classList.remove("printing-directory");
      const el = document.getElementById("dir-page-style");
      if(el) el.remove();
    };
    const done = () => { cleanup(); setPrinting(false); };
    window.addEventListener("afterprint", done, {once:true});
    const t = setTimeout(()=>window.print(), 200);
    return ()=>{ clearTimeout(t); window.removeEventListener("afterprint", done); cleanup(); };
  }, [printing]);

  const printList = useMemo(()=>{
    const muniSet = new Set(MUNICIPALITIES.map(m=>m.toLowerCase()));
    const isProvince = d => {
      const m = (d.municipality||"").trim().toLowerCase();
      return !m || !muniSet.has(m) || m === (d.provinceCity||"").trim().toLowerCase();
    };
    const cmp = (a,b) => String(a||"").localeCompare(String(b||""), undefined, {sensitivity:"base"});
    return [...filtered].sort((a,b)=>{
      const pa = isProvince(a) ? 0 : 1, pb = isProvince(b) ? 0 : 1;
      if(pa !== pb) return pa - pb;
      if(pa === 1){ const c = cmp(a.municipality, b.municipality); if(c) return c; }
      return cmp(a.name, b.name);
    });
  }, [filtered]);
  const printTitle = (() => {
    const plural = {"Elected Official":"Elected Officials","PTC Member":"PTC Members","Department Head":"Department Heads","Tourism Officer":"Tourism Officers","Others":"Others"};
    return filters.category ? (plural[filters.category] || filters.category) + " Directory" : "Directory";
  })();

  const printFilterText = (() => {
    const labels = {provinceCity:"Province/City", municipality:"Municipality", category:"Category", officeAgency:"Office/Agency", year:"Year", status:"Status"};
    const parts = Object.keys(labels).filter(k=>filters[k]).map(k=>labels[k]+": "+filters[k]);
    if(search.trim()) parts.push('Search: "'+search.trim()+'"');
    return parts.join("  |  ") || "None (all records)";
  })();

  const save = (f) => {
    if(modal.mode==="edit"){
      setData(prev=>prev.map(d=> d.id===modal.item.id ? {...f, id:d.id} : d));
      flashBanner("success", "Record updated successfully.");
    } else {
      setData(prev=>[...prev, {...f, id:"DIR-"+Date.now()}]);
      flashBanner("success", "Record added successfully.");
    }
    setModal(null);
  };
  const handleDelete = () => {
    setData(prev => prev.filter(d => d.id !== toDelete.id));
    setToDelete(null);
    flashBanner("success", "Record deleted.");
  };

  const exportSubset = (list, label) => {
    if (!isAdmin) { alert("View-only mode: only the admin can download data."); return; }
    if (!list.length) { flashBanner("error", "No records to export for this selection."); return; }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([DIRECTORY_HEADERS, ...buildDirectoryRows(list)]);
    ws['!cols'] = DIRECTORY_HEADERS.map(h => ({ wch: Math.max(14, h.length + 2) }));
    XLSX.utils.book_append_sheet(wb, ws, "Directory");
    XLSX.writeFile(wb, "Directory-" + label + "-" + timestamp() + ".xlsx");
  };
  const handleExportYear = () => {
    if(!filters.year){ flashBanner("error", "Select a Year filter first to export that year's records."); return; }
    exportSubset(data.filter(d=>d.year===filters.year), "Year-"+filters.year);
  };

  return (<div>
    {banner && <div className={"directory-banner " + (banner.type==="error"?"error":"success")}>{banner.text}</div>}

    <SingleSheetToolbar
      title="Directory" sheetName="Directory" headers={DIRECTORY_HEADERS} buildRows={buildDirectoryRows}
      data={data} setData={setData} parseRow={parseDirectoryRow}
      dedupeKey={d=>(d.name+"|"+d.municipality+"|"+d.year+"|"+d.category).toLowerCase()}
      idPrefix="DIR" isAdmin={isAdmin} filenamePrefix="Directory-All"
    />

    <div className="toolbar-row">
      <div className="view-toggle">
        <button className={view==="dashboard"?"active":""} onClick={()=>setView("dashboard")}>Dashboard</button>
        <button className={view==="records"?"active":""} onClick={()=>setView("records")}>Records</button>
      </div>
      <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center"}}>
        {view==="records" && (<>
          <button className="btn btn-outline-teal btn-sm" onClick={()=>{ if(!filtered.length){ flashBanner("error","No records to print for this selection."); return; } setPrinting(true); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1C6B6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> Print Report
          </button>
        </>)}
        {isAdmin && <button className="btn btn-outline-teal btn-sm" onClick={()=>exportSubset(filtered, "Filtered")}><Icon d={ICONS.download} size={13} color="#1C6B6E" /> Export Filtered</button>}
        {isAdmin && <button className="btn btn-outline-teal btn-sm" onClick={handleExportYear}><Icon d={ICONS.download} size={13} color="#1C6B6E" /> Export Selected Year</button>}
        {isAdmin && (
          <button className="btn btn-primary" onClick={()=>setModal({mode:"add"})}><Icon d={ICONS.plus} size={15} color="#fff" /> Add Record</button>
        )}
      </div>
    </div>

    <div className="directory-search search-wrap">
      <span className="search-icon"><Icon d={ICONS.search} size={13} /></span>
      <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Search by name, position/designation, office/agency, contact number, or email address" />
    </div>

    <FilterBar filters={filters} setFilters={setFilters} options={options} fields={[
      {key:"provinceCity", label:"Province/City"},
      {key:"municipality", label:"Municipality"},
      {key:"category", label:"Category"},
      {key:"officeAgency", label:"Office/Agency"},
      {key:"year", label:"Year"},
      {key:"status", label:"Status"},
    ]} />

    <div className="stat-cards">
      <StatCard label="Total Directory Records" value={filtered.length} />
      <StatCard label="Active" value={filtered.filter(d=>d.status==="Active").length} />
      <StatCard label="Inactive" value={filtered.filter(d=>d.status==="Inactive").length} />
      <StatCard label="Tourism Officers" value={filtered.filter(d=>d.category==="Tourism Officer").length} />
      <StatCard label="Elected Officials" value={filtered.filter(d=>d.category==="Elected Official").length} />
      <StatCard label="Department Heads" value={filtered.filter(d=>d.category==="Department Head").length} />
      <StatCard label="PTC Members" value={filtered.filter(d=>d.category==="PTC Member").length} />
      <StatCard label="Others" value={filtered.filter(d=>d.category==="Others").length} />
    </div>

    {view==="dashboard" ? (
      <div className="charts-grid">
        <div className="panel">
          <div className="panel-title">Per Municipality (current filters)</div>
          <BarList data={byMunicipality} color="#1C6B6E" />
        </div>
        <div className="panel">
          <div className="panel-title">Per Category (current filters)</div>
          <Donut data={byCategory} total={filtered.length} />
        </div>
      </div>
    ) : (
      <div>
        <div className="table-wrap">
          <table className="table-even">
            {(() => {
              const cols = ["Province/City","Municipality","Name","Position/Designation","Office/Agency","Contact Number","Email Address","Category","Year","Status","Actions"];
              const pct = (100/cols.length).toFixed(4)+"%";
              return (<React.Fragment>
                <colgroup>{cols.map(h=><col key={h} style={{width:pct}} />)}</colgroup>
                <thead><tr>{cols.map(h=><th key={h}>{h}</th>)}</tr></thead>
              </React.Fragment>);
            })()}
            <tbody>
              {paged.map((d,i)=>(
                <tr key={d.id} className={i%2?"odd":""}>
                  <td>{d.provinceCity || <span className="cell-sub">—</span>}</td>
                  <td>{d.municipality || <span className="cell-sub">—</span>}</td>
                  <td style={{fontWeight:600}}>{d.name}</td>
                  <td>{d.position || <span className="cell-sub">—</span>}</td>
                  <td>{d.officeAgency || <span className="cell-sub">—</span>}</td>
                  <td>{d.contact || <span className="cell-sub">—</span>}</td>
                  <td>{d.email || <span className="cell-sub">—</span>}</td>
                  <td><Pill tone={directoryCategoryTone(d.category)}>{d.category}</Pill></td>
                  <td>{d.year}</td>
                  <td><Pill tone={d.status==="Active"?"teal":"danger"}>{d.status}</Pill></td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-outline-teal btn-sm" onClick={()=>setModal({mode:"view", item:d})}>
                        <Icon d={ICONS.eye} size={13} color="#1C6B6E" /> View
                      </button>
                      {isAdmin && (<>
                        <button className="btn btn-primary btn-sm" onClick={()=>setModal({mode:"edit", item:d})}>
                          <Icon d={ICONS.edit} size={13} color="#fff" /> Edit
                        </button>
                        <button className="btn-ghost" onClick={()=>setToDelete(d)} title="Delete"><Icon d={ICONS.trash} color="#A8442D" /></button>
                      </>)}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan="11" className="empty-row">No directory records match these filters. Try adjusting your search or clearing filters.</td></tr>}
            </tbody>
          </table>
        </div>
        {filtered.length>0 && (
          <div className="directory-pagination">
            <span>Page {pageClamped} of {totalPages} · {filtered.length} record{filtered.length===1?"":"s"}</span>
            <button className="btn btn-sm" disabled={pageClamped<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Previous</button>
            <button className="btn btn-sm" disabled={pageClamped>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
          </div>
        )}
      </div>
    )}

    {modal && modal.mode==="view" && (
      <Modal title="Directory Record" onClose={()=>setModal(null)}>
        <DirectoryViewInfo item={modal.item} onClose={()=>setModal(null)} onEdit={()=>setModal({mode:"edit", item:modal.item})} isAdmin={isAdmin} />
      </Modal>
    )}
    {modal && isAdmin && (modal.mode==="edit" || modal.mode==="add") && (
      <Modal title={modal.mode==="edit" ? "Edit Directory Record" : "Add Directory Record"} onClose={()=>setModal(null)}>
        <DirectoryForm initial={modal.item} onCancel={()=>setModal(null)} onSave={save} existingData={data} officeOptions={officeOptions} />
      </Modal>
    )}
    {printing && ReactDOM.createPortal(
      <div className="dir-print-root">
        <div className="print-report-header">
          <img src={PGO_LOGO_URI} alt="Official Seal of the Province of Occidental Mindoro" />
          <div className="prh-text">
            <div className="prh-l1">Republic of the Philippines</div>
            <div className="prh-l2">Provincial Government of Occidental Mindoro</div>
            <div className="prh-l3">Provincial Tourism, Culture and Arts Division</div>
            <div className="prh-l4">Planning Development, Data Banking and Administrative Section</div>
          </div>
        </div>
        <div className="dir-title-block">
          <h3 className="dir-title">{printTitle}</h3>
          <p className="dir-sub">Filters applied: <b>{printFilterText}</b> &nbsp;|&nbsp; Total records: <b>{filtered.length}</b></p>
        </div>
        <table className="dir-print-table">
          <colgroup>
            <col style={{width:"12%"}} /><col style={{width:"13%"}} /><col style={{width:"17%"}} /><col style={{width:"18%"}} /><col style={{width:"16%"}} /><col style={{width:"11%"}} /><col style={{width:"13%"}} />
          </colgroup>
          <thead><tr>
            {["Province/City","Municipality","Name","Position/Designation","Office/Agency","Contact Number","Email Address"].map(h=><th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>
            {printList.map(d=>(
              <tr key={d.id}>
                <td>{d.provinceCity || "—"}</td>
                <td>{d.municipality || "—"}</td>
                <td style={{fontWeight:600}}>{d.name || "—"}</td>
                <td>{d.position || "—"}</td>
                <td>{d.officeAgency || "—"}</td>
                <td>{d.contact || "—"}</td>
                <td>{d.email || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="report-generated-note">
          <p>This report was generated through the Tourism Enterprise &amp; Attraction Inventory by the <strong>Provincial Tourism, Culture and Arts Division – Planning Development, Data Banking and Administrative Section</strong>. Figures reflect the records encoded in the system as of the date generated.</p>
          <p style={{marginTop:4}}>Prepared by: <strong>RYAN R. TAJONERA</strong>, Tourism Operations Officer II &nbsp;|&nbsp; Date generated: {new Date().toLocaleString("en-PH", {year:"numeric", month:"long", day:"numeric", hour:"numeric", minute:"2-digit"})}</p>
        </div>
      </div>,
      document.body
    )}
    {toDelete && (
      <ConfirmDialog text={'Delete the record for "'+toDelete.name+'" ('+(toDelete.municipality||"—")+', '+(toDelete.year||"—")+')? This cannot be undone.'} onCancel={()=>setToDelete(null)} onConfirm={handleDelete} />
    )}
  </div>);
}
