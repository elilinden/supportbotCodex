import { NextResponse } from "next/server";

type SessionRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  payload: unknown;
};

const globalForSessions = globalThis as typeof globalThis & {
  __nyOpSessions?: Map<string, SessionRecord>;
};

const sessions = globalForSessions.__nyOpSessions || new Map<string, SessionRecord>();

globalForSessions.__nyOpSessions = sessions;

export async function POST(request: Request) {
  const body = await request.json();
  const id = body?.id || (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `session_${Math.random().toString(36).slice(2, 9)}`);
  const timestamp = new Date().toISOString();
  const record: SessionRecord = {
    id,
    createdAt: body?.createdAt || timestamp,
    updatedAt: timestamp,
    payload: body?.payload || body
  };
  sessions.set(id, record);
  return NextResponse.json({ id, createdAt: record.createdAt, updatedAt: record.updatedAt });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const record = sessions.get(id);
  if (!record) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}
