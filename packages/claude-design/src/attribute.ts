// What an x-import attribute holds for one prop, read from the prop's
// TypeScript type. index.d.ts prints it for the props panel, and the bundle
// converts each attribute string by it.

/** A string, number or boolean prop, or a union of literals. */
export interface ScalarAttribute {
  kind: 'scalar';
  /** The literal members, each in its own type: `"1"` stays a string, `1` a number. */
  literals: (string | number)[];
  string: boolean;
  /** Any string is accepted, but the literals are the suggestions (`string & {}`). */
  suggested: boolean;
  number: boolean;
  boolean: boolean;
}

/** An array of strings, numbers or dates, written as a comma list. */
export interface ListAttribute {
  kind: 'list';
  item: ScalarAttribute | DateAttribute;
  /** The prop also takes one value, as Accordion's `value` does for `type="single"`. */
  single: ScalarAttribute | null;
}

/** A Date, written `YYYY-MM-DD` or `YYYY-MM`. */
export interface DateAttribute {
  kind: 'date';
  /** DatePicker's `selected`: one date, a comma list or a range, by `mode`. */
  selection: boolean;
}

/** An object or array of objects, written as JSON. */
export interface JsonAttribute {
  kind: 'json';
  shape: 'object' | 'array' | 'any';
  /** Keys every object needs, or every array item. */
  required: string[];
  /** Keys whose values are dates, at any depth. */
  dateKeys: string[];
  /** A string in an array is a date, as in DatePicker's `disabled`. */
  dateItems: boolean;
  /** A bare attribute is `true`, as DatePicker's `disabled` takes. */
  boolean: boolean;
}

/** An icon prop, which takes an icon name. */
export interface IconAttribute {
  kind: 'icon';
}

export interface ContentAttribute {
  kind: 'content';
}

/** A prop a canvas doesn't set, and why. */
export interface NoAttribute {
  kind: 'none';
  reason: string;
}

export type Attribute =
  | ScalarAttribute
  | ListAttribute
  | DateAttribute
  | JsonAttribute
  | IconAttribute
  | ContentAttribute
  | NoAttribute;
