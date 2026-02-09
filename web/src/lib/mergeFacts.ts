import type { Facts } from "@/lib/types";

export function mergeFacts(current: Facts, incoming?: Partial<Facts>): Facts {
  if (!incoming) return current;
  return {
    ...current,
    ...incoming,
    parties: {
      ...current.parties,
      ...(incoming.parties || {})
    },
    incidents: incoming.incidents?.length ? incoming.incidents : current.incidents,
    safetyConcerns: incoming.safetyConcerns?.length ? incoming.safetyConcerns : current.safetyConcerns,
    requestedRelief: incoming.requestedRelief?.length ? incoming.requestedRelief : current.requestedRelief,
    evidenceList: incoming.evidenceList?.length ? incoming.evidenceList : current.evidenceList,
    timeline: incoming.timeline?.length ? incoming.timeline : current.timeline
  };
}
