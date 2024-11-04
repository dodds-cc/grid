import { ShapeConfig } from "konva/lib/Shape";
import { SelectionProps } from "./Grid";
/**
 * Create a box with custom top/right/bottom/left colors and widths
 * @param param0
 */
export declare const createCanvasBox: ({ x, y, width, height, fill, stroke, strokeLeftColor, strokeTopColor, strokeRightColor, strokeBottomColor, strokeWidth, strokeTopWidth, strokeRightWidth, strokeBottomWidth, strokeLeftWidth, dash, dashEnabled, lineCap, key, }: ShapeConfig) => JSX.Element;
export declare const createHTMLBox: ({ x, y, width, height, fill, stroke, strokeLeftColor, strokeTopColor, strokeRightColor, strokeBottomColor, strokeWidth, strokeTopWidth, strokeRightWidth, strokeBottomWidth, strokeLeftWidth, key, strokeStyle, fillOpacity, draggable, isDragging, borderCoverWidth, type, bounds, activeCell, ...props }: SelectionProps) => JSX.Element;
