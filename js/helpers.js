/**
 * SMALL HELPERS: dates, totals, comparing enterprise changes, finding possible duplicate names.
 */

function pad(n){ return String(n).padStart(2,"0"); }

function timestamp(){
  const d = new Date();
  return d.getFullYear()+""+pad(d.getMonth()+1)+pad(d.getDate())+"-"+pad(d.getHours())+pad(d.getMinutes());
}

function todayISO(){ return new Date().toISOString().slice(0,10); }

function totalEmployees(d){
  return (Number(d.maleEmployees)||0) + (Number(d.femaleEmployees)||0);
}

function yearOfISO(iso){
  const m = String(iso||"").match(/^(\d{4})/);
  return m ? parseInt(m[1],10) : null;
}

function formatEstabFieldValue(key, val){
  if(key==="accredHistory"){
    const list = normalizeAccredHistory(val);
    if(list.length===0) return "None";
    return list.map(h=>accredEntryLabel(h)).join("; ");
  }
  if(key==="accredValidity") return val ? formatDateDisplay(val) : "—";
  if(val===undefined || val===null || val==="") return "—";
  return String(val);
}

function diffEstablishment(before, after){
  const b = before || {};
  const a = after || {};
  const changes = [];
  Object.keys(ESTAB_FIELD_LABELS).forEach(k=>{
    const bv = k==="accredHistory" ? accredHistoryToText(b[k]) : String(b[k]==null?"":b[k]);
    const av = k==="accredHistory" ? accredHistoryToText(a[k]) : String(a[k]==null?"":a[k]);
    if(bv !== av){
      changes.push({ key:k, label: ESTAB_FIELD_LABELS[k], from: formatEstabFieldValue(k, b[k]), to: formatEstabFieldValue(k, a[k]) });
    }
  });
  return changes;
}

function normalizeForCompare(s){
  return String(s||"").toLowerCase().trim().replace(/\s+/g," ").replace(/[^\w\s]/g,"");
}

function levenshteinDistance(a,b){
  const m = a.length, n = b.length;
  if(m===0) return n;
  if(n===0) return m;
  const dp = Array.from({length:m+1},()=>new Array(n+1).fill(0));
  for(let i=0;i<=m;i++) dp[i][0]=i;
  for(let j=0;j<=n;j++) dp[0][j]=j;
  for(let i=1;i<=m;i++){
    for(let j=1;j<=n;j++){
      dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[m][n];
}

function isSimilarName(a,b){
  const na = normalizeForCompare(a), nb = normalizeForCompare(b);
  if(!na || !nb) return false;
  if(na===nb) return true;
  const dist = levenshteinDistance(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  if(maxLen===0) return false;
  return (1 - dist/maxLen) >= 0.85;
}

function findPossibleDuplicates(name, list, excludeId){
  return (list||[]).filter(d => d.id!==excludeId && isSimilarName(d.name, name));
}

function conditionTone(condition){
  if(condition==="Lost/Destroyed" || condition==="Critical") return "danger";
  if(condition==="Poor") return "gold";
  if(condition==="Good" || condition==="Excellent") return "teal";
  return "grey";
}

function declarationTone(status){
  if(status==="Nationally Declared" || status==="Locally Declared") return "teal";
  if(status==="Registered") return "grey";
  if(status==="Unregistered/For Validation") return "gold";
  return "grey";
}

function pad2(n){ return String(n).padStart(2,"0"); }
function dateToISO(d){ return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate()); }

function excelValueToISODate(v){
  if(v instanceof Date && !isNaN(v)) return dateToISO(v);
  if(typeof v === "number" && isFinite(v)){
    const parsed = XLSX.SSF ? XLSX.SSF.parse_date_code(v) : null;
    if(parsed) return parsed.y+"-"+pad2(parsed.m)+"-"+pad2(parsed.d);
  }
  const s = String(v||"").trim();
  if(!s) return "";
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const parsed = new Date(s);
  if(!isNaN(parsed)) return dateToISO(parsed);
  return s;
}

function formatDateDisplay(iso){
  if(!iso) return "";
  const d = new Date(iso+"T00:00:00");
  if(isNaN(d)) return iso;
  return d.toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" });
}

function isoToDateObj(iso){
  if(!iso) return "";
  const d = new Date(iso+"T00:00:00");
  return isNaN(d) ? "" : d;
}

function cbtoTotalMembers(d){
  return (Number(d.maleMembers)||0) + (Number(d.femaleMembers)||0);
}

// Duplicate check per spec: same Name + Municipality + Year + Category (name compared
// fuzzily so near-identical spellings are still flagged).
function findPossibleDirectoryDuplicates(f, list, excludeId){
  return (list||[]).filter(d =>
    d.id!==excludeId &&
    String(d.municipality||"").toLowerCase()===String(f.municipality||"").toLowerCase() &&
    String(d.year||"").toLowerCase()===String(f.year||"").toLowerCase() &&
    String(d.category||"")===String(f.category||"") &&
    isSimilarName(d.name, f.name)
  );
}
