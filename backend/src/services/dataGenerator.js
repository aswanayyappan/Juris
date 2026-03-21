// ════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════
const STATE_CODES = {"Andhra Pradesh":"37","Arunachal Pradesh":"12","Assam":"18","Bihar":"10","Chhattisgarh":"22","Goa":"30","Gujarat":"24","Haryana":"06","Himachal Pradesh":"02","Jharkhand":"20","Karnataka":"29","Kerala":"32","Madhya Pradesh":"23","Maharashtra":"27","Manipur":"14","Meghalaya":"17","Mizoram":"15","Nagaland":"13","Odisha":"21","Punjab":"03","Rajasthan":"08","Sikkim":"11","Tamil Nadu":"33","Telangana":"36","Tripura":"16","Uttar Pradesh":"09","Uttarakhand":"05","West Bengal":"19","Delhi":"07","Chandigarh":"04","Puducherry":"34"};

const ROC_CITIES = {"Maharashtra":"Mumbai","Delhi":"Delhi","Karnataka":"Bangalore","Tamil Nadu":"Chennai","West Bengal":"Kolkata","Gujarat":"Ahmedabad","Telangana":"Hyderabad","Kerala":"Ernakulam","Punjab":"Chandigarh","Rajasthan":"Jaipur"};

const INDUSTRIES = {"Pvt Ltd":["IT Services","Software Development","E-Commerce","Healthcare Tech","EdTech","FinTech","Manufacturing","Consulting","Logistics"],"LLP":["Legal Services","Accounting & Audit","Architecture","Consulting","Real Estate Advisory"],"Partnership":["Trading","Wholesale","Retail","Construction","Hospitality"],"Sole Proprietorship":["Retail","Freelancing","Food & Beverage","Salon & Wellness","Transport"],"Public Ltd":["Manufacturing","Banking & Finance","Telecom","Infrastructure","FMCG"]};

const DIRECTOR_NAMES = [["Arjun","Mehta"],["Priya","Sharma"],["Rohan","Gupta"],["Deepika","Nair"],["Kiran","Patel"],["Suresh","Iyer"],["Ananya","Krishnan"],["Vikram","Bose"],["Neha","Joshi"],["Rajesh","Singh"],["Kavita","Reddy"],["Amit","Agarwal"],["Sunita","Pillai"],["Rahul","Verma"],["Meenakshi","Rajan"]];

const ENTITY_CIN = {"Pvt Ltd":"PTC","LLP":"LLP","Partnership":"FLC","Sole Proprietorship":"FLC","Public Ltd":"PLC"};

// ════════════════════════════════════════════
// SEEDED RANDOM ENGINE
// ════════════════════════════════════════════
function hash(s){ let h=5381; for(let i=0;i<s.length;i++) h=(h*33^s.charCodeAt(i))>>>0; return h; }

class Rng {
  constructor(seed){ this.s = seed >>> 0; }
  next(){ this.s = (this.s * 1664525 + 1013904223) >>> 0; return this.s / 0xFFFFFFFF; }
  int(min,max){ return Math.floor(this.next()*(max-min+1))+min; }
  pick(arr){ return arr[this.int(0,arr.length-1)]; }
  bool(p=0.5){ return this.next()<p; }
  float(min,max,dec=1){ return parseFloat((this.next()*(max-min)+min).toFixed(dec)); }
}

// ════════════════════════════════════════════
// DATE HELPERS
// ════════════════════════════════════════════
const TODAY = new Date(); // Dynamically mapped to exact system clock
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x.toISOString().split("T")[0]; }
function daysUntil(d){ return Math.round((new Date(d)-TODAY)/86400000); }
function pastDate(n){ return addDays(TODAY,-n); }
function futureDate(n){ return addDays(TODAY,n); }

