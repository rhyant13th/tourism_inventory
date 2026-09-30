/**
 * CBTO SCREEN: community-based tourism organizations list and form.
 */

const emptyCbto = {
  municipality: "", nameAddress: "", contactPersonNumber: "",
  maleMembers: "", femaleMembers: "", natureOfActivity: "", purpose: "",
};

function CbtoForm({initial, onCancel, onSave}){
  const [f, setF] = useState(initial || emptyCbto);
  const set = (k) => (e) => {
    const v = e && e.target ? e.target.value : e;
    setF(prev=>({...prev, [k]: v}));
  };
  const submit = () => {
    if(!f.municipality || !f.nameAddress){
      alert("Please complete municipality and name/address of the CBTO.");
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
      <Field label="Name and Address of CBTO" required><input type="text" value={f.nameAddress} onChange={set("nameAddress")} placeholder="e.g. Sablayan Fisherfolk Tourism Assoc., Brgy. Poblacion" /></Field>
      <div style={{gridColumn:"1 / -1"}}>
        <Field label="Contact Person and Number"><input type="text" value={f.contactPersonNumber} onChange={set("contactPersonNumber")} placeholder="e.g. Juan Dela Cruz, 0917-000-0000" /></Field>
      </div>
      <Field label="Number of Male Members"><input type="text" inputMode="numeric" value={f.maleMembers} onChange={set("maleMembers")} placeholder="0" /></Field>
      <Field label="Number of Female Members"><input type="text" inputMode="numeric" value={f.femaleMembers} onChange={set("femaleMembers")} placeholder="0" /></Field>
      <div style={{gridColumn:"1 / -1"}}>
        <Field label="Total Members"><input type="text" value={cbtoTotalMembers(f)} disabled /></Field>
      </div>
      <div style={{gridColumn:"1 / -1"}}>
        <Field label="Nature of Activity in the Destination"><input type="text" value={f.natureOfActivity} onChange={set("natureOfActivity")} placeholder="e.g. Guided boat tours, mangrove conservation" /></Field>
      </div>
      <div style={{gridColumn:"1 / -1"}}>
        <Field label="Purpose / Objective"><input type="text" value={f.purpose} onChange={set("purpose")} placeholder="e.g. Livelihood generation for local fisherfolk" /></Field>
      </div>
    </div>
    <div className="form-actions">
      <button className="btn" onClick={onCancel}>Cancel</button>
      <button className="btn btn-primary" onClick={submit}>Save CBTO</button>
    </div>
  </div>);
}

function CbtoSection({data, setData, isAdmin}){
  const [view, setView] = useState("dashboard");
  const [printing, setPrinting] = useState(false);
  const [filters, setFilters] = useState({});
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const options = useMemo(()=>({ municipality: MUNICIPALITIES }), []);

  const filtered = useMemo(()=>data.filter(d=>{
    if(filters.nameAddress && !(d.nameAddress||"").toLowerCase().includes(filters.nameAddress.toLowerCase())) return false;
    if(filters.municipality && d.municipality!==filters.municipality) return false;
    return true;
  }).sort((a,b)=>(a.municipality+a.nameAddress).localeCompare(b.municipality+b.nameAddress)), [data, filters]);

  const byMunicipality = useMemo(()=>{
    const m = {}; data.forEach(d=>{ m[d.municipality]=(m[d.municipality]||0)+1; });
    return Object.entries(m).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count);
  }, [data]);

  const totalMale = data.reduce((s,d)=>s+(Number(d.maleMembers)||0),0);
  const totalFemale = data.reduce((s,d)=>s+(Number(d.femaleMembers)||0),0);

  const save = (f) => {
    if(modal.mode==="edit"){
      setData(prev=>prev.map(d=> d.id===modal.item.id ? {...f, id:d.id} : d));
    } else {
      setData(prev=>[...prev, {...f, id:"C-"+Date.now()}]);
    }
    setModal(null);
  };
  const handleDelete = () => {
    setData(prev => prev.filter(d => d.id !== toDelete.id));
    setToDelete(null);
  };

  return (<div>
    <SingleSheetToolbar
      title="CBTO" sheetName="CBTOs" headers={CBTO_HEADERS} buildRows={buildCbtoRows}
      data={data} setData={setData} parseRow={parseCbtoRow}
      dedupeKey={d=>(d.nameAddress+"|"+d.municipality).toLowerCase()}
      idPrefix="C" isAdmin={isAdmin} filenamePrefix="CBTO-Directory"
    />
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
          <button className="btn btn-primary" onClick={()=>setModal({mode:"add"})}><Icon d={ICONS.plus} size={15} color="#fff" /> Add CBTO</button>
        )}
      </div>
    </div>

    {view==="dashboard" ? (
      <div>
        <div className="stat-cards">
          <StatCard label="Total CBTOs" value={data.length} />
          <StatCard label="Total Members" value={totalMale+totalFemale} />
          <StatCard label="Male Members" value={totalMale} />
          <StatCard label="Female Members" value={totalFemale} />
          <StatCard label="Municipalities Covered" value={new Set(data.map(d=>d.municipality)).size} />
        </div>
        <div className="charts-grid">
          <div className="panel span-2">
            <div className="panel-title">CBTOs Per Municipality</div>
            <BarList data={byMunicipality} color="#1C6B6E" />
          </div>
        </div>
      </div>
    ) : (
      <div>
        <FilterBar filters={filters} setFilters={setFilters} options={options} fields={[
          {key:"nameAddress", label:"CBTO Name", type:"search", placeholder:"Search by name"},
          {key:"municipality", label:"Municipality"},
        ]} />
        <div className="table-wrap">
          <table>
            <thead><tr>{["Municipality","Name and Address of CBTO","Contact Person and Number","Male","Female","Total Members","Nature of Activity","Purpose/Objective","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((d,i)=>(
                <tr key={d.id} className={i%2?"odd":""}>
                  <td>{d.municipality}</td>
                  <td>{d.nameAddress}</td>
                  <td>{d.contactPersonNumber}</td>
                  <td>{d.maleMembers}</td>
                  <td>{d.femaleMembers}</td>
                  <td>{cbtoTotalMembers(d)}</td>
                  <td>{d.natureOfActivity}</td>
                  <td>{d.purpose}</td>
                  <td>
                    <div className="actions-cell">
                      {isAdmin && (<>
                        <button className="btn-ghost" onClick={()=>setModal({mode:"edit", item:d})}><Icon d={ICONS.edit} color="#1C6B6E" /></button>
                        <button className="btn-ghost" onClick={()=>setToDelete(d)}><Icon d={ICONS.trash} color="#A8442D" /></button>
                      </>)}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan="9" className="empty-row">No CBTOs match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {printing && <RecordsPrintReport {...buildCbtosPrint(filtered, filters)} onDone={()=>setPrinting(false)} />}
    {modal && isAdmin && (
      <Modal title={modal.mode==="edit" ? "Edit CBTO" : "Add CBTO"} onClose={()=>setModal(null)}>
        <CbtoForm initial={modal.item} onCancel={()=>setModal(null)} onSave={save} />
      </Modal>
    )}
    {toDelete && (
      <ConfirmDialog text={'Delete "'+toDelete.nameAddress+'"? This cannot be undone.'} onCancel={()=>setToDelete(null)} onConfirm={handleDelete} />
    )}
  </div>);
}
