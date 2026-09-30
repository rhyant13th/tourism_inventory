/**
 * ENTERPRISES SCREEN: the enterprise list, add/edit form and read-only view.
 */

const emptyEstablishment = {
  name: "", proprietor: "", email: "", municipality: "", classification: "",
  type: "", address: "", contact: "", rooms: "", maleEmployees: "",
  femaleEmployees: "", remarks: "",
  accredHistory: [], status: "Active", statusOthers: "", year: "",
  tourlista: "No"
};

// Tour Guides don't have rooms, employees, or a proprietor in the usual sense — those
// fields are auto-filled with "N/A" and locked whenever the enterprise type is Tour Guides.
function applyTourGuideAutoFields(obj){
  if(obj && obj.type === "Tour Guides"){
    return {...obj, proprietor: "N/A", rooms: "N/A", maleEmployees: "N/A", femaleEmployees: "N/A"};
  }
  return obj;
}

function EstablishmentForm({initial, onCancel, onSave, existingData, mode, onDirtyChange}){
  const [f, setF] = useState(() => applyTourGuideAutoFields(initial ? {...initial, accredHistory: getAccredHistory(initial)} : emptyEstablishment));
  const [dupeWarning, setDupeWarning] = useState(null);
  const [confirmSave, setConfirmSave] = useState(null);
  const initialSnapshotRef = useRef(applyTourGuideAutoFields(initial ? {...initial, accredHistory: getAccredHistory(initial)} : emptyEstablishment));

  useEffect(() => {
    if(typeof onDirtyChange !== "function") return;
    const baseline = initialSnapshotRef.current;
    const isDirty = diffEstablishment(baseline, f).length > 0;
    onDirtyChange(isDirty);
  }, [f]);
  
  const set = (k) => (e) => {
    const v = e && e.target ? e.target.value : e;
    setF(prev=>{
      const next = {...prev, [k]: v};
      if(k==="classification") next.type = "";
      if(k==="status" && v!=="Others") next.statusOthers = "";
      if(k==="type" && prev.type==="Tour Guides" && v!=="Tour Guides"){
        // leaving Tour Guides — clear the auto-filled N/A so the fields are editable again
        ["proprietor","rooms","maleEmployees","femaleEmployees"].forEach(key=>{ if(next[key]==="N/A") next[key]=""; });
      }
      return applyTourGuideAutoFields(next);
    });
  };

  const addHistoryEntry = () => {
    setF(prev => ({...prev, accredHistory: [...(prev.accredHistory||[]), {type:"", number:"", accredDate:"", validity:""}]}));
  };
  const updateHistoryEntry = (idx, key, value) => {
    setF(prev => {
      const next = (prev.accredHistory||[]).slice();
      next[idx] = {...next[idx], [key]: value};
      return {...prev, accredHistory: next};
    });
  };
  const removeHistoryEntry = (idx) => {
    setF(prev => {
      const next = (prev.accredHistory||[]).slice();
      next.splice(idx,1);
      return {...prev, accredHistory: next};
    });
  };
  const typeOptions = f.classification==="Primary Enterprises" ? PRIMARY_TYPES : f.classification==="Secondary Enterprises" ? SECONDARY_TYPES : [];
  const isTourGuide = f.type === "Tour Guides";

  const finalizeSave = (cleanedForm) => {
    if(mode === "edit"){
      const changes = diffEstablishment(initialSnapshotRef.current, cleanedForm);
      if(changes.length === 0){
        onSave(cleanedForm);
        return;
      }
      setConfirmSave({ changes, formToSave: cleanedForm });
      return;
    }
    onSave(cleanedForm);
  };

  const submit = () => {
    if(!f.municipality || !f.name || !f.classification || !f.type){
      alert("Please complete municipality, name, classification, and type.");
      return;
    }
    const cleanedForm = applyTourGuideAutoFields({...f, accredHistory: normalizeAccredHistory(f.accredHistory)});
    const dupes = findPossibleDuplicates(cleanedForm.name, existingData, cleanedForm.id);
    if(dupes.length){
      setF(cleanedForm);
      setDupeWarning(dupes);
      return;
    }
    finalizeSave(cleanedForm);
  };
  const confirmSaveAnyway = () => {
    setDupeWarning(null);
    finalizeSave({...f, accredHistory: normalizeAccredHistory(f.accredHistory)});
  };

  if(confirmSave){
    return (<div>
      <div className="warning-box">
        <div style={{fontWeight:700, color:"var(--navy)", fontSize:15, marginBottom:6}}>Confirm Changes</div>
        <div style={{fontSize:13, color:"var(--text)", marginBottom:12}}>
          You are about to update this establishment. Do you want to proceed with saving these changes?
        </div>
        <div style={{background:"#fff", border:"1px solid var(--border)", borderRadius:8, overflow:"hidden"}}>
          {confirmSave.changes.map((c,idx)=>(
            <div className="change-summary-item" key={c.key || idx}>
              <div style={{fontWeight:600, fontSize:13, color:"var(--navy)"}}>{c.label}</div>
              <div style={{fontSize:12, color:"var(--subtext)"}}>{c.from} → {c.to}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button className="btn" onClick={()=>setConfirmSave(null)}>Cancel / Go Back</button>
        <button className="btn btn-primary" onClick={()=>onSave(confirmSave.formToSave)}>Confirm / Save Changes</button>
      </div>
    </div>);
  }

  if(dupeWarning){
    return (<div>
      <div style={{background:"var(--danger-soft)", border:"1px solid var(--danger)", borderRadius:10, padding:16}}>
        <div style={{fontWeight:700, color:"var(--danger)", fontSize:15, marginBottom:6}}>Possible Duplicate Enterprise</div>
        <div style={{fontSize:13, color:"var(--text)", marginBottom:12}}>
          An establishment with the same or similar name already exists. Please check the existing records before saving.
        </div>
        <div style={{background:"#fff", border:"1px solid var(--border)", borderRadius:8, overflow:"hidden"}}>
          {dupeWarning.map(d=>(
            <div key={d.id} style={{padding:"8px 12px", borderTop:"1px solid var(--border)"}}>
              <div style={{fontWeight:600, fontSize:13}}>{d.name}</div>
              <div style={{fontSize:12, color:"var(--subtext)"}}>{d.municipality || "No municipality on record"}</div>
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
      <Field label="Name of Enterprise" required><input type="text" value={f.name} onChange={set("name")} placeholder="e.g. Bayfront Hotel" /></Field>
      <Field label="Municipality" required>
        <select value={f.municipality} onChange={set("municipality")}>
          <option value="">Select municipality</option>
          {MUNICIPALITIES.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
      </Field>
      <Field label="Proprietor / Owner">
        <input type="text" value={f.proprietor} onChange={set("proprietor")} placeholder="Full name of proprietor or owner" disabled={isTourGuide} />
      </Field>
      <Field label="Classification" required>
        <select value={f.classification} onChange={set("classification")}>
          <option value="">Select classification</option>
          {CLASSIFICATIONS.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Type" required>
        <select value={f.type} onChange={set("type")} disabled={!f.classification}>
          <option value="">{f.classification ? "Select type" : "Select classification first"}</option>
          {typeOptions.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Address"><input type="text" value={f.address} onChange={set("address")} placeholder="Street, Barangay" /></Field>
      <Field label="Contact Number"><input type="text" value={f.contact} onChange={set("contact")} placeholder="09XX-XXX-XXXX" /></Field>
      <Field label="Email Address">
        <input type="email" value={f.email} onChange={set("email")} placeholder="example@email.com" />
      </Field>
      <Field label="Number of Rooms"><input type="text" value={f.rooms} onChange={set("rooms")} placeholder="0" disabled={isTourGuide} /></Field>
      <Field label="Male Employees"><input type="text" value={f.maleEmployees} onChange={set("maleEmployees")} placeholder="0" disabled={isTourGuide} /></Field>
      <Field label="Female Employees"><input type="text" value={f.femaleEmployees} onChange={set("femaleEmployees")} placeholder="0" disabled={isTourGuide} /></Field>
      <Field label="Remarks"><input type="text" value={f.remarks} onChange={set("remarks")} placeholder="Optional remarks" /></Field>
      <Field label="Year (Established / Registered)"><input type="text" value={f.year} onChange={set("year")} placeholder="e.g. 2021" /></Field>
      <Field label="Status of Enterprise">
        <select value={f.status} onChange={set("status")}>
          {ESTAB_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      {f.status==="Others" && (
        <Field label="Please specify"><input type="text" value={f.statusOthers} onChange={set("statusOthers")} placeholder="Specify status" /></Field>
      )}
      <Field label="Registered on TourLISTA?">
        <select value={f.tourlista||"No"} onChange={set("tourlista")}>
          {TOURLISTA_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      </Field>
    </div>
    <div className="form-actions">
      <button className="btn" onClick={onCancel}>Cancel</button>
      <button className="btn btn-primary" onClick={submit}>{mode==="edit" ? "Save Changes" : "Save Enterprise"}</button>
    </div>
  </div>);
}

function EstablishmentViewInfo({item, onEdit, onClose, isAdmin}){
  if(!item) return null;
  return (<div>
    <div className="view-readonly-banner"><Icon d={ICONS.eye} size={14} color="#1C6B6E" /> Read-only view — no changes can be made here. Use Edit to modify this record.</div>
    <div className="view-grid">
      <ViewField label="Name of Enterprise" value={item.name} />
      <ViewField label="Municipality" value={item.municipality} />
      <ViewField label="Proprietor / Owner" value={item.proprietor} />
      <ViewField label="Classification" value={item.classification} />
      <ViewField label="Type" value={item.type} />
      <ViewField label="Address" value={item.address} />
      <ViewField label="Contact Number" value={item.contact} />
      <ViewField label="Email Address" value={item.email} />
      <ViewField label="Number of Rooms" value={item.rooms} />
      <ViewField label="Male Employees" value={item.maleEmployees} />
      <ViewField label="Female Employees" value={item.femaleEmployees} />
      <ViewField label="Total Employees" value={totalEmployees(item)} />
      <ViewField label="Remarks" value={item.remarks} />
      <ViewField label="Year Established / Registered" value={item.year} />
      <ViewField label="Status of Enterprise" value={item.status==="Others" && item.statusOthers ? item.statusOthers : item.status} />
      <ViewField label="Registered on TourLISTA?" value={item.tourlista||"No"} />
    </div>

    <div className="form-actions">
      <button className="btn" onClick={onClose}>Close</button>
      {isAdmin && (
        <button className="btn btn-primary" onClick={onEdit}><Icon d={ICONS.edit} size={13} color="#fff" /> Edit This Enterprise</button>
      )}
    </div>
  </div>);
}

function EstablishmentsSection({data, setData, isAdmin}){
  const [view, setView] = useState("dashboard");
  const [filters, setFilters] = useState({});
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);

  const options = useMemo(()=>({
    municipality: MUNICIPALITIES,
    type: [...new Set(data.map(d=>d.type))].sort(),
    classification: CLASSIFICATIONS,
    tourlista: TOURLISTA_OPTIONS,
    status: ESTAB_STATUSES,
    year: [...new Set(data.map(d=>d.year).filter(Boolean))].sort().reverse(),
  }), [data]);

  const filtered = useMemo(()=>data.filter(d=>{
    if(filters.name && !d.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if(filters.municipality && d.municipality!==filters.municipality) return false;
    if(filters.classification && d.classification!==filters.classification) return false;
    if(filters.type && d.type!==filters.type) return false;
    if(filters.status && d.status!==filters.status) return false;
    if(filters.tourlista && (d.tourlista||"No")!==filters.tourlista) return false;
    if(filters.year && d.year!==filters.year) return false;
    return true;
  }).sort((a,b)=>(a.municipality+a.name).localeCompare(b.municipality+b.name)), [data, filters]);

  const byMunicipality = useMemo(()=>{
    const m = {}; data.forEach(d=>{ m[d.municipality]=(m[d.municipality]||0)+1; });
    return Object.entries(m).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count);
  }, [data]);
  const byClassification = useMemo(()=>{
    const m = {}; data.forEach(d=>{ m[d.classification]=(m[d.classification]||0)+1; });
    return Object.entries(m).map(([name,value])=>({name,value}));
  }, [data]);
  const byType = useMemo(()=>{
    const m = {}; data.forEach(d=>{ m[d.type]=(m[d.type]||0)+1; });
    return Object.entries(m).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count);
  }, [data]);

  const save = (f) => {
    if(modal.mode==="edit"){
      setData(prev=>prev.map(d=> d.id===modal.item.id ? {...f, id:d.id} : d));
    } else {
      setData(prev=>[...prev, {...f, id:"E-"+Date.now()}]);
    }
    setFormDirty(false);
    setModal(null);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(d => d.id !== toDelete.id));
    setToDelete(null);
  };

  // Guarded close: if the edit/add form has unsaved changes, ask before discarding.
  const requestCloseModal = () => {
    if(modal && modal.mode !== "view" && formDirty){
      setShowLeaveWarning(true);
    } else {
      setModal(null);
      setFormDirty(false);
    }
  };
  const stayEditing = () => setShowLeaveWarning(false);
  const discardAndClose = () => {
    setShowLeaveWarning(false);
    setFormDirty(false);
    setModal(null);
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
          <button className="btn btn-primary" onClick={()=>{ setFormDirty(false); setModal({mode:"add"}); }}><Icon d={ICONS.plus} size={15} color="#fff" /> Add Enterprise</button>
        )}
      </div>
    </div>

    {view==="dashboard" ? (
      <div>
        <div className="stat-cards">
          <StatCard label="Total Enterprises" value={data.length} />
          <StatCard label="Currently Operating (Active)" value={data.filter(d=>d.status==="Active").length} />
          <StatCard label="Not Active" value={data.filter(d=>d.status!=="Active").length} />
          <StatCard label="On TourLISTA" value={data.filter(d=>d.tourlista==="Yes").length} />
          <StatCard label="Total Employees" value={data.reduce((sum,d)=>sum+totalEmployees(d),0)} />
          <StatCard label="Total Employees (TourLISTA-Registered)" value={data.filter(d=>d.tourlista==="Yes").reduce((sum,d)=>sum+totalEmployees(d),0)} />
          <StatCard label="Municipalities Covered" value={new Set(data.map(d=>d.municipality)).size} />
        </div>
        <div className="charts-grid">
          <div className="panel">
            <div className="panel-title">Per Municipality</div>
            <BarList data={byMunicipality} color="#1C6B6E" />
          </div>
          <div className="panel">
            <div className="panel-title">Per Classification</div>
            <Donut data={byClassification} total={data.length} />
          </div>
          <div className="panel span-2">
            <div className="panel-title">Per Type</div>
            <BarList data={byType} color="#C08A2E" />
          </div>
        </div>
      </div>
    ) : (
      <div>
        <FilterBar filters={filters} setFilters={setFilters} options={options} fields={[
          {key:"name", label:"Enterprise", type:"search", placeholder:"Search by name"},
          {key:"municipality", label:"Municipality"},
          {key:"classification", label:"Classification"},
          {key:"type", label:"Type"},
          {key:"status", label:"Status"},
          {key:"tourlista", label:"TourLISTA"},
          {key:"year", label:"Year"},
        ]} />
        <div className="table-wrap">
          <table>
            <thead><tr>{["Enterprise","Municipality","Rooms","Male","Female","Total Employees","Type","TourLISTA","Status","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((d,i)=>{
                return (
                <tr key={d.id} className={i%2?"odd":""}>
                  <td><div style={{fontWeight:600}}>{d.name}</div><div className="cell-sub">{d.address}</div></td>
                  <td>{d.municipality}</td><td>{d.rooms}</td><td>{d.maleEmployees}</td><td>{d.femaleEmployees}</td>
                  <td>{totalEmployees(d)}</td>
                  <td>{d.type}</td>
                  <td><Pill tone={d.tourlista==="Yes"?"teal":"gold"}>{d.tourlista==="Yes"?"Yes":"No"}</Pill></td>
                  <td><Pill tone={d.status==="Active"?"teal":d.status==="Not Active"?"danger":"gold"}>{d.status==="Others" && d.statusOthers ? d.statusOthers : d.status}</Pill></td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-outline-teal btn-sm" onClick={()=>{ setFormDirty(false); setModal({mode:"view", item:d}); }}>
                        <Icon d={ICONS.eye} size={13} color="#1C6B6E" /> View Info
                      </button>
                      {isAdmin && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={()=>{ setFormDirty(false); setModal({mode:"edit", item:d}); }}>
                            <Icon d={ICONS.edit} size={13} color="#fff" /> Edit
                          </button>
                          <button className="btn-ghost" onClick={()=>setToDelete(d)} title="Delete"><Icon d={ICONS.trash} color="#A8442D" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
              {filtered.length===0 && <tr><td colSpan="10" className="empty-row">No establishments match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {modal && modal.mode==="view" && (
      <Modal title="Enterprise Information" onClose={()=>setModal(null)}>
        <EstablishmentViewInfo
          item={modal.item}
          onClose={()=>setModal(null)}
          onEdit={()=>{ setFormDirty(false); setModal({mode:"edit", item:modal.item}); }}
          isAdmin={isAdmin}
        />
      </Modal>
    )}
    {modal && isAdmin && (modal.mode==="edit" || modal.mode==="add") && (
      <Modal title={modal.mode==="edit" ? "Edit Enterprise" : "Add Enterprise"} onClose={requestCloseModal}>
        <EstablishmentForm
          key={modal.mode + (modal.item ? modal.item.id : "new")}
          mode={modal.mode}
          initial={modal.item}
          onCancel={requestCloseModal}
          onSave={save}
          onDirtyChange={setFormDirty}
          existingData={data}
        />
      </Modal>
    )}
    {printing && <RecordsPrintReport {...buildEnterprisesPrint(filtered, filters)} onDone={()=>setPrinting(false)} />}
    {showLeaveWarning && (
      <WarningDialog
        text="You have unsaved changes. Are you sure you want to leave without saving?"
        onStay={stayEditing}
        onDiscard={discardAndClose}
      />
    )}
    {toDelete && (
      <ConfirmDialog text={'Delete "'+toDelete.name+'"? This cannot be undone.'} onCancel={()=>setToDelete(null)} onConfirm={handleDelete} />
    )}
  </div>);
}
