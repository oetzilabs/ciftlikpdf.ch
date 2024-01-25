import "solid-js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function ClientFormattedDate(props: { date: Date; relative?: boolean }) {
  const r = props.relative ? dayjs(props.date).fromNow() : dayjs(props.date).format("MMM D, YYYY h:mm A");
  return (
    <time
      datetime={props.date.toISOString()}
      class="text-neutral-500 border border-neutral-300 dark:border-neutral-800 px-1.5 p-0.5 rounded text-xs"
    >
      {r}
    </time>
  );
}
