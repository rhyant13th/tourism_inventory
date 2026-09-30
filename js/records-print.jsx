/**
 * PRINT REPORT LAYOUT: the printable table shown when you press Print.
 */

function RecordsPrintReport({ title, filterText, total, headers, rows, colWidths, dense, onDone }){
  useEffect(()=>{
    const st = document.createElement("style");
    st.id = "rec-page-style";
    st.textContent = "@page { margin: 12mm; }";
    document.head.appendChild(st);
    document.body.classList.add("printing-directory");
    const cleanup = () => {
      document.body.classList.remove("printing-directory");
      const el = document.getElementById("rec-page-style");
      if(el) el.remove();
    };
    const done = () => { cleanup(); onDone(); };
    window.addEventListener("afterprint", done, {once:true});
    const t = setTimeout(()=>window.print(), 200);
    return ()=>{ clearTimeout(t); window.removeEventListener("afterprint", done); cleanup(); };
  }, []);
  const generatedOn = new Date().toLocaleString("en-PH", {year:"numeric", month:"long", day:"numeric", hour:"numeric", minute:"2-digit"});
  return ReactDOM.createPortal(
    <div className={"dir-print-root" + (dense ? " rec-dense" : "")}>
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
        <h3 className="dir-title">{title}</h3>
        <p className="dir-sub">Filters applied: <b>{filterText}</b> &nbsp;|&nbsp; Total records: <b>{total}</b></p>
      </div>
      <table className="dir-print-table">
        <colgroup>{colWidths.map((w,i)=><col key={i} style={{width:w+"%"}} />)}</colgroup>
        <thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r,i)=>(<tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>))}
        </tbody>
      </table>
    <div className="report-generated-note">
      <p>This report was generated through the Tourism Enterprise &amp; Attraction Inventory by the <strong>Provincial Tourism, Culture and Arts Division – Planning Development, Data Banking and Administrative Section</strong>. Figures reflect the records encoded in the system as of the date generated.</p>
      <p style={{marginTop:4}}>Prepared by: <strong>RYAN R. TAJONERA</strong>, Tourism Operations Officer II &nbsp;|&nbsp; Date generated: {generatedOn}</p>
    </div>
    </div>,
    document.body
  );
}
