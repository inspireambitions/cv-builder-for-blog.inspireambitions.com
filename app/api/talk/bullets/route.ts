import { NextRequest } from "next/server";
import { handleTalkRequest } from "@/lib/talk-server";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) { return handleTalkRequest(request, "bullets"); }
