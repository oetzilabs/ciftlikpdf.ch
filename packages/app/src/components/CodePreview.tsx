import HighlightJS from "highlight.js";
import { Component, createMemo, mergeProps } from "solid-js";
import "highlight.js/styles/dark.min.css";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

type Props = {
  class?: string;
  language?: string;
  autoDetect?: boolean;
  ignoreIllegals?: boolean;
  children: any;
};

const Highlight: Component<Props> = (_props) => {
  const props = mergeProps({ autoDetect: true, ignoreIllegals: true, language: "" }, _props);

  const cannotDetectLanguage = !props.autoDetect && !props.language && !HighlightJS.getLanguage(props.children);
  const className = cannotDetectLanguage ? "" : `hljs ${props.language}`;

  const getHighlightedCode = createMemo(() => {
    if (cannotDetectLanguage) {
      console.warn(`The language "${props.language}" you specified could not be found.`);
      return escapeHtml(props.children);
    }

    if (props.autoDetect) {
      const result = HighlightJS.highlightAuto(props.children);
      return result.value;
    } else {
      const result = HighlightJS.highlight(props.children, {
        language: props.language,
        ignoreIllegals: props.ignoreIllegals,
      });
      return result.value;
    }
  });

  return <code class={`${className} ${props.class || ""}`} innerHTML={getHighlightedCode()} />;
};

export default Highlight;
