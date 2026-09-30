/**
 * BACKUP TOOLBAR: Excel backup / restore buttons above each screen.
 */

function BackupToolbar({ establishments, attractions, setEstablishments, setAttractions, cloudStatus, lastSaved, cloudError, onSave, isAdmin }){
  const fileRef = useRef(null);

  const handleExport = () => {
    if (!isAdmin) {
      alert("View-only mode: only the admin can download data.");
      return;
    }
    exportInventoryWorkbook(establishments, attractions);
  };

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "array", cellDates: true });
        const { establishments: newEstab, estabSkipped, attractions: newAttr, attrSkipped } = parseImportedWorkbook(wb);

        const existingEstabKeys = new Set(establishments.map(d => (d.name+"|"+d.municipality).toLowerCase()));
        const estabToAdd = [];
        let estabDup = 0;
        newEstab.forEach(d => {
          const key = (d.name+"|"+d.municipality).toLowerCase();
          if(existingEstabKeys.has(key)){ estabDup++; return; }
          existingEstabKeys.add(key);
          estabToAdd.push({ ...d, id: "E-import-"+Date.now()+"-"+Math.random().toString(36).slice(2,7) });
        });

        const existingAttrKeys = new Set(attractions.map(d => (d.name+"|"+d.municipality).toLowerCase()));
        const attrToAdd = [];
        let attrDup = 0;
        newAttr.forEach(d => {
          const key = (d.name+"|"+d.municipality).toLowerCase();
          if(existingAttrKeys.has(key)){ attrDup++; return; }
          existingAttrKeys.add(key);
          attrToAdd.push({ ...d, id: "A-import-"+Date.now()+"-"+Math.random().toString(36).slice(2,7) });
        });

        if(estabToAdd.length) setEstablishments(prev => [...prev, ...estabToAdd]);
        if(attrToAdd.length) setAttractions(prev => [...prev, ...attrToAdd]);

        alert(
          "Import complete.\n\n" +
          "Enterprises added: " + estabToAdd.length + "\n" +
          "Enterprises skipped (missing required fields): " + estabSkipped + "\n" +
          "Enterprises skipped (already in inventory): " + estabDup + "\n\n" +
          "Attractions added: " + attrToAdd.length + "\n" +
          "Attractions skipped (missing required fields): " + attrSkipped + "\n" +
          "Attractions skipped (already in inventory): " + attrDup
        );
      } catch(err){
        alert("Could not read this file. Please upload the .xlsx backup file with the original 'Enterprises' and 'Attractions' sheets, unedited headers.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const statusText = cloudStatus === "loading" ? "Loading saved data…"
    : cloudStatus === "saving" ? "Saving…"
    : cloudStatus === "error" ? (cloudError || "Could not reach the cloud — check your connection.")
    : lastSaved ? "Last saved: " + new Date(lastSaved).toLocaleString()
    : "Not saved yet.";

  return (<div className="data-toolbar">
    <div className="grow"><b>Backup &amp; Submission:</b> {isAdmin
      ? "Download the inventory as an Excel file to back up or submit to the national agency — fill it in (here or offline), then upload it back to bulk-add records instead of encoding one by one."
      : "You are in view-only mode. Download, upload, and save actions are available only to the administrator."}
      <div style={{fontSize:12, color: cloudStatus==="error" ? "#A8442D" : "#5E6E6A", marginTop:4}}>{statusText}</div>
    </div>
    {isAdmin && (
      <button className="btn btn-primary" onClick={onSave} disabled={cloudStatus==="saving"}><Icon d={ICONS.download} size={14} color="#fff" /> {cloudStatus==="saving" ? "Saving…" : "Save"}</button>
    )}
    {isAdmin && (
      <button className="btn btn-outline-teal" onClick={handleExport}><Icon d={ICONS.download} size={14} color="#1C6B6E" /> Download Excel Backup</button>
    )}
    {isAdmin && (
      <button className="btn btn-outline-gold" onClick={()=>fileRef.current.click()}><Icon d={ICONS.upload} size={14} color="#8A5F16" /> Upload Encoded Excel</button>
    )}
    <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} />
  </div>);
}
