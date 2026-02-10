/**
 * NY Family Court Order of Protection — forms, links, and court process data.
 * All links point to official NY Courts / NYS government sources.
 */

export type CourtForm = {
  id: string;
  name: string;
  formNumber: string;
  description: string;
  url: string;
  category: "filing" | "court-issued" | "violation" | "modification" | "guide" | "remote";
  required?: boolean;
};

export const COURT_FORMS: CourtForm[] = [
  // A) Filing packet
  {
    id: "info-sheet",
    name: "Family Court Intake / Identification Sheet",
    formNumber: "InfoSheet",
    description: "Required identification sheet filed with most Family Court petitions.",
    url: "https://ww2.nycourts.gov/sites/default/files/document/files/2023-09/InfoSheet.pdf",
    category: "filing",
    required: true,
  },
  {
    id: "family-offense-petition",
    name: "Family Offense Petition",
    formNumber: "UCS-FC 8-2",
    description: "The core filing — your petition alleging a family offense and requesting an order of protection.",
    url: "https://www.nycourts.gov/LegacyPDFS/FORMS/familycourt/pdfs/8-2.pdf",
    category: "filing",
    required: true,
  },
  {
    id: "address-confidentiality",
    name: "Address Confidentiality Affidavit",
    formNumber: "GF-21",
    description: "Use this if your address needs to be kept confidential for safety. Do NOT write your address on the petition if using this form.",
    url: "https://www.nycourts.gov/LegacyPDFS/FORMS/familycourt/pdfs/gf-21.pdf",
    category: "filing",
  },
  // B) Court-issued documents
  {
    id: "temp-op",
    name: "Temporary Order of Protection",
    formNumber: "GF-5",
    description: "The judge signs this if a temporary order is granted (usually same day as filing).",
    url: "https://www.nycourts.gov/LegacyPDFS/FORMS/familycourt/pdfs/GF-5.pdf",
    category: "court-issued",
  },
  {
    id: "final-op",
    name: "Order of Protection (Final)",
    formNumber: "GF-5a",
    description: "The judge signs this at the end of the case if a final order is granted.",
    url: "https://www.nycourts.gov/LegacyPDFS/FORMS/familycourt/pdfs/GF-5a.pdf",
    category: "court-issued",
  },
  {
    id: "affidavit-temp-op",
    name: "Affidavit in Support of Temporary OP",
    formNumber: "GF-5b",
    description: "Sometimes used to support a temporary order request. Some courts rely mainly on the petition + judge questions.",
    url: "https://www.nycourts.gov/LegacyPDFS/FORMS/familycourt/pdfs/gf-5bfillable.pdf",
    category: "court-issued",
  },
  {
    id: "summons",
    name: "Summons",
    formNumber: "GF-7",
    description: "The 'come to court' paper that must be served on the respondent.",
    url: "https://www.nycourts.gov/LegacyPDFS/FORMS/familycourt/pdfs/gf-7.pdf",
    category: "court-issued",
  },
  // C) Violation
  {
    id: "violation-petition",
    name: "Petition — Violation of Order of Protection",
    formNumber: "GF-8",
    description: "File this if the respondent violates the order. Violations are a crime.",
    url: "https://www.nycourts.gov/LegacyPDFS/FORMS/familycourt/pdfs/GF-8.pdf",
    category: "violation",
  },
  // D) Extension/Modification
  {
    id: "motion-extension",
    name: "Motion (Extension/Modification)",
    formNumber: "GF-10",
    description: "Use this to extend or modify an existing order of protection.",
    url: "https://www.nycourts.gov/LegacyPDFS/FORMS/familycourt/pdfs/GF-10.pdf",
    category: "modification",
  },
  {
    id: "affirmation-motion",
    name: "Affirmation in Support of Motion",
    formNumber: "GF-10a",
    description: "Supporting affirmation for your extension/modification motion.",
    url: "https://www.nycourts.gov/LegacyPDFS/FORMS/familycourt/pdfs/GF-10a.pdf",
    category: "modification",
  },
  // E) Guides
  {
    id: "faq-guide",
    name: "NYC Family Court DV FAQ",
    formNumber: "Guide",
    description: "Official NYC Family Court walkthrough: what to include, how to serve, return dates, violations, and more.",
    url: "https://ww2.nycourts.gov/COURTS/nyc/family/faqs_domesticviolence.shtml",
    category: "guide",
  },
  {
    id: "opdv-overview",
    name: "NYS OPDV Orders of Protection Overview",
    formNumber: "Guide",
    description: "Explains types of OPs, service, enforceability, after-hours info, and more.",
    url: "https://opdv.ny.gov/orders-protection",
    category: "guide",
  },
  {
    id: "nyc311-hub",
    name: "NYC311 Order of Protection Info Hub",
    formNumber: "Guide",
    description: "NYC311 reference page with pointers and current resources.",
    url: "https://portal.311.nyc.gov/article/?kanumber=KA-02904",
    category: "guide",
  },
  // F) Remote filing (EDDS)
  {
    id: "edds-user-guide",
    name: "Family Court EDDS Public User Guide",
    formNumber: "PDF Guide",
    description: "How to use the electronic document delivery system for remote filing.",
    url: "https://portal.nycourts.gov/knowledgebase/EDDS_FamilyCourt-UserGuide-Public.pdf",
    category: "remote",
  },
  {
    id: "edds-portal",
    name: "EDDS Landing Page",
    formNumber: "Portal",
    description: "Entry point for electronic document submission to Family Court.",
    url: "https://iappscontent.courts.state.ny.us/NYSCEF/live/edds.htm",
    category: "remote",
  },
];

