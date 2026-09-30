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
  const category = DIRECTORY_CATEGORIES.includes(base.category) ? base.category : "Tourism Officer";
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
  const category = matchFromList(row["Category"], DIRECTORY_CATEGORIES);
  const status = matchFromList(row["Status"], DIRECTORY_STATUSES);
  return {
    provinceCity: String(row["Province/City"]||"").trim(),
    municipality: matchFromList(row["Municipality"], MUNICIPALITIES) || String(row["Municipality"]||"").trim(),
    name,
    position: String(row["Position/Designation"]||"").trim(),
    officeAgency: String(row["Office/Agency"]||"").trim(),
    contact: String(row["Contact Number"]||"").trim(),
    email: String(row["Email Address"]||"").trim(),
    category: DIRECTORY_CATEGORIES.includes(category) ? category : "Others",
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
