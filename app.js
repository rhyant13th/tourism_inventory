/**
 * TOURISM ENTERPRISE & ATTRACTION INVENTORY - all application code in one file.
 * (React + JSX, compiled in the browser by Babel; see index.html.)
 *
 * The file is made of 22 sections, in this order. Each section starts with a banner.
 * Order matters: settings first, logic next, screens after, MAIN APP last.
 *
 *    1. js/config.js
 *    2. js/react-setup.js
 *    3. js/lists.js
 *    4. js/helpers.js
 *    5. js/accreditation-logic.js
 *    6. js/excel-io.js
 *    7. js/calendar-seed.js
 *    8. js/calendar-logic.js
 *    9. js/cloud.js
 *   10. js/ui-components.jsx
 *   11. js/print-builders.jsx
 *   12. js/establishments.jsx
 *   13. js/attractions.jsx
 *   14. js/cbto.jsx
 *   15. js/directory.jsx
 *   16. js/calendar.jsx
 *   17. js/accreditation.jsx
 *   18. js/records-print.jsx
 *   19. js/backup.jsx
 *   20. js/login.jsx
 *   21. js/analytics.jsx
 *   22. js/app.jsx
 */


// ======================================================================
// SECTION 1 of 22: js/config.js
// ======================================================================
/**
 * SETTINGS: admin email, logo files, Firebase project keys and startup.
 * Loaded first. Change the admin email, logos or Firebase project here.
 */

// Only these emails can edit. Everyone else who signs in is view-only.
const ADMIN_EMAILS = ["rhyant13th@gmail.com"];

// Logo picture files (replace the PNG in assets/, keep the same file name)
// ---------- ANALYTICS REPORTS (new tab) ----------
const PGO_LOGO_URI = "assets/seal-report.png";
const PGO_LOGO_HEADER_URI = "assets/seal-header.png";
const PGO_LOGO_LOGIN_URI = "assets/seal-login.png";

