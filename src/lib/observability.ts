import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const nowMs = () => Number(process.hrtime.bigint()) / 1_000_000;

type Handler = () => Promise<NextResponse> | NextResponse;

export async function withAPM(request: Request, handler: Handler): Promise<NextResponse> {
  const traceId = request.headers.get("x-trace-id") ?? randomUUID();
  const path = (() => {
    try {
      return new URL(request.url).pathname;
    } catch {
      return "unknown";
    }
  })();
  const start = nowMs();
  let response: NextResponse;
  try {
    response = await handler();
  } catch (err) {
    const duration = nowMs() - start;
    console.error("api_error", { path, traceId, durationMs: Number(duration.toFixed(1)), message: err });
    throw err;
  }

  const duration = nowMs() - start;
  const headers = response.headers;

  headers.set("x-trace-id", traceId);
  const existingTiming = headers.get("Server-Timing");
  const totalTiming = `total;dur=${duration.toFixed(1)};desc=${traceId}`;
  headers.set("Server-Timing", existingTiming ? `${existingTiming}, ${totalTiming}` : totalTiming);

  console.info("api_request", {
    path,
    method: request.method,
    status: response.status,
    traceId,
    durationMs: Number(duration.toFixed(1)),
  });

  return response;
}
