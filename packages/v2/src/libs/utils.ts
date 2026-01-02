import { APIEvent } from "@solidjs/start/server";
import { Cause, Config, Effect, Exit, Schema, Stream } from "effect";
import { getEvent, getRequestFingerprint } from "vinxi/http";

class NoVinxiEvent extends Schema.TaggedError<NoVinxiEvent>()("NoVinxiEvent", {
  message: Schema.optional(Schema.String),
}) {}

const fingerprint = Effect.fn("fingerprint")(function* () {
  const e = getEvent();
  if (!e) {
    return yield* Effect.fail(new NoVinxiEvent());
  }
  const fp = yield* Effect.promise(() => getRequestFingerprint(e));
  if (!fp) {
    return "unknown-device";
  }
  return fp;
});

export const createWebHandler =
  <A = unknown, E = never>(program: (ctx: APIEvent) => Effect.Effect<A, E, never>) =>
  async (context: APIEvent) => {
    const result = Exit.match(await Effect.runPromiseExit(program(context)), {
      onSuccess: (data) => data,
      onFailure: (cause) => {
        return {
          error: Cause.pretty(cause),
        };
      },
    });
    return result;
  };

// export const createWebStreamHandler =
//   <Name extends string, A, E>(name: Name, program: (ctx: APIEvent) => Effect.Effect<A, E, never>) =>
//   <StreamA extends A = A, StreamE extends E = E>(context: APIEvent) => {
//     const programEffect = innerProgram(name, program(context));
//     // Handle both Streams, arrays (stream individual elements), and single values
//     const stream = programEffect.pipe(
//       Effect.map((result): Stream.Stream<StreamA, StreamE, never> => {
//         // Check if result is a Stream by checking the StreamTypeId
//         if (result && typeof result === "object" && Stream.StreamTypeId in result) {
//           return result as unknown as Stream.Stream<StreamA, StreamE, never>;
//         }
//         // If result is an array, stream each element
//         if (Array.isArray(result)) {
//           return Stream.fromIterable(result);
//         }
//         // Otherwise stream as a single value
//         return Stream.succeed(result as StreamA);
//       }),
//       Stream.unwrap,
//       // Convert data to SSE format and encode as Uint8Array
//       Stream.map((data) => {
//         const serializedData = typeof data === "string" ? data : JSON.stringify(data);
//         const sseData = `data: ${serializedData}\n\n`;
//         return new TextEncoder().encode(sseData);
//       })
//     );
//     return new Response(Stream.toReadableStream(stream), {
//       headers: {
//         "Content-Type": "text/event-stream",
//         "Cache-Control": "no-cache",
//         Connection: "keep-alive",
//       },
//     });
//   };
