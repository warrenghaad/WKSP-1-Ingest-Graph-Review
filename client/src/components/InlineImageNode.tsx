import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { useState } from "react";
import { X } from "lucide-react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    inlineImage: {
      insertInlineImage: (attributes: {
        src: string;
        title: string;
        source: string;
        query: string;
      }) => ReturnType;
    };
  }
}

interface InlineImageAttrs {
  src: string | null;
  title: string;
  source: string;
  query: string;
}

const InlineImageComponent = (props: NodeViewProps) => {
  const { node, deleteNode } = props;
  const attrs = node.attrs as InlineImageAttrs;
  const { src, title, source } = attrs;
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) return null;

  return (
    <NodeViewWrapper as="span" className="inline-image-node-wrapper" data-testid="inline-image-node">
      <span
        className="inline-image-anchor"
        contentEditable={false}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <span className="inline-image-thumb">
          <img
            src={src}
            alt={title || ""}
            className="inline-image-img"
            onError={() => setImgError(true)}
            draggable={false}
            data-testid="inline-image-preview"
          />
        </span>
        <button
          className="inline-image-remove"
          onClick={(e) => { e.stopPropagation(); deleteNode(); }}
          data-testid="inline-image-remove"
          title="Remove image"
        >
          <X size={10} />
        </button>
        {expanded && (
          <span className="inline-image-popover" data-testid="inline-image-expanded">
            <img
              src={src}
              alt={title || ""}
              className="inline-image-popover-img"
              draggable={false}
            />
            <span className="inline-image-popover-meta">
              <span className="inline-image-popover-title">{title}</span>
              <span className="inline-image-popover-source">{source}</span>
            </span>
          </span>
        )}
      </span>
    </NodeViewWrapper>
  );
};

export const InlineImageNode = Node.create({
  name: "inlineImage",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: "" },
      source: { default: "" },
      query: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-inline-image]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-inline-image": "true" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineImageComponent);
  },

  addCommands() {
    return {
      insertInlineImage:
        (attributes) =>
        ({ chain }) => {
          return chain().insertContent({
            type: this.name,
            attrs: attributes,
          }).run();
        },
    };
  },
});
