import { formatDateTime, splitList } from "@/lib/utils";
import type { CaseOutputs, Facts, IntakeData } from "@/lib/types";

export function buildFactsFromIntake(intake: IntakeData): Facts {
  const { date, time } = formatDateTime(intake.mostRecentIncidentAt);
  const petitioner = intake.petitionerName || "Petitioner";
  const respondent = intake.respondentName || "Respondent";
  const relationshipDetails = [intake.relationshipCategory, intake.cohabitation]
    .filter(Boolean)
    .join(" / ");

  const incidents = [
    {
      date,
      time,
      location: "",
      whatHappened: intake.patternOfIncidents || "",
      injuries: "",
      threats: "",
      witnesses: intake.childrenInvolved ? `Children status: ${intake.childrenInvolved}` : "",
      evidence: intake.evidenceInventory
    }
  ];

  const safetyConcerns = [
    intake.safetyStatus ? `Safety status: ${intake.safetyStatus}` : "",
    intake.firearmsAccess ? `Firearms access: ${intake.firearmsAccess}` : ""
  ].filter(Boolean);

  const requestedRelief = splitList(intake.requestedRelief);
  const evidenceList = splitList(intake.evidenceInventory);

  const timeline = [
    date ? `Most recent incident on ${date}${time ? ` at ${time}` : ""}.` : "",
    intake.patternOfIncidents ? `Pattern: ${intake.patternOfIncidents}` : "",
    intake.existingCasesOrders ? `Existing cases/orders: ${intake.existingCasesOrders}` : ""
  ].filter(Boolean);

  return {
    parties: {
      petitioner,
      respondent
    },
    relationship: relationshipDetails || "Relationship details not provided.",
    incidents,
    safetyConcerns,
    requestedRelief,
    evidenceList,
    timeline
  };
}

export function buildOutputsFromFacts(facts: Facts): CaseOutputs {
  const petitioner = facts.parties.petitioner || "Petitioner";
  const respondent = facts.parties.respondent || "Respondent";

  // Build timeline from incidents if no explicit timeline exists
  const incidentTimeline = facts.incidents
    .map((incident) => {
      const date = incident.date || "Date unknown";
      const time = incident.time ? ` at ${incident.time}` : "";
      const location = incident.location ? ` at ${incident.location}` : "";
      const what = incident.whatHappened ? ` - ${incident.whatHappened}` : "";
      return `${date}${time}${location}${what}`.trim();
    })
    .filter(Boolean);

  const timelineSource = facts.timeline.length ? facts.timeline : incidentTimeline;

  // Build a severity-aware 2-minute script
  const hasSafetyConcerns = facts.safetyConcerns.length > 0;
  const hasMultipleIncidents = facts.incidents.length > 1;
  const mostRecentIncident = facts.incidents[0];
  const incidentSummary = mostRecentIncident?.whatHappened
    ? `On ${mostRecentIncident.date || "a recent date"}, ${mostRecentIncident.whatHappened}`
    : timelineSource[0] || "I need to describe what happened.";

  const severityContext = hasSafetyConcerns
    ? ` My safety concerns include: ${facts.safetyConcerns.join("; ")}.`
    : "";
  const patternContext = hasMultipleIncidents
    ? ` There have been ${facts.incidents.length} incidents that I can describe.`
    : "";
  const injuryMention = mostRecentIncident?.injuries
    ? ` Reported injuries: ${mostRecentIncident.injuries}.`
    : "";
  const threatMention = mostRecentIncident?.threats
    ? ` Threats made: ${mostRecentIncident.threats}.`
    : "";

  const script2Min = [
    `Your Honor, my name is ${petitioner}. I am here to request an Order of Protection against ${respondent}.`,
    facts.relationship ? `${respondent} is my ${facts.relationship.toLowerCase()}.` : "",
    incidentSummary + ".",
    injuryMention,
    threatMention,
    severityContext,
    patternContext,
    facts.requestedRelief.length
      ? `I am requesting: ${facts.requestedRelief.join("; ")}.`
      : "I am requesting the court's protection.",
    facts.evidenceList.length
      ? `I have evidence including: ${facts.evidenceList.slice(0, 3).join(", ")}.`
      : "",
    "This information is for preparation purposes only and is not legal advice.",
  ].filter(Boolean).join(" ");

  // Context-specific 5-minute outline
  const outline5Min = [
    `State your name and your relationship to ${respondent} (${facts.relationship || "describe the relationship"}).`,
    mostRecentIncident?.date
      ? `Describe the most recent incident on ${mostRecentIncident.date}: what happened, where, and who was present.`
      : "Describe the most recent incident: date, time, location, and exactly what happened.",
    mostRecentIncident?.injuries
      ? `Detail the injuries: ${mostRecentIncident.injuries}. Mention any medical treatment received.`
      : "Describe any injuries sustained and whether you sought medical treatment.",
    mostRecentIncident?.threats
      ? `Recount threats made: \"${mostRecentIncident.threats}\". Use the other person's exact words if possible.`
      : "Describe any threats made, using the other person's exact words if you can remember them.",
    hasMultipleIncidents
      ? `Describe the pattern: ${facts.incidents.length} incidents showing escalation over time.`
      : "Explain whether this is part of a broader pattern of behavior and if the situation has escalated.",
    hasSafetyConcerns
      ? `Address safety concerns: ${facts.safetyConcerns.join("; ")}.`
      : "Explain your current safety concerns and why you need the court's protection.",
    facts.incidents.some((i) => i.witnesses)
      ? `Mention witnesses: ${facts.incidents.map((i) => i.witnesses).filter(Boolean).join("; ")}.`
      : "Note any witnesses who can corroborate your account.",
    "State the specific protections you are requesting and why each is necessary.",
    "Mention the evidence you have brought and offer to present it to the court.",
  ];

  // Evidence checklist — specific to what's been mentioned plus standard items
  const caseSpecificEvidence = facts.evidenceList.map((e) => `${e} (mentioned in your account)`);
  const standardEvidence = [
    "Screenshots of threatening texts, emails, or social media messages",
    "Photos of injuries (with dates visible if possible)",
    "Photos of property damage",
    "Medical records documenting injuries",
    "Police reports or incident numbers",
    "Names and contact information for witnesses",
    "Prior orders of protection or related court documents",
    "Documentation of stalking behavior (logs with dates/times/locations)",
    "Financial records if economic abuse is involved",
  ];
  const evidenceChecklist = [
    ...caseSpecificEvidence,
    ...standardEvidence.filter((item) =>
      !caseSpecificEvidence.some((e) => e.toLowerCase().includes(item.toLowerCase().slice(0, 20)))
    ),
  ];

  const timelineSummary = timelineSource.length
    ? timelineSource
    : ["Add dates and key incidents to build a timeline."];

  const whatToBring = [
    "A government-issued photo ID",
    "All evidence from your evidence checklist (originals and copies)",
    "Written notes with key dates, times, and locations for each incident",
    "Names, addresses, and phone numbers of witnesses",
    "Information about children (names, ages, schools, custody arrangements)",
    "Any existing orders of protection, custody orders, or related court documents",
    "Case numbers for any related family, criminal, or supreme court matters",
    "Contact info for your local domestic violence advocate or hotline (if applicable)",
  ];

  const whatToExpect = [
    "You may go through a screening or intake process where court staff ask about the relationship and incidents.",
    "If there is immediate danger, the judge can issue a temporary (ex parte) order of protection the same day.",
    "You will need to describe the incidents clearly and factually — the judge will ask questions.",
    "The respondent will be served with the petition and order to appear at a hearing.",
    "At the hearing, both sides can present evidence and testimony. You may bring witnesses.",
    "The judge will decide whether to issue a final order of protection, which can last up to 2-5 years.",
    "Bring everything on your 'What to Bring' list — being prepared strengthens your case.",
  ];

  return {
    script2Min,
    outline5Min,
    evidenceChecklist,
    timelineSummary,
    whatToBring,
    whatToExpect,
  };
}