export type ProcessStep = {
  step: number;
  title: string;
  description: string;
  details: string[];
  timeEstimate: string;
  tips: string[];
};

export const COURT_PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    title: "Go to the Petition Room / Help Center",
    description: "Visit your local Family Court's Help Center (\"Petition Room\") during business hours. Tell the clerk you want to file a Family Offense Petition for an Order of Protection. You'll be given forms and a clerk will help draft the petition from your information. Where available, you can also use EDDS for remote submission.",
    details: [
      "No filing fees in Family Court for this.",
      "Bring photo ID and any evidence you have (texts, photos, medical records, police reports).",
      "If your address needs to be confidential, tell the clerk immediately and ask for form GF-21.",
    ],
    timeEstimate: "Same day to get petition drafted and see a judge, but wait times vary by borough/county.",
    tips: [
      "Arrive early — courts can be busy.",
      "Write your incident details before you arrive so you don't forget key facts under stress.",
    ],
  },
  {
    step: 2,
    title: "Complete the Paperwork",
    description: "This is where cases are won or lost. Put as many details as possible: when, where, what happened, injuries, weapons. Include the most recent incident, the first incident, and the worst incident.",
    details: [
      "If there were verbal threats, include the EXACT WORDS used.",
      "Tell the clerk about any criminal case and any prior orders of protection.",
      "Read the petition before you sign it and fix any omissions.",
      "Use this structure for each incident: (1) Date/time/place, (2) Who was present, (3) What respondent did/said, (4) Your reaction and why you feared harm, (5) Injuries/property damage, (6) Why it matters now, (7) What you want the court to order.",
    ],
    timeEstimate: "30-60 minutes to complete with the clerk's help.",
    tips: [
      "Be specific and factual. Avoid vague language like 'he was mean' — say exactly what he did.",
      "Include injuries even if you didn't go to the hospital.",
      "If children witnessed anything, describe what they saw/heard.",
    ],
  },
  {
    step: 3,
    title: "Request Address Confidentiality (if needed)",
    description: "If listing your address is unsafe, do NOT write it on the petition. Ask the clerk for the Address Confidentiality Affidavit (form GF-21) and file it with your petition.",
    details: [
      "The court can keep your address sealed from the respondent.",
      "You can use a safe alternative address for service purposes.",
    ],
    timeEstimate: "A few minutes — just fill out form GF-21.",
    tips: [
      "Decide this BEFORE filling out the petition so you don't accidentally write your address.",
    ],
  },
  {
    step: 4,
    title: "See the Judge for a Temporary Order of Protection",
    description: "After the clerk drafts the petition, you wait to see a judge. The judge reviews it and decides if there is 'good cause' to issue a temporary order. The judge will also set up the summons and your return date.",
    details: [
      "The judge applies Family Court Act §828 — 'good cause shown' standard.",
      "Factors the judge considers: prior incidents, injury, threats, drug/alcohol abuse, access to weapons, prior OP violations.",
      "The judge may ask questions based on your petition — answer directly.",
      "If you want exclusion from the home or temporary support, SAY SO explicitly.",
    ],
    timeEstimate: "The judge interaction is often short (5-15 minutes), but waiting can be hours.",
    tips: [
      "Hit 3 things in order: (1) Most recent incident (60-90 seconds), (2) Why the risk is ongoing, (3) Exact relief you want today.",
      "Be prepared to explain: stay-away, no-contact, exclusion, firearms restriction, temporary child support if needed.",
    ],
  },
  {
    step: 5,
    title: "Pick Up Your Papers",
    description: "If the temporary order is granted, you'll receive your copy of the temporary order and a summons + petition copy for service on the respondent.",
    details: [
      "Keep your copy of the temporary order with you at all times.",
      "The summons tells the respondent when to appear in court.",
      "The order is NOT in effect until it has been served on the respondent.",
    ],
    timeEstimate: "Typically provided same day after the judge's decision.",
    tips: [
      "Make copies of everything for your records.",
      "Take a photo of the order on your phone as backup.",
    ],
  },
  {
    step: 6,
    title: "Serve the Respondent",
    description: "The respondent must receive the papers (personal service) for the case to proceed. You CANNOT serve them yourself. The server can be: sheriff, police, a friend/relative over 18, or a professional process server.",
    details: [
      "Service must be personal (handed directly to the respondent).",
      "If a friend/relative serves: you need an affidavit of service at the next court date.",
      "If police serve: they give a Statement of Personal Service (no notarization needed).",
      "If sheriff serves: the court may receive proof directly.",
      "The order is not enforceable until served.",
    ],
    timeEstimate: "Varies — usually days to a couple weeks before the return date.",
    tips: [
      "Don't wait until the last minute to arrange service.",
      "If you can't locate the respondent, tell the court — they may allow alternative service methods.",
    ],
  },
  {
    step: 7,
    title: "Return Date — Court Appearance",
    description: "On the return date, two things can happen: If the respondent doesn't show (and was properly served), the judge may hold an inquest and issue a final order. If the respondent shows, you'll typically speak with a court attorney first.",
    details: [
      "If respondent doesn't appear: you explain what happened clearly and organized. The judge can issue a final order the same day.",
      "If respondent appears: the options are (a) consent order (often 'without admission' — still enforceable), or (b) the case goes to trial (fact-finding hearing).",
      "Be specific — don't forget injuries, weapons, and dates.",
    ],
    timeEstimate: "The return date is typically days to a few weeks after filing.",
    tips: [
      "Bring all your evidence organized and ready to present.",
      "If offered a consent order, it IS still enforceable and protective. Discuss terms carefully.",
    ],
  },
  {
    step: 8,
    title: "Trial (Fact-Finding Hearing)",
    description: "If the case isn't resolved by consent, a fact-finding hearing is scheduled. You must prove your case by 'fair preponderance of the evidence' (more likely than not). Both sides can present evidence and testimony.",
    details: [
      "Structure your presentation: (1) Jurisdiction, (2) Timeline of incidents, (3) Elements through facts, (4) Credibility anchors, (5) Relief requested.",
      "Evidence to bring: photos, medical records, police reports, threatening texts/emails, witness testimony.",
      "Live testimony from witnesses is stronger than written statements.",
      "The judge decides whether a family offense occurred and what order to issue.",
    ],
    timeEstimate: "Often multiple court dates; weeks to months depending on court congestion.",
    tips: [
      "Practice telling your story clearly: first incident, worst incident, most recent incident.",
      "If you can't afford a lawyer, ask the judge for a court-appointed attorney (18-B).",
      "Both petitioners and respondents may get court-appointed attorneys if indigent.",
    ],
  },
];

