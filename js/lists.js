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
const MUNICIPALITIES = ["Abra de Ilog","Calintaan","Looc","Lubang","Magsaysay","Mamburao","Paluan","Rizal","Sablayan","San Jose","Sta. Cruz"];
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
