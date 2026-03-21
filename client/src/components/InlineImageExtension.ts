import { Mark, mergeAttributes } from "@tiptap/core";

export interface ImageAnnotationOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageAnnotation: {
      setImageAnnotation: (attributes: {
        url: string;
        title: string;
        source: string;
        query: string;
      }) => ReturnType;
      unsetImageAnnotation: () => ReturnType;
    };
  }
}

export const ImageAnnotation = Mark.create<ImageAnnotationOptions>({
  name: "imageAnnotation",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-image-url"),
        renderHTML: (attributes) => ({
          "data-image-url": attributes.url,
        }),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-image-title"),
        renderHTML: (attributes) => ({
          "data-image-title": attributes.title,
        }),
      },
      source: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-image-source"),
        renderHTML: (attributes) => ({
          "data-image-source": attributes.source,
        }),
      },
      query: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-image-query"),
        renderHTML: (attributes) => ({
          "data-image-query": attributes.query,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-image-url]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "image-annotation",
        "data-testid": "annotated-text",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setImageAnnotation:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetImageAnnotation:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