// Firebase project keys + startup (Firebase web keys are public by design;
// real protection comes from your Firestore security rules)
const firebaseConfig = {
  apiKey: "AIzaSyAhfpg6aVJlazzuyelcPILDzEVtqdlBrKw",
  authDomain: "tourism-inventory-e44d0.firebaseapp.com",
  projectId: "tourism-inventory-e44d0",
  storageBucket: "tourism-inventory-e44d0.firebasestorage.app",
  messagingSenderId: "269769924283",
  appId: "1:269769924283:web:39be26bb7ef751fabb539e"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();
window.auth = firebase.auth();


// ======================================================================
// SECTION 2 of 22: js/react-setup.js
// ======================================================================
/**
 * REACT SETUP: pulls the React hooks (useState, useEffect ...) into every file.
 */

const { useState, useMemo, useRef, useEffect } = React;


// ======================================================================
// SECTION 3 of 22: js/lists.js
// ======================================================================
/**
 * DROPDOWN LISTS & LABELS: municipalities, enterprise types, classifications, accreditation levels,
 * attraction categories, statuses, and the Excel column headings. Edit here to add or rename choices.
 */

const PRIMARY_TYPES = [
  "Hotel","Resort","Apartment Hotel","Mabuhay Accommodation","Homestay",
  "Travel and Tour Agency","Travel Agency","Tour Operator","Online Travel Agency",
  "Land Transport Operator","Air Transport Operator","Water Transport Operator",
  "Motorized Boats","MICE Venue/Facility","MICE Organizer","Tour Guides",
];

const SECONDARY_TYPES = [
  "Farm Tourism Camp","Restaurant","Target Shooting Range",
  "Tourist Shop (Department Store / Souvenir Shop / Specialty Shop)",
  "Dive Shop","Tourism Recreation Center","Tourism Trainer","Rest Area","Spa",
];

const CLASSIFICATIONS = ["Primary Enterprises","Secondary Enterprises"];
const MUNICIPALITIES = ["Abra de Ilog","Calintaan","Looc","Lubang","Magsaysay","Mamburao","Paluan","Rizal","Sablayan","San Jose","Sta. Cruz"]
  .sort((a,b)=>a.localeCompare(b, undefined, {sensitivity:"base"}));

// LGU ORDER RULE (used by every list, dropdown, filter and table that shows LGUs):
// the Province itself is always on top, then the municipalities in A-Z order.
const PROVINCE_NAME = "Occidental Mindoro";
function isProvinceLGU(v){
  const s = String(v||"").trim().toLowerCase();
  return s==="province-wide" || s==="province" || s==="occidental mindoro" || s.startsWith("province of") || s.startsWith("provincial");
}
function compareLGU(a, b){
  const pa = isProvinceLGU(a) ? 0 : 1, pb = isProvinceLGU(b) ? 0 : 1;
  if(pa !== pb) return pa - pb;
  return String(a||"").localeCompare(String(b||""), undefined, {sensitivity:"base"});
}
const ACCRED_STATUSES = ["Accredited","Not Accredited"];

// "Level of Accreditation": Primary Enterprises get Regular/Basic; Secondary Enterprises
// have no PAS level at all, so they use "N/A-No PAS Level" instead (validity is 1 year,
// same as Basic, and the covered/counted years follow the same validity-based rule).
const PRIMARY_ACCRED_LEVELS = ["Regular","Basic"];

const SECONDARY_ACCRED_LEVELS = ["N/A-No PAS Level"];
const ACCRED_LEVELS = [...PRIMARY_ACCRED_LEVELS, ...SECONDARY_ACCRED_LEVELS];
const ESTAB_STATUSES = ["Active","Not Active","Others"];
const ATTRACTION_SELECTIONS = ["Existing","Potential","Emerging"];
const TOURLISTA_OPTIONS = ["Yes","No"];
const PHYSICAL_CONDITIONS = ["Lost/Destroyed","Critical","Poor","Fair","Good","Excellent"];
const DECLARATION_STATUSES = ["Nationally Declared","Locally Declared","Registered","Unregistered/For Validation"];

const ESTAB_FIELD_LABELS = {
  name: "Name of Enterprise",
  proprietor: "Proprietor / Owner",
  municipality: "Municipality",
  classification: "Classification",
  type: "Type",
  address: "Address",
  contact: "Contact Number",
  email: "Email Address",
  rooms: "Number of Rooms",
  maleEmployees: "Male Employees",
  femaleEmployees: "Female Employees",
  remarks: "Remarks",
  year: "Year Established / Registered",
  accredHistory: "Accreditation History",
  status: "Status of Enterprise",
  statusOthers: "Status Details (Others)",
  tourlista: "Registered on TourLISTA",
};

const ATTRACTION_CATEGORIES = {
  "Nature":[
    {code:"101",label:"Mountains/hills/highlands"},
    {code:"102",label:"Falls"},
    {code:"103",label:"Lakes and Pond"},
    {code:"104",label:"River and Landscape (includes subterranean rivers)"},
    {code:"105",label:"Coastal Landscape and Seascape (e.g. dive sites, reefs)"},
    {code:"106",label:"Marine Park (e.g. aquarium, open parks)"},
    {code:"107",label:"Caves (inland)"},
    {code:"108",label:"Unique Natural Landscape / Seascape"},
    {code:"109",label:"Volcanoes"},
    {code:"199",label:"Other Natural Attractions (e.g. century old trees/forest, endemic species)"},
  ],
  "History and Culture":[
    {code:"201",label:"Fort"},
    {code:"202",label:"Church, Mosque or Temples"},
    {code:"203",label:"Historical Road/Trails"},
    {code:"204",label:"Historic Monuments"},
    {code:"205",label:"Museum"},
    {code:"206",label:"Structures and Buildings"},
    {code:"207",label:"Unique Cultural Heritage"},
    {code:"208",label:"Archaeological/Historic Sites"},
    {code:"299",label:"Other Historical or cultural attractions"},
  ],
  "Industrial Tourism":[
    {code:"301",label:"Agro-Forestry"},
    {code:"302",label:"Farm and Ranch"},
    {code:"303",label:"Fishery"},
    {code:"304",label:"Arts and Craft"},
    {code:"305",label:"Industrial Facilities for Visitors"},
  ],
  "Sports and Recreational Facilities":[
    {code:"401",label:"Golf"},
    {code:"402",label:"Tennis"},
    {code:"403",label:"Cycling Road and Area"},
    {code:"404",label:"Zoo and Botanical Garden"},
    {code:"405",label:"Sports Complex"},
    {code:"406",label:"Camping Ground"},
    {code:"407",label:"Nature Trail and Path"},
    {code:"408",label:"Beach for Sea Bathing"},
    {code:"409",label:"Pools and Springs"},
    {code:"410",label:"Marina and Harbor"},
    {code:"411",label:"Parks"},
    {code:"412",label:"Leisure-land, Theme Park"},
    {code:"413",label:"Resort Complex"},
    {code:"414",label:"Other Sports and Recreational Activities"},
    {code:"415",label:"Casino"},
    {code:"416",label:"Water Sports (Excludes Diving, see Nature Category)"},
  ],
  "Shopping":[
    {code:"501",label:"Malls, Department Stores"},
    {code:"502",label:"Open Air Market, Traditional Market Area"},
    {code:"503",label:"Souvenirs And Delicacies"},
  ],
  "Customs and Tradition":[
    {code:"601",label:"Local Specialty Restaurant"},
    {code:"602",label:"Festivals"},
    {code:"603",label:"Performing Arts (e.g. Folk Music and Dance)"},
    {code:"604",label:"Local Culture and Traditions (includes social practices and rituals)"},
  ],
  "Special Event":[
    {code:"701",label:"Exposition"},
    {code:"702",label:"Convention"},
    {code:"703",label:"Sports Event"},
    {code:"799",label:"Other Events"},
  ],
  "Health and Wellness":[
    {code:"801",label:"Hot Spring"},
    {code:"802",label:"Cold Spring"},
    {code:"803",label:"Spa"},
    {code:"804",label:"Hospital/Clinics/Medical Tourism Facilities"},
  ],
  "Others":[{code:"901",label:"Others (Please specify)"}],
};

const PIE_COLORS = ["#1C6B6E","#C08A2E","#0E3B3C","#2B7A57","#A8442D","#8A9B97"];
const ATTRACTION_CODE_INDEX = {};

Object.entries(ATTRACTION_CATEGORIES).forEach(([cat, items]) => {
  items.forEach(it => { ATTRACTION_CODE_INDEX[it.code] = { category: cat, label: it.label }; });
});

const ESTAB_HEADERS = [
  "No.","Name of Enterprise","Proprietor / Owner","Municipality","Classification","Type",
  "Address","Contact Number","Email Address","Number of Rooms","Male Employees","Female Employees",
  "Total Employees","Remarks","Year Established / Registered","Status of Accreditation",
  "Accreditation Status (Computed)","Level of Accreditation","Accreditation Number","Accreditation Validity",
  "Accreditation History (Type|Number|AccredDate|Validity; ...)","Accredited Years (Computed)",
  "Registered on TourLISTA","Status of Enterprise",
];

const ATTR_HEADERS = [
  "No.","Municipality","Name of Attraction","Year Established","Status","Physical Condition",
  "Declaration Status","Attraction Category","Attraction Code","Code Description",
  "Remarks/Description","Latitude","Longitude",
];

const CBTO_HEADERS = [
  "No.","Municipality","Name and Address of CBTO","Contact Person and Number",
  "Number of Male Members","Number of Female Members","Total Members",
  "Nature of Activity in the Destination","Purpose/Objective",
];

// ---- Directory (formerly "Tourism Officers Directory") ----
// General directory of tourism-related personnel: elected officials, PTC members,
// department heads, tourism officers, and others — organized by year.
const DIRECTORY_CATEGORIES = ["Elected Official","PTC Member","Department Head","Tourism Officer","Others"];

const DIRECTORY_STATUSES = ["Active","Inactive"];

const DIRECTORY_HEADERS = [
  "No.","Province/City","Municipality","Name","Position/Designation","Office/Agency",
  "Contact Number","Email Address","Category","Year","Status",
];

// ---- Calendar of Activities ----
// Months, places, categories and statuses used by the Calendar screen and its Excel file.
const CALENDAR_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
// A calendar event can belong to one municipality, the whole province, or several municipalities
// (for several, pick "Multiple Municipalities" and name them in "Other Location Details").
const CALENDAR_LOCATIONS = [...MUNICIPALITIES, "Province-wide", "Multiple Municipalities"].sort(compareLGU);
const CALENDAR_CATEGORIES = ["Festival","Founding Anniversary","Feast / Fiesta","Parade / Procession","Trade Fair / Market","Observance / Awareness","Christmas / Holiday","Commemoration","Other"];
const CALENDAR_STATUSES = ["Scheduled","Tentative","Postponed","Cancelled","Completed"];
// The three calendars shown as tabs on the Calendar screen.
//  tourism    = Tourism Office Calendar of Activities (has a year: different activities each year)
//  provincial = Provincial and Municipal Calendar of Activities (no year: annual celebrations)
//  arawatan   = Arawatan Calendar of Activities (has a year and one theme per year)
const CALENDAR_TYPES = [
  {key:"tourism",    label:"Tourism Office Calendar of Activities"},
  {key:"provincial", label:"Provincial and Municipal Calendar of Activities"},
  {key:"arawatan",   label:"Arawatan Calendar of Activities"},
];
const CALENDAR_TYPE_LABEL = Object.fromEntries(CALENDAR_TYPES.map(t=>[t.key, t.label]));
const CALENDAR_HEADERS = [
  "No.","Calendar Type","Year","Month","Date","Activity / Event","Municipality / Venue","Other Location Details",
  "Category","Status","Description",
];


// ======================================================================
// SECTION 4 of 22: js/helpers.js
// ======================================================================
/**
 * SMALL HELPERS: dates, totals, comparing enterprise changes, finding possible duplicate names.
 */

function pad(n){ return String(n).padStart(2,"0"); }

// Filter dropdowns are multiple select: a filter value is a list of chosen items (empty = All).
// A plain text value (older code, search boxes) is treated as a one-item list.
function filterSel(v){ return Array.isArray(v) ? v : (v ? [v] : []); }
function matchSel(v, val){ const a = filterSel(v); return a.length===0 || a.includes(val); }

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


// ======================================================================
// SECTION 5 of 22: js/accreditation-logic.js
// ======================================================================
/**
 * ACCREDITATION RULES: accreditation history, current status, coverage years (no screens, only logic).
 */

function accredLevelsForClassification(classification){
  return classification==="Secondary Enterprises" ? SECONDARY_ACCRED_LEVELS : PRIMARY_ACCRED_LEVELS;
}

function normalizeAccredHistory(list){
  const seen = new Set();
  const cleaned = [];
  (list||[]).forEach(h=>{
    const type = String((h && h.type) || "").trim();
    const number = String((h && h.number) || "").trim();
    const accredDate = String((h && h.accredDate) || "").trim();
    const validity = String((h && h.validity) || "").trim();
    const dotAsOf = String((h && h.dotAsOf) || "").trim();
    if(!type && !number && !accredDate && !validity && !dotAsOf) return;
    const key = type + "|" + number + "|" + accredDate + "|" + validity + "|" + dotAsOf;
    if(seen.has(key)) return;
    seen.add(key);
    cleaned.push({ type, number, accredDate, validity, dotAsOf });
  });
  return cleaned.sort((a,b)=> (a.validity||"").localeCompare(b.validity||""));
}

// First day an accreditation is counted from: its Date Accredited, else the date of the
// DOT list it came with, else (when neither is on file) the start of the current year (if still valid) or of its validity year.
function accredEntryStartISO(h){
  if(h && h.accredDate) return h.accredDate;
  if(h && h.dotAsOf) return h.dotAsOf;
  if(!h || !h.validity) return "";
  const today = todayISO();
  return (h.validity >= today ? today.slice(0,4) : h.validity.slice(0,4)) + "-01-01";
}

// An accreditation counts in EVERY year (and month) from its start up to its Valid Until
// month, e.g. valid until 2028 and started in 2026 -> counted in 2026, 2027 and 2028.
function accredEntryCoverageYears(entry){
  const endY = yearOfISO(entry && entry.validity);
  if(endY===null){
    // no Valid Until on file: counted only in the year of its Date Accredited / DOT list
    const y0 = yearOfISO(accredEntryStartISO(entry));
    return y0===null ? [] : [String(y0)];
  }
  const startY = yearOfISO(accredEntryStartISO(entry));
  const lo = Math.min(startY, endY), hi = Math.max(startY, endY);
  const years = [];
  for(let y=lo; y<=hi; y++) years.push(String(y));
  return years;
}

function accredEntryCoversMonth(h, year, month){
  const st = isoYM(accredEntryStartISO(h)), en = isoYM(h && h.validity);
  if(!st) return false;
  if(!en) return String(year)===st.y && Number(month) >= st.m;   // no validity: from its start month to December of that year
  const a = Number(st.y)*12 + st.m, b = Number(en.y)*12 + en.m;
  const t = Number(year)*12 + Number(month);
  return t >= Math.min(a,b) && t <= Math.max(a,b);
}

// UPDATED: Automatically fallback to top-level accreditation fields if accredHistory is empty
function getAccredHistory(d){
  if(Array.isArray(d && d.accredHistory) && d.accredHistory.length > 0){
    return normalizeAccredHistory(d.accredHistory);
  }
  if(Array.isArray(d && d.accredYears) && d.accredYears.length > 0){
    return normalizeAccredHistory(d.accredYears.map(y => ({
      type: "", number: "", accredDate: "",
      validity: /^\d{4}$/.test(String(y)) ? String(y) + "-01-01" : String(y),
    })));
  }
  if(d && d.accredStatus === "Accredited" && d.accredValidity){
    return normalizeAccredHistory([{
      type: d.accredType || "Regular",
      number: d.accredNumber || "",
      accredDate: "",
      validity: d.accredValidity
    }]);
  }
  return [];
}

// The accreditation entry currently "in force" — the one with the latest validity date
// on file. This is the reference used to determine current status, and to display
// type/number/validity wherever the old top-level fields used to be shown.
function latestAccredEntry(d){
  const list = getAccredHistory(d);
  if(list.length===0) return null;
  const dated = list.filter(h=>h.validity);
  return (dated.length ? dated : list).slice()
    .sort((a,b)=> (a.validity||"").localeCompare(b.validity||"")).pop();
}

// Accreditation status is now entirely derived from the Accreditation History entries —
// there is no separate manual "Status of Accreditation" field on the establishment.
// No periods on file -> Not Accredited. Latest period's validity in the future -> Accredited.
// Latest period's validity already passed -> Expired.
function getAccredState(d){
  const latest = latestAccredEntry(d);
  if(!latest) return "Not Accredited";
  if(!latest.validity) return "Accredited";
  return latest.validity < todayISO() ? "Expired" : "Accredited";
}

// For an establishment counted as accredited in `year`, returns the accreditation entry
// "in force" for that year — the one whose coverage includes it, picking the latest by
// validity if there's more than one (e.g. a renewal within the same year).
function accredEntryForYear(d, year){
  const entries = getAccredHistory(d).filter(h => accredEntryCoverageYears(h).includes(year));
  if(entries.length===0) return null;
  const dated = entries.filter(h=>h.validity);
  return (dated.length ? dated : entries).slice()
    .sort((a,b)=> (a.validity||"").localeCompare(b.validity||"")).pop();
}

// For an establishment counted as accredited in `year` (per the calendar-year coverage
// rule), tells whether that accreditation is still currently valid as of today or has
// already lapsed. Picks the accreditation entry whose coverage includes `year` with the
// latest validity date (the one "in force" for that year), then compares it to today.
function establishmentYearRealtimeStatus(d, year){
  const latest = accredEntryForYear(d, year);
  if(!latest) return null;
  if(!latest.validity) return "Accredited";
  return latest.validity < todayISO() ? "Expired" : "Accredited";
}

function establishmentAccreditedYears(d){
  const years = new Set();
  getAccredHistory(d).forEach(h => accredEntryCoverageYears(h).forEach(y => years.add(y)));
  return Array.from(years).sort();
}

// ---------------------------------------------------------------------
// ACCREDITATION MONITORING (per year / per month)
// ---------------------------------------------------------------------
function isoYM(iso){
  const m = String(iso||"").match(/^(\d{4})-(\d{2})/);
  return m ? { y: m[1], m: parseInt(m[2],10) } : null;
}

// true when the date falls in `year` (and in `month`, 1-12, when a month is given)
function isoInPeriod(iso, year, month){
  const p = isoYM(iso);
  if(!p || p.y !== String(year)) return false;
  if(Array.isArray(month)) return month.length===0 || month.map(Number).includes(p.m);   // several months chosen
  return !month || p.m === Number(month);
}

function accredPeriodExpired(h){
  return !!(h && h.validity) && h.validity < todayISO();
}

// Status of ONE accreditation period:
//   Expired    = Valid Until has already passed
//   To Expire  = still valid today, but expires within the selected year
//   Valid      = still valid and does not expire in the selected year
function accredPeriodStatus(h, year){
  if(!h) return "Not Accredited";
  if(!h.validity) return "No Validity";
  if(accredPeriodExpired(h)) return "Expired";
  if(year && h.validity && isoInPeriod(h.validity, year, "")) return "To Expire";
  return "Valid";
}

function accredStatusTone(st){
  return st==="Valid" ? "teal" : st==="To Expire" ? "gold" : st==="Expired" ? "danger" : "grey";
}

function accredEntryKey(h){
  return [h.type||"", h.number||"", h.accredDate||"", h.validity||"", h.dotAsOf||""].join("|");
}

// Checks the accreditation periods typed in a form. Periods that were already on file
// (baseline) are not re-checked, so old records with missing dates never block a save.
function validateAccredEntries(list, baselineList){
  const known = new Set(normalizeAccredHistory(baselineList).map(accredEntryKey));
  const cleaned = normalizeAccredHistory(list);
  for(const h of cleaned){
    if(known.has(accredEntryKey(h))) continue;
    if(!h.type) return "Please select the Level of Accreditation for each accreditation period.";
    if(!h.accredDate && !h.dotAsOf && !h.validity) return "Please enter at least one date for each accreditation period (Date Accredited, DOT List As Of or Valid Until) so it can be counted in the right year.";
    if(h.accredDate && h.validity && h.validity < h.accredDate) return "Valid Until cannot be earlier than the Date Accredited.";
  }
  return "";
}

// Is this period relevant to the selected year / month?
// - accredited (Date Accredited) or expiring (Valid Until) inside the year / month, or
// - (year only) the period is still running during that year.
function accredPeriodInScope(h, year, month){
  const ms = Array.isArray(month) ? month : (month ? [month] : []);
  return ms.length ? ms.some(m => accredEntryCoversMonth(h, year, m))
                   : accredEntryCoverageYears(h).includes(String(year));
}

// Dashboard numbers for one year (each enterprise is counted once per card).
function accredYearStats(list, year){
  const accredited = new Set(), valid = new Set(), renewed = new Set();
  const toExpire = new Set(), expired = new Set(), lapsed = new Set();
  const yearEnd = String(year) + "-12-31";
  list.forEach(d=>{
    getAccredHistory(d).forEach(h=>{
      const covers = accredEntryCoverageYears(h).includes(String(year));
      if(covers) accredited.add(d.id);
      if(covers && (!h.validity || h.validity >= yearEnd)) valid.add(d.id);
      if(isoInPeriod(h.accredDate, year, "")) renewed.add(d.id);
      if(isoInPeriod(h.validity, year, "")){
        if(accredPeriodExpired(h)) expired.add(d.id); else toExpire.add(d.id);
      }
    });
    const latest = latestAccredEntry(d);
    if(latest && accredPeriodExpired(latest) && isoInPeriod(latest.validity, year, "")) lapsed.add(d.id);
  });
  return { accredited, valid, renewed, toExpire, expired, lapsed };
}

// Month-by-month table for one year.
function accredMonthlyStats(list, year){
  return CALENDAR_MONTHS.map((name, i)=>{
    const m = i + 1;
    const acc = new Set(), toE = new Set(), exp = new Set();
    list.forEach(d=>{
      getAccredHistory(d).forEach(h=>{
        if(accredEntryCoversMonth(h, year, m)) acc.add(d.id);
        if(isoInPeriod(h.validity, year, m)){
          if(accredPeriodExpired(h)) exp.add(d.id); else toE.add(d.id);
        }
      });
    });
    return { month: name, num: m, accredited: acc.size, toExpire: toE.size, expired: exp.size };
  });
}

// Enterprises whose CURRENT (latest) accreditation ends within the next `days` days.
function accredExpiringSoon(list, days){
  const today = todayISO();
  const lim = new Date(today + "T00:00:00");
  lim.setDate(lim.getDate() + days);
  const limit = dateToISO(lim);
  const out = [];
  list.forEach(d=>{
    const latest = latestAccredEntry(d);
    if(latest && latest.validity && latest.validity >= today && latest.validity <= limit){
      const left = Math.round((new Date(latest.validity + "T00:00:00") - new Date(today + "T00:00:00")) / 86400000);
      out.push({ d, h: latest, daysLeft: left });
    }
  });
  return out.sort((a,b)=> a.daysLeft - b.daysLeft);
}

// Rows of the Accreditation records list / print report: one row per accreditation period
// in the selected year / month. Status "Not Accredited" lists enterprises with no period at all.
function accredRecordRows(list, year, month, statusFilter, dotFilter){
  const dotSel = Array.isArray(dotFilter) ? dotFilter : (dotFilter ? [dotFilter] : []);
  const sel = Array.isArray(statusFilter) ? statusFilter : (statusFilter ? [statusFilter] : []);
  const wantNone = sel.includes("Not Accredited");
  const periodSel = sel.filter(x => x !== "Not Accredited");
  const rows = [];
  if(!(wantNone && periodSel.length===0)){
    list.forEach(d=>{
      const hist = getAccredHistory(d);
      hist.forEach(h=>{
        // Choosing a DOT list lists everything that came with that file (year / month do not limit it)
        if(dotSel.length){ if(!dotSel.includes(h.dotAsOf)) return; }
        else if(!accredPeriodInScope(h, year, month)) return;
        const status = accredPeriodStatus(h, year);
        if(periodSel.length && !periodSel.includes(status)) return;
        rows.push({
          d, h, status, renewed: false,
          accredIn: isoInPeriod(h.accredDate, year, month),
          expiryIn: isoInPeriod(h.validity, year, month),
        });
      });
    });
  }
  // ONE ROW PER ENTERPRISE PER YEAR: an enterprise with several accreditation periods / DOT lists in
  // the same year (e.g. DOT as of Jul 12, Sep 6 and Oct 5, 2022) is shown once for that year, using the
  // accreditation in force = the one with the latest Valid Until (ties: later DOT date, then later Date Accredited).
  const better = (a, b) =>
    ((a.h.validity||"").localeCompare(b.h.validity||"")) ||
    ((a.h.dotAsOf||"").localeCompare(b.h.dotAsOf||"")) ||
    ((a.h.accredDate||"").localeCompare(b.h.accredDate||""));
  const best = new Map();
  rows.forEach(r=>{
    const yr = dotSel.length ? String(yearOfISO(r.h.dotAsOf)) : String(year);   // with a DOT filter, group by the DOT list's year
    const key = r.d.id + "|" + yr;
    const cur = best.get(key);
    if(!cur || better(r, cur) > 0) best.set(key, r);
  });
  rows.length = 0;
  best.forEach(r=>rows.push(r));

  if(wantNone && !dotSel.length){
    list.filter(d=>getAccredHistory(d).length===0).forEach(d=>{
      rows.push({ d, h:null, status:"Not Accredited", renewed:false, accredIn:false, expiryIn:false });
    });
  }
  return rows.sort((a,b)=>
    (a.d.municipality + a.d.name).localeCompare(b.d.municipality + b.d.name) ||
    ((a.h && a.h.validity)||"").localeCompare((b.h && b.h.validity)||""));
}

function accredEntrySortKey(entry){
  return (entry && (entry.accredDate || entry.validity)) || "";
}

function sortAccredHistoryDesc(list){
  return normalizeAccredHistory(list).slice().sort((a,b)=> accredEntrySortKey(b).localeCompare(accredEntrySortKey(a)));
}

function sortedAccredHistoryForForm(list){
  return (list||[]).map((h,idx)=>({h,idx})).sort((a,b)=> accredEntrySortKey(b.h).localeCompare(accredEntrySortKey(a.h)));
}

function accredEntryLabel(h){
  const years = accredEntryCoverageYears(h);
  const typeLabel = h.type || "Accreditation";
  if(years.length===0) return typeLabel;
  const range = years.length>1 ? (years[0] + "–" + years[years.length-1]) : years[0];
  return typeLabel + " – " + range;
}

function accredHistoryToText(list){
  return normalizeAccredHistory(list)
    .map(h => [h.type||"", h.number||"", h.accredDate||"", h.validity||"", h.dotAsOf||""].join("|"))
    .join("; ");
}

function parseAccredHistoryText(v){
  const s = String(v||"").trim();
  if(!s) return [];
  return normalizeAccredHistory(s.split(";").map(chunk=>{
    const parts = chunk.split("|");
    return {
      type: matchFromList((parts[0]||"").trim(), ACCRED_LEVELS) || (parts[0]||"").trim(),
      number: (parts[1]||"").trim(),
      accredDate: excelValueToISODate((parts[2]||"").trim()),
      validity: excelValueToISODate((parts[3]||"").trim()),
      dotAsOf: excelValueToISODate((parts[4]||"").trim()),
    };
  }));
}


// ======================================================================
// SECTION 6 of 22: js/excel-io.js
// ======================================================================
/**
 * EXCEL IMPORT / EXPORT: builds the backup workbook and reads an uploaded workbook back in.
 */

function buildCbtoRows(list){
  return list.map((d,i)=>[
    i+1, d.municipality||"", d.nameAddress||"", d.contactPersonNumber||"",
    d.maleMembers||"", d.femaleMembers||"", cbtoTotalMembers(d),
    d.natureOfActivity||"", d.purpose||"",
  ]);
}

function parseCbtoRow(row){
  const municipality = matchFromList(row["Municipality"], MUNICIPALITIES);
  const nameAddress = String(row["Name and Address of CBTO"]||"").trim();
  if(!nameAddress || !municipality) return null;
  return {
    municipality, nameAddress,
    contactPersonNumber: String(row["Contact Person and Number"]||"").trim(),
    maleMembers: String(row["Number of Male Members"]||"").trim(),
    femaleMembers: String(row["Number of Female Members"]||"").trim(),
    natureOfActivity: String(row["Nature of Activity in the Destination"]||"").trim(),
    purpose: String(row["Purpose/Objective"]||"").trim(),
  };
}

// Legacy officer records (year, level, lguName, officerName, lceName, lceEmail, ...) are
// migrated into the new field names here, non-destructively — original fields are kept on
// the record (via spread) in case they're still needed, and existing officer entries are
// classified as "Tourism Officer" per the migration requirement.
function normalizeDirectoryRecord(d){
  const base = d || {};
  const name = base.name !== undefined && base.name !== "" ? base.name : (base.officerName || "");
  const municipality = base.municipality !== undefined && base.municipality !== "" ? base.municipality : (base.lguName || "");
  // Categories can now be added/renamed by the user, so any non-empty text is kept.
  const category = String(base.category || "").trim() || "Tourism Officer";
  const status = DIRECTORY_STATUSES.includes(base.status) ? base.status : "Active";
  return {
    ...base,
    provinceCity: base.provinceCity || "",
    municipality,
    name,
    position: base.position || "",
    officeAgency: base.officeAgency || "",
    contact: base.contact || "",
    email: base.email || "",
    category,
    year: base.year || "",
    status,
  };
}

function buildDirectoryRows(list){
  return list.map((d,i)=>[
    i+1, d.provinceCity||"", d.municipality||"", d.name||"", d.position||"", d.officeAgency||"",
    d.contact||"", d.email||"", d.category||"", d.year||"", d.status||"",
  ]);
}

function parseDirectoryRow(row){
  const name = String(row["Name"]||"").trim();
  const year = String(row["Year"]||"").trim();
  if(!name || !year) return null;
  const categoryText = String(row["Category"]||"").trim();
  const category = matchFromList(categoryText, DIRECTORY_CATEGORIES) || categoryText || "Others";
  const status = matchFromList(row["Status"], DIRECTORY_STATUSES);
  return {
    provinceCity: String(row["Province/City"]||"").trim(),
    municipality: matchFromList(row["Municipality"], MUNICIPALITIES) || String(row["Municipality"]||"").trim(),
    name,
    position: String(row["Position/Designation"]||"").trim(),
    officeAgency: String(row["Office/Agency"]||"").trim(),
    contact: String(row["Contact Number"]||"").trim(),
    email: String(row["Email Address"]||"").trim(),
    category,
    year,
    status: DIRECTORY_STATUSES.includes(status) ? status : "Active",
  };
}

function buildEstabRows(list){
  return list.map((d,i)=>{
    const latest = latestAccredEntry(d);
    return [
      i+1, d.name||"", d.proprietor||"", d.municipality||"", d.classification||"", d.type||"",
      d.address||"", d.contact||"", d.email||"", d.rooms||"", d.maleEmployees||"", d.femaleEmployees||"",
      totalEmployees(d), d.remarks||"", d.year||"", getAccredState(d), getAccredState(d),
      (latest && latest.type)||"", (latest && latest.number)||"", isoToDateObj(latest && latest.validity), accredHistoryToText(getAccredHistory(d)),
      establishmentAccreditedYears(d).join(", "),
      d.tourlista||"No",
      (d.status==="Others" && d.statusOthers) ? d.statusOthers : (d.status||""),
    ];
  });
}

function buildAttrRows(list){
  return list.map((d,i)=>[
    i+1, d.municipality||"", d.name||"", d.yearEstablished||"", d.selection||"", d.physicalCondition||"",
    d.declarationStatus||"", d.category||"", d.code||"", (ATTRACTION_CODE_INDEX[d.code]||{}).label || "",
    d.remarks||"", d.latitude||"", d.longitude||"",
  ]);
}

function exportInventoryWorkbook(establishments, attractions){
  const wb = XLSX.utils.book_new();

  const infoRows = [
    ["PROVINCIAL TOURISM OFFICE"],
    ["Tourism Enterprise & Attraction Inventory — Submission File"],
    ["Generated: " + new Date().toLocaleString()],
    [""],
    ["Instructions"],
    ["1. Do not rename, reorder, or delete the column headers on the 'Enterprises' and 'Attractions' sheets."],
    ["2. To add or correct records offline, edit the rows or add new rows below the existing data on each sheet."],
    ["3. Save this file, then use the 'Upload Encoded Excel' button in the app to bulk-import the rows."],
    ["4. This same file, once complete, can be submitted directly to the national agency."],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoRows);
  wsInfo['!cols'] = [{ wch: 95 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, "Read Me");

  const wsEstab = XLSX.utils.aoa_to_sheet([ESTAB_HEADERS, ...buildEstabRows(establishments)]);
  wsEstab['!cols'] = ESTAB_HEADERS.map(h => ({ wch: Math.max(14, h.length + 2) }));
  const validityColIdx = ESTAB_HEADERS.indexOf("Accreditation Validity");
  if(validityColIdx > -1 && wsEstab['!ref']){
    const range = XLSX.utils.decode_range(wsEstab['!ref']);
    for(let r = range.s.r + 1; r <= range.e.r; r++){
      const cell = wsEstab[XLSX.utils.encode_cell({ r, c: validityColIdx })];
      if(cell && cell.t === 'd') cell.z = 'yyyy-mm-dd';
    }
  }
  XLSX.utils.book_append_sheet(wb, wsEstab, "Enterprises");

  const wsAttr = XLSX.utils.aoa_to_sheet([ATTR_HEADERS, ...buildAttrRows(attractions)]);
  wsAttr['!cols'] = ATTR_HEADERS.map(h => ({ wch: Math.max(14, h.length + 2) }));
  XLSX.utils.book_append_sheet(wb, wsAttr, "Attractions");

  XLSX.writeFile(wb, "Tourism-Inventory-Backup-" + timestamp() + ".xlsx");
}

function normalizeKey(s){ return String(s||"").trim().toLowerCase(); }
function stripListPrefix(s){ return String(s||"").replace(/^\s*\d+[\.\)]\s*/, "").trim(); }

function matchFromList(value, list){
  const cleaned = stripListPrefix(value);
  if(!cleaned) return "";
  const key = normalizeKey(cleaned);
  let found = list.find(item => normalizeKey(item) === key);
  if(!found){
    found = list.find(item => {
      const ik = normalizeKey(item);
      return ik.startsWith(key) || key.startsWith(ik);
    });
  }
  return found || cleaned;
}

function sheetToRows(wb, sheetName, canonicalHeaders){
  const ws = wb.Sheets[sheetName];
  if(!ws) return [];
  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", blankrows: false });
  if(aoa.length < 2) return [];
  const canonMap = {};
  (canonicalHeaders||[]).forEach(h => { canonMap[normalizeKey(h)] = h; });
  const headers = aoa[0].map(h => canonMap[normalizeKey(h)] || String(h||"").trim());
  return aoa.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = row[idx] !== undefined ? row[idx] : ""; });
    return obj;
  });
}

// Tries each sheet name in order — lets us read older backups that still use the
// pre-rename "Establishments" tab, as well as current "Enterprises" backups.
function sheetToRowsAny(wb, sheetNames, canonicalHeaders){
  for(const name of sheetNames){
    if(wb.Sheets[name]) return sheetToRows(wb, name, canonicalHeaders);
  }
  return [];
}

