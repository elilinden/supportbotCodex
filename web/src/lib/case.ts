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
  const fallbackTimeline = facts.timeline.length
    ? facts.timeline
    : facts.incidents
        .map((incident) => {
          const date = incident.date || "Date unknown";
          const time = incident.time ? ` at ${incident.time}` : "";
          const location = incident.location ? ` at ${incident.location}` : "";
          const what = incident.whatHappened ? ` - ${incident.whatHappened}` : "";
          return `${date}${time}${location}${what}`.trim();
        })
        .filter(Boolean);

  const timelineSource = fallbackTimeline.length ? fallbackTimeline : facts.timeline;
  const keyIncident = timelineSource[0] || "Most recent incident not specified.";

  const script2Min = `Hi, I'm here to ask about a New York Family Court Order of Protection. ${keyIncident} I am seeking an order involving ${respondent}. I want to explain the relationship, describe what happened, and share my safety concerns. I can provide evidence and details about prior incidents and any existing cases. I understand this is general information and not legal advice.`;

  const outline5Min = [
    `Introduce yourself and your relationship to ${respondent}.`,
    "Summarize the most recent incident clearly: date, time, and location.",
    "Describe the broader pattern of incidents and any threats or injuries.",
    "Explain safety concerns, children involvement, and firearm access if relevant.",
    "List the relief you are requesting and the evidence you can provide.",
    "Ask what the next steps are in New York Family Court for an Order of Protection."
  ];

  const evidenceChecklist = [
    "Screenshots of texts, emails, or social media messages",
    "Photos of injuries or property damage",
    "Medical records or police reports, if available",
    "Names and contact info for witnesses",
    "Prior orders, case numbers, or related court paperwork",
    ...facts.evidenceList
  ].filter(Boolean);

  const timelineSummary = timelineSource.length
    ? timelineSource
    : ["Add dates and key incidents to build a timeline."];

  const whatToBring = [
    "A government-issued photo ID",
    "Any evidence listed in your evidence checklist",
    "Notes about key dates, times, and locations",
    "Information about children or shared family members",
    "Any existing orders of protection or related case documents"
  ];

  const whatToExpect = [
    "Screening or intake questions about relationship and incidents",
    "Discussion of immediate safety concerns and requested relief",
    "Possible temporary order process and next hearing date",
    "Information on service and follow-up steps"
  ];

  return {
    script2Min,
    outline5Min,
    evidenceChecklist,
    timelineSummary,
    whatToBring,
    whatToExpect
  };
}

export function deriveAssumptions(facts: Facts, intake: IntakeData): string[] {
  const assumptions: string[] = [];
  if (!intake.petitionerName) assumptions.push("Petitioner name not provided.");
  if (!intake.respondentName) assumptions.push("Respondent name not provided.");
  if (!intake.mostRecentIncidentAt) assumptions.push("Most recent incident date/time unknown.");
  if (!facts.requestedRelief.length) assumptions.push("Requested relief not specified.");
  return assumptions;
}

export function deriveUncertainties(facts: Facts, intake: IntakeData): string[] {
  const uncertainties: string[] = [];
  if (!intake.patternOfIncidents) uncertainties.push("Pattern of incidents is not described yet.");
  if (!intake.existingCasesOrders) uncertainties.push("Existing cases or orders not described.");
  if (!intake.evidenceInventory) uncertainties.push("Evidence inventory not listed yet.");
  if (!facts.incidents[0]?.location) uncertainties.push("Incident location is missing.");
  return uncertainties;
}
