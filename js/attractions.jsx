/**
 * ATTRACTIONS SCREEN: the tourist attractions list and its add/edit form.
 */

const emptyAttraction = {
  municipality: "", name: "", yearEstablished: "", selection: "Existing",
  physicalCondition: "", declarationStatus: "", category: "", code: "",
  remarks: "", latitude: "", longitude: ""
};

function AttractionForm({initial, onCancel, onSave}){
  const [f, setF] = useState(initial || emptyAttraction);
  const set = (k) => (e) => {
    const v = e && e.target ? e.target.value : e;
    setF(prev=>{
      const next = {...prev, [k]: v};
      if(k==="category") next.code = "";
      return next;
    });
  };
  const codeOptions = f.category ? ATTRACTION_CATEGORIES[f.category] : [];
  const submit = () => {
    if(!f.municipality || !f.name || !f.category || !f.code){
      alert("Please complete municipality, name, category, and code.");
      return;
    }
    onSave(f);
  };
  return (<div>
    <div className="form-grid">
      <Field label="Municipality" required>
        <select value={f.municipality} onChange={set("municipality")}>
          <option value="">Select municipality</option>
          {MUNICIPALITIES.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
      </Field>
      <Field label="Name of Attraction" required><input type="text" value={f.name} onChange={set("name")} placeholder="e.g. Apo Reef Natural Park" /></Field>
      <Field label="Year Established"><input type="text" value={f.yearEstablished} onChange={set("yearEstablished")} placeholder="e.g. 1930" /></Field>
      <Field label="Status">
        <select value={f.selection} onChange={set("selection")}>
          {ATTRACTION_SELECTIONS.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Physical Condition">
        <select value={f.physicalCondition||""} onChange={set("physicalCondition")}>
          <option value="">Select condition</option>
          {PHYSICAL_CONDITIONS.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Declaration Status">
        <select value={f.declarationStatus||""} onChange={set("declarationStatus")}>
          <option value="">Select status</option>
          {DECLARATION_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Attraction Category" required>
        <select value={f.category} onChange={set("category")}>
          <option value="">Select category</option>
          {Object.keys(ATTRACTION_CATEGORIES).map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Attraction Code" required>
        <select value={f.code} onChange={set("code")} disabled={!f.category}>
          <option value="">{f.category ? "Select code" : "Select category first"}</option>
          {codeOptions.map(o=><option key={o.code} value={o.code}>{o.code} — {o.label}</option>)}
        </select>
      </Field>
      <Field label="Latitude"><input type="text" value={f.latitude} onChange={set("latitude")} placeholder="e.g. 12.6625" /></Field>
      <Field label="Longitude"><input type="text" value={f.longitude} onChange={set("longitude")} placeholder="e.g. 120.4855" /></Field>
      <div style={{gridColumn:"1 / -1"}}>
        <Field label="Remarks / Description"><input type="text" value={f.remarks||""} onChange={set("remarks")} placeholder="Optional remarks or description of the attraction" /></Field>
      </div>
    </div>
    <div className="form-actions">
      <button className="btn" onClick={onCancel}>Cancel</button>
      <button className="btn btn-primary" onClick={submit}>Save Attraction</button>
    </div>
  </div>);
}

function AttractionsSection({data, setData, isAdmin}){
  const [view, setView] = useState("dashboard");
  const [printing, setPrinting] = useState(false);
  const [filters, setFilters] = useState({});
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const options = useMemo(()=>({
    municipality: MUNICIPALITIES,
    category: Object.keys(ATTRACTION_CATEGORIES),
    selection: ATTRACTION_SELECTIONS,
    physicalCondition: PHYSICAL_CONDITIONS,
    declarationStatus: DECLARATION_STATUSES,
  }), []);

  const filtered = useMemo(()=>data.filter(d=>{
    if(filters.name && !d.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if(filters.municipality && d.municipality!==filters.municipality) return false;
    if(filters.category && d.category!==filters.category) return false;
    if(filters.selection && d.selection!==filters.selection) return false;
    if(filters.physicalCondition && d.physicalCondition!==filters.physicalCondition) return false;
    if(filters.declarationStatus && d.declarationStatus!==filters.declarationStatus) return false;
    return true;
  }), [data, filters]);

  const byMunicipality = useMemo(()=>{
    const m = {}; data.forEach(d=>{ m[d.municipality]=(m[d.municipality]||0)+1; });
    return Object.entries(m).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count);
  }, [data]);
  const byCategory = useMemo(()=>{
    const m = {}; data.forEach(d=>{ m[d.category]=(m[d.category]||0)+1; });
    return Object.entries(m).map(([name,value])=>({name,value}));
  }, [data]);
  const byPhysicalCondition = useMemo(()=>{
    const m = {}; data.forEach(d=>{ const k = d.physicalCondition || "Not Specified"; m[k]=(m[k]||0)+1; });
    return Object.entries(m).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count);
  }, [data]);
  const byDeclarationStatus = useMemo(()=>{
    const m = {}; data.forEach(d=>{ const k = d.declarationStatus || "Not Specified"; m[k]=(m[k]||0)+1; });
    return Object.entries(m).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count);
  }, [data]);

  const save = (f) => {
    if(modal.mode==="edit"){
      setData(prev=>prev.map(d=> d.id===modal.item.id ? {...f, id:d.id} : d));
    } else {
      setData(prev=>[...prev, {...f, id:"A-"+Date.now()}]);
    }
    setModal(null);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(d => d.id !== toDelete.id));
    setToDelete(null);
  };

  return (<div>
    <div className="toolbar-row">
      <div className="view-toggle">
        <button className={view==="dashboard"?"active":""} onClick={()=>setView("dashboard")}>Dashboard</button>
        <button className={view==="records"?"active":""} onClick={()=>setView("records")}>Records</button>
      </div>
      <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center"}}>
        {view==="records" && (
          <button className="btn btn-outline-teal btn-sm" onClick={()=>{ if(!filtered.length){ alert("No records to print for this selection."); return; } setPrinting(true); }}>
            <PrintIcon /> Print Report
          </button>
        )}
        {isAdmin && (
          <button className="btn btn-primary" onClick={()=>setModal({mode:"add"})}><Icon d={ICONS.plus} size={15} color="#fff" /> Add Attraction</button>
        )}
      </div>
    </div>

    {view==="dashboard" ? (
      <div>
        <div className="stat-cards">
          <StatCard label="Total Attractions" value={data.length} />
          <StatCard label="Existing" value={data.filter(d=>d.selection==="Existing").length} />
          <StatCard label="Potential" value={data.filter(d=>d.selection==="Potential").length} />
          <StatCard label="Emerging" value={data.filter(d=>d.selection==="Emerging").length} />
          <StatCard label="Municipalities Covered" value={new Set(data.map(d=>d.municipality)).size} />
          <StatCard label="Declared (National/Local)" value={data.filter(d=>d.declarationStatus==="Nationally Declared"||d.declarationStatus==="Locally Declared").length} />
          <StatCard label="Good / Excellent Condition" value={data.filter(d=>d.physicalCondition==="Good"||d.physicalCondition==="Excellent").length} />
        </div>
        <div className="charts-grid">
          <div className="panel">
            <div className="panel-title">Per Municipality</div>
            <BarList data={byMunicipality} color="#1C6B6E" />
          </div>
          <div className="panel">
            <div className="panel-title">Per Category</div>
            <Donut data={byCategory} total={data.length} />
          </div>
          <div className="panel span-2">
            <div className="panel-title">Per Physical Condition</div>
            <BarList data={byPhysicalCondition} color="#C08A2E" />
          </div>
          <div className="panel span-2">
            <div className="panel-title">Per Declaration Status</div>
            <BarList data={byDeclarationStatus} color="#0E3B3C" />
          </div>
        </div>
      </div>
    ) : (
      <div>
        <FilterBar filters={filters} setFilters={setFilters} options={options} fields={[
          {key:"name", label:"Attraction", type:"search", placeholder:"Search by name"},
          {key:"municipality", label:"Municipality"},
          {key:"category", label:"Category"},
          {key:"selection", label:"Status"},
          {key:"physicalCondition", label:"Physical Condition"},
          {key:"declarationStatus", label:"Declaration Status"},
        ]} />
        <div className="table-wrap">
          <table className="table-even">
            {(() => {
              const cols = ["Attraction","Municipality","Category","Code","Status","Physical Condition","Declaration Status","Remarks / Description","Actions"];
              const pct = (100/cols.length).toFixed(4)+"%";
              return (<React.Fragment>
                <colgroup>{cols.map(h=><col key={h} style={{width:pct}} />)}</colgroup>
                <thead><tr>{cols.map(h=><th key={h}>{h}</th>)}</tr></thead>
              </React.Fragment>);
            })()}
            <tbody>
              {filtered.map((d,i)=>(
                <tr key={d.id} className={i%2?"odd":""}>
                  <td><div style={{fontWeight:600}}>{d.name}</div></td>
                  <td>{d.municipality}</td>
                  <td>{d.category}</td>
                  <td>{d.code}</td>
                  <td><Pill tone="teal">{d.selection}</Pill></td>
                  <td>{d.physicalCondition ? <Pill tone={conditionTone(d.physicalCondition)}>{d.physicalCondition}</Pill> : <span className="cell-sub">—</span>}</td>
                  <td>{d.declarationStatus ? <Pill tone={declarationTone(d.declarationStatus)}>{d.declarationStatus}</Pill> : <span className="cell-sub">—</span>}</td>
                  <td>{d.remarks || <span className="cell-sub">—</span>}</td>
                  <td>
                    <div style={{display:"flex",gap:10}}>
                      {isAdmin && (
                        <>
                          <button className="btn-ghost" onClick={()=>setModal({mode:"edit", item:d})}><Icon d={ICONS.edit} color="#1C6B6E" /></button>
                          <button className="btn-ghost" onClick={()=>setToDelete(d)}><Icon d={ICONS.trash} color="#A8442D" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan="9" className="empty-row">No attractions match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {printing && <RecordsPrintReport {...buildAttractionsPrint(filtered, filters)} onDone={()=>setPrinting(false)} />}
    {modal && isAdmin && (
      <Modal title={modal.mode==="edit" ? "Edit Attraction" : "Add Attraction"} onClose={()=>setModal(null)}>
        <AttractionForm initial={modal.item} onCancel={()=>setModal(null)} onSave={save} />
      </Modal>
    )}
    {toDelete && (
      <ConfirmDialog text={'Delete "'+toDelete.name+'"? This cannot be undone.'} onCancel={()=>setToDelete(null)} onConfirm={handleDelete} />
    )}
  </div>);
}
