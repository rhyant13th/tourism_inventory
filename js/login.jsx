/**
 * LOGIN SCREEN: the sign-in form.
 */

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await window.auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app" style={{maxWidth:420, marginTop:80}}>
      <div style={{textAlign:"center"}}>
        <img className="login-logo" src={PGO_LOGO_LOGIN_URI} alt="Official Seal of the Province of Occidental Mindoro" />
        <div className="eyebrow">PROVINCIAL TOURISM OFFICE</div>
        <h1 className="title" style={{fontSize:24}}>Sign in</h1>
        <p className="subtitle" style={{marginLeft:"auto", marginRight:"auto"}}>Enter your email and password to access the inventory.</p>
      </div>
      <form onSubmit={handleLogin} style={{marginTop:24}}>
        <label className="field">
          <span className="field-label">Email</span>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        {error && <div style={{color:"var(--danger)", fontSize:13, marginBottom:12}}>{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{width:"100%"}}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
