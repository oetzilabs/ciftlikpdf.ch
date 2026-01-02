import { createWebHandler } from "@/libs/utils";
import { Effect } from "effect";
import { StatusCodes } from "http-status-codes";
import { PDFService, PDFLive } from "@ciftlikpdf/core/src/entities/pdf";

export const POST = createWebHandler(
  Effect.fn(
    function* (ctx) {
      const body = yield* Effect.promise(() => ctx.request.json());

      if (!body) {
        return Response.json({ error: "No body provided" }, { status: StatusCodes.BAD_REQUEST });
      }

      // Extract config from body or use default
      const config = body.config || {
        page: {
          size: "A4",
          orientation: "portrait",
        },
      };

      const service = yield* PDFService;
      const pdf = yield* service.letter(body, config);

      yield* Effect.log("PDF generated successfully, buffer size:", pdf.length);
      yield* Effect.log("PDF buffer type:", typeof pdf);
      yield* Effect.log("PDF is Buffer:", Buffer.isBuffer(pdf));

      return new Response(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Content-Length": pdf.length.toString(),
        },
        status: StatusCodes.OK,
      });
    },
    (effect) => effect.pipe(Effect.provide([PDFLive]), Effect.scoped)
  )
);
