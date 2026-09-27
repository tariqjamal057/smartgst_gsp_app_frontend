import React, { useState, useRef, useEffect } from "react";
import { fetchNews } from "../api/services";
import {
  HiArchive,
  HiBell,
  HiSpeakerphone,
  HiTrendingUp,
  HiDocumentText,
  HiRefresh,
  HiNewspaper,
  HiX,
  HiChevronLeft,
  HiChevronRight,
  HiCalendar,
  HiDownload,
  HiExternalLink,
  HiFilter,
} from "react-icons/hi";

// ════════════════════════════════════════════════════════════════════
// DotMatrix — Premium SaaS dot grid
// ════════════════════════════════════════════════════════════════════
const DotMatrix = ({
  cols = 3,
  rows = 4,
  color = "#a5b4fc",
  opacity = 0.45,
  size = 3.5,
  gap = 4,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, ${size}px)`,
      gap: `${gap}px`,
      opacity,
      flexShrink: 0,
      pointerEvents: "none",
      userSelect: "none",
    }}
  >
    {Array.from({ length: cols * rows }).map((_, i) => (
      <div
        key={i}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
        }}
      />
    ))}
  </div>
);

// ════════════════════════════════════════════════════════════════════
// Static Data
// ════════════════════════════════════════════════════════════════════
const FILTER_TABS = [
  { label: "All Types",      value: "all" },
  { label: "Notification",   value: "Notification" },
  { label: "Advisory",       value: "Advisory" },
  { label: "Revenue Update", value: "Revenue Update" },
  { label: "Circular",       value: "Circular" },
  { label: "Update",         value: "Update" },
  { label: "Press Release",  value: "Press Release" },
];

const TYPE_META = {
  Notification:    { icon: HiBell,          color: "#4f46e5", bg: "#ede9fe", label: "Notification"   },
  Advisory:        { icon: HiSpeakerphone,  color: "#0891b2", bg: "#e0f2fe", label: "Advisory"       },
  "Revenue Update":{ icon: HiTrendingUp,    color: "#059669", bg: "#d1fae5", label: "Revenue Update" },
  Circular:        { icon: HiDocumentText,  color: "#d97706", bg: "#fef3c7", label: "Circular"       },
  Update:          { icon: HiRefresh,       color: "#7c3aed", bg: "#f3e8ff", label: "Update"         },
  "Press Release": { icon: HiNewspaper,     color: "#be185d", bg: "#fce7f3", label: "Press Release"  },
};

// Full dataset — 2017 to 2026 months, 8 per filter tab visible
const NEWS_DATA = [
  // ── 2026 ──────────────────────────────────────────────────────
  {
    id: 101, type: "Notification", date: "Jan 15, 2026", year: 2026, month: 1,
    featured: true,
    title: "GSTR-3B late fee waiver extended till 31st March 2026",
    summary: "CBIC Notification No. 03/2026 – Central Tax dated 14.01.2026 extends the waiver of late fee for delayed filing of FORM GSTR-3B for specified taxpayers.",
    tag: "Returns", pdf: true,
  },
  {
    id: 102, type: "Revenue Update", date: "Jan 12, 2026", year: 2026, month: 1,
    featured: true,
    title: "Gross GST revenue for December 2025 crosses ₹1.78 lakh crore",
    summary: "Net collection after refunds stands at ₹1.52 lakh crore. MoM growth 7.8%, YoY growth 11.4%. Detailed state-wise breakup and sector analysis released.",
    tag: "Others", pdf: true,
  },
  {
    id: 103, type: "Advisory", date: "Jan 8, 2026", year: 2026, month: 1,
    featured: false,
    title: "Advisory on IMS (Invoice Management System) for taxpayers",
    summary: "GSTN has issued an advisory for taxpayers on the new Invoice Management System enabling real-time reconciliation of invoices between suppliers and recipients.",
    tag: "ITC", pdf: false,
  },
  {
    id: 104, type: "Advisory", date: "Jan 3, 2026", year: 2026, month: 1,
    featured: false,
    title: "Mandatory e-invoicing for taxpayers with AATO above ₹5 crore",
    summary: "E-invoicing is now mandatory for all registered taxpayers with aggregate annual turnover exceeding ₹5 crore from 1st February 2026 onwards.",
    tag: "E-Invoice", pdf: true,
  },
  // ── 2025 ──────────────────────────────────────────────────────
  {
    id: 95, type: "Circular", date: "Dec 28, 2025", year: 2025, month: 12,
    featured: false,
    title: "Clarification on ITC eligibility for construction services",
    summary: "CBIC Circular No. 226/20/2025-GST clarifies the scope of ITC eligibility for works contract and construction services under Section 17(5) of CGST Act.",
    tag: "ITC", pdf: true,
  },
  {
    id: 96, type: "Update", date: "Dec 22, 2025", year: 2025, month: 12,
    featured: false,
    title: "GSTN portal update: New reconciliation tool for GSTR-2B vs books",
    summary: "GSTN launched an upgraded reconciliation module that allows taxpayers to directly match GSTR-2B auto-drafted ITC with purchase register data.",
    tag: "Portal", pdf: false,
  },
  {
    id: 97, type: "Press Release", date: "Dec 18, 2025", year: 2025, month: 12,
    featured: false,
    title: "GST Council 55th meeting outcomes – key decisions summary",
    summary: "The 55th GST Council meeting chaired by Finance Minister concluded with several significant recommendations including rate rationalisation and compliance relief.",
    tag: "Council", pdf: true,
  },
  {
    id: 98, type: "Notification", date: "Dec 10, 2025", year: 2025, month: 12,
    featured: false,
    title: "CGST Rules amended – new provisions for GSTR-9 annual return",
    summary: "Central Tax notification amends CGST Rules 2017 to include new disclosure requirements in GSTR-9 for FY 2024-25 onwards. HSN-wise reporting mandatory.",
    tag: "Returns", pdf: true,
  },
  {
    id: 91, type: "Advisory", date: "Nov 20, 2025", year: 2025, month: 11,
    featured: false,
    title: "Advisory on E-Way Bill generation for multi-vehicle transport",
    summary: "GSTN issues guidance on generating consolidated E-Way Bills for consignments transported via multiple vehicles in a single dispatch cycle.",
    tag: "E-Way Bill", pdf: false,
  },
  {
    id: 92, type: "Revenue Update", date: "Nov 5, 2025", year: 2025, month: 11,
    featured: false,
    title: "GST revenue for October 2025 stands at ₹1.87 lakh crore",
    summary: "October 2025 marks a new record with ₹1.87 lakh crore gross GST collection driven by strong domestic consumption and improved compliance metrics.",
    tag: "Revenue", pdf: true,
  },
  {
    id: 85, type: "Circular", date: "Oct 14, 2025", year: 2025, month: 10,
    featured: false,
    title: "Circular on reversal of ITC on credit notes from supplier",
    summary: "CBIC clarifies the mechanism for reversal of ITC availed on credit notes issued by suppliers under Rule 37A of CGST Rules 2017.",
    tag: "ITC", pdf: true,
  },
  {
    id: 86, type: "Notification", date: "Oct 2, 2025", year: 2025, month: 10,
    featured: false,
    title: "Extension of due date for GSTR-1 for September 2025",
    summary: "CBIC extends the due date for filing GSTR-1 for the month of September 2025 by 5 days due to technical glitches reported on the GSTN portal.",
    tag: "Returns", pdf: false,
  },
  {
    id: 80, type: "Update", date: "Sep 18, 2025", year: 2025, month: 9,
    featured: false,
    title: "GSTN launches new taxpayer dashboard with compliance score",
    summary: "The revamped GSTN dashboard introduces a Compliance Rating Score for each registered taxpayer based on timely filing, payment, and ITC matching.",
    tag: "Portal", pdf: false,
  },
  {
    id: 81, type: "Press Release", date: "Sep 3, 2025", year: 2025, month: 9,
    featured: false,
    title: "MoF releases GST collection data for Q1 FY 2025-26",
    summary: "Ministry of Finance data shows Q1 FY26 total GST revenue at ₹5.57 lakh crore, reflecting 13.2% growth over corresponding period of previous financial year.",
    tag: "Revenue", pdf: true,
  },
  {
    id: 75, type: "Advisory", date: "Aug 22, 2025", year: 2025, month: 8,
    featured: false,
    title: "Advisory on new Table 14 and Table 15 in GSTR-1",
    summary: "GSTN issues advisory explaining new reporting requirements for supplies through e-commerce operators in the revised GSTR-1 format effective September 2025.",
    tag: "Returns", pdf: true,
  },
  {
    id: 76, type: "Circular", date: "Aug 8, 2025", year: 2025, month: 8,
    featured: false,
    title: "Clarification on export of services under IGST Act Section 2(6)",
    summary: "CBIC Circular 225/2025 clarifies conditions under which IT and consulting services provided to foreign clients qualify as export of services with zero-rated status.",
    tag: "Exports", pdf: true,
  },
  // ── 2024 ──────────────────────────────────────────────────────
  {
    id: 70, type: "Notification", date: "Dec 12, 2024", year: 2024, month: 12,
    featured: false,
    title: "CBIC notifies reduced GST rate on health insurance premiums",
    summary: "GST rate on individual health insurance policies with sum insured up to ₹5 lakh reduced from 18% to 5% effective 1st January 2025 as per Council decision.",
    tag: "Rates", pdf: true,
  },
  {
    id: 71, type: "Revenue Update", date: "Dec 2, 2024", year: 2024, month: 12,
    featured: false,
    title: "November 2024 GST collections cross ₹1.82 lakh crore mark",
    summary: "Festive season spending and improved compliance drove November 2024 GST collections to ₹1.82 lakh crore, a 9.4% year-on-year increase.",
    tag: "Revenue", pdf: false,
  },
  {
    id: 65, type: "Advisory", date: "Oct 25, 2024", year: 2024, month: 10,
    featured: false,
    title: "GSTN advisory on GSTR-2B generation delay for October 2024",
    summary: "GSTN acknowledges a technical issue causing delay in GSTR-2B generation for October 2024 and advises taxpayers to wait before filing GSTR-3B.",
    tag: "ITC", pdf: false,
  },
  {
    id: 66, type: "Circular", date: "Oct 10, 2024", year: 2024, month: 10,
    featured: false,
    title: "Place of supply rules clarification for cloud computing services",
    summary: "CBIC issues detailed circular on determining place of supply for cloud, SaaS, and hosted software services under Schedule II of IGST Act.",
    tag: "IGST", pdf: true,
  },
  {
    id: 60, type: "Press Release", date: "Aug 20, 2024", year: 2024, month: 8,
    featured: false,
    title: "GST Council 54th meeting: Rate rationalisation on cancer drugs",
    summary: "54th GST Council recommends reduction of GST rate on three cancer treatment drugs to 5% and exemption for satellite-based broadband internet services.",
    tag: "Council", pdf: true,
  },
  {
    id: 61, type: "Update", date: "Aug 5, 2024", year: 2024, month: 8,
    featured: false,
    title: "New HSN search tool launched on GST portal for taxpayers",
    summary: "GSTN introduces an AI-powered HSN search functionality on the GST portal allowing taxpayers to identify correct HSN codes by entering product descriptions.",
    tag: "Portal", pdf: false,
  },
  {
    id: 55, type: "Notification", date: "Jun 14, 2024", year: 2024, month: 6,
    featured: false,
    title: "Amnesty scheme for pending GST appeals announced",
    summary: "CBIC announces a one-time amnesty scheme for taxpayers with pending GST demands under Section 128A allowing settlement without interest and penalty.",
    tag: "Compliance", pdf: true,
  },
  {
    id: 56, type: "Advisory", date: "Jun 3, 2024", year: 2024, month: 6,
    featured: false,
    title: "Advisory on reporting of intra-state supplies in GSTR-3B",
    summary: "Taxpayers advised to correctly segregate intra-state B2B, B2C, and exempt supplies in respective tables of GSTR-3B to avoid mismatch notices.",
    tag: "Returns", pdf: true,
  },
  // ── 2023 ──────────────────────────────────────────────────────
  {
    id: 50, type: "Revenue Update", date: "Dec 5, 2023", year: 2023, month: 12,
    featured: false,
    title: "FY 2023-24 GST collections show consistent growth above ₹1.6 lakh crore",
    summary: "Eight consecutive months of collections above ₹1.6 lakh crore reflect structural improvement in compliance driven by e-invoicing and portal automation.",
    tag: "Revenue", pdf: true,
  },
  {
    id: 51, type: "Circular", date: "Dec 1, 2023", year: 2023, month: 12,
    featured: false,
    title: "Circular on valuation of corporate guarantee between related parties",
    summary: "CBIC Circular 204/2023 prescribes a 1% of the guaranteed amount as the taxable value of corporate guarantees extended between related persons under GST.",
    tag: "Valuation", pdf: true,
  },
  {
    id: 45, type: "Notification", date: "Sep 18, 2023", year: 2023, month: 9,
    featured: false,
    title: "E-invoicing threshold reduced to ₹5 crore AATO",
    summary: "CBIC notification mandates e-invoicing for all taxpayers with aggregate annual turnover exceeding ₹5 crore from 1st August 2023.",
    tag: "E-Invoice", pdf: true,
  },
  {
    id: 46, type: "Update", date: "Sep 2, 2023", year: 2023, month: 9,
    featured: false,
    title: "GSTN enables biometric Aadhaar authentication for new GST registration",
    summary: "New GST registrations in Gujarat and Andhra Pradesh now require biometric Aadhaar authentication at GST Suvidha Kendras as an anti-fraud measure.",
    tag: "Registration", pdf: false,
  },
  {
    id: 40, type: "Press Release", date: "Jun 12, 2023", year: 2023, month: 6,
    featured: false,
    title: "50th GST Council meeting – milestone decisions and special session",
    summary: "The 50th GST Council meeting held in New Delhi recommended GST on online gaming at 28% on full face value and concluded review of inverted duty structure.",
    tag: "Council", pdf: true,
  },
  {
    id: 41, type: "Advisory", date: "Jun 1, 2023", year: 2023, month: 6,
    featured: false,
    title: "Advisory on availment of ITC on demo vehicles by automobile dealers",
    summary: "GSTN clarifies that GST paid on purchase of demo vehicles used by automobile dealers for business demonstration is eligible as input tax credit.",
    tag: "ITC", pdf: true,
  },
  // ── 2022 ──────────────────────────────────────────────────────
  {
    id: 35, type: "Notification", date: "Nov 28, 2022", year: 2022, month: 11,
    featured: false,
    title: "CGST Rules amended to implement mandatory ITC reversal mechanism",
    summary: "Rule 37A inserted in CGST Rules to provide automated ITC reversal and reclaim mechanism for GSTR-2B based ITC where supplier fails to pay tax.",
    tag: "ITC", pdf: true,
  },
  {
    id: 36, type: "Revenue Update", date: "Nov 3, 2022", year: 2022, month: 11,
    featured: false,
    title: "October 2022 GST revenue at ₹1.52 lakh crore – 2nd highest ever",
    summary: "October 2022 GST collections at ₹1,51,718 crore, the second highest since GST implementation, driven by economic recovery and festive season demand.",
    tag: "Revenue", pdf: false,
  },
  {
    id: 30, type: "Circular", date: "Aug 3, 2022", year: 2022, month: 8,
    featured: false,
    title: "Clarification on GST treatment of transactions in crypto assets",
    summary: "CBIC issues guidance on GST applicability on transfer of virtual digital assets, clarifying that brokerage and exchange fees attract 18% GST.",
    tag: "Digital", pdf: true,
  },
  {
    id: 31, type: "Advisory", date: "Aug 1, 2022", year: 2022, month: 8,
    featured: false,
    title: "GSTN advisory on the new Annual Return GSTR-9 for FY 2021-22",
    summary: "Advisory explains key changes in GSTR-9 and GSTR-9C for FY 2021-22 including optional reporting of HSN details and reconciliation statement changes.",
    tag: "Returns", pdf: true,
  },
  {
    id: 25, type: "Update", date: "Apr 20, 2022", year: 2022, month: 4,
    featured: false,
    title: "GST portal launches automated GSTR-1 filing assistance tool",
    summary: "A new GSTR-1 filing assistant tool on the GST portal pre-populates invoice data from IRP reducing manual entry errors and improving filing accuracy.",
    tag: "Portal", pdf: false,
  },
  {
    id: 26, type: "Press Release", date: "Apr 4, 2022", year: 2022, month: 4,
    featured: false,
    title: "GST revenue in March 2022 at ₹1.42 lakh crore – all-time high then",
    summary: "March 2022 GST collection of ₹1,42,095 crore sets a new record driven by year-end compliance push and improved e-invoicing adoption across sectors.",
    tag: "Revenue", pdf: true,
  },
  // ── 2021 ──────────────────────────────────────────────────────
  {
    id: 20, type: "Notification", date: "Dec 21, 2021", year: 2021, month: 12,
    featured: false,
    title: "Auto-population of GSTR-3B from GSTR-1 and GSTR-2B enabled",
    summary: "GSTN enables Phase-I of auto-population of liability and ITC values in GSTR-3B based on filed GSTR-1 and system-generated GSTR-2B for all taxpayers.",
    tag: "Returns", pdf: true,
  },
  {
    id: 21, type: "Circular", date: "Dec 8, 2021", year: 2021, month: 12,
    featured: false,
    title: "Clarification on GST on employee secondment – overseas entities",
    summary: "CBIC Circular 167/2021 clarifies that services by overseas holding company employees seconded to Indian subsidiaries attract GST under reverse charge.",
    tag: "RCM", pdf: true,
  },
  {
    id: 18, type: "Advisory", date: "Sep 12, 2021", year: 2021, month: 9,
    featured: false,
    title: "Advisory on introduction of GSTR-2B for ITC reconciliation",
    summary: "GSTN introduces GSTR-2B as a static ITC statement to facilitate accurate reconciliation and reduce ITC mismatches between buyers and suppliers.",
    tag: "ITC", pdf: false,
  },
  {
    id: 19, type: "Revenue Update", date: "Sep 1, 2021", year: 2021, month: 9,
    featured: false,
    title: "August 2021 GST revenue crosses ₹1.12 lakh crore post-pandemic recovery",
    summary: "GST collections in August 2021 at ₹1,12,020 crore reflect strong recovery from COVID-19 disruptions with all major states showing double-digit growth.",
    tag: "Revenue", pdf: false,
  },
  // ── 2020 ──────────────────────────────────────────────────────
  {
    id: 15, type: "Notification", date: "Oct 1, 2020", year: 2020, month: 10,
    featured: false,
    title: "QRMP scheme introduced for small taxpayers with turnover up to ₹5 crore",
    summary: "CBIC introduces Quarterly Return Monthly Payment (QRMP) scheme allowing eligible taxpayers to file GSTR-1 and GSTR-3B on quarterly basis from January 2021.",
    tag: "Compliance", pdf: true,
  },
  {
    id: 16, type: "Circular", date: "Oct 15, 2020", year: 2020, month: 10,
    featured: false,
    title: "Circular clarifying ITC restriction on employee welfare expenses",
    summary: "CBIC Circular 172/2020 clarifies restrictions on ITC availment on canteen, health insurance, and other employee welfare expenses under Section 17(5).",
    tag: "ITC", pdf: true,
  },
  {
    id: 12, type: "Advisory", date: "Apr 3, 2020", year: 2020, month: 4,
    featured: false,
    title: "Advisory on COVID-19 GST compliance relief – due date extensions",
    summary: "GSTN issues advisory on relief measures for taxpayers during COVID-19 pandemic including waiver of late fees and extension of return filing due dates.",
    tag: "Compliance", pdf: false,
  },
  {
    id: 13, type: "Update", date: "Apr 1, 2020", year: 2020, month: 4,
    featured: false,
    title: "GST portal enhancements for bulk filing and offline tool update",
    summary: "Updated GSTR-1 and GSTR-3B offline tools released with improved performance for bulk invoice upload and error-handling for large taxpayers.",
    tag: "Portal", pdf: false,
  },
  // ── 2019 ──────────────────────────────────────────────────────
  {
    id: 10, type: "Notification", date: "Dec 26, 2019", year: 2019, month: 12,
    featured: false,
    title: "E-invoicing scheme notified – implementation from April 2020",
    summary: "CBIC notifies e-invoicing under Rule 48(4) of CGST Rules for taxpayers with AATO exceeding ₹500 crore to be implemented from 1st April 2020.",
    tag: "E-Invoice", pdf: true,
  },
  {
    id: 11, type: "Revenue Update", date: "Dec 3, 2019", year: 2019, month: 12,
    featured: false,
    title: "GST collections for November 2019 show month-on-month improvement",
    summary: "November 2019 GST revenue at ₹1,03,492 crore improves over previous months reflecting government initiatives to improve return filing compliance rates.",
    tag: "Revenue", pdf: false,
  },
  {
    id: 8, type: "Circular", date: "Aug 14, 2019", year: 2019, month: 8,
    featured: false,
    title: "Circular on GST applicability on educational services and institutions",
    summary: "CBIC Circular 151/2019 comprehensively clarifies exemption scope for educational services including coaching classes, online courses, and exam fees.",
    tag: "Exemption", pdf: true,
  },
  {
    id: 9, type: "Advisory", date: "Aug 2, 2019", year: 2019, month: 8,
    featured: false,
    title: "Advisory on Composition Scheme annual return CMP-08 for FY 2018-19",
    summary: "GSTN issues advisory on filing of annual statement CMP-08 for composition dealers for FY 2018-19 with step-by-step guidance on portal navigation.",
    tag: "Composition", pdf: false,
  },
  // ── 2018 ──────────────────────────────────────────────────────
  {
    id: 5, type: "Notification", date: "Nov 15, 2018", year: 2018, month: 11,
    featured: false,
    title: "GST rates revised downward on 28 goods at 32nd Council meeting",
    summary: "32nd GST Council meeting reduces rates on several items including TV sets up to 32 inches, computer monitors, lithium-ion batteries, and handmade goods.",
    tag: "Rates", pdf: true,
  },
  {
    id: 6, type: "Circular", date: "Nov 2, 2018", year: 2018, month: 11,
    featured: false,
    title: "Circular on treatment of secondary discounts and post-sale incentives",
    summary: "CBIC Circular 105/2018 clarifies GST implications of trade discounts, volume incentives, and other post-sale incentives between distributors and manufacturers.",
    tag: "Valuation", pdf: true,
  },
  {
    id: 3, type: "Advisory", date: "May 18, 2018", year: 2018, month: 5,
    featured: false,
    title: "Advisory on the new return filing system – GST 2.0 pilot",
    summary: "GSTN issues advisory on the pilot launch of the new simplified return filing system featuring SAHAJ, SUGAM, and main return formats for different taxpayer categories.",
    tag: "Returns", pdf: false,
  },
  {
    id: 4, type: "Update", date: "May 4, 2018", year: 2018, month: 5,
    featured: false,
    title: "E-Way Bill system fully operational across all states",
    summary: "E-Way Bill system becomes operational for inter-state and intra-state movement of goods across all 29 states and 7 union territories from April and May 2018.",
    tag: "E-Way Bill", pdf: false,
  },
  // ── 2017 ──────────────────────────────────────────────────────
  {
    id: 1, type: "Notification", date: "Jul 1, 2017", year: 2017, month: 7,
    featured: true,
    title: "GST officially launched – historic tax reform comes into effect",
    summary: "Goods and Services Tax replaces multiple indirect taxes including Central Excise, VAT, and Service Tax from midnight of 1st July 2017 with a unified structure.",
    tag: "Launch", pdf: true,
  },
  {
    id: 2, type: "Advisory", date: "Jul 15, 2017", year: 2017, month: 7,
    featured: false,
    title: "GSTN advisory on first-time registration and migration from VAT to GST",
    summary: "Comprehensive advisory for businesses migrating from VAT, Service Tax, and Central Excise to the new GST regime including provisional ID and ARN guidance.",
    tag: "Registration", pdf: true,
  },
  {
    id: 201, type: "Circular", date: "Sep 25, 2017", year: 2017, month: 9,
    featured: false,
    title: "Clarification on transitional credit under Section 140 of CGST Act",
    summary: "CBIC Circular 1/2017 clarifies the procedure for availing of transitional credit of pre-GST taxes like CENVAT and VAT in TRAN-1 and TRAN-2 forms.",
    tag: "Transition", pdf: true,
  },
  {
    id: 202, type: "Revenue Update", date: "Sep 1, 2017", year: 2017, month: 9,
    featured: false,
    title: "First GST revenue data – ₹92,283 crore collected in July 2017",
    summary: "Government releases first GST collection data for July 2017 showing ₹92,283 crore from 72.5 lakh returns filed, with CGST, SGST, and IGST breakup.",
    tag: "Revenue", pdf: false,
  },
];

// ════════════════════════════════════════════════════════════════════
// Archive Modal — Full calendar 2017–2026
// ════════════════════════════════════════════════════════════════════
const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];
const YEARS = [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026];

const ArchiveModal = ({ onClose, onSelectArchive, newsData = NEWS_DATA }) => {
  const [selectedYear,  setSelectedYear]  = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedType,  setSelectedType]  = useState("all");

  const modalRef = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // count how many items exist for a year+month combo
  const countFor = (yr, mo) =>
    newsData.filter(
      (n) =>
        n.year === yr &&
        n.month === mo &&
        (selectedType === "all" || n.type === selectedType)
    ).length;

  const handleApply = () => {
    onSelectArchive({ year: selectedYear, month: selectedMonth, type: selectedType });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "720px",
          boxShadow:
            "0 40px 100px rgba(15,23,42,0.28), 0 8px 32px rgba(15,23,42,0.12)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}
      >

        {/* ── MODAL HEADER — white, 3D card style ── */}
        <div
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            padding: "18px 22px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid #f1f5f9",
            boxShadow: "0 4px 16px rgba(15,23,42,0.07), inset 0 -2px 0 rgba(79,70,229,0.08)",
            position: "relative",
          }}
        >


          {/* Left: 3D icon + text */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", paddingLeft: "0" }}>
            {/* 3D icon box */}
            <div
              style={{
                width: "46px", height: "46px",
                borderRadius: "14px",
                background: "linear-gradient(145deg, #4f46e5 0%, #3730a3 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow:
                  "0 8px 20px rgba(79,70,229,0.32), 0 2px 6px rgba(79,70,229,0.18), inset 0 1px 0 rgba(255,255,255,0.2)",
                flexShrink: 0,
              }}
            >
              <HiCalendar style={{ color: "#fff", fontSize: "1.3rem" }} />
            </div>

            <div>
              <h2 style={{
                margin: 0,
                fontSize: "1.12rem", fontWeight: 800,
                color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.2,
              }}>
                GST{" "}
                <span style={{ color: "#4f46e5" }}>Archives</span>
              </h2>
              <p style={{
                margin: "3px 0 0",
                fontSize: "0.74rem", fontWeight: 500, color: "#64748b",
              }}>
                Browse GST updates from 2017 to 2026
              </p>
            </div>
          </div>

          {/* Right: Close button — dark, turns red on hover */}
          <button
            onClick={onClose}
            style={{
              width: "36px", height: "36px",
              borderRadius: "10px",
              background: "#f1f5f9",
              border: "1.5px solid #e2e8f0",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1rem", fontWeight: 700,
              color: "#64748b",
              transition: "all 0.15s ease",
              boxShadow: "0 2px 6px rgba(15,23,42,0.07)",
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#ef4444";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "#ef4444";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(239,68,68,0.32)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(15,23,42,0.07)";
            }}
          >
            ✕
          </button>
        </div>

        {/* ── MODAL BODY ── */}
        <div style={{ padding: "20px 24px 22px" }}>

          {/* ── SECTION LABEL: Filter by Type ── */}
          <p style={{
            margin: "0 0 9px",
            fontSize: "0.72rem", fontWeight: 800,
            color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Filter by Type
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "20px" }}>
            {FILTER_TABS.map((tab) => {
              const isActive = selectedType === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedType(tab.value)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "999px",
                    border: isActive ? "none" : "1.5px solid #e2e8f0",
                    background: isActive
                      ? "linear-gradient(135deg, #4f46e5, #3730a3)"
                      : "#f8fafc",
                    color: isActive ? "#fff" : "#475569",
                    fontSize: "0.79rem",
                    fontWeight: isActive ? 700 : 600,
                    cursor: "pointer",
                    boxShadow: isActive
                      ? "0 3px 10px rgba(79,70,229,0.28)"
                      : "0 1px 3px rgba(15,23,42,0.05)",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#ede9fe";
                      e.currentTarget.style.color = "#4f46e5";
                      e.currentTarget.style.borderColor = "#c4b5fd";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.color = "#475569";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── SECTION LABEL: Select Year ── */}
          <p style={{
            margin: "0 0 9px",
            fontSize: "0.72rem", fontWeight: 800,
            color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Select Year
          </p>
          {/* Year grid — 5 per row so all 10 years fit perfectly in 2 rows */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "10px",
              marginBottom: "22px",
            }}
          >
            {YEARS.map((yr) => {
              const isActive = selectedYear === yr;
              const hasData = newsData.some(
                (n) => n.year === yr && (selectedType === "all" || n.type === selectedType)
              );
              return (
                <button
                  key={yr}
                  onClick={() => { if (hasData) { setSelectedYear(yr); setSelectedMonth(null); } }}
                  style={{
                    padding: "11px 6px",
                    borderRadius: "12px",
                    border: isActive
                      ? "none"
                      : hasData
                      ? "1.5px solid #e2e8f0"
                      : "1.5px solid #f1f5f9",
                    background: isActive
                      ? "linear-gradient(145deg, #4f46e5, #3730a3)"
                      : hasData
                      ? "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
                      : "#f8fafc",
                    color: isActive ? "#fff" : hasData ? "#0f172a" : "#cbd5e1",
                    fontSize: "0.92rem",
                    fontWeight: isActive ? 800 : hasData ? 700 : 400,
                    cursor: hasData ? "pointer" : "not-allowed",
                    boxShadow: isActive
                      ? "0 6px 16px rgba(79,70,229,0.32), inset 0 1px 0 rgba(255,255,255,0.18)"
                      : hasData
                      ? "0 2px 6px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.8)"
                      : "none",
                    transition: "all 0.15s",
                    opacity: hasData ? 1 : 0.4,
                    textAlign: "center",
                    width: "100%",
                  }}
                  onMouseEnter={e => {
                    if (hasData && !isActive) {
                      e.currentTarget.style.background = "linear-gradient(180deg, #ede9fe 0%, #ddd6fe 100%)";
                      e.currentTarget.style.color = "#4f46e5";
                      e.currentTarget.style.borderColor = "#c4b5fd";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (hasData && !isActive) {
                      e.currentTarget.style.background = "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)";
                      e.currentTarget.style.color = "#0f172a";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}
                >
                  {yr}
                </button>
              );
            })}
          </div>

          {/* ── SECTION LABEL: Select Month ── */}
          <p style={{
            margin: "0 0 9px",
            fontSize: "0.72rem", fontWeight: 800,
            color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Select Month — <span style={{ color: "#4f46e5", fontWeight: 700, textTransform: "none", letterSpacing: 0 }}>{selectedYear}</span>
          </p>
          {/* Month grid — 4 columns × 3 rows, year jaisi same styling */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
              marginBottom: "22px",
            }}
          >
            {MONTHS.map((mo, idx) => {
              const monthNum = idx + 1;
              const count = countFor(selectedYear, monthNum);
              const isActive = selectedMonth === monthNum;
              const hasData = count > 0;
              return (
                <button
                  key={mo}
                  onClick={() => hasData && setSelectedMonth(isActive ? null : monthNum)}
                  style={{
                    padding: "11px 6px",
                    borderRadius: "12px",
                    border: isActive
                      ? "none"
                      : hasData
                      ? "1.5px solid #e2e8f0"
                      : "1.5px solid #f1f5f9",
                    background: isActive
                      ? "linear-gradient(145deg, #4f46e5, #3730a3)"
                      : hasData
                      ? "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
                      : "#f8fafc",
                    color: isActive ? "#fff" : hasData ? "#0f172a" : "#cbd5e1",
                    fontSize: "0.9rem",
                    fontWeight: isActive ? 800 : hasData ? 700 : 400,
                    cursor: hasData ? "pointer" : "not-allowed",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    transition: "all 0.15s",
                    boxShadow: isActive
                      ? "0 6px 16px rgba(79,70,229,0.32), inset 0 1px 0 rgba(255,255,255,0.18)"
                      : hasData
                      ? "0 2px 6px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.8)"
                      : "none",
                    opacity: 1,
                    textAlign: "center",
                    width: "100%",
                  }}
                  onMouseEnter={e => {
                    if (hasData && !isActive) {
                      e.currentTarget.style.background = "linear-gradient(180deg, #ede9fe 0%, #ddd6fe 100%)";
                      e.currentTarget.style.color = "#4f46e5";
                      e.currentTarget.style.borderColor = "#c4b5fd";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (hasData && !isActive) {
                      e.currentTarget.style.background = "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)";
                      e.currentTarget.style.color = "#0f172a";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <span style={{ lineHeight: 1, fontWeight: isActive ? 800 : hasData ? 700 : 500, color: isActive ? "#fff" : hasData ? "#0f172a" : "#94a3b8" }}>{mo}</span>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      background: isActive
                        ? "rgba(255,255,255,0.25)"
                        : hasData
                        ? "#4f46e5"
                        : "#e2e8f0",
                      color: isActive ? "#fff" : hasData ? "#fff" : "#94a3b8",
                      borderRadius: "20px",
                      padding: "1px 6px",
                      lineHeight: 1.6,
                      minWidth: "18px",
                      textAlign: "center",
                      display: "inline-block",
                    }}
                  >
                    {hasData ? count : "0"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── ACTION ROW ── */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
              paddingTop: "4px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "10px 24px",
                borderRadius: "10px",
                border: "1.5px solid #e2e8f0",
                background: "#f8fafc",
                color: "#475569",
                fontSize: "0.86rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              style={{
                padding: "10px 28px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #4f46e5, #3730a3)",
                color: "#fff",
                fontSize: "0.86rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 6px 16px rgba(79,70,229,0.32)",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 10px 24px rgba(79,70,229,0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(79,70,229,0.32)";
              }}
            >
              <HiCalendar style={{ fontSize: "1rem" }} />
              View Archive
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// News Card
// ════════════════════════════════════════════════════════════════════
const NewsCard = ({ item }) => {
  const meta = TYPE_META[item.type] || TYPE_META["Update"];
  const Icon = meta.icon;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e8edf5",
        boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 10px 32px rgba(79,70,229,0.13)";
        e.currentTarget.style.borderColor = "#c7d2fe";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(15,23,42,0.06)";
        e.currentTarget.style.borderColor = "#e8edf5";
      }}
    >
      {/* ── Card Top Bar ── */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        {/* Type Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div
            style={{
              width: "28px", height: "28px",
              borderRadius: "8px",
              background: meta.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon style={{ color: meta.color, fontSize: "0.95rem" }} />
          </div>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: meta.color }}>
            {item.type}
          </span>
        </div>

        {/* Date + dots handle */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "0.73rem", fontWeight: 600, color: "#64748b",
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: "20px", padding: "3px 10px",
            }}
          >
            {item.date}
          </span>
          <span style={{ color: "#cbd5e1", fontSize: "0.9rem", letterSpacing: "-1px" }}>⋮⋮</span>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div style={{ padding: "16px 18px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        {item.featured && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
            <span style={{ color: "#f59e0b", fontSize: "0.75rem" }}>★</span>
            <span
              style={{
                fontSize: "0.65rem", fontWeight: 800,
                color: "#92400e", letterSpacing: "0.08em", textTransform: "uppercase",
              }}
            >
              Featured
            </span>
          </div>
        )}

        <h3
          style={{
            margin: "0 0 8px",
            fontSize: "0.94rem", fontWeight: 700,
            color: "#0f172a", lineHeight: 1.45,
          }}
        >
          {item.title}
        </h3>

        <p
          style={{
            margin: 0, fontSize: "0.81rem", color: "#64748b",
            lineHeight: 1.65, flex: 1,
          }}
        >
          {item.summary}
        </p>
      </div>

      {/* ── Card Footer ── */}
      <div
        style={{
          padding: "10px 18px",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "0.72rem", fontWeight: 600, color: "#475569",
              background: "#f1f5f9", border: "1px solid #e2e8f0",
              borderRadius: "20px", padding: "3px 10px",
            }}
          >
            {item.tag}
          </span>
          {item.pdf && (
            <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500 }}>
              · PDF available
            </span>
          )}
        </div>

        {item.pdf && (
          <button
            style={{
              width: "30px", height: "30px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(239,68,68,0.28)",
              flexShrink: 0, transition: "all 0.15s",
            }}
            title="View PDF"
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <span style={{ color: "#fff", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.02em" }}>PDF</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════════════════
const NewsAndUpdates = () => {
  const [activeFilter,  setActiveFilter]  = useState("all");
  const [showArchive,   setShowArchive]   = useState(false);
  const [archiveFilter, setArchiveFilter] = useState(null);
  // archiveFilter = { year, month, type } | null

  // Live news from the Django backend (falls back to static data offline)
  const [liveNews, setLiveNews] = useState(null);
  useEffect(() => {
    fetchNews()
      .then((res) => setLiveNews(res.results || res))
      .catch(() => {});
  }, []);
  const newsList = liveNews || NEWS_DATA;

  // Build visible list
  const getFiltered = () => {
    let data = [...newsList];

    // If archive mode active
    if (archiveFilter) {
      data = data.filter((n) => {
        const yearMatch = n.year === archiveFilter.year;
        const monthMatch = archiveFilter.month ? n.month === archiveFilter.month : true;
        const typeMatch =
          archiveFilter.type === "all" || n.type === archiveFilter.type;
        return yearMatch && monthMatch && typeMatch;
      });
    } else {
      // Normal filter tab
      if (activeFilter !== "all") {
        data = data.filter((n) => n.type === activeFilter);
      }
    }

    // Sort newest first
    data.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });

    return data;
  };

  const filtered = getFiltered();

  // Count per tab for the strip
  const _countFor = (type) =>
    type === "all"
      ? newsList.length
      : newsList.filter((n) => n.type === type).length;

  const handleSelectArchive = (filter) => {
    setArchiveFilter(filter);
    setActiveFilter("all");
  };

  const clearArchive = () => {
    setArchiveFilter(null);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f1f5f9",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ══════════════════════════════════════════════════════════
          TOP NAVBAR — fixed at top, does not scroll
      ════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "14px 20px 0", flexShrink: 0 }}>
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(15,23,42,0.07), 0 1px 3px rgba(15,23,42,0.05)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Radial glow overlay */}
          <div
            style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse 55% 100% at 0% 50%, rgba(237,233,254,0.55) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* LEFT: Icon + Title */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: "14px",
              position: "relative", zIndex: 1,
            }}
          >
            {/* Icon box */}
            <div
              style={{
                width: "46px", height: "46px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 16px rgba(79,70,229,0.35)",
                flexShrink: 0,
              }}
            >
              <HiDocumentText style={{ color: "#fff", fontSize: "1.3rem" }} />
            </div>

            {/* Title block */}
            <div>
              <h1
                style={{
                  margin: 0, fontSize: "1.2rem", fontWeight: 800,
                  color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.2,
                }}
              >
                GST News{" "}
                <span style={{ color: "#4f46e5" }}>&amp; Updates</span>
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: "0.77rem", color: "#64748b", fontWeight: 500 }}>
                Latest notifications, advisories &amp; revenue updates
              </p>
            </div>

          </div>

          {/* RIGHT: Archives button */}
          <button
            onClick={() => setShowArchive(true)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 20px",
              background: "linear-gradient(135deg, #4f46e5, #3730a3)",
              color: "#fff", border: "none",
              borderRadius: "12px",
              fontSize: "0.85rem", fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(79,70,229,0.32)",
              transition: "all 0.18s ease",
              position: "relative", zIndex: 1,
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 10px 26px rgba(79,70,229,0.42)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(79,70,229,0.32)";
            }}
          >
            <HiArchive style={{ fontSize: "1rem" }} />
            Archives
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SCROLLABLE CONTENT AREA
      ════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0" }}>
      <div style={{ padding: "14px 20px 28px" }}>

        {/* Archive banner — visible when archive filter applied */}
        {archiveFilter && (
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
              border: "1px solid #c4b5fd",
              borderRadius: "12px",
              padding: "10px 16px",
              marginBottom: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <HiCalendar style={{ color: "#4f46e5", fontSize: "1rem" }} />
              <span style={{ fontSize: "0.83rem", fontWeight: 700, color: "#3730a3" }}>
                Archive View:{" "}
                {archiveFilter.month ? MONTHS[archiveFilter.month - 1] + " " : "All months, "}
                {archiveFilter.year}
                {archiveFilter.type !== "all" ? ` · ${archiveFilter.type}` : ""}
              </span>
              <span
                style={{
                  background: "#4f46e5", color: "#fff",
                  fontSize: "0.65rem", fontWeight: 800,
                  borderRadius: "20px", padding: "2px 8px",
                }}
              >
                {filtered.length} results
              </span>
            </div>
            <button
              onClick={clearArchive}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "5px 12px", borderRadius: "8px",
                background: "#4f46e5", color: "#fff",
                border: "none", fontSize: "0.75rem", fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <HiX style={{ fontSize: "0.8rem" }} /> Clear
            </button>
          </div>
        )}

        {/* Filter Tab Pills */}
       

        {/* ── Rounded Cards Container ── */}
        <div
          style={{
            background: "linear-gradient(180deg, #eef2ff 0%, #f1f5f9 100%)",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
          }}
        >
          {/* Inner nav strip — filter pills centered */}
          <div
  style={{
    padding: "20px 40px",
    borderBottom: "1px solid #e2e8f0",
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "18px",
    flexWrap: "wrap",
  }}
>
  {FILTER_TABS.map((tab) => {
    const isActive = activeFilter === tab.value;

    return (
      <button
        key={tab.value}
        onClick={() => setActiveFilter(tab.value)}
        style={{
          padding: "8px 16px",
          borderRadius: "999px",
          border: isActive ? "none" : "1.5px solid #e2e8f0",
          background: isActive
            ? "linear-gradient(135deg,#4f46e5,#3730a3)"
            : "#ffffff",
          color: isActive ? "#ffffff" : "#475569",
          fontSize: "0.82rem",
          fontWeight: isActive ? 700 : 600,
          cursor: "pointer",
          transition: "all 0.15s ease",
          boxShadow: isActive
            ? "0 4px 14px rgba(79,70,229,0.28)"
            : "0 1px 3px rgba(15,23,42,0.05)",
          whiteSpace: "nowrap",
        }}
      >
        {tab.label}
      </button>
    );
  })}
</div>
          {/* Cards Grid */}
          <div
            style={{
              padding: "18px 20px 22px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
              gap: "16px",
            }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "64px 0",
                  color: "#94a3b8",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📋</div>
                No updates found for the selected filter.
                {archiveFilter && (
                  <div style={{ marginTop: "10px" }}>
                    <button
                      onClick={clearArchive}
                      style={{
                        padding: "8px 20px", borderRadius: "8px",
                        background: "#4f46e5", color: "#fff",
                        border: "none", fontSize: "0.82rem",
                        fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Back to All Updates
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filtered.map((item) => <NewsCard key={item.id} item={item} />)
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Archive Modal */}
      {showArchive && (
        <ArchiveModal
          onClose={() => setShowArchive(false)}
          onSelectArchive={handleSelectArchive}
          newsData={newsList}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default NewsAndUpdates;