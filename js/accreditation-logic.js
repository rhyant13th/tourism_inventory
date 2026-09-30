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
    if(!type && !number && !accredDate && !validity) return;
    const key = type + "|" + number + "|" + accredDate + "|" + validity;
    if(seen.has(key)) return;
    seen.add(key);
    cleaned.push({ type, number, accredDate, validity });
  });
  return cleaned.sort((a,b)=> (a.validity||"").localeCompare(b.validity||""));
}

function accredEntryCoverageYears(entry){
  const endY = yearOfISO(entry && entry.validity);
  if(endY===null) return [];
  const startY = yearOfISO(entry && entry.accredDate);
  const years = [];
  if(startY!==null){
    const lo = Math.min(startY, endY), hi = Math.max(startY, endY);
    for(let y=lo; y<=hi; y++) years.push(String(y));
    return years;
  }
  // Coverage starts N years before the validity expiry date and runs to the validity date
  // (Regular: N=2; Basic and N/A-No PAS Level: N=1). Since the period doesn't align to
  // Jan 1–Dec 31, it touches
  // N+1 calendar years — e.g. Regular expiring Oct 31, 2026 covers 2024, 2025, 2026.
  const durationYears = (entry && entry.type==="Regular") ? 2 : 1;
  for(let y = endY - durationYears; y <= endY; y++) years.push(String(y));
  return years;
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
    .map(h => [h.type||"", h.number||"", h.accredDate||"", h.validity||""].join("|"))
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
    };
  }));
}
