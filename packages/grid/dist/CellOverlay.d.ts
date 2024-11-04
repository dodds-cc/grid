import React from "react";
import { CellProps } from "./Cell";
import { RendererProps } from "./Grid";
export interface StrokeCellProps extends Omit<CellProps, "key" | "rowIndex" | "columnIndex"> {
}
/**
 * Offset helps multiple borders to align properly
 * @param width
 */
export declare const getOffsetFromWidth: (width: number) => number;
/**
 * Only used for strokes
 */
declare const CellOverlay: React.FC<StrokeCellProps>;
/**
 * Default CellRenderer
 * @param props
 */
declare const CellRenderer: (props: RendererProps) => JSX.Element | null;
export default CellRenderer;
export { CellRenderer, CellOverlay };
