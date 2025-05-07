import type { ElementType } from "react";

export type SourceType = "camera" | "screen" | "window";

export interface Source {
  type: SourceType;
  label: string;
  icon: ElementType;
  placeholder: string;
}
