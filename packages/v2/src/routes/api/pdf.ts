import { createWebHandler } from "@/libs/utils";
import { Effect } from "effect";
import { StatusCodes } from "http-status-codes";
import { PDFService, PDFLive } from "@ciftlikpdf/core/src/entities/pdf";

export const GET = createWebHandler(
  "@hex-a/api/stream/publish",
  Effect.fn(
    function* (ctx) {
      const body = yield* Effect.promise(() => ctx.request.json());
      if (!body) {
        return Response.json({ error: "No body provided" }, { status: StatusCodes.BAD_REQUEST });
      }
      const service = yield* PDFService;
      const pdf = yield* service.letter(body, body.config);
      return new Response(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        status: StatusCodes.OK,
      });
    },
    (effect) => effect.pipe(Effect.provide([PDFLive]), Effect.scoped)
  )
);