function parseImportedWorkbook(wb){
  const estabRows = sheetToRowsAny(wb, ["Enterprises","Establishments"], ESTAB_HEADERS);
  const attrRows = sheetToRows(wb, "Attractions", ATTR_HEADERS);

  const establishments = [];
  let estabSkipped = 0;
  estabRows.forEach(row => {
    const name = String(row["Name of Enterprise"]||"").trim();
    const municipality = matchFromList(row["Municipality"], MUNICIPALITIES);
    const classification = matchFromList(row["Classification"], CLASSIFICATIONS);
    const typeList = classification==="Primary Enterprises" ? PRIMARY_TYPES
      : classification==="Secondary Enterprises" ? SECONDARY_TYPES
      : [...PRIMARY_TYPES, ...SECONDARY_TYPES];
    const type = matchFromList(row["Type"], typeList);
    if(!name || !municipality || !classification || !type){ estabSkipped++; return; }
    const rawStatus = matchFromList(row["Status of Enterprise"], ESTAB_STATUSES) || "Active";
    const status = ESTAB_STATUSES.includes(rawStatus) ? rawStatus : "Others";
    const rawAccred = matchFromList(row["Status of Accreditation"], ACCRED_STATUSES);
    
    let accredHistory = parseAccredHistoryText(row["Accreditation History (Type|Number|AccredDate|Validity; ...)"]);
    const accredValidity = excelValueToISODate(row["Accreditation Validity"]);
    const accredType = matchFromList(row["Level of Accreditation"], ACCRED_LEVELS);
    const accredNumber = String(row["Accreditation Number"]||"").trim();

    // Automatically populate history if text column was blank but current validity exists
    if(accredHistory.length === 0 && rawAccred === "Accredited" && accredValidity){
      const defaultLevel = classification==="Secondary Enterprises" ? "N/A-No PAS Level" : "Regular";
      accredHistory = [{ type: accredType || defaultLevel, number: accredNumber, accredDate: "", validity: accredValidity }];
    }

    establishments.push({
      name, proprietor: String(row["Proprietor / Owner"]||"").trim(),
      email: String(row["Email Address"]||"").trim(), municipality, classification, type,
      address: String(row["Address"]||"").trim(), contact: String(row["Contact Number"]||"").trim(),
      rooms: String(row["Number of Rooms"]||"").trim(), maleEmployees: String(row["Male Employees"]||"").trim(),
      femaleEmployees: String(row["Female Employees"]||"").trim(), remarks: String(row["Remarks"]||"").trim(),
      accredStatus: ACCRED_STATUSES.includes(rawAccred) ? rawAccred : "Not Accredited",
      accredType,
      accredNumber,
      accredValidity,
      accredHistory,
      status, statusOthers: status==="Others" ? stripListPrefix(row["Status of Enterprise"]) : "",
      year: String(row["Year Established / Registered"]||"").trim(),
      tourlista: matchFromList(row["Registered on TourLISTA"], TOURLISTA_OPTIONS) === "Yes" ? "Yes" : "No",
    });
  });

  const attractions = [];
  let attrSkipped = 0;
  attrRows.forEach(row => {
    const name = String(row["Name of Attraction"]||"").trim();
    const municipality = matchFromList(row["Municipality"], MUNICIPALITIES);
    let code = stripListPrefix(row["Attraction Code"]);
    let category = matchFromList(row["Attraction Category"], Object.keys(ATTRACTION_CATEGORIES));
    if(code && !ATTRACTION_CODE_INDEX[code]) code = "";
    if(code && !ATTRACTION_CATEGORIES[category]) category = ATTRACTION_CODE_INDEX[code].category;
    if(!name || !municipality || !category || !code){ attrSkipped++; return; }
    const rawSelection = matchFromList(row["Status"], ATTRACTION_SELECTIONS);
    const rawPhysicalCondition = matchFromList(row["Physical Condition"], PHYSICAL_CONDITIONS);
    const rawDeclarationStatus = matchFromList(row["Declaration Status"], DECLARATION_STATUSES);
    attractions.push({
      municipality, name,
      yearEstablished: String(row["Year Established"]||"").trim(),
      selection: ATTRACTION_SELECTIONS.includes(rawSelection) ? rawSelection : "Existing",
      category, code,
      physicalCondition: PHYSICAL_CONDITIONS.includes(rawPhysicalCondition) ? rawPhysicalCondition : "",
      declarationStatus: DECLARATION_STATUSES.includes(rawDeclarationStatus) ? rawDeclarationStatus : "",
      remarks: String(row["Remarks/Description"]||"").trim(),
      latitude: String(row["Latitude"]||"").trim(),
      longitude: String(row["Longitude"]||"").trim(),
    });
  });

  return { establishments, estabSkipped, attractions, attrSkipped };
}


// ======================================================================
// SECTION 7 of 22: js/calendar-seed.js
// ======================================================================
/**
 * CALENDAR 2025 STARTER DATA: the activities from the Provincial Tourism Office
 * "Calendar of Events | Province of Occidental Mindoro" (2025).
 * Used only by the "Load 2025 Calendar" button on the Calendar screen when the list is empty.
 * February and July had no listed events in the source file.
 * After loading, edit/add/delete records on the screen, then press Save to cloud.
 */

const CALENDAR_2025_SEED = [
  { month: "January", dateText: "18-20", title: "Founding Anniversary and Feast of San Sebastian", municipality: "Sablayan", locationNote: "",
    category: "Founding Anniversary", status: "Scheduled",
    description: "A celebration of Sablayan’s history, culture, and faith, featuring religious activities, cultural performances, and community gatherings." },
  { month: "January", dateText: "27", title: "Dugoy Festival", municipality: "Sablayan", locationNote: "",
    category: "Festival", status: "Scheduled",
    description: "A vibrant festival showcasing Mangyan heritage through street dancing, exhibits, and performances, promoting unity and cultural pride." },
  { month: "March", dateText: "19", title: "Town Fiesta", municipality: "Paluan", locationNote: "",
    category: "Feast / Fiesta", status: "Scheduled",
    description: "Honoring St. Joseph, the Husband of Mary, with religious and cultural festivities, including a fluvial parade and Karakol street dancing." },
  { month: "March", dateText: "27", title: "Mamburao Founding Anniversary", municipality: "Mamburao", locationNote: "",
    category: "Founding Anniversary", status: "Scheduled",
    description: "Celebrating Mamburao’s establishment with a Medical and Dental Mission, cultural performances, and the Tuna Festival, featuring tuna-themed floats and a cook fest." },
  { month: "March", dateText: "30-31 (until April 1)", title: "Talabasi Festival and 76th Founding Anniversary", municipality: "Sta. Cruz", locationNote: "",
    category: "Festival", status: "Scheduled",
    description: "A cultural and tourism event promoting Santa Cruz’s heritage through performances, culinary experiences, and artisan exhibits." },
  { month: "April", dateText: "1-3", title: "Rizal Founding Anniversary", municipality: "Rizal", locationNote: "",
    category: "Founding Anniversary", status: "Scheduled",
    description: "Three-day festivities featuring Mangyan Day, pageants, a talent competition, and sports activities, fostering unity and cultural pride." },
  { month: "April", dateText: "2", title: "Tambulan Festival", municipality: "Rizal", locationNote: "",
    category: "Festival", status: "Scheduled",
    description: "A musical showcase of drum and lyre performances by students, promoting creativity and school pride." },
  { month: "April", dateText: "3", title: "Hinugyaw Festival", municipality: "Rizal", locationNote: "",
    category: "Festival", status: "Scheduled",
    description: "A thanksgiving festival with street dancing competitions among barangays, celebrating harvests and prosperity." },
  { month: "April", dateText: "5", title: "Magsaysay Founding Anniversary", municipality: "Magsaysay", locationNote: "",
    category: "Founding Anniversary", status: "Scheduled",
    description: "Commemorating Magsaysay’s history and progress through cultural performances and community events." },
  { month: "April", dateText: "16", title: "Abra de Ilog Founding Anniversary", municipality: "Abra de Ilog", locationNote: "",
    category: "Founding Anniversary", status: "Scheduled",
    description: "A celebration of the town’s establishment with parades, cultural performances, and community programs." },
  { month: "April", dateText: "Tentative", title: "One Oksi Trade and Tourism Fair", municipality: "San Jose", locationNote: "",
    category: "Trade Fair / Market", status: "Tentative",
    description: "A provincial event featuring local products, services, and tourism highlights, promoting sustainable economic growth." },
  { month: "April", dateText: "27", title: "Pamag-uhan sa Pandurucan (Harvest Festival)", municipality: "San Jose", locationNote: "",
    category: "Festival", status: "Scheduled",
    description: "Celebrating local agriculture with booth competitions, cooking contests, and community feasts." },
  { month: "April", dateText: "29", title: "Indak Pandurucan Festival", municipality: "San Jose", locationNote: "",
    category: "Festival", status: "Scheduled",
    description: "An inter-barangay street dance competition showcasing Mangyan and Tamaraw-inspired performances." },
  { month: "May", dateText: "1", title: "Founding Anniversary", municipality: "Looc", locationNote: "",
    category: "Founding Anniversary", status: "Scheduled",
    description: "Marking Looc’s history and achievements through parades, cultural performances, and community gatherings." },
  { month: "May", dateText: "1", title: "Pahago Festival", municipality: "Paluan", locationNote: "",
    category: "Festival", status: "Scheduled",
    description: "A grand celebration of Paluan’s tourism, culture, and products, with performances and exhibits." },
  { month: "May", dateText: "1", title: "Ginoo at Binibining San Jose", municipality: "San Jose", locationNote: "",
    category: "Other", status: "Scheduled",
    description: "A prestigious pageant highlighting local beauty, talent, and cultural heritage." },
  { month: "May", dateText: "1", title: "Founding Anniversary & Feast of St. Joseph the Worker", municipality: "San Jose", locationNote: "",
    category: "Founding Anniversary", status: "Scheduled",
    description: "A week-long event blending religious devotion, cultural showcases, and community activities." },
  { month: "May", dateText: "1st-2nd week", title: "Sandalan Festival and Santa Cruzan", municipality: "Looc", locationNote: "",
    category: "Festival", status: "Scheduled",
    description: "A religious and cultural event honoring the Blessed Virgin Mary, culminating in the Flores de Mayo procession." },
  { month: "May", dateText: "1-8", title: "Feast of St. Michael the Archangel", municipality: "Calintaan", locationNote: "",
    category: "Feast / Fiesta", status: "Scheduled",
    description: "A religious festivity with solemn processions, masses, and community activities." },
  { month: "May", dateText: "7", title: "Tambuid Festival", municipality: "Calintaan", locationNote: "",
    category: "Festival", status: "Scheduled",
    description: "A month-long celebration emphasizing Mangyan heritage and environmental conservation." },
  { month: "May", dateText: "Whole month", title: "Sandalan Festival", municipality: "Lubang", locationNote: "",
    category: "Festival", status: "Scheduled",
    description: "A faith-based celebration with nightly dancing, processions, and community feasts." },
  { month: "May", dateText: "Tentative", title: "Flores de Mayo", municipality: "Sta. Cruz", locationNote: "",
    category: "Parade / Procession", status: "Tentative",
    description: "A partnership event featuring floral processions, performances, and community engagement." },
  { month: "June", dateText: "5", title: "Founding Anniversary", municipality: "Lubang", locationNote: "",
    category: "Founding Anniversary", status: "Scheduled",
    description: "A celebration of Lubang’s progress through parades, cultural events, and community programs." },
  { month: "June", dateText: "18", title: "Calintaan Founding Anniversary", municipality: "Calintaan", locationNote: "",
    category: "Founding Anniversary", status: "Scheduled",
    description: "Commemorating the town’s history with parades, performances, and festivities." },
  { month: "August", dateText: "12", title: "Pandanggo sa Ilaw Festival", municipality: "Lubang", locationNote: "",
    category: "Festival", status: "Scheduled",
    description: "A cultural dance festival celebrating the artistic heritage of Lubang." },
  { month: "August", dateText: "15", title: "Feast of Our Lady of the Assumption", municipality: "Lubang", locationNote: "",
    category: "Feast / Fiesta", status: "Scheduled",
    description: "A religious fiesta honoring the town’s patroness through processions and celebrations." },
  { month: "September", dateText: "15", title: "Feast of the Holy Cross Parish", municipality: "Sta. Cruz", locationNote: "",
    category: "Feast / Fiesta", status: "Scheduled",
    description: "A revived cultural and religious event featuring music, dance, and traditional cuisine." },
  { month: "September", dateText: "27", title: "World Tourism Day", municipality: "San Jose", locationNote: "",
    category: "Observance / Awareness", status: "Scheduled",
    description: "A tourism awareness event with training, cultural showcases, and guided tours." },
  { month: "September", dateText: "Tentative", title: "World Tourism Day Celebration", municipality: "Sta. Cruz", locationNote: "",
    category: "Observance / Awareness", status: "Tentative",
    description: "Promoting local tourism and products through exhibits and interactive events." },
  { month: "October", dateText: "10", title: "Karakol Parade", municipality: "Mamburao", locationNote: "",
    category: "Parade / Procession", status: "Scheduled",
    description: "A lively street dance procession in honor of Nuestra Señora del Pilar." },
  { month: "October", dateText: "11", title: "Fluvial Parade", municipality: "Mamburao", locationNote: "",
    category: "Parade / Procession", status: "Scheduled",
    description: "A maritime procession showcasing decorated boats in thanksgiving for bountiful harvests." },
  { month: "October", dateText: "12", title: "Feast of Nuestra Señora del Pilar", municipality: "Mamburao", locationNote: "",
    category: "Feast / Fiesta", status: "Scheduled",
    description: "A town fiesta with religious activities and community gatherings." },
  { month: "October", dateText: "24", title: "Feast of San Rafael Archangel & Apo Iraya Festival", municipality: "Abra de Ilog", locationNote: "",
    category: "Feast / Fiesta", status: "Scheduled",
    description: "A dual celebration honoring San Rafael and the cultural heritage of the Iraya Mangyan." },
  { month: "October", dateText: "24", title: "Looc Town Fiesta", municipality: "Looc", locationNote: "",
    category: "Feast / Fiesta", status: "Scheduled",
    description: "A faith-based event featuring cultural performances and religious activities." },
  { month: "October", dateText: "Tentative", title: "Indigenous People’s Month", municipality: "Multiple Municipalities", locationNote: "San Jose & Sta. Cruz",
    category: "Observance / Awareness", status: "Tentative",
    description: "Events highlighting Mangyan traditions, artistry, and advocacy efforts." },
  { month: "October", dateText: "Tentative", title: "Tamaraw Conservation Month", municipality: "San Jose", locationNote: "",
    category: "Observance / Awareness", status: "Tentative",
    description: "A month-long awareness campaign on the conservation of the endangered Tamaraw." },
  { month: "November", dateText: "15", title: "Arawatan Festival", municipality: "Province-wide", locationNote: "",
    category: "Festival", status: "Scheduled",
    description: "Focal celebration in the founding anniversary of the province of Occidental Mindoro." },
  { month: "November", dateText: "Tentative", title: "Annual Christmas Lighting", municipality: "San Jose", locationNote: "",
    category: "Christmas / Holiday", status: "Tentative",
    description: "A festive event marking the start of the holiday season with light displays and performances." },
  { month: "December", dateText: "1", title: "Pandurucan Parol Festival", municipality: "San Jose", locationNote: "",
    category: "Christmas / Holiday", status: "Scheduled",
    description: "A competition of locally crafted lanterns symbolizing unity and creativity." },
  { month: "December", dateText: "2", title: "San Jose Night Market Anniversary", municipality: "San Jose", locationNote: "",
    category: "Trade Fair / Market", status: "Scheduled",
    description: "A celebration of local businesses and cultural vibrancy." },
  { month: "December", dateText: "5", title: "Tanglawan 2025", municipality: "Sta. Cruz", locationNote: "",
    category: "Christmas / Holiday", status: "Scheduled",
    description: "A Christmas lighting event featuring performances and community testimonials." },
  { month: "December", dateText: "15", title: "Commemoration of the Liberation of Occidental Mindoro", municipality: "San Jose", locationNote: "",
    category: "Commemoration", status: "Scheduled",
    description: "A tribute to World War II heroes with ceremonies and cultural presentations." },
  { month: "December", dateText: "30", title: "Rizal Day", municipality: "San Jose", locationNote: "",
    category: "Commemoration", status: "Scheduled",
    description: "A solemn commemoration of Dr. Jose Rizal’s legacy with patriotic activities." },
  { month: "December", dateText: "1st week", title: "Pailaw Festival", municipality: "Looc", locationNote: "",
    category: "Christmas / Holiday", status: "Scheduled",
    description: "A dazzling Christmas lights festival symbolizes unity and joy." },
  { month: "December", dateText: "7", title: "Parol Festival", municipality: "Rizal", locationNote: "",
    category: "Christmas / Holiday", status: "Scheduled",
    description: "A showcase of creatively crafted Christmas lanterns promoting local artistry." },
  { month: "December", dateText: "16", title: "Pailaw", municipality: "Magsaysay", locationNote: "",
    category: "Christmas / Holiday", status: "Scheduled",
    description: "A festive light display event with entertainment and community activities." },
  { month: "December", dateText: "Whole month", title: "Paskuhan sa Guraan", municipality: "Paluan", locationNote: "",
    category: "Christmas / Holiday", status: "Scheduled",
    description: "A holiday celebration with cultural performances and festive activities." },
];


// ======================================================================
// SECTION 8 of 22: js/calendar-logic.js
// ======================================================================
/**
 * CALENDAR LOGIC: sorting, Excel rows, and loading the 2025 starter data (no screens, only logic).
 */

// "18-20" -> 18, "30-31 (until April 1)" -> 30. Text like "Tentative", "Whole month" or
// "1st week" has no exact day, so it sorts after the dated events of that month.
function calendarDayKey(dateText){
  const m = String(dateText||"").trim().match(/^(\d{1,2})(?!\w)/);
  return m ? parseInt(m[1], 10) : 100;
}

// Records saved before the calendar types existed have no type: they are the Provincial and Municipal calendar.
function calendarTypeOf(d){
  return d && (d.calendarType==="tourism" || d.calendarType==="arawatan") ? d.calendarType : "provincial";
}

function compareCalendarEvents(a, b){
  const yr = d => calendarTypeOf(d)==="provincial" ? 0 : (parseInt(d.year, 10) || 0);   // provincial = annual, no year
  const ya = yr(a), yb = yr(b);
  if(ya !== yb) return ya - yb;
  const ma = CALENDAR_MONTHS.indexOf(a.month), mb = CALENDAR_MONTHS.indexOf(b.month);
  if(ma !== mb) return ma - mb;
  const da = calendarDayKey(a.dateText), db = calendarDayKey(b.dateText);
  if(da !== db) return da - db;
  return String(a.title||"").localeCompare(String(b.title||""));
}