export type ReliefOption = {
  label: string;
  description: string;
};

export const AVAILABLE_RELIEF: ReliefOption[] = [
  { label: "Stay-away", description: "Respondent must stay away from you, your home, work, school, and children's school." },
  { label: "No contact / refrain from acts", description: "No calls, texts, emails, social media contact, threats, harassment, or intimidation." },
  { label: "Exclude respondent from home", description: "Even if the lease or title isn't in your name, the court can order the respondent to leave." },
  { label: "Police escort for belongings", description: "Court can order a police escort so you can safely retrieve your belongings." },
  { label: "Temporary child support", description: "Family Court can include temporary child support as part of an OP case." },
  { label: "Custody/visitation provisions", description: "Temporary custody or supervised visitation can be included in the order." },
  { label: "Firearms restrictions", description: "Court can order surrender of firearms and revocation of firearms licenses." },
];

export const QUALIFYING_OFFENSES = [
  "Harassment",
  "Aggravated harassment",
  "Assault / attempted assault",
  "Menacing",
  "Reckless endangerment",
  "Stalking",
  "Criminal mischief",
  "Strangulation / criminal obstruction of breathing",
  "Sexual offenses (sexual abuse, sexual misconduct, rape)",
  "Disorderly conduct",
  "Intimidation of a victim or witness",
  "Identity theft",
  "Grand larceny",
  "Coercion",
];

export const ORDER_DURATION_INFO = {
  standard: "Up to 2 years",
  aggravated: "Up to 5 years (if aggravating circumstances found or a violation of a valid OP)",
  aggravatingExamples: [
    "Physical injury to the petitioner",
    "Use of a weapon",
    "Repeated violations of prior orders",
    "Past criminal convictions for domestic violence offenses",
    "Conduct creating a substantial risk of physical injury",
  ],
  extension: "Extensions can be granted by motion (form GF-10) for good cause.",
};