// ════════════════════════════════════════════
// MASSIVE DATA GENERATOR -> EXPORTED
// ════════════════════════════════════════════
function generateSyntheticRegTechData(form){
  const seed = hash(form.name + form.state + form.type + (form.cin||""));
  const rng = new Rng(seed);

  const stateCode = STATE_CODES[form.state] || "29";
  const industries = INDUSTRIES[form.type] || INDUSTRIES["Pvt Ltd"];
  const industry = rng.pick(industries);
  const incYear = rng.int(2016,2024);
  const incMonth = rng.int(1,12);
  const incDay = rng.int(1,28);
  const incDate = `${incYear}-${String(incMonth).padStart(2,'0')}-${String(incDay).padStart(2,'0')}`;

  const parseOrGenEmp = () => { if(form.employeeCount) { const maps = {'0_10':5,'10_20':15,'20_50':35,'50+':75}; return maps[form.employeeCount]||rng.int(8, 320); } return rng.int(8, 320); };
  const employees = parseOrGenEmp();
  const turnoverCr = rng.float(0.5, 95.0, 2);
  const authCapital = rng.int(5,100) * 100000;
  const paidUpCapital = Math.round(authCapital * rng.float(0.4,1.0,2));
  const netWorth = Math.round(paidUpCapital * rng.float(0.8,4.5,2));

  // CIN / GSTIN / PAN / TAN
  const cinType = ENTITY_CIN[form.type] || "PTC";
  const cinSerial = rng.int(100000,999999);
  const cinCode = "U" + rng.int(10000,99999) + stateCode + incYear + cinType + cinSerial;
  const cin = form.cin || cinCode;
  const panLetters = "ABCFGHIJKLMNPRSTUV";
  const pan = panLetters[rng.int(0,17)]+panLetters[rng.int(0,17)]+panLetters[rng.int(0,17)]+panLetters[rng.int(0,17)]+panLetters[rng.int(0,17)]+rng.int(1000,9999)+panLetters[rng.int(0,17)];
  const tan = form.state.substring(0,3).toUpperCase().padEnd(3,'X') + stateCode + rng.int(10000,99999) + panLetters[rng.int(0,17)];
  const gstin = stateCode + pan + "1Z" + rng.int(1,9);
  const udyamNo = "UDYAM-" + form.state.substring(0,2).toUpperCase() + "-" + rng.int(10,99) + "-" + rng.int(1000000,9999999);
  const rocCity = ROC_CITIES[form.state] || form.state.split(" ")[0];
  const rocNo = "ROC-" + rocCity.toUpperCase().replace(/\s/g,'').substring(0,5) + "-" + cin.slice(-6);

  // ── RISK FLAGS ──
  const gstr3bMissed = rng.bool(0.48);
  const gstr1Missed  = rng.bool(0.3);
  const pfMissed     = rng.bool(0.42);
  const esiMissed    = rng.bool(0.25);
  const tdsMissed    = rng.bool(0.35);
  const tradeLicExp  = rng.bool(0.45);
  const contractIss  = rng.bool(0.5);
  const dir3kycPend  = rng.bool(0.4);
  const advTaxDue    = rng.bool(0.3);
  const ptPending    = rng.bool(0.35);
  const shopActPend  = rng.bool(0.3);
  const itcMismatch  = rng.bool(0.4);

  // ── RISK SCORE ENGINE ──
  const RISK_WEIGHTS = [
    { key:"GST Filing Missed (GSTR-3B)", flag:gstr3bMissed, weight:25, section:"GST" },
    { key:"GST Filing Missed (GSTR-1)",  flag:gstr1Missed,  weight:12, section:"GST" },
    { key:"PF Payment Overdue",          flag:pfMissed,     weight:20, section:"Labour" },
    { key:"ESI Payment Overdue",         flag:esiMissed,    weight:12, section:"Labour" },
    { key:"TDS Non-Compliance",          flag:tdsMissed,    weight:18, section:"Income Tax" },
    { key:"Trade License Expiring",      flag:tradeLicExp,  weight:8,  section:"Licenses" },
    { key:"Incomplete Employee Contracts",flag:contractIss, weight:6,  section:"Labour" },
    { key:"DIN-3 KYC Pending",           flag:dir3kycPend, weight:5,  section:"ROC" },
    { key:"Advance Tax Due",             flag:advTaxDue,   weight:8,  section:"Income Tax" },
    { key:"Professional Tax Pending",    flag:ptPending,   weight:4,  section:"Licenses" },
    { key:"Shops Act Renewal Pending",   flag:shopActPend, weight:4,  section:"Licenses" },
    { key:"ITC Mismatch (2B vs 3B)",     flag:itcMismatch, weight:9,  section:"GST" },
  ];

  let riskScore = 12;
  RISK_WEIGHTS.forEach(r=>{ if(r.flag) riskScore+=r.weight; });
  riskScore = Math.min(riskScore+rng.int(0,8), 97);
  const healthScore = 100 - riskScore;
  const riskLevel = riskScore>=65?"High":riskScore>=40?"Medium":"Low";

  // SUBSCORE BREAKDOWN
  const gstRisk = Math.min((gstr3bMissed?35:0)+(gstr1Missed?20:0)+(itcMismatch?15:0)+rng.int(0,10),100);
  const labourRisk = Math.min((pfMissed?40:0)+(esiMissed?25:0)+(contractIss?15:0)+rng.int(0,10),100);
  const taxRisk = Math.min((tdsMissed?35:0)+(advTaxDue?20:0)+rng.int(0,10),100);
  const licenseRisk = Math.min((tradeLicExp?30:0)+(ptPending?15:0)+(shopActPend?15:0)+rng.int(0,10),100);
  const rocRisk = Math.min((dir3kycPend?20:0)+rng.int(0,15),100);

  // ── DIRECTORS ──
  const numDir = rng.int(2,5);
  const directors = [];
  const usedNames = new Set();
  for(let i=0;i<numDir;i++){
    let nameArr;
    do { nameArr = rng.pick(DIRECTOR_NAMES); } while(usedNames.has(nameArr[0]));
    usedNames.add(nameArr[0]);
    const roles = ["Managing Director","Executive Director","Non-Executive Director","Independent Director","Whole-time Director"];
    directors.push({
      name: nameArr[0]+" "+nameArr[1],
      din: "0"+rng.int(1000000,9999999),
      role: i===0?"Managing Director":rng.pick(roles.slice(1)),
      dsc_expiry: futureDate(rng.int(-30,400)),
      kyc_status: rng.bool(0.7)?"Completed":"Pending",
      designation: rng.pick(["CEO","CFO","CTO","Director","COO","CMO",null]),
      nationality: rng.bool(0.95)?"Indian":"NRI",
      shares: Math.round(paidUpCapital/100 * rng.float(5,40,1)),
    });
  }

  // ── GST MODULE ──
  const gstr_history = [];
  for(let m=1;m<=6;m++){
    const baseDate = addDays(TODAY, -m*30);
    const missed = rng.bool(0.2);
    gstr_history.push({
      period: new Date(baseDate).toLocaleString('default',{month:'short',year:'numeric'}),
      gstr1: missed&&rng.bool(0.5) ? "Missed" : "Filed",
      gstr3b: missed&&rng.bool(0.4) ? "Missed" : "Filed",
      liability: rng.int(15000,280000),
      itc_availed: rng.int(8000,150000),
      late_fee: missed ? rng.int(500,5000) : 0
    });
  }
  const pendingGSTLiability = gstr3bMissed ? rng.int(12000,180000) : 0;
  const itcAvailable = rng.int(50000,800000);
  const itcUtilized = Math.round(itcAvailable * rng.float(0.5,0.95,2));
  const itcBlocked = Math.round(itcAvailable * rng.float(0.02,0.12,2));
  const ewayBills = rng.int(10,1200);
  const gstReg = addDays(incDate, rng.int(5,90));
  const gstCategory = turnoverCr>=1.5||form.type==="Public Ltd"?"Regular":"Regular";
  const hsnCodes = [rng.int(1000,9999)+"00", rng.int(1000,9999)+"10", rng.int(1000,9999)+"90"].slice(0, rng.int(1,3));

  // ── ROC MODULE ──
  const lastAgm = pastDate(rng.int(30,280));
  const nextAgm = futureDate(rng.int(60,300));
  const boardMeetings = [];
  for(let i=0;i<4;i++) boardMeetings.push({ date:pastDate(rng.int(10,300)), quorum:rng.bool(0.85), resolutions:rng.int(2,8) });
  const charges = rng.int(0,3);
  const chargeList = [];
  for(let i=0;i<charges;i++) chargeList.push({ id:"CH-"+rng.int(100000,999999), amount:rng.int(500000,20000000), holder:rng.pick(["HDFC Bank","SBI","ICICI Bank","Axis Bank","Kotak Bank"]), date:pastDate(rng.int(100,900)) });

  // ── INCOME TAX MODULE ──
  const tds_sections = [];
  if(employees>0) tds_sections.push({section:"194C",desc:"Contractor Payments",rate:"2%",monthly:rng.int(5000,50000)});
  if(employees>5) tds_sections.push({section:"192",desc:"Salary TDS",rate:"Slab",monthly:rng.int(10000,120000)});
  tds_sections.push({section:"194J",desc:"Professional Fees",rate:"10%",monthly:rng.int(2000,30000)});
  if(rng.bool(0.4)) tds_sections.push({section:"194I",desc:"Rent Payments",rate:"10%",monthly:rng.int(5000,40000)});
  if(rng.bool(0.3)) tds_sections.push({section:"194Q",desc:"Purchase of Goods",rate:"0.1%",monthly:rng.int(1000,15000)});

  const totalTDSLiability = tds_sections.reduce((a,s)=>a+s.monthly,0);
  const estProfit = rng.int(500000,8000000);
  const estTax = Math.round(estProfit*0.25);
  const advanceTaxSchedule = [
    {installment:"1st",dueDate:futureDate(rng.int(-270,-200)),percent:"15%",amount:Math.round(estTax*0.15),status:rng.bool(0.8)?"Paid":"Missed"},
    {installment:"2nd",dueDate:futureDate(rng.int(-180,-120)),percent:"45%",amount:Math.round(estTax*0.30),status:rng.bool(0.75)?"Paid":"Missed"},
    {installment:"3rd",dueDate:futureDate(rng.int(-90,-40)),percent:"75%",amount:Math.round(estTax*0.30),status:rng.bool(0.7)?"Paid":"Pending"},
    {installment:"4th",dueDate:futureDate(rng.int(10,60)),percent:"100%",amount:Math.round(estTax*0.25),status:"Upcoming"},
  ];
  const itrType = form.type==="Sole Proprietorship"?"ITR-3":form.type==="Partnership"?"ITR-5":"ITR-6";
  const matApplicable = turnoverCr>1.0 && (form.type==="Pvt Ltd"||form.type==="Public Ltd");

  // ── LABOUR MODULE ──
  const pfEligible = Math.min(employees, Math.round(employees * rng.float(0.6,1.0,2)));
  const esiEligible = employees>=10 ? Math.min(employees, Math.round(employees * rng.float(0.4,0.8,2))) : 0;
  const avgSalary = rng.int(18000,85000);
  const monthlyPF = Math.round(pfEligible * Math.min(avgSalary,15000) * 0.24);
  const monthlyESI = Math.round(esiEligible * Math.min(avgSalary,21000) * 0.04);
  const monthlyPT = employees > 0 ? rng.int(200,2500)*Math.ceil(employees/10) : 0;
  const gratuityProv = Math.round(employees * avgSalary * 0.0481 * rng.int(1,8));
  const bonusProv = Math.round(employees * Math.min(avgSalary,7000) * 12 * 0.0833);
  const wageCategories = [
    {category:"Skilled",count:Math.round(employees*0.4),dailyWage:rng.int(450,800),minWage:400,compliant:rng.bool(0.8)},
    {category:"Semi-Skilled",count:Math.round(employees*0.3),dailyWage:rng.int(380,600),minWage:360,compliant:rng.bool(0.85)},
    {category:"Unskilled",count:Math.round(employees*0.3),dailyWage:rng.int(310,480),minWage:300,compliant:rng.bool(0.9)},
  ];
  const pfHistory = [];
  for(let m=1;m<=6;m++){
    pfHistory.push({ month:new Date(addDays(TODAY,-m*30)).toLocaleString('default',{month:'short',year:'numeric'}), amount:Math.round(monthlyPF*(1+rng.float(-0.05,0.05,3))), status:m<=2&&pfMissed?"Missed":"Paid" });
  }

  // ── LICENSES MODULE ──
  const licenseList = [
    { type:"Trade License", authority:rocCity+" Municipal Corporation", number:"TL/"+rocCity.substring(0,3).toUpperCase()+"/"+rng.int(10000,99999), expiry:tradeLicExp?futureDate(rng.int(5,25)):futureDate(rng.int(60,400)), status:tradeLicExp?"Expiring Soon":"Active", renewable:true },
    { type:"MSME / Udyam Registration", authority:"Ministry of MSME", number:udyamNo, expiry:"Perpetual", status:"Active", renewable:false },
    { type:"Shops & Establishment", authority:form.state+" Labour Dept", number:"SE/"+stateCode+"/"+rng.int(100000,999999), expiry:shopActPend?futureDate(rng.int(-10,20)):futureDate(rng.int(60,400)), status:shopActPend?"Renewal Pending":"Active", renewable:true },
    { type:"Professional Tax Registration", authority:form.state+" Govt", number:"PT/"+stateCode+"/"+rng.int(100000,999999), expiry:"Annual", status:ptPending?"Payment Due":"Current", renewable:true },
    { type:"Import Export Code (IEC)", authority:"DGFT", number:rng.int(1000000000,9999999999).toString(), expiry:"Perpetual", status:rng.bool(0.7)?"Active":"Not Applied", renewable:false },
    { type:"ISO 9001:2015", authority:"BIS / Third Party", number:rng.bool(0.4)?"ISO-"+rng.int(100000,999999):null, expiry:rng.bool(0.4)?futureDate(rng.int(30,700)):"N/A", status:rng.bool(0.4)?"Active":"Not Obtained", renewable:true },
    { type:"FSSAI License", authority:"FSSAI", number:rng.bool(industry.toLowerCase().includes("food")||rng.bool(0.2))?"10"+rng.int(10000000000,99999999999):null, expiry:rng.bool(0.3)?futureDate(rng.int(30,700)):"N/A", status:industry.toLowerCase().includes("food")?"Active":"Not Applicable", renewable:true }
  ];

  // ── COMPLIANCE CALENDAR (next 90 days) ──
  const calendar = [
    { date:futureDate(rng.int(1,10)), label:"GSTR-1 Filing", module:"GST", priority:gstr1Missed?"High":"Medium" },
    { date:futureDate(rng.int(8,18)), label:"GSTR-3B Filing", module:"GST", priority:gstr3bMissed?"High":"Medium" },
    { date:futureDate(rng.int(5,15)), label:"TDS Challan Deposit (Q4)", module:"Income Tax", priority:tdsMissed?"High":"Medium" },
    { date:futureDate(rng.int(12,22)), label:"PF Monthly Contribution", module:"Labour", priority:pfMissed?"High":"Low" },
    { date:futureDate(rng.int(12,22)), label:"ESI Monthly Contribution", module:"Labour", priority:esiMissed?"High":"Low" },
    { date:futureDate(rng.int(15,30)), label:"Professional Tax Payment", module:"Licenses", priority:ptPending?"Medium":"Low" },
    { date:futureDate(rng.int(20,40)), label:"Advance Tax 4th Installment", module:"Income Tax", priority:advTaxDue?"High":"Medium" },
    { date:futureDate(rng.int(25,45)), label:"Board Meeting (Statutory)", module:"ROC", priority:"Low" },
    { date:futureDate(rng.int(30,60)), label:"TDS Return Filing (Form 24Q)", module:"Income Tax", priority:tdsMissed?"High":"Medium" },
    { date:futureDate(rng.int(40,70)), label:"ITC Reconciliation (2A vs 2B)", module:"GST", priority:itcMismatch?"High":"Medium" },
    { date:futureDate(rng.int(50,80)), label:"DIN-3 KYC Filing", module:"ROC", priority:dir3kycPend?"High":"Low" },
    { date:futureDate(rng.int(100,160)), label:"ITR Filing ("+itrType+")", module:"Income Tax", priority:"Medium" }
  ].sort((a,b)=>a.date.localeCompare(b.date));

  // ── PENALTY EXPOSURE ──
  const penalties = [];
  if(gstr3bMissed) penalties.push({ item:"GSTR-3B Late Fee",section:"Sec 47 CGST",daily:rng.int(50,100),accrued:rng.int(1000,8000),projected30d:rng.int(2000,15000) });
  if(gstr1Missed) penalties.push({ item:"GSTR-1 Late Fee",section:"Sec 47 CGST",daily:rng.int(25,50),accrued:rng.int(500,3000),projected30d:rng.int(1000,6000) });
  if(pfMissed) penalties.push({ item:"PF Late Payment Interest",section:"Para 60 EPF Scheme",daily:rng.int(100,400),accrued:rng.int(2000,15000),projected30d:rng.int(5000,25000) });
  if(esiMissed) penalties.push({ item:"ESI Interest on Delayed Payment",section:"Sec 85B ESI Act",daily:rng.int(30,120),accrued:rng.int(800,5000),projected30d:rng.int(2000,10000) });
  if(tdsMissed) penalties.push({ item:"TDS Interest (Late Deduction)",section:"Sec 201 ITA",daily:0,accrued:Math.round(totalTDSLiability*0.01),projected30d:Math.round(totalTDSLiability*0.015) });
  if(dir3kycPend) penalties.push({ item:"DIN Deactivation Penalty",section:"Rule 12A CA Rules",daily:0,accrued:5000,projected30d:5000 });

  const totalPenaltyNow = penalties.reduce((a,p)=>a+p.accrued,0);
  const totalPenalty30d = penalties.reduce((a,p)=>a+p.projected30d,0);

  // ── ALERTS ──
  const alerts = [];
  if(gstr3bMissed) alerts.push({ level:"High", title:"GSTR-3B Filing Missed", detail:`Late fee of ₹${penalties.find(p=>p.item.includes("3B"))?.accrued?.toLocaleString()||'—'} accrued. File immediately to stop accumulation.`, module:"GST", action:"File Now" });
  if(gstr1Missed) alerts.push({ level:"High", title:"GSTR-1 Return Overdue", detail:"B2B invoices not uploaded. Buyers' ITC may be blocked due to your non-filing.", module:"GST", action:"File Now" });
  if(pfMissed) alerts.push({ level:"High", title:"PF Contribution Overdue", detail:`₹${monthlyPF.toLocaleString()} unpaid. EPFO can initiate prosecution under EPF Act.`, module:"Labour", action:"Pay Now" });
  if(esiMissed) alerts.push({ level:"Medium", title:"ESI Payment Missed", detail:`₹${monthlyESI.toLocaleString()} due. Non-compliance may result in 12% p.a. interest.`, module:"Labour", action:"Pay Now" });
  if(tdsMissed) alerts.push({ level:"High", title:"TDS Non-Compliance Detected", detail:`Multi-section TDS liability of ₹${totalTDSLiability.toLocaleString()} pending. Sec 201 interest applies.`, module:"Income Tax", action:"Deposit Challan" });
  if(tradeLicExp) alerts.push({ level:"Medium", title:"Trade License Expiring", detail:`License expires in ${daysUntil(licenseList[0].expiry)} days. Operations may be halted if not renewed.`, module:"Licenses", action:"Renew Now" });
  if(itcMismatch) alerts.push({ level:"Medium", title:"ITC Mismatch Detected (2A vs 2B)", detail:`Discrepancy of ₹${rng.int(5000,80000).toLocaleString()} between auto-populated and claimed ITC.`, module:"GST", action:"Reconcile" });
  if(contractIss) alerts.push({ level:"Low", title:"Incomplete Employment Contracts", detail:`${rng.int(2,7)} employees lack signed contracts. Potential labour tribunal exposure.`, module:"Labour", action:"Complete Docs" });
  if(dir3kycPend) alerts.push({ level:"Medium", title:"DIN KYC Pending", detail:`${directors.filter(d=>d.kyc_status==="Pending").length} director(s) have pending DIN-3 KYC. DIN may be deactivated.`, module:"ROC", action:"File DIN-3" });
  if(advTaxDue) alerts.push({ level:"Medium", title:"Advance Tax Installment Due", detail:`4th installment of ₹${Math.round(estTax*0.25).toLocaleString()} due. Interest u/s 234B/C applies on default.`, module:"Income Tax", action:"Pay Advance Tax" });
  if(ptPending) alerts.push({ level:"Low", title:"Professional Tax Payment Due", detail:`Monthly PT of ₹${monthlyPT.toLocaleString()} pending with authorities.`, module:"Licenses", action:"Pay PT" });

  // ── CHECKLIST (Maintaining Backend Compatibility format) ──
  const checklist = [
    { task:"File GSTR-3B for current cycle", status:gstr3bMissed?"Overdue":"Pending", due:gstr3bMissed?pastDate(rng.int(2,12)):futureDate(rng.int(5,15)), category:"GST", priority:"High" },
    { task:"Deposit TDS Challan (Q4)", status:tdsMissed?"Overdue":"Pending", due:tdsMissed?pastDate(rng.int(1,5)):futureDate(rng.int(3,12)), category:"Income Tax", priority:"High" },
    { task:"PF Monthly Payment", status:pfMissed?"Overdue":"Pending", due:pfMissed?pastDate(rng.int(1,8)):futureDate(rng.int(5,15)), category:"Labour", priority:"High" },
    { task:"Renew Trade License", status:tradeLicExp?"Due Soon":"Pending", due:licenseList[0].expiry, category:"Licenses", priority:"Medium" },
    { task:"ITC Reconciliation (2B vs 3B)", status:itcMismatch?"Pending":"Done", due:futureDate(rng.int(3,12)), category:"GST", priority:"Medium" },
    { task:"File DIN-3 KYC", status:dir3kycPend?"Pending":"Done", due:futureDate(rng.int(20,60)), category:"ROC", priority:"Medium" },
  ];

  // ── FINANCIAL SNAPSHOT ──
  const financial = {
    authorized_capital: authCapital,
    paid_up_capital: paidUpCapital,
    net_worth: netWorth,
    turnover_cr: turnoverCr,
    estimated_profit: estProfit,
    estimated_tax: estTax,
    total_tds_monthly: totalTDSLiability,
    total_pf_monthly: monthlyPF,
    total_esi_monthly: monthlyESI,
    total_pt_monthly: monthlyPT,
    gratuity_provision: gratuityProv,
    bonus_provision: bonusProv,
    itc_available: itcAvailable,
    itc_utilized: itcUtilized,
    itc_blocked: itcBlocked,
    gst_liability_pending: pendingGSTLiability,
    total_penalty_now: totalPenaltyNow,
    total_penalty_30d: totalPenalty30d,
  };

  // ── PEER BENCHMARK ──
  const peerRiskAvg = rng.int(28,55);
  const peerHealthAvg = 100 - peerRiskAvg;
  const peerComplianceRank = rng.int(15,85);

  // ── FINAL HUGE OBJECT ──
  return {
    _meta: { generated:new Date().toISOString(), engine:"JURIS v2.4.1", data_points:340, seed:seed },
    summary: { compliance_health:healthScore, status:riskScore>=65?"Critical":riskScore>=40?"Attention Needed":"Good Standing" },
    company: { name:form.name, cin, gstin, pan, tan, udyam:udyamNo, roc:rocNo, state:form.state, city:rocCity, industry, entity_type:form.type, incorporation_date:incDate, age_years:2026-incYear, employees, turnover_cr:turnoverCr, authorized_capital:authCapital, paid_up_capital:paidUpCapital, net_worth:netWorth, gst_registered:true, gst_category:gstCategory, gst_registration_date:gstReg, hsn_codes:hsnCodes, tax_audit_required:matApplicable },
    directors,
    dashboard: { compliance_health:healthScore, risk_score:riskScore, risk_level:riskLevel, status:riskScore>=65?"Critical":riskScore>=40?"Attention Needed":"Good Standing", last_updated:"2026-03-22", subscore_gst:100-gstRisk, subscore_labour:100-labourRisk, subscore_tax:100-taxRisk, subscore_licenses:100-licenseRisk, subscore_roc:100-rocRisk, peer_risk_avg:peerRiskAvg, peer_health_avg:peerHealthAvg, compliance_rank_percentile:peerComplianceRank },
    gst: { gstin, registration_date:gstReg, category:gstCategory, hsn_codes:hsnCodes, gstr1:{ due_date:futureDate(rng.int(8,18)), status:gstr1Missed?"Missed":"Pending", risk:gstr1Missed?"High":"Medium" }, gstr3b:{ due_date:gstr3bMissed?pastDate(rng.int(2,10)):futureDate(10), status:gstr3bMissed?"Missed":"Pending", penalty:gstr3bMissed?rng.int(1000,8000):0, risk:gstr3bMissed?"High":"Low" }, gstr9:{ due_date:futureDate(rng.int(150,220)), status:"Not Due" }, itc:{ available:itcAvailable, utilized:itcUtilized, blocked:itcBlocked, mismatch:itcMismatch }, filing_history:gstr_history, eway_bills_ytd:ewayBills, pending_liability:pendingGSTLiability },
    roc: { cin, roc_office:"ROC "+rocCity, aoc4:{ due_date:futureDate(rng.int(160,220)), status:"Not Due" }, mgt7a:{ due_date:futureDate(rng.int(200,280)), status:"Not Due" }, dir3_kyc:{ due_date:futureDate(rng.int(80,180)), status:dir3kycPend?"Pending":"Completed", pending_directors:directors.filter(d=>d.kyc_status==="Pending").map(d=>d.name) }, last_agm:lastAgm, next_agm:nextAgm, board_meetings:boardMeetings, charges_registered:charges, charge_details:chargeList, directors_count:numDir },
    income_tax: { pan, tan, itr_type:itrType, assessment_year:"AY 2026-27", estimated_profit:estProfit, estimated_tax:estTax, mat_applicable:matApplicable, advance_tax_schedule:advanceTaxSchedule, tds_sections, total_monthly_tds:totalTDSLiability, itr:{ due_date:futureDate(rng.int(120,160)), status:"Not Due" }, form_16_due:futureDate(rng.int(60,100)), tax_audit_required:matApplicable },
    labour: { total_employees:employees, pf_eligible:pfEligible, esi_eligible:esiEligible, avg_monthly_salary:avgSalary, pf:{ account:"PF/"+stateCode+"/"+rng.int(10000,99999)+"/"+rng.int(100,999), monthly_liability:monthlyPF, rate:"24% of Basic", status:pfMissed?"Overdue":"Current", filing_history:pfHistory }, esi:{ applicable:employees>=10, monthly_liability:monthlyESI, rate:"3.25% ER + 0.75% EE", status:esiMissed?"Overdue":"Current" }, professional_tax:{ monthly:monthlyPT, status:ptPending?"Pending":"Paid" }, gratuity:{ provision:gratuityProv, applicable:employees>=10 }, bonus:{ provision:bonusProv }, wage_compliance:wageCategories, contracts:{ total:employees, missing:contractIss?rng.int(2,7):0 } },
    licenses: licenseList,
    risk_engine: { score:riskScore, level:riskLevel, health:healthScore, factors:RISK_WEIGHTS.filter(r=>r.flag), recommendations:alerts.map(a=>a.action), peer_avg:peerRiskAvg, rank_percentile:peerComplianceRank, subscore_breakdown:{ gst:gstRisk, labour:labourRisk, tax:taxRisk, licenses:licenseRisk, roc:rocRisk } },
    penalties, total_penalty_now:totalPenaltyNow, total_penalty_30d:totalPenalty30d,
    alerts,
    global_alerts: alerts.map(a => a.title + " - " + a.detail),
    checklist,
    compliance_calendar: calendar,
    financial,
  };
}

module.exports = { generateSyntheticRegTechData };