// "Looc" or "Multiple Municipalities (San Jose & Sta. Cruz)"
function calendarLocation(d){
  const base = d.municipality || "";
  return d.locationNote ? (base ? base + " (" + d.locationNote + ")" : d.locationNote) : base;
}

function calendarEventKey(d){
  const t = calendarTypeOf(d);
  return [t, t==="provincial" ? "" : d.year, d.month, d.dateText, d.title, d.municipality].map(normalizeKey).join("|");
}

function buildCalendarRows(list){
  return list.map((d,i)=>[
    i+1, CALENDAR_TYPE_LABEL[calendarTypeOf(d)], calendarTypeOf(d)==="provincial" ? "" : (d.year||""),
    d.month||"", d.dateText||"", d.title||"", d.municipality||"",
    d.locationNote||"", d.category||"", d.status||"", d.description||"",
  ]);
}

function parseCalendarRow(row){
  const title = String(row["Activity / Event"]||"").trim();
  const month = matchFromList(row["Month"], CALENDAR_MONTHS);
  const municipality = matchFromList(row["Municipality / Venue"], CALENDAR_LOCATIONS);
  if(!title || !month || !municipality) return null;
  // Excel may turn a text like "1-3" into a date; keep just the day number in that case.
  let dateText = row["Date"];
  if(dateText instanceof Date) dateText = String(dateText.getDate());
  const typeLabel = matchFromList(row["Calendar Type"], CALENDAR_TYPES.map(t=>t.label));
  const typeKey = (CALENDAR_TYPES.find(t=>t.label===typeLabel) || {key:"provincial"}).key;   // no type column = Provincial and Municipal
  return {
    calendarType: typeKey,
    year: typeKey==="provincial" ? "" : (String(row["Year"]||"").trim() || String(new Date().getFullYear())),
    month, municipality,
    dateText: String(dateText||"").trim(),
    title,
    locationNote: String(row["Other Location Details"]||"").trim(),
    category: typeKey==="arawatan" ? "" : (matchFromList(row["Category"], CALENDAR_CATEGORIES) || "Other"),
    status: matchFromList(row["Status"], CALENDAR_STATUSES) || "Scheduled",
    description: String(row["Description"]||"").trim(),
  };
}

// Records from js/calendar-seed.js that are not already in `existing`, each with a new id.
function calendarSeedRecords(existing){
  const have = new Set(existing.map(calendarEventKey));
  const out = [];
  CALENDAR_2025_SEED.forEach((e, i) => {
    const rec = { ...e, calendarType: "provincial", year: "" };
    if(have.has(calendarEventKey(rec))) return;
    have.add(calendarEventKey(rec));
    out.push({ ...rec, id: "CAL-2025-" + String(i+1).padStart(3, "0") });
  });
  return out;
}


// ======================================================================
// SECTION 9 of 22: js/cloud.js
// ======================================================================
/**
 * CLOUD SAVE / LOAD: reads and writes the inventory in Firebase Firestore (inventory/data).
 */

const CLOUD_DOC = () => window.db.collection("inventory").doc("data");

function withTimeout(promise, ms, label){
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(label + " timed out")), ms)),
  ]);
}

async function saveInventoryToCloud(establishments, attractions, cbtos, officers, calendar, directoryCategories, arawatanThemes){
  await withTimeout(CLOUD_DOC().set({
    establishments, attractions, cbtos: cbtos||[], officers: officers||[], calendar: calendar||[],
    directoryCategories: (directoryCategories && directoryCategories.length) ? directoryCategories : DIRECTORY_CATEGORIES,
    arawatanThemes: arawatanThemes || {},
    updatedAt: new Date().toISOString(),
  }), 15000, "Saving");
}

async function loadInventoryFromCloud(){
  const snap = await withTimeout(CLOUD_DOC().get(), 15000, "Loading");
  if(!snap.exists) return null;
  return snap.data();
}


// ======================================================================
// SECTION 10 of 22: js/ui-components.jsx
// ======================================================================
/**
 * SHARED SCREEN PARTS: icons, form fields, badges, pop-up windows, confirm dialogs, charts, filter bar.
 */

const Icon = ({d, size=16, color="currentColor"}) => (
  <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  plus: "M12 5v14M5 12h14",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
  x: "M18 6 6 18M6 6l12 12",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  pin: "M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  download: "M12 3v12M7 10l5 5 5-5M4 21h16",
  upload: "M12 21V9M7 14l5-5 5 5M4 3h16",
  eye: "M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
};

function Field({label, required, children}){
  return (<label className="field">
    <span className="field-label">{label}{required && <span className="req"> *</span>}</span>
    {children}
  </label>);
}

function Pill({children, tone="teal"}){
  return <span className={"pill pill-"+tone}>{children}</span>;
}

function StatCard({label, value}){
  return (<div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </div>);
}

function Modal({title, onClose, children}){
  return (<div className="modal-overlay" onMouseDown={(e)=>{ if(e.target===e.currentTarget) onClose(); }}>
    <div className="modal">
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="btn-ghost" onClick={onClose}><Icon d={ICONS.x} color="#5E6E6A" /></button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>);
}

function ConfirmDialog({text, onCancel, onConfirm}){
  return (<div className="modal-overlay" style={{alignItems:"center"}}>
    <div className="confirm-box">
      <p style={{fontSize:14,margin:0}}>{text}</p>
      <div className="confirm-actions">
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>);
}

function WarningDialog({text, onStay, onDiscard}){
  return (<div className="modal-overlay" style={{alignItems:"center", zIndex:60}}>
    <div className="confirm-box">
      <p style={{fontSize:14,margin:0}}>{text}</p>
      <div className="confirm-actions">
        <button className="btn btn-primary" onClick={onStay}>Stay and Continue Editing</button>
        <button className="btn btn-danger" onClick={onDiscard}>Discard Changes</button>
      </div>
    </div>
  </div>);
}

function ViewField({label, value}){
  const display = (value===undefined || value===null || value==="") ? "—" : value;
  return (<div className="view-field">
    <div className="view-field-label">{label}</div>
    <div className="view-field-value">{display}</div>
  </div>);
}

function BarList({data, color}){
  const max = Math.max(1, ...data.map(d=>d.count));
  return (<div>
    {data.map(d=>(
      <div className="bar-row" key={d.name}>
        <div className="bar-label" title={d.name}>{d.name}</div>
        <div className="bar-track"><div className="bar-fill" style={{width:(d.count/max*100)+"%", background:color}}></div></div>
        <div className="bar-count">{d.count}</div>
      </div>
    ))}
    {data.length===0 && <div style={{fontSize:13,color:"var(--subtext)"}}>No data yet.</div>}
  </div>);
}

function Donut({data, total}){
  let acc = 0;
  const stops = data.map((d,i)=>{
    const pct = total ? (d.value/total*100) : 0;
    const start = acc; acc += pct;
    return PIE_COLORS[i % PIE_COLORS.length] + " " + start.toFixed(2) + "% " + acc.toFixed(2) + "%";
  }).join(", ");
  return (<div className="donut-wrap">
    <div className="donut" style={{background: total ? ("conic-gradient(" + stops + ")") : "#EDEFEE"}}>
      <div className="donut-hole"><b>{total}</b><span>total</span></div>
    </div>
    <div>
      {data.map((d,i)=>(
        <div className="legend-item" key={d.name}>
          <span className="legend-dot" style={{background:PIE_COLORS[i % PIE_COLORS.length]}}></span>
          {d.name} — {d.value}
        </div>
      ))}
    </div>
  </div>);
}

function SingleSheetToolbar({ title, sheetName, headers, buildRows, data, setData, parseRow, dedupeKey, idPrefix, isAdmin, filenamePrefix }){
  const fileRef = useRef(null);

  const handleExport = () => {
    if (!isAdmin) { alert("View-only mode: only the admin can download data."); return; }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...buildRows(data)]);
    ws['!cols'] = headers.map(h => ({ wch: Math.max(14, h.length + 2) }));
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filenamePrefix + "-" + timestamp() + ".xlsx");
  };

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "array", cellDates: true });
        const rows = sheetToRows(wb, sheetName, headers);
        const existingKeys = new Set(data.map(dedupeKey));
        const toAdd = [];
        let skipped = 0, dup = 0;
        rows.forEach(row => {
          const parsed = parseRow(row);
          if(!parsed){ skipped++; return; }
          const key = dedupeKey(parsed);
          if(existingKeys.has(key)){ dup++; return; }
          existingKeys.add(key);
          toAdd.push({ ...parsed, id: idPrefix+"-import-"+Date.now()+"-"+Math.random().toString(36).slice(2,7) });
        });
        if(toAdd.length) setData(prev => [...prev, ...toAdd]);
        alert(
          title + " import complete.\n\n" +
          "Added: " + toAdd.length + "\n" +
          "Skipped (missing required fields): " + skipped + "\n" +
          "Skipped (already in list): " + dup
        );
      } catch(err){
        alert("Could not read this file. Please upload the .xlsx file with the original '" + sheetName + "' sheet, unedited headers.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (<div className="data-toolbar">
    <div className="grow"><b>Backup &amp; Import:</b> {isAdmin
      ? "Download this list as an Excel file to back up or edit offline, then upload it back to bulk-add records."
      : "You are in view-only mode. Download and upload actions are available only to the administrator."}
    </div>
    {isAdmin && (
      <button className="btn btn-outline-teal" onClick={handleExport}><Icon d={ICONS.download} size={14} color="#1C6B6E" /> Download Excel</button>
    )}
    {isAdmin && (
      <button className="btn btn-outline-gold" onClick={()=>fileRef.current.click()}><Icon d={ICONS.upload} size={14} color="#8A5F16" /> Upload Excel</button>
    )}
    <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} />
  </div>);
}

function FilterBar({filters, setFilters, options, fields}){
  const update = (k,v) => setFilters(prev=>({...prev, [k]: v}));
  return (<div className="filter-bar">
    {fields.map(fld=>(
      <div className="filter-field" key={fld.key}>
        <div className="filter-field-label">{fld.label}</div>
        {fld.type==="search" ? (
          <div className="search-wrap">
            <span className="search-icon"><Icon d={ICONS.search} size={13} /></span>
            <input type="text" value={filters[fld.key]||""} onChange={(e)=>update(fld.key, e.target.value)} placeholder={fld.placeholder} />
          </div>
        ) : (
          <MultiSelectFilter options={options[fld.key]||[]} value={filterSel(filters[fld.key])} onChange={(v)=>update(fld.key, v)} allLabel="All" />
        )}
      </div>
    ))}
    <button className="clear-btn" onClick={()=>setFilters({})}>Clear filters</button>
  </div>);
}

// =====================================================================
// RECORDS PRINT REPORTS (Enterprises, Accreditation, Attractions, CBTOs)
// Same print mechanism, header, look and generated-by note as the
// Directory print report (re-uses its .dir-print-root print styles).
// =====================================================================
function PrintIcon(){
  return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1C6B6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>);
}


// ======================================================================
// SECTION 11 of 22: js/print-builders.jsx
// ======================================================================
/**
 * PRINT REPORT DATA: which columns and filters appear on each printed report.
 */

function printCell(v){ return (v===undefined || v===null || v==="") ? "—" : String(v); }

function printFilterSummary(fields, filters){
  const parts = fields.filter(fl => filters && filterSel(filters[fl.key]).length).map(fl => fl.label + ": " + filterSel(filters[fl.key]).join(", "));
  return parts.length ? parts.join("; ") : "None (all records)";
}

const ENTERPRISE_PRINT_FILTERS = [
  {key:"name", label:"Enterprise"}, {key:"municipality", label:"Municipality"}, {key:"classification", label:"Classification"},
  {key:"type", label:"Type"}, {key:"status", label:"Status"}, {key:"tourlista", label:"TourLISTA"}, {key:"year", label:"Year"},
];

const ACCRED_PRINT_FILTERS = [
  {key:"year", label:"Year"}, {key:"month", label:"Month"}, {key:"name", label:"Enterprise"},
  {key:"municipality", label:"Municipality"}, {key:"classification", label:"Classification"},
  {key:"type", label:"Type"}, {key:"dot", label:"DOT List As Of"}, {key:"status", label:"Status"},
];

const ATTRACTION_PRINT_FILTERS = [
  {key:"name", label:"Attraction"}, {key:"municipality", label:"Municipality"}, {key:"category", label:"Category"},
  {key:"selection", label:"Status"}, {key:"physicalCondition", label:"Physical Condition"}, {key:"declarationStatus", label:"Declaration Status"},
];

const CBTO_PRINT_FILTERS = [
  {key:"nameAddress", label:"CBTO Name"}, {key:"municipality", label:"Municipality"},
];

const CALENDAR_PRINT_FILTERS = [
  {key:"title", label:"Search"}, {key:"year", label:"Year"}, {key:"month", label:"Month"},
  {key:"municipality", label:"Municipality"}, {key:"category", label:"Category"}, {key:"status", label:"Status"},
];

// Enterprises: every field of the Enterprises Excel export except the accreditation
// columns, which now live in (and print from) the Accreditation section.
function buildEnterprisesPrint(list, filters){
  const keep = ESTAB_HEADERS.map((h,i)=> /accredit/i.test(h) ? -1 : i).filter(i=>i>=0);
  return {
    title: "Enterprises Records",
    filterText: printFilterSummary(ENTERPRISE_PRINT_FILTERS, filters),
    total: list.length,
    headers: keep.map(i=>ESTAB_HEADERS[i]),
    rows: buildEstabRows(list).map(r=>keep.map(i=>printCell(r[i]))),
    colWidths: [3,10,8,6,6,7,9,6,7,4,4,4,4,6,5,4,6],
    dense: true,
  };
}

function buildAttractionsPrint(list, filters){
  return {
    title: "Attractions Records",
    filterText: printFilterSummary(ATTRACTION_PRINT_FILTERS, filters),
    total: list.length,
    headers: ATTR_HEADERS,
    rows: buildAttrRows(list).map(r=>r.map(printCell)),
    colWidths: [4,8,14,5,7,7,9,10,5,10,12,4.5,4.5],
    dense: true,
  };
}

function buildCbtosPrint(list, filters){
  return {
    title: "CBTOs Records",
    filterText: printFilterSummary(CBTO_PRINT_FILTERS, filters),
    total: list.length,
    headers: CBTO_HEADERS,
    rows: buildCbtoRows(list).map(r=>r.map(printCell)),
    colWidths: [4,9,20,13,7,7,7,16,17],
    dense: false,
  };
}

// Calendar of Activities: one row per activity, in date order (the list passed in is already sorted).
function buildCalendarPrint(list, filters, calType, themes){
  const type = calType || "tourism";
  const th = themes || {};
  const years = filterSel(filters && filters.year);
  const year = years.length ? " " + years.join(", ") : "";
  const common = d => [printCell(d.month), printCell(d.dateText), printCell(d.title), printCell(calendarLocation(d))];
  const base = {
    title: CALENDAR_TYPE_LABEL[type] + (type==="provincial" ? "" : year),
    filterText: printFilterSummary(CALENDAR_PRINT_FILTERS, filters),
    total: list.length,
    dense: false,
  };
  if(type==="provincial"){
    return { ...base,
      headers: ["No.","Month","Date","Activity / Event","Municipality / Venue","Category","Status","Description"],
      rows: list.map((d,i)=>[i+1, ...common(d), printCell(d.category), printCell(d.status), printCell(d.description)]),
      colWidths: [4,8,9,21,13,11,7,27],
    };
  }
  if(type==="arawatan"){
    const theme = years.length===1 ? th[years[0]] : "";
    return { ...base,
      filterText: (theme ? "Theme: " + theme + "; " : "") + base.filterText,
      headers: ["No.","Year","Theme","Month","Date","Activity","Venue","Status","Description"],
      rows: list.map((d,i)=>[i+1, printCell(d.year), printCell(th[d.year]), ...common(d), printCell(d.status), printCell(d.description)]),
      colWidths: [4,5,16,8,8,17,11,7,24],
    };
  }
  return { ...base,
    headers: ["No.","Year","Month","Date","Activity / Event","Municipality / Venue","Category","Status","Description"],
    rows: list.map((d,i)=>[i+1, printCell(d.year), ...common(d), printCell(d.category), printCell(d.status), printCell(d.description)]),
    colWidths: [4,5,8,9,19,11,10,7,27],
  };
}

// Accreditation Monitoring Report: one row per accreditation period in the selected
// year (and month, if chosen). The Year filter is required, so it is always in the title.
function buildAccreditationPrint(rows, filters){
  const count = {Valid:0, "To Expire":0, Expired:0};
  rows.forEach(r=>{ if(count[r.status]!==undefined) count[r.status]++; });
  const notAccred = filters && filters.status==="Not Accredited";
  const period = (filters && filters.month ? filters.month + " " : "") + (filters && filters.year ? filters.year : "");
  const summary = (!notAccred && rows.length)
    ? "  |  Valid: " + count.Valid + " · To Expire: " + count["To Expire"] + " · Expired: " + count.Expired
    : "";
  return {
    title: notAccred ? "Accreditation Monitoring Report — Enterprises Not Accredited" : "Accreditation Monitoring Report — " + period,
    filterText: printFilterSummary(ACCRED_PRINT_FILTERS, filters) + summary,
    total: rows.length,
    headers: ["No.","Name of Enterprise","Municipality","Classification","Type","Level of Accreditation","Accreditation Number","Date Accredited","Valid Until","DOT List As Of","Status"],
    rows: rows.map((r,i)=>[
      i+1, printCell(r.d.name), printCell(r.d.municipality), printCell(r.d.classification), printCell(r.d.type),
      printCell(r.h && r.h.type), printCell(r.h && r.h.number),
      (r.h && r.h.accredDate) ? formatDateDisplay(r.h.accredDate) : "—",
      (r.h && r.h.validity) ? formatDateDisplay(r.h.validity) : "—",
      (r.h && r.h.dotAsOf) ? formatDateDisplay(r.h.dotAsOf) : "—",
      r.status,
    ]),
    colWidths: [4,16,8,9,10,8,11,8,8,8,10],
    dense: true,
  };
}

// Month-by-month summary for one year (printed from the Accreditation dashboard).
function buildAccreditationMonthlyPrint(year, municipality, monthly, yearStats){
  return {
    title: "Accreditation Monthly Summary — " + year,
    filterText: "Year: " + year + "; Municipality: " + (municipality || "All"),
    total: yearStats.accredited.size,
    headers: ["Month","Accredited","To Expire","Expired"],
    rows: [
      ...monthly.map(m=>[m.month, m.accredited, m.toExpire, m.expired]),
      [<strong key="t">Year total (enterprises)</strong>, <strong key="a">{yearStats.accredited.size}</strong>, <strong key="b">{yearStats.toExpire.size}</strong>, <strong key="c">{yearStats.expired.size}</strong>],
    ],
    colWidths: [34,22,22,22],
    dense: false,
  };
}

