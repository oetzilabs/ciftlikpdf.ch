import { Schema } from "effect";

export class PDFGenerationError extends Schema.TaggedError<PDFGenerationError>()("PDFGenerationError", {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
}) {}
