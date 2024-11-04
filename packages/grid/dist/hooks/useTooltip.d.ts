import React from "react";
import { CellInterface, GridRef } from "../Grid";
export interface TooltipOptions {
    /**
     * Tooltip component
     */
    getTooltip?: (cell: CellInterface | null) => React.ElementType | null;
    /**
     * Grid references
     */
    gridRef: React.MutableRefObject<GridRef | null>;
}
export interface TooltipResults {
    /**
     * Tooltip component to inject into the page
     */
    tooltipComponent: React.ReactElement | null;
    /**
     * Mousemove listener to align tooltip
     */
    onMouseMove: ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
    /**
     * Mouse leave listener to hide tooltip
     */
    onMouseLeave: ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
}
export interface DefaultTooltipProps {
    /**
     * Tooltip x position
     */
    x?: number;
    /**
     * Tooltip y position
     */
    y?: number;
    width?: number;
    height?: number;
    scrollLeft?: number;
    scrollTop?: number;
}
declare const useTooltip: ({ gridRef, getTooltip, }: TooltipOptions) => TooltipResults;
export default useTooltip;