// One enterprise's complete accreditation record (printed from the record view).
function buildEnterpriseAccreditationPrint(d){
  const hist = sortAccredHistoryDesc(getAccredHistory(d));
  return {
    title: "Accreditation Record",
    filterText: "Enterprise: " + (d.name||"—") + "; Municipality: " + (d.municipality||"—") + "; Type: " + (d.type||"—"),
    total: hist.length,
    headers: ["No.","Level of Accreditation","Accreditation Number","Date Accredited","Valid Until","DOT List As Of","Status"],
    rows: hist.map((h,i)=>[
      i+1, printCell(h.type), printCell(h.number),
      h.accredDate ? formatDateDisplay(h.accredDate) : "—",
      h.validity ? formatDateDisplay(h.validity) : "—",
      h.dotAsOf ? formatDateDisplay(h.dotAsOf) : "—",
      accredPeriodStatus(h, ""),
    ]),
    colWidths: [5,17,20,15,15,15,13],
    dense: false,
  };
}


// ======================================================================
// SECTION 12 of 22: js/establishments.jsx
// ======================================================================
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
  // A new enterprise starts with one empty accreditation row so the fields are visible right away.
  const [f, setF] = useState(() => applyTourGuideAutoFields(initial ? {...initial, accredHistory: getAccredHistory(initial)} : {...emptyEstablishment, accredHistory: [{type:"", number:"", accredDate:"", validity:"", dotAsOf:""}]}));
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
      if(k==="classification"){
        next.type = "";
        // keep only the accreditation levels allowed for the new classification
        const allowed = accredLevelsForClassification(v);
        next.accredHistory = (prev.accredHistory||[]).map(h => allowed.includes(h.type) ? h : {...h, type:""});
      }
      if(k==="status" && v!=="Others") next.statusOthers = "";
      if(k==="type" && prev.type==="Tour Guides" && v!=="Tour Guides"){
        // leaving Tour Guides — clear the auto-filled N/A so the fields are editable again
        ["proprietor","rooms","maleEmployees","femaleEmployees"].forEach(key=>{ if(next[key]==="N/A") next[key]=""; });
      }
      return applyTourGuideAutoFields(next);
    });
  };

  const addHistoryEntry = () => {
    setF(prev => ({...prev, accredHistory: [...(prev.accredHistory||[]), {type:"", number:"", accredDate:"", validity:"", dotAsOf:""}]}));
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
    const accredProblem = validateAccredEntries(f.accredHistory, initialSnapshotRef.current.accredHistory);
    if(accredProblem){
      alert(accredProblem);
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
      <div style={{gridColumn:"1 / -1"}}>
        <Field label="Accreditation">
          <div style={{fontSize:11, color:"var(--subtext)", marginTop:-2, marginBottom:8}}>
            Leave blank if the enterprise is not accredited. Add one period for every accreditation. Enter at least one date. DOT List As Of = date of the DOT file where the enterprise first appeared. An accreditation is counted from its Date Accredited (or, if blank, its DOT List As Of date) up to its Valid Until month; with no Valid Until, it is counted only in the year of that date.
          </div>
          {(f.accredHistory||[]).map((h, idx)=>(
            <div key={idx} style={{display:"flex", gap:8, alignItems:"flex-end", marginBottom:8, flexWrap:"wrap"}}>
              <div style={{flex:"1 1 130px"}}>
                <div style={{fontSize:11, fontWeight:700, color:"var(--subtext)", marginBottom:4}}>Level of Accreditation</div>
                <select value={h.type} onChange={(e)=>updateHistoryEntry(idx,"type",e.target.value)} disabled={!f.classification}>
                  <option value="">{f.classification ? "Select level" : "Select classification first"}</option>
                  {accredLevelsForClassification(f.classification).map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{flex:"1 1 150px"}}>
                <div style={{fontSize:11, fontWeight:700, color:"var(--subtext)", marginBottom:4}}>Accreditation Number</div>
                <input type="text" value={h.number} onChange={(e)=>updateHistoryEntry(idx,"number",e.target.value)} placeholder="e.g. ACC-2026-0001" />
              </div>
              <div style={{flex:"1 1 140px"}}>
                <div style={{fontSize:11, fontWeight:700, color:"var(--subtext)", marginBottom:4}}>Date Accredited</div>
                <input type="date" value={h.accredDate} onChange={(e)=>updateHistoryEntry(idx,"accredDate",e.target.value)} />
              </div>
              <div style={{flex:"1 1 140px"}}>
                <div style={{fontSize:11, fontWeight:700, color:"var(--subtext)", marginBottom:4}}>Valid Until</div>
                <input type="date" value={h.validity} onChange={(e)=>updateHistoryEntry(idx,"validity",e.target.value)} />
              </div>
              <div style={{flex:"1 1 140px"}}>
                <div style={{fontSize:11, fontWeight:700, color:"var(--subtext)", marginBottom:4}}>DOT List As Of</div>
                <input type="date" value={h.dotAsOf||""} onChange={(e)=>updateHistoryEntry(idx,"dotAsOf",e.target.value)} />
              </div>
              <button type="button" className="btn-ghost" onClick={()=>removeHistoryEntry(idx)} title="Remove this period">
                <Icon d={ICONS.trash} color="#A8442D" />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-outline-teal" onClick={addHistoryEntry}>
            <Icon d={ICONS.plus} size={13} color="#1C6B6E" /> Add Accreditation Period
          </button>
        </Field>
      </div>
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

    <div style={{marginTop:14}}>
      <div className="view-field-label" style={{marginBottom:6}}>Accreditation</div>
      <div style={{display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:8}}>
        <Pill tone={accredStatusTone(getAccredState(item)==="Accredited" ? "Valid" : getAccredState(item))}>{getAccredState(item)}</Pill>
        {latestAccredEntry(item) && latestAccredEntry(item).validity && (
          <span style={{fontSize:12, color:"var(--subtext)"}}>
            {getAccredState(item)==="Expired" ? "Expired on " : "Valid until "}{formatDateDisplay(latestAccredEntry(item).validity)}
          </span>
        )}
      </div>
      <AccredHistoryTable list={getAccredHistory(item)} />
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
    if(!matchSel(filters.municipality, d.municipality)) return false;
    if(!matchSel(filters.classification, d.classification)) return false;
    if(!matchSel(filters.type, d.type)) return false;
    if(!matchSel(filters.status, d.status)) return false;
    if(!matchSel(filters.tourlista, d.tourlista||"No")) return false;
    if(!matchSel(filters.year, d.year)) return false;
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


// ======================================================================
// SECTION 13 of 22: js/attractions.jsx
// ======================================================================
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
    if(!matchSel(filters.municipality, d.municipality)) return false;
    if(!matchSel(filters.category, d.category)) return false;
    if(!matchSel(filters.selection, d.selection)) return false;
    if(!matchSel(filters.physicalCondition, d.physicalCondition)) return false;
    if(!matchSel(filters.declarationStatus, d.declarationStatus)) return false;
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


// ======================================================================
// SECTION 14 of 22: js/cbto.jsx
// ======================================================================
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
    if(!matchSel(filters.municipality, d.municipality)) return false;
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


// ======================================================================
// SECTION 15 of 22: js/directory.jsx
// ======================================================================
/**
 * DIRECTORY SCREEN: tourism officers / contacts directory, list and form.
 */

const emptyDirectoryRecord = {
  provinceCity: "", municipality: "", name: "", position: "", officeAgency: "",
  contact: "", email: "", category: "Tourism Officer", year: String(new Date().getFullYear()),
  status: "Active",
};

const DIRECTORY_PLURALS = {"Elected Official":"Elected Officials","PTC Member":"PTC Members","Department Head":"Department Heads","Tourism Officer":"Tourism Officers","Others":"Others"};

function DirectoryForm({initial, onCancel, onSave, existingData, officeOptions, categories, onAddCategory, onRenameCategory, categoryCount}){
  const [f, setF] = useState(() => normalizeDirectoryRecord(initial || emptyDirectoryRecord));
  const [dupeWarning, setDupeWarning] = useState(null);
  // Add / Edit category: small inline editor under the Category dropdown
  const [catMode, setCatMode] = useState(null);   // null | "add" | "edit"
  const [catText, setCatText] = useState("");
  const [catError, setCatError] = useState("");
  const startCat = (mode) => { setCatMode(mode); setCatText(mode==="edit" ? f.category : ""); setCatError(""); };
  const cancelCat = () => { setCatMode(null); setCatText(""); setCatError(""); };
  const saveCat = () => {
    const name = catText.trim().replace(/\s+/g, " ");
    if(!name){ setCatError("Please type a category name."); return; }
    let err = "";
    if(catMode==="add") err = onAddCategory(name);
    else if(name !== f.category) err = onRenameCategory(f.category, name);
    if(err){ setCatError(err); return; }
    setF(prev=>({...prev, category: name}));
    cancelCat();
  };
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
          {[PROVINCE_NAME, ...MUNICIPALITIES].map(m=><option key={m} value={m} />)}
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
          {(categories.includes(f.category) ? categories : [...categories, f.category]).map(o=><option key={o} value={o}>{o}</option>)}
        </select>
        {!catMode && (
          <div style={{display:"flex", gap:6, marginTop:6}}>
            <button type="button" className="btn btn-outline-teal btn-sm" onClick={()=>startCat("add")}><Icon d={ICONS.plus} size={12} color="#1C6B6E" /> Add Category</button>
            <button type="button" className="btn btn-outline-teal btn-sm" onClick={()=>startCat("edit")}><Icon d={ICONS.edit} size={12} color="#1C6B6E" /> Edit Category</button>
          </div>
        )}
        {catMode && (
          <div style={{marginTop:6, padding:8, border:"1px solid var(--border)", borderRadius:8, background:"var(--bg, #f7f8f8)"}}>
            <div style={{fontSize:11, fontWeight:700, color:"var(--subtext)", marginBottom:4}}>
              {catMode==="add" ? "New category name" : "Rename \"" + f.category + "\""}
            </div>
            <input type="text" value={catText} autoFocus onChange={e=>{ setCatText(e.target.value); setCatError(""); }}
              onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); saveCat(); } }}
              placeholder={catMode==="add" ? "e.g. Barangay Official" : "New name"} />
            {catMode==="edit" && (
              <div style={{fontSize:11, color:"var(--subtext)", marginTop:4}}>
                Renaming applies to all {categoryCount(f.category)} record(s) using this category.
              </div>
            )}
            {catError && <div style={{fontSize:12, color:"var(--danger)", marginTop:4}}>{catError}</div>}
            <div style={{display:"flex", gap:6, marginTop:6}}>
              <button type="button" className="btn btn-sm" onClick={cancelCat}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={saveCat}>{catMode==="add" ? "Add" : "Save Name"}</button>
            </div>
          </div>
        )}
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
function DirectorySection({data: rawData, setData, isAdmin, categories: savedCategories, setCategories}){
  const data = useMemo(()=>rawData.map(normalizeDirectoryRecord), [rawData]);

  // Category list = the saved list + any category found in records (e.g. from an Excel import)
  const categories = useMemo(()=>{
    const base = (savedCategories && savedCategories.length) ? savedCategories : DIRECTORY_CATEGORIES;
    const extra = [...new Set(data.map(d=>d.category).filter(c=>c && !base.includes(c)))];
    return [...base, ...extra];
  }, [savedCategories, data]);
  const addCategory = (name) => {
    if(categories.some(c=>c.toLowerCase()===name.toLowerCase())) return "That category already exists.";
    if(setCategories) setCategories([...categories, name]);
    return "";
  };
  const renameCategory = (oldName, newName) => {
    if(newName.toLowerCase()!==oldName.toLowerCase() && categories.some(c=>c.toLowerCase()===newName.toLowerCase())) return "That category already exists.";
    if(setCategories) setCategories(categories.map(c=>c===oldName ? newName : c));
    setData(prev=>prev.map(d=> normalizeDirectoryRecord(d).category===oldName ? {...d, category:newName} : d));
    setFilters(prev=> filterSel(prev.category).includes(oldName) ? {...prev, category: filterSel(prev.category).map(c=>c===oldName ? newName : c)} : prev);
    return "";
  };
  const categoryCount = (name) => data.filter(d=>d.category===name).length;

  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [banner, setBanner] = useState(null);
  const pageSize = 15;
  const [printing, setPrinting] = useState(false);
  const [notedBy, setNotedBy] = useState(null);

  const flashBanner = (type, text) => {
    setBanner({type, text});
    setTimeout(()=>setBanner(b => (b && b.text===text) ? null : b), 3500);
  };

  const options = useMemo(()=>({
    provinceCity: [...new Set(data.map(d=>d.provinceCity).filter(Boolean))].sort(compareLGU),
    municipality: [...new Set(data.map(d=>d.municipality).filter(Boolean))].sort(compareLGU),
    category: categories,
    officeAgency: [...new Set(data.map(d=>d.officeAgency).filter(Boolean))].sort(),
    year: [...new Set(data.map(d=>d.year).filter(Boolean))].sort().reverse(),
    status: DIRECTORY_STATUSES,
  }), [data, categories]);

  // LGU order for the Directory list and its printout: Province / province-level records first,
  // then municipalities A-Z, then name A-Z, then newest year first.
  const lguCompareRecords = useMemo(()=>{
    const muniSet = new Set(MUNICIPALITIES.map(m=>m.toLowerCase()));
    const isProvince = d => {
      const m = (d.municipality||"").trim().toLowerCase();
      return !m || !muniSet.has(m) || m === (d.provinceCity||"").trim().toLowerCase() || isProvinceLGU(d.municipality);
    };
    const cmp = (a,b) => String(a||"").localeCompare(String(b||""), undefined, {sensitivity:"base"});
    return (a,b) => {
      const pa = isProvince(a) ? 0 : 1, pb = isProvince(b) ? 0 : 1;
      if(pa !== pb) return pa - pb;
      const c = cmp(a.municipality, b.municipality); if(c) return c;
      return cmp(a.name, b.name) || cmp(b.year, a.year);
    };
  }, []);

  const filtered = useMemo(()=>{
    const q = search.trim().toLowerCase();
    return data.filter(d=>{
      if(!matchSel(filters.provinceCity, d.provinceCity)) return false;
      if(!matchSel(filters.municipality, d.municipality)) return false;
      if(!matchSel(filters.category, d.category)) return false;
      if(!matchSel(filters.officeAgency, d.officeAgency)) return false;
      if(!matchSel(filters.year, d.year)) return false;
      if(!matchSel(filters.status, d.status)) return false;
      if(q){
        const hay = [d.name,d.position,d.officeAgency,d.contact,d.email].join(" ").toLowerCase();
        if(!hay.includes(q)) return false;
      }
      return true;
    }).sort(lguCompareRecords);
  }, [data, filters, search, lguCompareRecords]);

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
    if(!printing || !notedBy) return;
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
    const done = () => { cleanup(); setPrinting(false); setNotedBy(null); };
    window.addEventListener("afterprint", done, {once:true});
    const t = setTimeout(()=>window.print(), 200);
    return ()=>{ clearTimeout(t); window.removeEventListener("afterprint", done); cleanup(); };
  }, [printing, notedBy]);

  const printList = useMemo(()=>[...filtered].sort(lguCompareRecords), [filtered, lguCompareRecords]);
  const printTitle = (() => {
    const cs = filterSel(filters.category);
    return cs.length===1 ? (DIRECTORY_PLURALS[cs[0]] || cs[0]) + " Directory" : "Directory";
  })();

  const printFilterText = (() => {
    const labels = {provinceCity:"Province/City", municipality:"Municipality", category:"Category", officeAgency:"Office/Agency", year:"Year", status:"Status"};
    const parts = Object.keys(labels).filter(k=>filterSel(filters[k]).length).map(k=>labels[k]+": "+filterSel(filters[k]).join(", "));
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
    const ys = filterSel(filters.year);
    if(!ys.length){ flashBanner("error", "Select a Year filter first to export that year's records."); return; }
    exportSubset(data.filter(d=>ys.includes(d.year)), "Year-"+ys.join("-"));
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
      {categories.map(c=><StatCard key={c} label={DIRECTORY_PLURALS[c] || c} value={filtered.filter(d=>d.category===c).length} />)}
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
        <DirectoryForm initial={modal.item} onCancel={()=>setModal(null)} onSave={save} existingData={data} officeOptions={officeOptions}
          categories={categories} onAddCategory={addCategory} onRenameCategory={renameCategory} categoryCount={categoryCount} />
      </Modal>
    )}
    {printing && !notedBy && <NotedByDialog onConfirm={setNotedBy} onCancel={()=>setPrinting(false)} />}
    {printing && notedBy && ReactDOM.createPortal(
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
          <p style={{marginTop:4}}>Date generated: {new Date().toLocaleString("en-PH", {year:"numeric", month:"long", day:"numeric", hour:"numeric", minute:"2-digit"})}</p>
        </div>
        <PrintSignatories notedBy={notedBy} />
      </div>,
      document.body
    )}
    {toDelete && (
      <ConfirmDialog text={'Delete the record for "'+toDelete.name+'" ('+(toDelete.municipality||"—")+', '+(toDelete.year||"—")+')? This cannot be undone.'} onCancel={()=>setToDelete(null)} onConfirm={handleDelete} />
    )}
  </div>);
}


// ======================================================================
// SECTION 16 of 22: js/calendar.jsx
// ======================================================================
/**
 * CALENDAR SCREEN: Calendar of Activities (festivals, anniversaries, feasts) with add / edit / delete,
 * filters, a month-by-month view, a records table, Excel download/upload and a print report.
 */

const emptyCalendarEvent = {
  calendarType: "tourism",
  year: String(new Date().getFullYear()), month: "", dateText: "", title: "",
  municipality: "", locationNote: "", category: "Festival", status: "Scheduled", description: "",
};

