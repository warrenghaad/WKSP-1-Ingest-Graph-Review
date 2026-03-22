import { Mark, mergeAttributes } from "@tiptap/core";

export interface EntityMarkOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    entityMark: {
      setEntityMark: (attributes: {
        entityId: number;
        label: string;
        entityType: string;
      }) => ReturnType;
      unsetEntityMark: () => ReturnType;
    };
  }
}

export const EntityMark = Mark.create<EntityMarkOptions>({
  name: "entityMark",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      entityId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-entity-id"),
        renderHTML: (attributes) => ({
          "data-entity-id": attributes.entityId,
        }),
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-entity-label"),
        renderHTML: (attributes) => ({
          "data-entity-label": attributes.label,
        }),
      },
      entityType: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-entity-type"),
        renderHTML: (attributes) => ({
          "data-entity-type": attributes.entityType,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-entity-id]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const entityType = HTMLAttributes["data-entity-type"] || "concept";
    const typeColors: Record<string, string> = {
      artifact: "entity-mark entity-artifact",
      place: "entity-mark entity-place",
      person: "entity-mark entity-person",
      deity: "entity-mark entity-deity",
      concept: "entity-mark entity-concept",
      material: "entity-mark entity-material",
      technique: "entity-mark entity-technique",
      period: "entity-mark entity-period",
      culture: "entity-mark entity-culture",
    };

    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: typeColors[entityType] || "entity-mark entity-concept",
        "data-testid": `entity-mark-${HTMLAttributes["data-entity-id"]}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setEntityMark:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetEntityMark:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
