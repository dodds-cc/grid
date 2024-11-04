import React from "react";
import { RendererProps } from "./Grid";
import { KonvaEventObject } from "konva/lib/Node";
export interface CellProps extends RendererProps {
    value?: string;
    textColor?: string;
    padding?: number;
    fontWeight?: string;
    fontStyle?: string;
    onClick?: (e: KonvaEventObject<MouseEvent>) => void;
}
/**
 * Default cell component
 * @param props
 */
declare const Cell: React.FC<CellProps>;
/**
 * Default CellRenderer
 * @param props
 */
declare const CellRenderer: (props: RendererProps) => JSX.Element;
export default CellRenderer;
export { CellRenderer, Cell };
