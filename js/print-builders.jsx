/**
 * PRINT REPORT DATA: which columns and filters appear on each printed report.
 */

function printCell(v){ return (v===undefined || v===null || v==="") ? "—" : String(v); }

function printFilterSummary(fields, filters){
  const parts = fields.filter(fl => filters && filters[fl.key]).map(fl => fl.label + ": " + filters[fl.key]);
  return parts.length ? parts.join("; ") : "None (all records)";
}

const ENTERPRISE_PRINT_FILTERS = [
  {key:"name", label:"Enterprise"}, {key:"municipality", label:"Municipality"}, {key:"classification", label:"Classification"},
  {key:"type", label:"Type"}, {key:"status", label:"Status"}, {key:"tourlista", label:"TourLISTA"}, {key:"year", label:"Year"},
];

const ACCRED_PRINT_FILTERS = [
  {key:"name", label:"Enterprise"}, {key:"municipality", label:"Municipality"}, {key:"classification", label:"Classification"},
  {key:"type", label:"Type"}, {key:"accredStatus", label:"Accreditation"}, {key:"year", label:"Year"},
];

const ATTRACTION_PRINT_FILTERS = [
  {key:"name", label:"Attraction"}, {key:"municipality", label:"Municipality"}, {key:"category", label:"Category"},
  {key:"selection", label:"Status"}, {key:"physicalCondition", label:"Physical Condition"}, {key:"declarationStatus", label:"Declaration Status"},
];

const CBTO_PRINT_FILTERS = [
  {key:"nameAddress", label:"CBTO Name"}, {key:"municipality", label:"Municipality"},
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

// Accreditation: every accreditation field of the Enterprises Excel export
// (status, level, number, validity, history, accredited years), with the enterprise
// identifiers (name, municipality, classification, type) so each row is readable.
function buildAccreditationPrint(list, filters){
  return {
    title: "Accreditation Records",
    filterText: printFilterSummary(ACCRED_PRINT_FILTERS, filters),
    total: list.length,
    headers: ["No.","Name of Enterprise","Municipality","Classification","Type","Status of Accreditation","Level of Accreditation","Accreditation Number","Accreditation Validity","Accreditation History","Accredited Years"],
    rows: list.map((d,i)=>{
      const latest = latestAccredEntry(d);
      const hist = sortAccredHistoryDesc(getAccredHistory(d));
      return [
        i+1, printCell(d.name), printCell(d.municipality), printCell(d.classification), printCell(d.type),
        getAccredState(d), printCell(latest && latest.type), printCell(latest && latest.number),
        (latest && latest.validity) ? formatDateDisplay(latest.validity) : "—",
        hist.length===0 ? "—" : hist.map((h,k)=>(
          <div key={k}>{(h.type||"—") + " · No. " + (h.number||"—") + " · " + (h.accredDate?formatDateDisplay(h.accredDate):"—") + " to " + (h.validity?formatDateDisplay(h.validity):"—")}</div>
        )),
        establishmentAccreditedYears(d).join(", ") || "—",
      ];
    }),
    colWidths: [4,16,9,9,10,8,8,9,8,13,6],
    dense: true,
  };
}
