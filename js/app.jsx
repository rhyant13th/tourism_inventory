/**
 * MAIN APP: login check, loading/saving, left menu and which screen is shown.
 * Keep this file LAST in the script list in index.html.
 */

function App(){
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [tab, setTab] = useState("establishments");
  const [establishments, setEstablishments] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [cbtos, setCbtos] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [cloudStatus, setCloudStatus] = useState("loading");
  const [lastSaved, setLastSaved] = useState(null);
  const [cloudError, setCloudError] = useState("");

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    const unsub = window.auth.onAuthStateChanged(u => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setCloudStatus("loading");
    loadInventoryFromCloud().then(data => {
      if(cancelled) return;
      if(data){
        setEstablishments((Array.isArray(data.establishments) ? data.establishments : []).map(d => ({...d, accredHistory: getAccredHistory(d)})));
        setAttractions(Array.isArray(data.attractions) ? data.attractions : []);
        setCbtos(Array.isArray(data.cbtos) ? data.cbtos : []);
        setOfficers(Array.isArray(data.officers) ? data.officers : []);
        if(data.updatedAt) setLastSaved(data.updatedAt);
      }
      setCloudStatus("idle");
    }).catch(err => {
      console.error(err);
      if(!cancelled){ setCloudStatus("error"); setCloudError(err && err.message ? err.message : "Unknown error."); }
    });
    return () => { cancelled = true; };
  }, [user]);

  const handleSave = async () => {
    if (!isAdmin) return;
    setCloudStatus("saving");
    try {
      await saveInventoryToCloud(establishments, attractions, cbtos, officers);
      setLastSaved(new Date().toISOString());
      setCloudStatus("idle");
    } catch(err){
      console.error(err);
      setCloudStatus("error");
      setCloudError(err && err.message ? err.message : "Unknown error.");
      alert("Save failed: " + (err && err.message ? err.message : "Unknown error. Check the browser console for details."));
    }
  };

  const handleLogout = () => window.auth.signOut();

  if (!authReady) {
    return <div className="app" style={{textAlign:"center", paddingTop:100}}>Checking authentication…</div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (<div className="app app-shell">
    <div className="app-header">
      <div className="app-brand">
        <img className="brand-logo" src={PGO_LOGO_HEADER_URI} alt="Official Seal of the Province of Occidental Mindoro" />
        <div>
          <div className="eyebrow">PROVINCIAL TOURISM OFFICE</div>
          <h1 className="title">Tourism Enterprise &amp; Attraction Inventory</h1>
          <div className="subtitle">
            Data inventory management for provincial tourism establishments and natural/cultural attractions developed by <span className="author">RYAN R. TAJONERA</span>, Tourism Operations Officer II.
            {!isAdmin && <span className="viewonly"> — You are in view-only mode</span>}
          </div>
        </div>
      </div>
      <div className="app-account">
        <span className="account-email">
          {user.email}{" "}
          {isAdmin
            ? <span className="pill pill-teal">Admin</span>
            : <span className="pill pill-grey">Viewer</span>}
        </span>
        <button className="btn btn-sm" onClick={handleLogout}>Sign out</button>
      </div>
    </div>

    <div className="app-layout">
    <aside className="side-col">
    <div className="side-inner">
    <div className="section-tabs">
      <div className="nav-group">Data Categories</div>
      <button className={"section-tab " + (tab==="establishments"?"active":"")} onClick={()=>setTab("establishments")}>
        <svg className="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/></svg><span className="nav-text">Enterprises</span> <span className="tab-count">{establishments.length}</span>
      </button>
      <button className={"section-tab " + (tab==="accreditation"?"active":"")} onClick={()=>setTab("accreditation")}>
        <svg className="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg><span className="nav-text">Accreditation</span> <span className="tab-count">{establishments.length}</span>
      </button>
      <button className={"section-tab " + (tab==="attractions"?"active":"")} onClick={()=>setTab("attractions")}>
        <svg className="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg><span className="nav-text">Attractions</span> <span className="tab-count">{attractions.length}</span>
      </button>
      <button className={"section-tab " + (tab==="cbtos"?"active":"")} onClick={()=>setTab("cbtos")}>
        <svg className="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8"/></svg><span className="nav-text">CBTOs</span> <span className="tab-count">{cbtos.length}</span>
      </button>
      <button className={"section-tab " + (tab==="officers"?"active":"")} onClick={()=>setTab("officers")}>
        <svg className="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17c.6-1.8 2-2.7 3.5-2.7s2.9.9 3.5 2.7M15 9h3M15 13h3"/></svg><span className="nav-text">Directory</span> <span className="tab-count">{officers.length}</span>
      </button>
      <div className="nav-group">Analytics &amp; Reports</div>
      <button className={"section-tab " + (tab==="analytics"?"active":"")} onClick={()=>setTab("analytics")}>
        <svg className="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg><span className="nav-text">Analytics</span>
      </button>
    </div>
    <div className="side-foot">Provincial Tourism Office<br/>Firestore Cloud</div>
    </div>
    </aside>

    <main className="main-col">
    <BackupToolbar
      establishments={establishments} attractions={attractions}
      setEstablishments={setEstablishments} setAttractions={setAttractions}
      cloudStatus={cloudStatus} lastSaved={lastSaved} cloudError={cloudError} onSave={handleSave}
      isAdmin={isAdmin}
    />

    {tab === "establishments" && (
      <EstablishmentsSection data={establishments} setData={setEstablishments} isAdmin={isAdmin} />
    )}
    {tab === "accreditation" && (
      <AccreditationSection data={establishments} setData={setEstablishments} isAdmin={isAdmin} />
    )}
    {tab === "attractions" && (
      <AttractionsSection data={attractions} setData={setAttractions} isAdmin={isAdmin} />
    )}
    {tab === "cbtos" && (
      <CbtoSection data={cbtos} setData={setCbtos} isAdmin={isAdmin} />
    )}
    {tab === "officers" && (
      <DirectorySection data={officers} setData={setOfficers} isAdmin={isAdmin} />
    )}
    {tab === "analytics" && (
      <AnalyticsSection establishments={establishments} attractions={attractions} cbtos={cbtos} />
    )}
    </main>
    </div>
  </div>);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