export function deriveAssumptions(facts: Facts, intake: IntakeData): string[] {
  const assumptions: string[] = [];
  if (!intake.petitionerName) assumptions.push("Petitioner name not provided — court will need this for the petition.");
  if (!intake.respondentName) assumptions.push("Respondent name not provided — required for service of process.");
  if (!intake.mostRecentIncidentAt) assumptions.push("Most recent incident date/time unknown — approximate dates can be used.");
  if (!facts.requestedRelief.length) assumptions.push("Specific relief not yet requested — common protections include stay-away, no contact, and temporary custody.");
  if (!intake.firearmsAccess) assumptions.push("Firearms access status unknown — the court is required to inquire about this.");
  if (!intake.childrenInvolved) assumptions.push("Children's involvement status not specified.");
  if (facts.incidents.length <= 1 && !intake.patternOfIncidents) {
    assumptions.push("Only one incident described — courts look favorably on evidence of a pattern. Consider adding earlier incidents if they exist.");
  }
  return assumptions;
}

export function deriveUncertainties(facts: Facts, intake: IntakeData): string[] {
  const uncertainties: string[] = [];
  if (!intake.patternOfIncidents) uncertainties.push("Pattern of incidents not yet described — is the behavior escalating?");
  if (!intake.existingCasesOrders) uncertainties.push("Unknown whether prior cases or orders exist between the parties.");
  if (!intake.evidenceInventory) uncertainties.push("Evidence inventory not listed yet — documentation strengthens the petition.");
  if (!facts.incidents[0]?.location) uncertainties.push("Incident location(s) missing — needed for the petition.");
  if (facts.incidents.some((i) => !i.threats && !i.injuries)) {
    uncertainties.push("Some incidents are missing details about threats or injuries — these details matter for the court.");
  }
  if (!facts.incidents.some((i) => i.witnesses)) {
    uncertainties.push("No witnesses identified — consider whether anyone saw or heard what happened.");
  }
  return uncertainties;
}