function CalendarForm({initial, onCancel, onSave, calType, defaultYear}){
  const [f, setF] = useState(() => initial
    ? {...initial, calendarType: calendarTypeOf(initial)}
    : {...emptyCalendarEvent, calendarType: calType, year: defaultYear || emptyCalendarEvent.year,
       month: calType==="arawatan" ? "November" : "", category: calType==="arawatan" ? "" : "Festival"});
  const type = f.calendarType;
  const set = (k) => (e) => {
    const v = e && e.target ? e.target.value : e;
    setF(prev=>({...prev, [k]: v}));
  };
  const setType = (e) => {
    const v = e.target.value;
    setF(prev=>({...prev, calendarType: v,
      year: v!=="provincial" && !prev.year ? (defaultYear || emptyCalendarEvent.year) : prev.year,
      category: v==="arawatan" ? "" : (prev.category || "Festival")}));
  };
  const submit = () => {
    if(type!=="provincial" && !/^\d{4}$/.test(String(f.year||"").trim())){
      alert("Please enter the year as 4 digits, e.g. 2026.");
      return;
    }
    if(!f.month || !f.title.trim() || !f.municipality){
      alert("Please complete the month, the name of the activity, and the municipality.");
      return;
    }
    onSave({...f,
      year: type==="provincial" ? "" : String(f.year).trim(),
      category: type==="arawatan" ? "" : (f.category || "Other"),
      title: f.title.trim(), dateText: String(f.dateText||"").trim()});
  };
  return (<div>
    <div className="form-grid">
      <div style={{gridColumn:"1 / -1"}}>
        <Field label="Calendar Type" required>
          <select value={type} onChange={setType}>
            {CALENDAR_TYPES.map(t=><option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </Field>
      </div>
      {type!=="provincial" && (
        <Field label="Year" required><input type="text" inputMode="numeric" value={f.year} onChange={set("year")} placeholder="e.g. 2026" /></Field>
      )}
      <Field label="Month" required>
        <select value={f.month} onChange={set("month")}>
          <option value="">Select month</option>
          {CALENDAR_MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
      </Field>
      <div style={{gridColumn:"1 / -1"}}>
        <Field label="Date"><input type="text" value={f.dateText} onChange={set("dateText")} placeholder="e.g. 18-20, 27, Tentative, Whole month, 1st week" /></Field>
      </div>
      <div style={{gridColumn:"1 / -1"}}>
        <Field label="Name of Activity / Event" required><input type="text" value={f.title} onChange={set("title")} placeholder={type==="arawatan" ? "e.g. Grand Parade" : "e.g. Dugoy Festival"} /></Field>
      </div>
      <Field label={type==="arawatan" ? "Municipality / Venue" : "Municipality / Venue"} required>
        <select value={f.municipality} onChange={set("municipality")}>
          <option value="">Select municipality</option>
          {CALENDAR_LOCATIONS.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
      </Field>
      <Field label="Other Location Details"><input type="text" value={f.locationNote} onChange={set("locationNote")} placeholder="e.g. San Jose & Sta. Cruz (optional)" /></Field>
      {type!=="arawatan" && (
        <Field label="Category">
          <select value={f.category} onChange={set("category")}>
            {CALENDAR_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      )}
      <Field label="Status">
        <select value={f.status} onChange={set("status")}>
          {CALENDAR_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <div style={{gridColumn:"1 / -1"}}>
        <Field label="Description"><textarea rows={3} value={f.description} onChange={set("description")} placeholder="Short description of the activity" /></Field>
      </div>
    </div>
    <div className="form-actions">
      <button className="btn" onClick={onCancel}>Cancel</button>
      <button className="btn btn-primary" onClick={submit}>Save Activity</button>
    </div>
  </div>);
}

// Arawatan: one theme per year.
function ArawatanThemeForm({initialYear, initialTheme, lockYear, onCancel, onSave}){
  const [year, setYear] = useState(initialYear || String(new Date().getFullYear()));
  const [theme, setTheme] = useState(initialTheme || "");
  const submit = () => {
    if(!/^\d{4}$/.test(String(year).trim())){ alert("Please enter the year as 4 digits, e.g. 2026."); return; }
    onSave(String(year).trim(), theme.trim());
  };
  return (<div>
    <div className="form-grid">
      <Field label="Year" required><input type="text" inputMode="numeric" value={year} disabled={!!lockYear} onChange={e=>setYear(e.target.value)} placeholder="e.g. 2026" /></Field>
      <div style={{gridColumn:"1 / -1"}}>
        <Field label="Theme"><textarea rows={2} value={theme} autoFocus onChange={e=>setTheme(e.target.value)} placeholder="Theme of the Arawatan celebration for this year" /></Field>
      </div>
    </div>
    <div style={{fontSize:11, color:"var(--subtext)", marginTop:6}}>Leave the theme blank to remove it for this year.</div>
    <div className="form-actions">
      <button className="btn" onClick={onCancel}>Cancel</button>
      <button className="btn btn-primary" onClick={submit}>Save Theme</button>
    </div>
  </div>);
}

function calendarStatusPill(status){
  if(!status || status==="Scheduled") return null;
  const tone = status==="Cancelled" ? "danger" : status==="Completed" ? "grey" : "gold";
  return <Pill tone={tone}>{status}</Pill>;
}

function CalendarSection({data, setData, isAdmin, arawatanThemes, setArawatanThemes}){
  const themes = arawatanThemes || {};
  const [calType, setCalType] = useState("tourism");
  const [view, setView] = useState("monthly");
  const [printing, setPrinting] = useState(false);
  const [filters, setFilters] = useState({});
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const oneYear = filterSel(filters.year).length===1 ? filterSel(filters.year)[0] : "";
  const switchType = (k) => { setCalType(k); setFilters({}); setView("monthly"); };
  const typed = useMemo(()=>data.filter(d=>calendarTypeOf(d)===calType), [data, calType]);

  const options = useMemo(()=>({
    year: [...new Set([...typed.map(d=>d.year), ...(calType==="arawatan" ? Object.keys(themes) : [])].filter(Boolean))].sort((a,b)=>String(b).localeCompare(String(a))),
    month: CALENDAR_MONTHS,
    municipality: CALENDAR_LOCATIONS,
    category: CALENDAR_CATEGORIES,
    status: CALENDAR_STATUSES,
  }), [typed, themes, calType]);

  const filtered = useMemo(()=>typed.filter(d=>{
    if(filters.title){
      const hay = ((d.title||"")+" "+(d.description||"")+" "+calendarLocation(d)).toLowerCase();
      if(!hay.includes(filters.title.toLowerCase())) return false;
    }
    if(!matchSel(filters.year, d.year)) return false;
    if(!matchSel(filters.month, d.month)) return false;
    if(!matchSel(filters.municipality, d.municipality)) return false;
    if(!matchSel(filters.category, d.category)) return false;
    if(!matchSel(filters.status, d.status)) return false;
    return true;
  }).sort(compareCalendarEvents), [typed, filters]);

  // Month-by-month groups (Tourism Office and Provincial/Municipal). Months with no events are
  // still listed ("No listed events") when only the year/month filters are used.
  const groups = useMemo(()=>{
    if(calType==="arawatan") return [];
    const narrowed = !!(filters.title || filterSel(filters.municipality).length || filterSel(filters.category).length || filterSel(filters.status).length);
    const months = filterSel(filters.month).length ? CALENDAR_MONTHS.filter(m=>filterSel(filters.month).includes(m)) : CALENDAR_MONTHS;
    const out = [];
    if(calType==="provincial"){            // annual: no year
      months.forEach(m => {
        const items = filtered.filter(d => d.month===m);
        if(items.length===0 && narrowed) return;
        out.push({ year:"", month:m, items });
      });
      return out;
    }
    const years = filterSel(filters.year).length ? [...filterSel(filters.year)].sort()
      : [...new Set((narrowed ? filtered : typed).map(d=>d.year).filter(Boolean))].sort();
    years.forEach(y => months.forEach(m => {
      const items = filtered.filter(d => d.year===y && d.month===m);
      if(items.length===0 && narrowed) return;
      out.push({ year:y, month:m, items });
    }));
    return out;
  }, [filtered, typed, filters, calType]);

  // Arawatan: one panel per year (theme + that year's activities).
  const arawatanGroups = useMemo(()=>{
    if(calType!=="arawatan") return [];
    const narrowed = !!(filters.title || filterSel(filters.month).length || filterSel(filters.municipality).length || filterSel(filters.status).length);
    const years = filterSel(filters.year).length ? [...filterSel(filters.year)].sort().reverse()
      : [...new Set([...typed.map(d=>d.year), ...Object.keys(themes)].filter(Boolean))].sort().reverse();
    return years.map(y=>({ year:y, items: filtered.filter(d=>d.year===y) })).filter(g=>!narrowed || g.items.length);
  }, [filtered, typed, filters, calType, themes]);

  const save = (f) => {
    if(modal.mode==="edit"){
      setData(prev=>prev.map(d=> d.id===modal.item.id ? {...f, id:d.id} : d));
    } else {
      setData(prev=>[...prev, {...f, id:"CAL-"+Date.now()}]);
    }
    if(f.calendarType !== calType) setCalType(f.calendarType);   // follow the record to its calendar
    setModal(null);
  };
  const saveTheme = (year, theme) => {
    if(setArawatanThemes){
      setArawatanThemes(prev=>{ const n = {...(prev||{})}; if(theme) n[year] = theme; else delete n[year]; return n; });
    }
    setModal(null);
  };
  const handleDelete = () => {
    setData(prev => prev.filter(d => d.id !== toDelete.id));
    setToDelete(null);
  };
  const loadSeed = () => {
    const fresh = calendarSeedRecords(data);
    if(!fresh.length){ alert("The 2025 calendar is already in the list."); return; }
    setData(prev => [...prev, ...fresh]);
  };

  const municipalitiesCovered = new Set(typed.map(d=>d.municipality).filter(m=>MUNICIPALITIES.includes(m))).size;
  const rowActions = (d) => (
    <div className="actions-cell">
      {isAdmin && (<>
        <button className="btn-ghost" title="Edit" onClick={()=>setModal({mode:"edit", item:d})}><Icon d={ICONS.edit} color="#1C6B6E" /></button>
        <button className="btn-ghost" title="Delete" onClick={()=>setToDelete(d)}><Icon d={ICONS.trash} color="#A8442D" /></button>
      </>)}
    </div>
  );

  const filterFields = calType==="tourism" ? [
      {key:"title", label:"Search", type:"search", placeholder:"Activity, place or description"},
      {key:"year", label:"Year"}, {key:"month", label:"Month"}, {key:"municipality", label:"Municipality"},
      {key:"category", label:"Category"}, {key:"status", label:"Status"},
    ] : calType==="provincial" ? [
      {key:"title", label:"Search", type:"search", placeholder:"Activity, place or description"},
      {key:"month", label:"Month"}, {key:"municipality", label:"Municipality"},
      {key:"category", label:"Category"}, {key:"status", label:"Status"},
    ] : [
      {key:"title", label:"Search", type:"search", placeholder:"Activity, place or description"},
      {key:"year", label:"Year"}, {key:"month", label:"Month"}, {key:"municipality", label:"Municipality"},
      {key:"status", label:"Status"},
    ];

  const locCell = d => calendarLocation(d);
  const colDefs = calType==="provincial" ? [
      ["Month", d=>d.month], ["Date", d=>d.dateText], ["Activity / Event", d=>d.title], ["Municipality / Venue", locCell],
      ["Category", d=>d.category], ["Status", d=>d.status], ["Description", d=>d.description],
    ] : calType==="arawatan" ? [
      ["Year", d=>d.year], ["Theme", d=>themes[d.year] || "—"], ["Month", d=>d.month], ["Date", d=>d.dateText],
      ["Activity", d=>d.title], ["Venue", locCell], ["Status", d=>d.status], ["Description", d=>d.description],
    ] : [
      ["Year", d=>d.year], ["Month", d=>d.month], ["Date", d=>d.dateText], ["Activity / Event", d=>d.title],
      ["Municipality / Venue", locCell], ["Category", d=>d.category], ["Status", d=>d.status], ["Description", d=>d.description],
    ];

  const itemRow = (d, dateLabel) => (
    <div className="cal-item" key={d.id}>
      <div className="cal-date">{dateLabel}</div>
      <div className="cal-body">
        <div className="cal-title">{d.title} {calendarStatusPill(d.status)} {d.category && <Pill tone="teal">{d.category}</Pill>}</div>
        <div className="cal-meta"><Icon d={ICONS.pin} size={12} color="#5E6E6A" /> {calendarLocation(d)}</div>
        {d.description && <div className="cal-desc">{d.description}</div>}
      </div>
      {rowActions(d)}
    </div>
  );

  const emptyText = calType==="provincial"
    ? (isAdmin ? "Add the annual celebrations one by one, upload an Excel file, or start with the Provincial Tourism Office Calendar of Events (" + CALENDAR_2025_SEED.length + " activities)." : "This calendar is empty. The administrator has not added any activities yet.")
    : (isAdmin ? "Add activities one by one using Add Activity, or upload an Excel file." : "This calendar is empty. The administrator has not added any activities yet.");

  return (<div>
    <SingleSheetToolbar
      title="Calendar" sheetName="Calendar" headers={CALENDAR_HEADERS} buildRows={buildCalendarRows}
      data={data} setData={setData} parseRow={parseCalendarRow}
      dedupeKey={calendarEventKey}
      idPrefix="CAL" isAdmin={isAdmin} filenamePrefix="Calendar-of-Activities"
    />

    <div className="view-toggle" style={{flexWrap:"wrap", marginBottom:12}}>
      {CALENDAR_TYPES.map(t=>(
        <button key={t.key} className={calType===t.key?"active":""} onClick={()=>switchType(t.key)}>
          {t.label} ({data.filter(d=>calendarTypeOf(d)===t.key).length})
        </button>
      ))}
    </div>

    <div className="toolbar-row">
      <div className="view-toggle">
        <button className={view==="monthly"?"active":""} onClick={()=>setView("monthly")}>{calType==="arawatan" ? "By Year" : "By Month"}</button>
        <button className={view==="records"?"active":""} onClick={()=>setView("records")}>Records</button>
      </div>
      <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center"}}>
        <button className="btn btn-outline-teal btn-sm" onClick={()=>{ if(!filtered.length){ alert("No activities to print for this selection."); return; } setPrinting(true); }}>
          <PrintIcon /> Print Report
        </button>
        {isAdmin && calType==="arawatan" && (
          <button className="btn btn-outline-gold" onClick={()=>setModal({mode:"theme", year: oneYear, theme: oneYear ? (themes[oneYear]||"") : "", lock:false})}>Set Theme</button>
        )}
        {isAdmin && (
          <button className="btn btn-primary" onClick={()=>setModal({mode:"add"})}><Icon d={ICONS.plus} size={15} color="#fff" /> Add Activity</button>
        )}
      </div>
    </div>

    <div className="stat-cards">
      <StatCard label="Total Activities" value={typed.length} />
      <StatCard label="Showing" value={filtered.length} />
      <StatCard label="Tentative" value={typed.filter(d=>d.status==="Tentative").length} />
      {calType==="arawatan"
        ? <StatCard label="Years with Theme" value={Object.keys(themes).length} />
        : <StatCard label="Municipalities with Activities" value={municipalitiesCovered} />}
    </div>

    {typed.length===0 && (calType!=="arawatan" || Object.keys(themes).length===0) && (
      <div className="panel cal-empty">
        <div className="panel-title">No activities yet</div>
        <p>{emptyText}</p>
        {isAdmin && calType==="provincial" && <button className="btn btn-outline-gold" onClick={loadSeed}>Load 2025 Calendar of Events</button>}
      </div>
    )}

    <FilterBar filters={filters} setFilters={setFilters} options={options} fields={filterFields} />

    {view==="monthly" ? (
      calType==="arawatan" ? (
        <div>
          {arawatanGroups.map(g=>(
            <div className="panel cal-month" key={g.year}>
              <div className="panel-title">Arawatan {g.year} <span className="cal-count">{g.items.length} {g.items.length===1 ? "activity" : "activities"}</span></div>
              <div style={{display:"flex", gap:10, alignItems:"center", flexWrap:"wrap", margin:"2px 0 8px"}}>
                <div style={{fontSize:13}}><b>Theme:</b> {themes[g.year] ? themes[g.year] : <span className="cell-sub">(no theme set)</span>}</div>
                {isAdmin && <button className="btn btn-outline-teal btn-sm" onClick={()=>setModal({mode:"theme", year:g.year, theme:themes[g.year]||"", lock:true})}>{themes[g.year] ? "Edit Theme" : "Set Theme"}</button>}
              </div>
              {g.items.length===0 && <div className="cal-none">(No listed activities)</div>}
              {g.items.map(d=>itemRow(d, (d.month ? d.month.slice(0,3) : "") + (d.dateText ? " " + d.dateText : "") || "—"))}
            </div>
          ))}
          {arawatanGroups.length===0 && typed.length>0 && <div className="panel"><div className="empty-row">No activities match these filters.</div></div>}
        </div>
      ) : (
        <div>
          {groups.map(g=>(
            <div className="panel cal-month" key={g.year+"-"+g.month}>
              <div className="panel-title">{g.month} {g.year} <span className="cal-count">{g.items.length} {g.items.length===1 ? "activity" : "activities"}</span></div>
              {g.items.length===0 && <div className="cal-none">(No listed events)</div>}
              {g.items.map(d=>itemRow(d, d.dateText || "—"))}
            </div>
          ))}
          {groups.length===0 && typed.length>0 && <div className="panel"><div className="empty-row">No activities match these filters.</div></div>}
        </div>
      )
    ) : (
      <div className="table-wrap">
        <table>
          <thead><tr>{[...colDefs.map(c=>c[0]), "Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((d,i)=>(
              <tr key={d.id} className={i%2?"odd":""}>
                {colDefs.map(c=><td key={c[0]}>{c[1](d)}</td>)}
                <td>{rowActions(d)}</td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={colDefs.length+1} className="empty-row">No activities match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    )}

    {printing && <RecordsPrintReport {...buildCalendarPrint(filtered, filters, calType, themes)} onDone={()=>setPrinting(false)} />}
    {modal && isAdmin && (modal.mode==="edit" || modal.mode==="add") && (
      <Modal title={(modal.mode==="edit" ? "Edit Activity" : "Add Activity") + " — " + CALENDAR_TYPE_LABEL[modal.item ? calendarTypeOf(modal.item) : calType]} onClose={()=>setModal(null)}>
        <CalendarForm initial={modal.item} onCancel={()=>setModal(null)} onSave={save} calType={calType} defaultYear={oneYear} />
      </Modal>
    )}
    {modal && isAdmin && modal.mode==="theme" && (
      <Modal title="Arawatan Theme" onClose={()=>setModal(null)}>
        <ArawatanThemeForm initialYear={modal.year} initialTheme={modal.theme} lockYear={modal.lock} onCancel={()=>setModal(null)} onSave={saveTheme} />
      </Modal>
    )}
    {toDelete && (
      <ConfirmDialog text={'Delete "'+toDelete.title+'"? This cannot be undone.'} onCancel={()=>setToDelete(null)} onConfirm={handleDelete} />
    )}
  </div>);
}


// ======================================================================
// SECTION 17 of 22: js/accreditation.jsx
// ======================================================================
/**
 * ACCREDITATION SCREEN: accreditation records, form and history.
 */

// =====================================================================
// ACCREDITATION SECTION (moved out of Enterprises — same data, same fields:
// each enterprise's accredHistory is read and saved on the establishment record)
// =====================================================================
// Accreditation history table (one row per period, latest first) — used by the
// Enterprises "View Info" and by the Accreditation record view.
function AccredHistoryTable({list}){
  const history = sortAccredHistoryDesc(list);
  if(history.length===0){
    return <div style={{fontSize:12, color:"var(--subtext)"}}>No accreditation history recorded.</div>;
  }
  return (
    <div className="table-wrap">
      <table style={{minWidth:"auto"}}>
        <thead><tr><th>Level</th><th>Number</th><th>Date Accredited</th><th>Valid Until</th><th>DOT List As Of</th><th>Status</th></tr></thead>
        <tbody>
          {history.map((h,idx)=>{
            const st = accredPeriodStatus(h, "");
            return (
              <tr key={idx} className={idx%2?"odd":""}>
                <td>{h.type||"—"}</td>
                <td>{h.number||"—"}</td>
                <td>{h.accredDate?formatDateDisplay(h.accredDate):"—"}</td>
                <td>{h.validity?formatDateDisplay(h.validity):"—"}</td>
                <td>{h.dotAsOf?formatDateDisplay(h.dotAsOf):"—"}</td>
                <td><Pill tone={accredStatusTone(st)}>{st}</Pill></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AccreditationViewInfo({item, onEdit, onClose, isAdmin}){
  const [printing, setPrinting] = useState(false);
  if(!item) return null;
  const accredState = getAccredState(item);
  const latestAccred = latestAccredEntry(item);
  const history = getAccredHistory(item);
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
      <div className="view-field-label" style={{marginBottom:6}}>Accreditation History (all records, latest first)</div>
      <AccredHistoryTable list={history} />
    </div>

    <div className="form-actions">
      <button className="btn" onClick={onClose}>Close</button>
      {history.length>0 && (
        <button className="btn btn-outline-teal" onClick={()=>setPrinting(true)}><PrintIcon /> Print Record</button>
      )}
      {isAdmin && (
        <button className="btn btn-primary" onClick={onEdit}><Icon d={ICONS.edit} size={13} color="#fff" /> Edit Accreditation</button>
      )}
    </div>
    {printing && <RecordsPrintReport {...buildEnterpriseAccreditationPrint(item)} onDone={()=>setPrinting(false)} />}
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
    setF(prev => ({...prev, accredHistory: [...(prev.accredHistory||[]), {type:"", number:"", accredDate:"", validity:"", dotAsOf:""}]}));
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
    const problem = validateAccredEntries(f.accredHistory, initialSnapshotRef.current.accredHistory);
    if(problem){
      alert(problem);
      return;
    }
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
            Automatically calculated from the Date Accredited and Valid Until of each accreditation period below.
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
              <div style={{flex:"1 1 140px"}}>
                <div style={{fontSize:11, fontWeight:700, color:"var(--subtext)", marginBottom:4}}>DOT List As Of</div>
                <input type="date" value={h.dotAsOf||""} onChange={(e)=>updateHistoryEntry(idx,"dotAsOf",e.target.value)} />
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

// Dropdown with checkboxes: pick one, several, or none (none = all).
function MultiSelectFilter({options, value, onChange, allLabel, format}){
  const fmt = format || (x=>x);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{
    const h = (e) => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return ()=>document.removeEventListener("mousedown", h);
  }, []);
  const sel = Array.isArray(value) ? value : [];
  const toggle = (o) => onChange(sel.includes(o) ? sel.filter(x=>x!==o) : [...sel, o]);
  const label = sel.length===0 ? allLabel : (sel.length<=2 ? sel.map(fmt).join(", ") : sel.length + " selected");
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button type="button" className="btn" style={{width:"100%", justifyContent:"space-between", textAlign:"left"}} onClick={()=>setOpen(o=>!o)}>
        <span>{label}</span><span>▾</span>
      </button>
      {open && (
        <div style={{position:"absolute", zIndex:30, top:"100%", left:0, minWidth:"100%", maxHeight:280, overflowY:"auto", background:"#fff", color:"#1f2937", border:"1px solid #cbd5e1", borderRadius:8, padding:6, boxShadow:"0 6px 18px rgba(0,0,0,.15)"}}>
          {options.map(o=>(
            <label key={o} style={{display:"flex", gap:8, alignItems:"center", padding:"6px 8px", cursor:"pointer", fontSize:13, whiteSpace:"nowrap"}}>
              <input type="checkbox" checked={sel.includes(o)} onChange={()=>toggle(o)} style={{width:"auto"}} />{fmt(o)}
            </label>
          ))}
          {sel.length>0 && <button type="button" className="clear-btn" onClick={()=>onChange([])}>Clear</button>}
        </div>
      )}
    </div>
  );
}

function AccreditationSection({data, setData, isAdmin}){
  const [view, setView] = useState("dashboard");
  const [filters, setFilters] = useState({});
  const [modal, setModal] = useState(null);
  const [statMunicipality, setStatMunicipality] = useState("");
  // The YEAR is a required filter: it is always set (defaults to the current year) and
  // has no "All" choice, so the dashboard, the records and the printed report always
  // refer to one specific year.
  const [statYear, setStatYear] = useState(() => String(new Date().getFullYear()));
  const [formDirty, setFormDirty] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [printing, setPrinting] = useState(false);   // false | "records" | "monthly"

  const yearOptions = useMemo(()=>{
    const ys = new Set([String(new Date().getFullYear())]);
    data.forEach(d=>{
      getAccredHistory(d).forEach(h=>{
        accredEntryCoverageYears(h).forEach(y=>ys.add(y));
        const a = yearOfISO(h.accredDate);
        if(a!==null) ys.add(String(a));
      });
    });
    return Array.from(ys).sort().reverse();
  }, [data]);

  const typeOptions = useMemo(()=>[...new Set(data.map(d=>d.type))].filter(Boolean).sort(), [data]);

  // ---------- Dashboard numbers ----------
  const scoped = useMemo(()=> statMunicipality ? data.filter(d=>d.municipality===statMunicipality) : data, [data, statMunicipality]);
  const yearStats = useMemo(()=>accredYearStats(scoped, statYear), [scoped, statYear]);
  const monthly = useMemo(()=>accredMonthlyStats(scoped, statYear), [scoped, statYear]);
  const expiringSoon = useMemo(()=>accredExpiringSoon(scoped, 60), [scoped]);
  const accreditedByType = useMemo(()=>{
    const m = {};
    scoped.forEach(d=>{ if(yearStats.accredited.has(d.id)) m[d.type] = (m[d.type]||0) + 1; });
    return Object.entries(m).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count);
  }, [scoped, yearStats]);
  const accredPerYear = useMemo(()=>{
    const counts = {};
    scoped.forEach(d=>{ establishmentAccreditedYears(d).forEach(y=>{ counts[y] = (counts[y]||0) + 1; }); });
    return Object.entries(counts).map(([name,count])=>({name,count})).sort((a,b)=>a.name.localeCompare(b.name));
  }, [scoped]);

  // ---------- Records list ----------
  const monthSel = filterSel(filters.month);
  const monthNum = monthSel.map(m => CALENDAR_MONTHS.indexOf(m) + 1);
  const records = useMemo(()=>{
    const ents = data.filter(d=>{
      if(filters.name && !d.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if(!matchSel(filters.municipality, d.municipality)) return false;
      if(!matchSel(filters.classification, d.classification)) return false;
      if(!matchSel(filters.type, d.type)) return false;
      return true;
    });
    return accredRecordRows(ents, statYear, monthNum, filters.status, filters.dot);
  }, [data, filters, statYear, monthSel.join("|")]);
  const dotOptions = useMemo(()=>{
    const ds = new Set();
    data.forEach(d=>getAccredHistory(d).forEach(h=>{ if(h.dotAsOf) ds.add(h.dotAsOf); }));
    return Array.from(ds).sort().reverse();
  }, [data]);
  // Enterprises that came with each DOT list received in the selected year
  const dotSummary = useMemo(()=>{
    const m = {};
    scoped.forEach(d=>getAccredHistory(d).forEach(h=>{
      if(h.dotAsOf && isoInPeriod(h.dotAsOf, statYear, "")){ (m[h.dotAsOf] = m[h.dotAsOf] || new Set()).add(d.id); }
    }));
    return Object.entries(m).map(([date,set])=>({date, count:set.size})).sort((a,b)=>a.date.localeCompare(b.date));
  }, [scoped, statYear]);
  const statusSel = Array.isArray(filters.status) ? filters.status : [];
  const dotSel = Array.isArray(filters.dot) ? filters.dot : (filters.dot ? [filters.dot] : []);
  const onlyNotAccred = statusSel.length===1 && statusSel[0]==="Not Accredited";

  const printFilters = {
    year: statYear, month: monthSel.join(", "), name: filters.name, municipality: filterSel(filters.municipality).join(", "),
    classification: filterSel(filters.classification).join(", "), type: filterSel(filters.type).join(", "), status: statusSel.join(", "),
    dot: dotSel.map(formatDateDisplay).join(", "),
  };

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

  const updateFilter = (k, v) => setFilters(prev=>({...prev, [k]: v}));
  const yearSelect = (
    <select value={statYear} onChange={(e)=>setStatYear(e.target.value)}>
      {yearOptions.map(y=><option key={y} value={y}>{y}</option>)}
    </select>
  );
  const requiredMark = <span style={{color:"var(--danger)"}}> *</span>;
  const currentMonthName = CALENDAR_MONTHS[new Date().getMonth()];

  const printMonthly = () => {
    if(!scoped.length){ alert("No records to print for this selection."); return; }
    setPrinting("monthly");
  };
  const printRecords = () => {
    if(!statYear){ alert("Please select a year first."); return; }
    if(!records.length){ alert("No records to print for this selection."); return; }
    setPrinting("records");
  };

  return (<div>
    <div className="toolbar-row">
      <div className="view-toggle">
        <button className={view==="dashboard"?"active":""} onClick={()=>setView("dashboard")}>Dashboard</button>
        <button className={view==="records"?"active":""} onClick={()=>setView("records")}>Records</button>
      </div>
      <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center"}}>
        {view==="dashboard" ? (
          <button className="btn btn-outline-teal btn-sm" onClick={printMonthly}><PrintIcon /> Print Monthly Summary</button>
        ) : (
          <button className="btn btn-outline-teal btn-sm" onClick={printRecords}><PrintIcon /> Print Report</button>
        )}
      </div>
    </div>

    {view==="dashboard" ? (
      <div>
        <div className="filter-bar" style={{marginBottom:14}}>
          <div className="filter-field">
            <div className="filter-field-label">Year{requiredMark}</div>
            {yearSelect}
          </div>
          <div className="filter-field">
            <div className="filter-field-label">Municipality</div>
            <select value={statMunicipality} onChange={(e)=>setStatMunicipality(e.target.value)}>
              <option value="">All Municipalities</option>
              {MUNICIPALITIES.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="stat-cards">
          <StatCard label={"Accredited in " + statYear} value={yearStats.accredited.size} />
          <StatCard label={"Valid Through Dec 31, " + statYear} value={yearStats.valid.size} />
          <StatCard label={"To Expire in " + statYear} value={yearStats.toExpire.size} />
          <StatCard label={"Expired in " + statYear} value={yearStats.expired.size} />
        </div>

        <div className="charts-grid">
          <div className="panel span-2">
            <div className="panel-title">Monthly Monitoring — {statYear}</div>
            <div style={{fontSize:12, color:"var(--subtext)", marginBottom:10}}>
              An enterprise is Accredited in every month from its Date Accredited (or DOT list date) up to its Valid Until month (e.g. DOT list Sep 2021, valid until Jul 2022 = accredited in 2021 and 2022). With no Valid Until, it counts only in the year of its DOT list / Date Accredited. To Expire and Expired count the month of the Valid Until date (To Expire = still valid today, Expired = already lapsed).
            </div>
            <div className="table-wrap">
              <table style={{minWidth:"auto"}}>
                <thead><tr><th>Month</th><th>Accredited</th><th>To Expire</th><th>Expired</th><th></th></tr></thead>
                <tbody>
                  {monthly.map((m,i)=>{
                    const isNow = String(new Date().getFullYear())===String(statYear) && m.month===currentMonthName;
                    return (
                      <tr key={m.month} className={i%2?"odd":""} style={isNow ? {fontWeight:700} : undefined}>
                        <td>{m.month}{isNow ? " (this month)" : ""}</td>
                        <td>{m.accredited}</td>
                        <td>{m.toExpire}</td>
                        <td>{m.expired}</td>
                        <td>
                          {(m.accredited+m.toExpire+m.expired)>0 && (
                            <button className="btn btn-outline-teal btn-sm" onClick={()=>{
                              setFilters({month: [m.month], ...(statMunicipality ? {municipality: [statMunicipality]} : {})});
                              setView("records");
                            }}>View records</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{fontWeight:700}}>
                    <td>Year total (enterprises)</td>
                    <td>{yearStats.accredited.size}</td>
                    <td>{yearStats.toExpire.size}</td>
                    <td>{yearStats.expired.size}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel span-2">
            <div className="panel-title">Expiring Within the Next 60 Days</div>
            {expiringSoon.length===0 ? (
              <div style={{fontSize:13, color:"var(--subtext)"}}>No accreditation is due to expire in the next 60 days.</div>
            ) : (
              <div className="table-wrap">
                <table style={{minWidth:"auto"}}>
                  <thead><tr><th>Enterprise</th><th>Municipality</th><th>Level</th><th>Accreditation No.</th><th>Valid Until</th><th>Days Left</th><th></th></tr></thead>
                  <tbody>
                    {expiringSoon.map((r,i)=>(
                      <tr key={r.d.id} className={i%2?"odd":""}>
                        <td>{r.d.name}</td>
                        <td>{r.d.municipality}</td>
                        <td>{r.h.type||"—"}</td>
                        <td>{r.h.number||"—"}</td>
                        <td>{formatDateDisplay(r.h.validity)}</td>
                        <td><Pill tone={r.daysLeft<=30?"danger":"gold"}>{r.daysLeft} day{r.daysLeft===1?"":"s"}</Pill></td>
                        <td><button className="btn btn-outline-teal btn-sm" onClick={()=>{ setFormDirty(false); setModal({mode:"view", item:r.d}); }}>View Info</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="panel span-2">
            <div className="panel-title">DOT Lists Received in {statYear}</div>
            {dotSummary.length===0 ? (
              <div style={{fontSize:13, color:"var(--subtext)"}}>No DOT list dates encoded for {statYear}. Fill in "DOT List As Of" in an enterprise's accreditation to track each DOT file.</div>
            ) : (
              <div className="table-wrap">
                <table style={{minWidth:"auto"}}>
                  <thead><tr><th>DOT List As Of</th><th>Enterprises Added</th><th></th></tr></thead>
                  <tbody>
                    {dotSummary.map((r,i)=>(
                      <tr key={r.date} className={i%2?"odd":""}>
                        <td>{formatDateDisplay(r.date)}</td>
                        <td>{r.count}</td>
                        <td><button className="btn btn-outline-teal btn-sm" onClick={()=>{ setFilters({dot: [r.date], ...(statMunicipality ? {municipality: [statMunicipality]} : {})}); setView("records"); }}>View records</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-title">Accredited for {statYear} by Type</div>
            {accreditedByType.length===0
              ? <div style={{fontSize:13, color:"var(--subtext)"}}>No accredited enterprises for {statYear}.</div>
              : <BarList data={accreditedByType} color="#C08A2E" />}
          </div>
          <div className="panel">
            <div className="panel-title">Accredited Enterprises per Year</div>
            {accredPerYear.length===0
              ? <div style={{fontSize:13, color:"var(--subtext)"}}>No accreditation history recorded yet.</div>
              : <BarList data={accredPerYear} color="#2B7A57" />}
          </div>
        </div>
      </div>
    ) : (
      <div>
        <div className="filter-bar">
          <div className="filter-field">
            <div className="filter-field-label">Year{requiredMark}</div>
            {yearSelect}
          </div>
          <div className="filter-field">
            <div className="filter-field-label">Month</div>
            <MultiSelectFilter options={CALENDAR_MONTHS} value={monthSel} onChange={(v)=>updateFilter("month", v)} allLabel="All months" />
          </div>
          <div className="filter-field">
            <div className="filter-field-label">Enterprise</div>
            <div className="search-wrap">
              <span className="search-icon"><Icon d={ICONS.search} size={13} /></span>
              <input type="text" value={filters.name||""} onChange={(e)=>updateFilter("name", e.target.value)} placeholder="Search by name" />
            </div>
          </div>
          <div className="filter-field">
            <div className="filter-field-label">Municipality</div>
            <MultiSelectFilter options={MUNICIPALITIES} value={filterSel(filters.municipality)} onChange={(v)=>updateFilter("municipality", v)} allLabel="All" />
          </div>
          <div className="filter-field">
            <div className="filter-field-label">Classification</div>
            <MultiSelectFilter options={CLASSIFICATIONS} value={filterSel(filters.classification)} onChange={(v)=>updateFilter("classification", v)} allLabel="All" />
          </div>
          <div className="filter-field">
            <div className="filter-field-label">Type</div>
            <MultiSelectFilter options={typeOptions} value={filterSel(filters.type)} onChange={(v)=>updateFilter("type", v)} allLabel="All" />
          </div>
          <div className="filter-field">
            <div className="filter-field-label">DOT List As Of</div>
            <MultiSelectFilter options={dotOptions} value={dotSel} onChange={(v)=>updateFilter("dot", v)} allLabel="All" format={formatDateDisplay} />
          </div>
          <div className="filter-field">
            <div className="filter-field-label">Status</div>
            <MultiSelectFilter options={["Valid","To Expire","Expired","No Validity","Not Accredited"]} value={statusSel} onChange={(v)=>updateFilter("status", v)} allLabel="All" />
          </div>
          <button className="clear-btn" onClick={()=>setFilters({})}>Clear filters</button>
        </div>
        <div style={{fontSize:12, color:"var(--subtext)", margin:"8px 0"}}>
          {onlyNotAccred
            ? "Showing enterprises with no accreditation on file (Year and Month do not apply)."
            : dotSel.length ? "Showing " + records.length + " accreditation record" + (records.length===1?"":"s") + " that came with the DOT list as of " + dotSel.map(formatDateDisplay).join("; ") + ". One row per enterprise per year (the accreditation in force, i.e. latest Valid Until)."
            : "Showing " + records.length + " accreditation record" + (records.length===1?"":"s") + " for " + (monthSel.length ? monthSel.join(", ") + " " : "") + statYear + ". One row per enterprise per year (the accreditation in force, i.e. latest Valid Until). Year is required; Month is optional."}
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>{["Enterprise","Municipality","Type","Level / Accreditation No.","Date Accredited","Valid Until","DOT List As Of","Status","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {records.map((r,i)=>(
                <tr key={r.d.id + "-" + (r.h ? accredEntryKey(r.h) : "none") + "-" + i} className={i%2?"odd":""}>
                  <td><div style={{fontWeight:600}}>{r.d.name}</div><div className="cell-sub">{r.d.address}</div></td>
                  <td>{r.d.municipality}</td>
                  <td>{r.d.type}</td>
                  <td>
                    <div>{(r.h && r.h.type) || "—"}</div>
                    <div className="cell-sub">{(r.h && r.h.number) || "—"}</div>
                  </td>
                  <td>{r.h && r.h.accredDate ? formatDateDisplay(r.h.accredDate) : "—"}</td>
                  <td>{r.h && r.h.validity ? formatDateDisplay(r.h.validity) : "—"}</td>
                  <td>{r.h && r.h.dotAsOf ? formatDateDisplay(r.h.dotAsOf) : "—"}</td>
                  <td>
                    <Pill tone={accredStatusTone(r.status)}>{r.status}</Pill>
                    {r.expiryIn && <div className="cell-sub">{r.status==="Expired" ? "Expired " : "Expires "}{monthSel.length ? "in the selected month" + (monthSel.length===1 ? "" : "s") : "in " + statYear}</div>}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-outline-teal btn-sm" onClick={()=>{ setFormDirty(false); setModal({mode:"view", item:r.d}); }}>
                        <Icon d={ICONS.eye} size={13} color="#1C6B6E" /> View Info
                      </button>
                      {isAdmin && (
                        <button className="btn btn-primary btn-sm" onClick={()=>{ setFormDirty(false); setModal({mode:"edit", item:r.d}); }}>
                          <Icon d={ICONS.edit} size={13} color="#fff" /> Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {records.length===0 && <tr><td colSpan="9" className="empty-row">No accreditation records match these filters.</td></tr>}
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
    {printing==="records" && <RecordsPrintReport {...buildAccreditationPrint(records, printFilters)} onDone={()=>setPrinting(false)} />}
    {printing==="monthly" && <RecordsPrintReport {...buildAccreditationMonthlyPrint(statYear, statMunicipality, monthly, yearStats)} onDone={()=>setPrinting(false)} />}
    {showLeaveWarning && (
      <WarningDialog
        text="You have unsaved changes. Are you sure you want to leave without saving?"
        onStay={stayEditing}
        onDiscard={discardAndClose}
      />
    )}
  </div>);
}


// ======================================================================
// SECTION 18 of 22: js/records-print.jsx
// ======================================================================
/**
 * PRINT REPORT LAYOUT: the printable table shown when you press Print.
 */

// "Noted by" name and position are typed in a small box before printing (remembered on this computer).
const NOTED_BY_KEY = "tourism-inventory-noted-by";
function loadNotedBy(){
  try{
    const v = JSON.parse(localStorage.getItem(NOTED_BY_KEY) || "null");
    if(v && typeof v === "object") return { name: String(v.name||""), position: String(v.position||"") };
  }catch(e){}
  return { name: "", position: "" };
}
function saveNotedBy(v){ try{ localStorage.setItem(NOTED_BY_KEY, JSON.stringify(v)); }catch(e){} }

function NotedByDialog({ onConfirm, onCancel }){
  const [v, setV] = useState(loadNotedBy);
  const go = () => {
    const c = { name: v.name.trim(), position: v.position.trim() };
    saveNotedBy(c);
    onConfirm(c);
  };
  const onKey = (e) => { if(e.key === "Enter"){ e.preventDefault(); go(); } };
  return (
    <Modal title="Print Report — Noted by" onClose={onCancel}>
      <div className="form-grid">
        <Field label="Noted by — Name"><input type="text" autoFocus value={v.name} onKeyDown={onKey} onChange={e=>setV({...v, name:e.target.value})} placeholder="Full name" /></Field>
        <Field label="Noted by — Position"><input type="text" value={v.position} onKeyDown={onKey} onChange={e=>setV({...v, position:e.target.value})} placeholder="e.g. Provincial Tourism Officer" /></Field>
      </div>
      <div style={{fontSize:11, color:"var(--subtext)", marginTop:8}}>Leave the name blank to print an empty signature line.</div>
      <div className="form-actions">
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={go}>Print</button>
      </div>
    </Modal>
  );
}

// Prepared by / Noted by block printed at the end of every report.
function PrintSignatories({ notedBy }){
  const nb = notedBy || { name: "", position: "" };
  return (
    <div className="print-signatories">
      <div className="sig-block">
        <div className="sig-label">Prepared by:</div>
        <div className="sig-gap" />
        <div>RYAN R. TAJONERA</div>
        <div>Tourism Operations Officer II</div>
      </div>
      <div className="sig-block">
        <div className="sig-label">Noted by:</div>
        <div className="sig-gap" />
        {nb.name ? <div>{nb.name}</div> : <div className="sig-line" />}
        {nb.position ? <div>{nb.position}</div> : null}
      </div>
    </div>
  );
}

function RecordsPrintReport({ title, filterText, total, headers, rows, colWidths, dense, onDone }){
  const [notedBy, setNotedBy] = useState(null);
  useEffect(()=>{
    if(!notedBy) return;
    const st = document.createElement("style");
    st.id = "rec-page-style";
    st.textContent = "@page { margin: 12mm; } " +
      ".dir-print-root table.dir-print-table { table-layout: fixed !important; width: 100% !important; } " +
      ".dir-print-root .dir-print-table th, .dir-print-root .dir-print-table td { white-space: normal !important; overflow-wrap: anywhere !important; word-break: break-word !important; overflow: hidden; vertical-align: top; } " +
      ".dir-print-root .dir-print-table td *, .dir-print-root .dir-print-table th * { white-space: normal !important; overflow-wrap: anywhere !important; max-width: 100%; }";
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
  }, [notedBy]);
  if(!notedBy) return <NotedByDialog onConfirm={setNotedBy} onCancel={onDone} />;
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
      <p style={{marginTop:4}}>Date generated: {generatedOn}</p>
    </div>
    <PrintSignatories notedBy={notedBy} />
    </div>,
    document.body
  );
}


// ======================================================================
// SECTION 19 of 22: js/backup.jsx
// ======================================================================
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


// ======================================================================
// SECTION 20 of 22: js/login.jsx
// ======================================================================
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


// ======================================================================
// SECTION 21 of 22: js/analytics.jsx
// ======================================================================
/**
 * ANALYTICS SCREEN: summary numbers, charts and the analytics report.
 */

function AnalyticsSection({establishments, attractions, cbtos}){
  const REPORTS = [
    {id:"estab-muni", label:"Enterprises by Municipality", desc:"Enterprise counts per municipality with accreditation status, operating status, rooms and employees.",
     note:"Accredited / Expired / Not Accredited are computed from each enterprise's accreditation history. Rooms and employee counts exclude entries marked N/A (e.g., Tour Guides)."},
    {id:"estab-type", label:"Enterprises by Type", desc:"Enterprise counts per type with accreditation status, operating status, rooms and employees.",
     note:"Accredited / Expired / Not Accredited are computed from each enterprise's accreditation history. Rooms and employee counts exclude entries marked N/A (e.g., Tour Guides)."},
    {id:"attr-muni",  label:"Attractions by Municipality", desc:"Attraction counts per municipality by status and declaration status.",
     note:"Status refers to Existing, Potential or Emerging attractions as encoded in the inventory."},
    {id:"attr-cat",   label:"Attractions by Category", desc:"Attraction counts per category by status and physical condition.",
     note:"Status refers to Existing, Potential or Emerging attractions as encoded in the inventory."},
    {id:"cbto-muni",  label:"CBTOs by Municipality", desc:"Community-Based Tourism Organizations and their membership per municipality.",
     note:"Total Members is the sum of male and female members of each CBTO."},
  ];
  const [report, setReport] = useState("estab-muni");
  const [filters, setFilters] = useState({});
  const [now, setNow] = useState(new Date());
  const [notedBy, setNotedBy] = useState(loadNotedBy);
  const [askNoted, setAskNoted] = useState(false);

  useEffect(()=>{
    const h = ()=>setNow(new Date());
    window.addEventListener("beforeprint", h);
    return ()=>window.removeEventListener("beforeprint", h);
  }, []);

  const n = v => Number(v)||0;
  const sum = (list, fn) => list.reduce((a,d)=>a+fn(d), 0);
  const ALL_TYPES = [...PRIMARY_TYPES, ...SECONDARY_TYPES];
  const CATS = Object.keys(ATTRACTION_CATEGORIES);

  const munis = [...MUNICIPALITIES];
  [...establishments, ...attractions, ...cbtos].forEach(d=>{
    if(d.municipality && !munis.includes(d.municipality)) munis.push(d.municipality);
  });

  // ----- build the selected report -----
  let title = "", cols = [], rows = [], numStart = 1, fields = [];
  const cur = REPORTS.find(r=>r.id===report);

  const estabList = establishments.filter(d =>
    matchSel(filters.classification, d.classification) &&
    matchSel(filters.type, d.type) &&
    matchSel(filters.estatus, d.status) &&
    matchSel(filters.municipality, d.municipality));
  const estabCounts = list => {
    const st = list.map(getAccredState);
    return [
      list.length,
      st.filter(s=>s==="Accredited").length,
      st.filter(s=>s==="Expired").length,
      st.filter(s=>s==="Not Accredited").length,
      list.filter(d=>d.status==="Active").length,
      list.filter(d=>d.status==="Not Active").length,
      list.filter(d=>d.status==="Others").length,
      sum(list, d=>n(d.rooms)),
      sum(list, d=>n(d.maleEmployees)),
      sum(list, d=>n(d.femaleEmployees)),
      sum(list, d=>n(d.maleEmployees)+n(d.femaleEmployees)),
    ];
  };
  const attrList = attractions.filter(d =>
    matchSel(filters.category, d.category) &&
    matchSel(filters.selection, d.selection) &&
    matchSel(filters.municipality, d.municipality));
  const attrCounts = list => [
    list.length,
    list.filter(d=>d.selection==="Existing").length,
    list.filter(d=>d.selection==="Potential").length,
    list.filter(d=>d.selection==="Emerging").length,
  ];

  if(report==="estab-muni"){
    title = "Tourism Enterprises by Municipality";
    cols = ["Municipality","Total","Primary","Secondary","Accredited","Expired","Not Accredited","Active","Not Active","Others","Rooms","Male Emp.","Female Emp.","Total Emp."];
    rows = munis.map(m=>{
      const l = estabList.filter(d=>d.municipality===m);
      const c = estabCounts(l);
      return [m, c[0], l.filter(d=>d.classification==="Primary Enterprises").length, l.filter(d=>d.classification==="Secondary Enterprises").length, ...c.slice(1)];
    });
    fields = [{key:"classification",all:"All Classifications"},{key:"type",all:"All Types"},{key:"estatus",all:"All Enterprise Statuses"}];
  } else if(report==="estab-type"){
    title = "Tourism Enterprises by Type";
    cols = ["Type","Class","Total","Accredited","Expired","Not Accredited","Active","Not Active","Others","Rooms","Male Emp.","Female Emp.","Total Emp."];
    numStart = 2;
    const types = [...ALL_TYPES];
    estabList.forEach(d=>{ if(d.type && !types.includes(d.type)) types.push(d.type); });
    rows = types.map(t=>{
      const l = estabList.filter(d=>d.type===t);
      return [t, PRIMARY_TYPES.includes(t) ? "Primary" : (SECONDARY_TYPES.includes(t) ? "Secondary" : "—"), ...estabCounts(l)];
    }).filter(r=>r[2] > 0);
    fields = [{key:"municipality",all:"All Municipalities"},{key:"estatus",all:"All Enterprise Statuses"}];
  } else if(report==="attr-muni"){
    title = "Tourism Attractions by Municipality";
    cols = ["Municipality","Total","Existing","Potential","Emerging","Nationally Declared","Locally Declared","Registered","Unregistered / For Validation"];
    rows = munis.map(m=>{
      const l = attrList.filter(d=>d.municipality===m);
      return [m, ...attrCounts(l), ...DECLARATION_STATUSES.map(s=>l.filter(d=>d.declarationStatus===s).length)];
    });
    fields = [{key:"category",all:"All Categories"},{key:"selection",all:"All Statuses"}];
  } else if(report==="attr-cat"){
    title = "Tourism Attractions by Category";
    cols = ["Category","Total","Existing","Potential","Emerging", ...PHYSICAL_CONDITIONS];
    const cats = [...CATS];
    attrList.forEach(d=>{ if(d.category && !cats.includes(d.category)) cats.push(d.category); });
    rows = cats.map(c=>{
      const l = attrList.filter(d=>d.category===c);
      return [c, ...attrCounts(l), ...PHYSICAL_CONDITIONS.map(p=>l.filter(d=>d.physicalCondition===p).length)];
    });
    fields = [{key:"municipality",all:"All Municipalities"},{key:"selection",all:"All Statuses"}];
  } else {
    title = "Community-Based Tourism Organizations (CBTOs) by Municipality";
    cols = ["Municipality","No. of CBTOs","Male Members","Female Members","Total Members"];
    rows = munis.map(m=>{
      const l = cbtos.filter(d=>d.municipality===m);
      return [m, l.length, sum(l,d=>n(d.maleMembers)), sum(l,d=>n(d.femaleMembers)), sum(l,d=>cbtoTotalMembers(d))];
    });
  }

  const totals = cols.map((c,j)=> j===0 ? "TOTAL" : (j<numStart ? "" : sum(rows, r=>n(r[j]))));
  const chartData = rows.map(r=>({name:r[0], count:n(r[numStart])})).filter(d=>d.count>0);
  const chartMax = Math.max(1, ...chartData.map(d=>d.count));
  const options = {
    classification: CLASSIFICATIONS, type: ALL_TYPES, estatus: ESTAB_STATUSES,
    municipality: munis, category: CATS, selection: ATTRACTION_SELECTIONS,
  };
  const FILTER_LABELS = {classification:"Classification", type:"Type", estatus:"Enterprise Status", municipality:"Municipality", category:"Category", selection:"Status"};
  const filterText = fields.filter(f=>filterSel(filters[f.key]).length).map(f=>FILTER_LABELS[f.key]+": "+filterSel(filters[f.key]).join(", ")).join("  |  ") || "None (all records)";
  const generated = now.toLocaleString("en-PH", {year:"numeric", month:"long", day:"numeric", hour:"numeric", minute:"2-digit"});
  const fmt = c => typeof c==="number" ? c.toLocaleString() : c;
  const numCls = j => (j>=numStart ? " ar-r" : "") + (j===numStart ? " ar-key" : "");

  const handlePrint = () => setAskNoted(true);
  const confirmNoted = (c) => {
    setNotedBy(c); setAskNoted(false); setNow(new Date());
    setTimeout(()=>window.print(), 150);
  };

  return (<div className="analytics-report">
    <div className="print-report-header">
      <img src={PGO_LOGO_URI} alt="Official Seal of the Province of Occidental Mindoro" />
      <div className="prh-text">
        <div className="prh-l1">Republic of the Philippines</div>
        <div className="prh-l2">Provincial Government of Occidental Mindoro</div>
        <div className="prh-l3">Provincial Tourism, Culture and Arts Division</div>
        <div className="prh-l4">Planning Development, Data Banking and Administrative Section</div>
      </div>
    </div>

    <div className="ar-noprint ar-pills">
      {REPORTS.map(r=>(
        <button key={r.id} className={"ar-pill" + (report===r.id ? " active" : "")}
          onClick={()=>{ setReport(r.id); setFilters({}); }}>{r.label}</button>
      ))}
    </div>

    <div className="ar-noprint ar-card ar-toolbar">
      <div>
        <h2 className="ar-h2">{cur.label}</h2>
        <p className="ar-sub">{cur.desc}</p>
      </div>
      <div className="ar-controls">
        {fields.map(f=>(
          <div key={f.key} style={{minWidth:170}}>
            <MultiSelectFilter options={options[f.key]||[]} value={filterSel(filters[f.key])} allLabel={f.all}
              onChange={v=>setFilters(prev=>({...prev,[f.key]:v}))} />
          </div>
        ))}
        <button className="ar-btn-print" onClick={handlePrint}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print Report
        </button>
      </div>
    </div>

    <div className="ar-card ar-print-card">
      <div className="ar-title-block">
        <h3 className="ar-h3">{title}</h3>
        <p className="ar-sub">Filters applied: <b>{filterText}</b></p>
      </div>
      <div className="ar-scroll">
        <table className="ar-table">
          <thead>
            <tr>{cols.map((c,j)=><th key={j} className={numCls(j).trim()}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} className={(j===0 ? "ar-first" : numCls(j)).trim()}>{fmt(c)}</td>)}</tr>
            ))}
          </tbody>
          <tfoot>
            <tr>{totals.map((c,j)=><td key={j} className={(j===0 ? "ar-first" : numCls(j)).trim()}>{fmt(c)}</td>)}</tr>
          </tfoot>
        </table>
      </div>
      <p className="ar-foot-note">Note: {cur.note}</p>
    </div>

    {chartData.length>0 && (
      <div className="ar-card ar-chart-card">
        <h3 className="ar-h3s">Distribution — {cols[numStart]}</h3>
        {chartData.map(d=>(
          <div className="ar-bar-row" key={d.name}>
            <div className="ar-bar-label" title={d.name}>{d.name}</div>
            <div className="ar-bar-track"><div className="ar-bar-fill" style={{width:(d.count/chartMax*100)+"%"}}></div></div>
            <div className="ar-bar-count">{d.count.toLocaleString()}</div>
          </div>
        ))}
      </div>
    )}

    <div className="report-generated-note">
      <p>This report was generated through the Tourism Enterprise &amp; Attraction Inventory by the <strong>Provincial Tourism, Culture and Arts Division – Planning Development, Data Banking and Administrative Section</strong>. Figures reflect the records encoded in the system as of the date generated.</p>
      <p style={{marginTop:4}}>Date generated: {generated}</p>
    </div>
    <PrintSignatories notedBy={notedBy} />
    {askNoted && <NotedByDialog onConfirm={confirmNoted} onCancel={()=>setAskNoted(false)} />}
  </div>);
}


// ======================================================================
// SECTION 22 of 22: js/app.jsx
// ======================================================================
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
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [dirCategories, setDirCategories] = useState(DIRECTORY_CATEGORIES);
  const [arawatanThemes, setArawatanThemes] = useState({});
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
        setCalendarEvents(Array.isArray(data.calendar) ? data.calendar : []);
        if(Array.isArray(data.directoryCategories) && data.directoryCategories.length) setDirCategories(data.directoryCategories);
        if(data.arawatanThemes && typeof data.arawatanThemes === "object") setArawatanThemes(data.arawatanThemes);
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
      await saveInventoryToCloud(establishments, attractions, cbtos, officers, calendarEvents, dirCategories, arawatanThemes);
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
      <button className={"section-tab " + (tab==="calendar"?"active":"")} onClick={()=>setTab("calendar")}>
        <svg className="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><span className="nav-text">Calendar</span> <span className="tab-count">{calendarEvents.length}</span>
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
      <DirectorySection data={officers} setData={setOfficers} isAdmin={isAdmin} categories={dirCategories} setCategories={setDirCategories} />
    )}
    {tab === "calendar" && (
      <CalendarSection data={calendarEvents} setData={setCalendarEvents} isAdmin={isAdmin} arawatanThemes={arawatanThemes} setArawatanThemes={setArawatanThemes} />
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
