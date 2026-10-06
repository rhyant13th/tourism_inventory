/**
 * ACCREDITATION SCREEN: accreditation records, form and history.
 */

// =====================================================================
// ACCREDITATION SECTION (moved out of Enterprises — same data, same fields:
// each enterprise's accredHistory is read and saved on the establishment record)
// =====================================================================
function AccreditationViewInfo({item, onEdit, onClose, isAdmin}){
  if(!item) return null;
  const accredState = getAccredState(item);
  const latestAccred = latestAccredEntry(item);
  const history = sortAccredHistoryDesc(getAccredHistory(item));
  return (<div>
    <div className="view-readonly-banner"><Icon d={ICONS.eye} size={14} color="#1C6B6E" /> Read-only view — no changes can be made here. Use Edit to modify this record.</div>
    <div className="view-grid">
      <ViewField label="Name of Enterprise" value={item.name} />
      <ViewField label="Municipality" value={item.municipality} />
      <ViewField label="Classification" value={item.classification} />
      <ViewField label="Type" value={item.type} />
      <ViewField label="Status of Accreditation" value={accredState} />
      {latestAccred && (<React.Fragment>
        <ViewField label="Level of Accreditation" value={latestAccred.type} />
        <ViewField label="Accreditation Number" value={latestAccred.number} />
        <ViewField label="Accreditation Validity" value={latestAccred.validity ? formatDateDisplay(latestAccred.validity) : ""} />
      </React.Fragment>)}
    </div>

    <div style={{marginTop:14}}>
      <div className="view-field-label" style={{marginBottom:6}}>Accredited Years</div>
      <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:16}}>
        {establishmentAccreditedYears(item).length===0 ? (
          <span style={{fontSize:12, color:"var(--subtext)"}}>No accreditation records on file.</span>
        ) : establishmentAccreditedYears(item).map(y=><span key={y} className="pill pill-teal">{y}</span>)}
      </div>
      <div className="view-field-label" style={{marginBottom:6}}>Accreditation History</div>
      {history.length===0 ? (
        <div style={{fontSize:12, color:"var(--subtext)"}}>No accreditation history recorded.</div>
      ) : (
        <div className="table-wrap">
          <table style={{minWidth:"auto"}}>
            <thead><tr><th>Type</th><th>Number</th><th>Accreditation Date</th><th>Valid Until</th></tr></thead>
            <tbody>
              {history.map((h,idx)=>(
                <tr key={idx} className={idx%2?"odd":""}>
                  <td>{h.type||"—"}</td>
                  <td>{h.number||"—"}</td>
                  <td>{h.accredDate?formatDateDisplay(h.accredDate):"—"}</td>
                  <td>{h.validity?formatDateDisplay(h.validity):"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    <div className="form-actions">
      <button className="btn" onClick={onClose}>Close</button>
      {isAdmin && (
        <button className="btn btn-primary" onClick={onEdit}><Icon d={ICONS.edit} size={13} color="#fff" /> Edit Accreditation</button>
      )}
    </div>
  </div>);
}

function AccreditationForm({initial, onCancel, onSave, onDirtyChange}){
  const [f, setF] = useState(() => ({...initial, accredHistory: getAccredHistory(initial)}));
  const [confirmSave, setConfirmSave] = useState(null);
  const initialSnapshotRef = useRef({...initial, accredHistory: getAccredHistory(initial)});

  useEffect(() => {
    if(typeof onDirtyChange !== "function") return;
    onDirtyChange(diffEstablishment(initialSnapshotRef.current, f).length > 0);
  }, [f]);

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

  const submit = () => {
    const cleaned = {...f, accredHistory: normalizeAccredHistory(f.accredHistory)};
    const changes = diffEstablishment(initialSnapshotRef.current, cleaned);
    if(changes.length === 0){
      onSave(cleaned.accredHistory);
      return;
    }
    setConfirmSave({ changes, list: cleaned.accredHistory });
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
        <button className="btn btn-primary" onClick={()=>onSave(confirmSave.list)}>Confirm / Save Changes</button>
      </div>
    </div>);
  }

  return (<div>
    <div className="view-grid" style={{marginBottom:14}}>
      <ViewField label="Name of Enterprise" value={initial.name} />
      <ViewField label="Municipality" value={initial.municipality} />
      <ViewField label="Classification" value={initial.classification} />
      <ViewField label="Type" value={initial.type} />
    </div>
    <div className="form-grid">
      <Field label="Status of Accreditation">
        <div style={{display:"flex", alignItems:"center", gap:8, height:36}}>
          <span className={"pill " + (getAccredState(f)==="Accredited" ? "pill-teal" : getAccredState(f)==="Expired" ? "pill-danger" : "pill-grey")}>
            {getAccredState(f)}
          </span>
          <span style={{fontSize:11, color:"var(--subtext)"}}>Based on the Accreditation History below</span>
        </div>
      </Field>
      <div style={{gridColumn:"1 / -1"}}>
        <Field label="Accredited Years">
          <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
            {establishmentAccreditedYears(f).length===0 ? (
              <span style={{fontSize:12, color:"var(--subtext)"}}>No accreditation records yet — add an accreditation period below.</span>
            ) : (
              establishmentAccreditedYears(f).map(y=>(
                <span key={y} className="pill pill-teal">{y}</span>
              ))
            )}
          </div>
          <div style={{fontSize:11, color:"var(--subtext)", marginTop:6}}>
            Automatically calculated from the accreditation periods below — Regular covers 2 calendar years; Basic and N/A-No PAS Level (used for Secondary Enterprises) cover 1 year each, based on the actual dates on file.
          </div>
        </Field>
      </div>
      <div style={{gridColumn:"1 / -1"}}>
        <Field label="Accreditation History">
          <div style={{fontSize:11, color:"var(--subtext)", marginTop:-2, marginBottom:8}}>
            Record every past accreditation period — level, number, accreditation date, and validity date. All records are kept; the latest appears first.
          </div>
          {sortedAccredHistoryForForm(f.accredHistory).map(({h, idx})=>(
            <div key={idx} style={{display:"flex", gap:8, alignItems:"flex-end", marginBottom:8, flexWrap:"wrap"}}>
              <div style={{flex:"1 1 130px"}}>
                <div style={{fontSize:11, fontWeight:700, color:"var(--subtext)", marginBottom:4}}>Level of Accreditation</div>
                <select value={h.type} onChange={(e)=>updateHistoryEntry(idx,"type",e.target.value)}>
                  <option value="">Select level</option>
                  {accredLevelsForClassification(f.classification).map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{flex:"1 1 150px"}}>
                <div style={{fontSize:11, fontWeight:700, color:"var(--subtext)", marginBottom:4}}>Accreditation Number</div>
                <input type="text" value={h.number} onChange={(e)=>updateHistoryEntry(idx,"number",e.target.value)} placeholder="e.g. ACC-2020-0001" />
              </div>
              <div style={{flex:"1 1 140px"}}>
                <div style={{fontSize:11, fontWeight:700, color:"var(--subtext)", marginBottom:4}}>Accreditation Date</div>
                <input type="date" value={h.accredDate} onChange={(e)=>updateHistoryEntry(idx,"accredDate",e.target.value)} />
              </div>
              <div style={{flex:"1 1 140px"}}>
                <div style={{fontSize:11, fontWeight:700, color:"var(--subtext)", marginBottom:4}}>Valid Until</div>
                <input type="date" value={h.validity} onChange={(e)=>updateHistoryEntry(idx,"validity",e.target.value)} />
              </div>
              <div style={{flex:"1 1 110px", fontSize:12, color:"var(--subtext)"}}>
                {accredEntryCoverageYears(h).length>0 ? ("Covers: " + accredEntryCoverageYears(h).join(", ")) : ""}
              </div>
              <button type="button" className="btn-ghost" onClick={()=>removeHistoryEntry(idx)} title="Remove this period">
                <Icon d={ICONS.trash} color="#A8442D" />
              </button>
            </div>
          ))}
          {(!f.accredHistory || f.accredHistory.length===0) && (
            <div style={{fontSize:12, color:"var(--subtext)", marginBottom:8}}>No accreditation history recorded yet.</div>
          )}
          <button type="button" className="btn btn-outline-teal" onClick={addHistoryEntry}>
            <Icon d={ICONS.plus} size={13} color="#1C6B6E" /> Add Accreditation Period
          </button>
        </Field>
      </div>
    </div>
    <div className="form-actions">
      <button className="btn" onClick={onCancel}>Cancel</button>
      <button className="btn btn-primary" onClick={submit}>Save Changes</button>
    </div>
  </div>);
}

function AccreditationSection({data, setData, isAdmin}){
  const [view, setView] = useState("dashboard");
  const [filters, setFilters] = useState({});
  const [modal, setModal] = useState(null);
  const [statMunicipality, setStatMunicipality] = useState("");
  const [statYear, setStatYear] = useState(() => String(new Date().getFullYear()));
  const [formDirty, setFormDirty] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [printing, setPrinting] = useState(false);

  const options = useMemo(()=>({
    municipality: MUNICIPALITIES,
    classification: CLASSIFICATIONS,
    type: [...new Set(data.map(d=>d.type))].sort(),
    accredStatus: ["Accredited","Expired","Not Accredited"],
    year: [...new Set(data.flatMap(d=>establishmentAccreditedYears(d)))].sort(),
  }), [data]);

  const filtered = useMemo(()=>data.filter(d=>{
    if(filters.name && !d.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if(filters.municipality && d.municipality!==filters.municipality) return false;
    if(filters.classification && d.classification!==filters.classification) return false;
    if(filters.type && d.type!==filters.type) return false;
    if(filters.accredStatus && getAccredState(d)!==filters.accredStatus) return false;
    if(filters.year && !establishmentAccreditedYears(d).includes(filters.year)) return false;
    return true;
  }).sort((a,b)=>(a.municipality+a.name).localeCompare(b.municipality+b.name)), [data, filters]);

  const accredYearStats = useMemo(()=>{
    const counts = {};
    data.forEach(d=>{
      if(statMunicipality && d.municipality!==statMunicipality) return;
      establishmentAccreditedYears(d).forEach(y=>{ counts[y] = (counts[y]||0) + 1; });
    });
    return Object.entries(counts).map(([year,count])=>({year,count})).sort((a,b)=>a.year.localeCompare(b.year));
  }, [data, statMunicipality]);

  const accreditedInStatYear = useMemo(()=>{
    if(!statYear) return [];
    return data.filter(d=>{
      if(statMunicipality && d.municipality!==statMunicipality) return false;
      return establishmentAccreditedYears(d).includes(statYear);
    }).sort((a,b)=>(a.municipality+a.name).localeCompare(b.municipality+b.name));
  }, [data, statMunicipality, statYear]);

  // Same group as accreditedInStatYear, split by real-time status as of today —
  // e.g. "30 accredited for 2026" becomes "28 still valid today, 2 expired this year".
  const statYearBreakdown = useMemo(()=>{
    if(!statYear) return null;
    let valid = 0, expired = 0;
    accreditedInStatYear.forEach(d=>{
      if(establishmentYearRealtimeStatus(d, statYear)==="Expired") expired++; else valid++;
    });
    return { total: accreditedInStatYear.length, valid, expired };
  }, [accreditedInStatYear, statYear]);

  // How many accredited-for-that-year establishments fall under each type of enterprise
  // (e.g. Mabuhay Accommodation, Restaurant, Farm Tourism Camp).
  const statYearByType = useMemo(()=>{
    const m = {};
    accreditedInStatYear.forEach(d=>{ m[d.type] = (m[d.type]||0) + 1; });
    return Object.entries(m).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count);
  }, [accreditedInStatYear]);


  // Saves only the accreditation history onto the existing enterprise record.
  const saveAccred = (list) => {
    setData(prev=>prev.map(d=> d.id===modal.item.id ? {...d, accredHistory: list} : d));
    setFormDirty(false);
    setModal(null);
  };
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
      {view==="records" && (
        <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center"}}>
          <button className="btn btn-outline-teal btn-sm" onClick={()=>{ if(!filtered.length){ alert("No records to print for this selection."); return; } setPrinting(true); }}>
            <PrintIcon /> Print Report
          </button>
        </div>
      )}
    </div>

    {view==="dashboard" ? (
      <div>
        <div className="charts-grid">
          <div className="panel span-2">
            <div className="panel-title" style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8}}>
              <span>Accreditation History by Year</span>
              <div style={{minWidth:200}}>
                <select value={statMunicipality} onChange={(e)=>setStatMunicipality(e.target.value)}>
                  <option value="">All Municipalities</option>
                  {MUNICIPALITIES.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div style={{fontSize:12, color:"var(--subtext)", marginBottom:10}}>
              How many establishments were accredited during each year, based on each establishment's recorded accreditation history.
            </div>
            {accredYearStats.length===0 ? (
              <div style={{fontSize:13, color:"var(--subtext)"}}>No accreditation history recorded yet.</div>
            ) : (<React.Fragment>
              <BarList data={accredYearStats.map(s=>({name:s.year, count:s.count}))} color="#2B7A57" />
              <div className="table-wrap" style={{marginTop:14}}>
                <table style={{minWidth:"auto"}}>
                  <thead><tr><th>Accreditation Year</th><th>Number of Accredited Enterprises</th></tr></thead>
                  <tbody>
                    {accredYearStats.map((s,i)=>(
                      <tr key={s.year} className={i%2?"odd":""}><td>{s.year}</td><td>{s.count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </React.Fragment>)}
            <div style={{borderTop:"1px solid var(--border)", marginTop:16, paddingTop:14}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8, marginBottom:8}}>
                <div style={{fontWeight:700, fontSize:13}}>Accredited Enterprises by Year</div>
                <div style={{minWidth:180}}>
                  {/* FIXED: Dropdown options mapped directly from accredYearStats */}
                  <select value={statYear} onChange={(e)=>setStatYear(e.target.value)}>
                    <option value="">Select a year</option>
                    {accredYearStats.map(s=><option key={s.year} value={s.year}>{s.year}</option>)}
                  </select>
                </div>
              </div>
              {!statYear ? (
                <div style={{fontSize:12, color:"var(--subtext)"}}>Select a year above to list the establishments whose accreditation was valid during that year.</div>
              ) : accreditedInStatYear.length===0 ? (
                <div style={{fontSize:13, color:"var(--subtext)"}}>No establishments were accredited in {statYear}.</div>
              ) : (<React.Fragment>
                <div className="stat-cards" style={{marginBottom:14}}>
                  <StatCard label={"Accredited for " + statYear} value={statYearBreakdown.total} />
                  <StatCard label={"Still Valid (as of today)"} value={statYearBreakdown.valid} />
                  <StatCard label={"Expired (as of today)"} value={statYearBreakdown.expired} />
                </div>
                <div style={{fontWeight:700, fontSize:13, marginBottom:8}}>Accredited by Type of Enterprise ({statYear})</div>
                <BarList data={statYearByType} color="#C08A2E" />
                <div style={{fontWeight:700, fontSize:13, margin:"18px 0 8px"}}>Enterprises Accredited in {statYear}</div>
                <div className="table-wrap">
                  <table style={{minWidth:"auto"}}>
                    <thead><tr><th>Enterprise</th><th>Municipality</th><th>Type of Enterprise</th><th>Accreditation Level</th><th>Status (as of today)</th><th>Accredited Years</th></tr></thead>
                    <tbody>
                      {accreditedInStatYear.map((d,i)=>{
                        const yearEntry = accredEntryForYear(d, statYear);
                        return (
                        <tr key={d.id} className={i%2?"odd":""}>
                          <td>{d.name}</td>
                          <td>{d.municipality}</td>
                          <td>{d.type}</td>
                          <td>{(yearEntry && yearEntry.type) || "—"}</td>
                          <td>
                            <span className={"pill " + (establishmentYearRealtimeStatus(d, statYear)==="Expired" ? "pill-danger" : "pill-teal")}>
                              {establishmentYearRealtimeStatus(d, statYear)}
                            </span>
                          </td>
                          <td>{establishmentAccreditedYears(d).join(", ")}</td>
                        </tr>
                      );})}
                    </tbody>
                  </table>
                </div>
              </React.Fragment>)}
            </div>
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
          {key:"accredStatus", label:"Accreditation"},
          {key:"year", label:"Year"},
        ]} />
        <div className="table-wrap">
          <table>
            <thead><tr>{["Enterprise","Municipality","Classification","Type","Accreditation","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((d,i)=>{
                const accredState = getAccredState(d);
                const latestAccred = latestAccredEntry(d);
                return (
                <tr key={d.id} className={i%2?"odd":""}>
                  <td><div style={{fontWeight:600}}>{d.name}</div><div className="cell-sub">{d.address}</div></td>
                  <td>{d.municipality}</td>
                  <td>{d.classification}</td>
                  <td>{d.type}</td>
                  <td>
                    <Pill tone={accredState==="Accredited"?"teal":accredState==="Expired"?"danger":"gold"}>{accredState}</Pill>
                    {accredState==="Accredited" && latestAccred && latestAccred.type && <div className="cell-sub">{latestAccred.type}</div>}
                    {latestAccred && latestAccred.validity && <div className="cell-sub">{accredState==="Expired" ? "Expired on " : "Valid until "}{formatDateDisplay(latestAccred.validity)}</div>}
                    {establishmentAccreditedYears(d).length>0 && (
                      <div className="cell-sub">Accredited Years: {establishmentAccreditedYears(d).join(", ")}</div>
                    )}
                    {sortAccredHistoryDesc(getAccredHistory(d)).length>0 && (
                      <div className="cell-sub" style={{marginTop:4}}>
                        <div style={{fontWeight:600}}>History (latest → oldest):</div>
                        <ol style={{margin:"2px 0 0 16px", padding:0}}>
                          {sortAccredHistoryDesc(getAccredHistory(d)).map((h,idx)=>(
                            <li key={idx}>{accredEntryLabel(h)}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-outline-teal btn-sm" onClick={()=>{ setFormDirty(false); setModal({mode:"view", item:d}); }}>
                        <Icon d={ICONS.eye} size={13} color="#1C6B6E" /> View Info
                      </button>
                      {isAdmin && (
                        <button className="btn btn-primary btn-sm" onClick={()=>{ setFormDirty(false); setModal({mode:"edit", item:d}); }}>
                          <Icon d={ICONS.edit} size={13} color="#fff" /> Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
              {filtered.length===0 && <tr><td colSpan="6" className="empty-row">No establishments match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {modal && modal.mode==="view" && (
      <Modal title="Accreditation Information" onClose={()=>setModal(null)}>
        <AccreditationViewInfo
          item={modal.item}
          onClose={()=>setModal(null)}
          onEdit={()=>{ setFormDirty(false); setModal({mode:"edit", item:modal.item}); }}
          isAdmin={isAdmin}
        />
      </Modal>
    )}
    {modal && isAdmin && modal.mode==="edit" && (
      <Modal title="Edit Accreditation" onClose={requestCloseModal}>
        <AccreditationForm
          key={"accred-" + modal.item.id}
          initial={modal.item}
          onCancel={requestCloseModal}
          onSave={saveAccred}
          onDirtyChange={setFormDirty}
        />
      </Modal>
    )}
    {printing && <RecordsPrintReport {...buildAccreditationPrint(filtered, filters)} onDone={()=>setPrinting(false)} />}
    {showLeaveWarning && (
      <WarningDialog
        text="You have unsaved changes. Are you sure you want to leave without saving?"
        onStay={stayEditing}
        onDiscard={discardAndClose}
      />
    )}
  </div>);
}
