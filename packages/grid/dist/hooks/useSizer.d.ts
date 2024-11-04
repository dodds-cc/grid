import React from "react";
import { ViewPortProps, GridRef, CellInterface, ItemSizer } from "./../Grid";
import { HiddenType } from "./../helpers";
export interface IProps {
    /**
     * Used to access grid functions
     */
    gridRef: React.MutableRefObject<GridRef | null>;
    /**
     * Value getter for a cell
     */
    getValue: (cell: CellInterface) => any;
    /**
     * Visible rows when the grid is first visible, Since we do not know how many rows  can fit
     */
    initialVisibleRows?: number;
    /**
     * Restrict column width by this number
     */
    minColumnWidth?: number;
    /**
     * Cell padding, used for width calculation
     */
    cellSpacing?: number;
    /**
     * Scroll timeout
     */
    timeout?: number;
    /**
     * Calculate width and resize the grid on scroll
     */
    resizeOnScroll?: boolean;
    /**
     * Font used to calculate width
     */
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    /**
     * Strategy used to calculate column width
     * lazy = visible rows
     * full = all rows
     *
     * columns are always lazy
     */
    resizeStrategy?: ResizeStrategy;
    /**
     * No of rows in teh grid
     */
    rowCount?: number;
    /**
     * Enable autoresize
     */
    autoResize?: boolean;
    /**
     * Map of index to size
     */
    columnSizes?: SizeType;
    /**
     * Hidden rows
     */
    isHiddenRow: HiddenType;
    /**
     * Hidden columns
     */
    isHiddenColumn: HiddenType;
    /**
     * Number of frozen rows
     */
    frozenRows?: number;
    /**
     * Current scaling factor
     */
    scale?: number;
    /**
     * Get text value
     */
    getText: (config: any) => string | undefined;
}
export type ResizeStrategy = "lazy" | "full";
export interface AutoResizerResults {
    /**
     * Column width function consumed by the grid
     */
    columnWidth?: ItemSizer;
    /**
     * Callback when viewport is changed
     */
    onViewChange: (cells: ViewPortProps) => void;
    /**
     * Get column width based on resize strategy
     */
    getColumnWidth: (columnIndex: number, scale?: number) => number;
    /**
     * Text size getter
     */
    getTextMetrics: (text: string | number) => TextDimensions;
}
export interface TextDimensions {
    width: number;
    height: number;
}
export type SizeType = {
    [key: number]: number;
};
/**
 * Auto sizer hook
 * @param param
 *
 * TODO
 * Dynamically resize columns after user has scrolled down/view port changed ?
 */
declare const useAutoSizer: ({ gridRef, getValue, initialVisibleRows, cellSpacing, minColumnWidth, timeout, resizeStrategy, rowCount, resizeOnScroll, fontFamily, fontSize, fontWeight, fontStyle, autoResize, columnSizes, frozenRows, scale, isHiddenRow, isHiddenColumn, getText, }: IProps) => AutoResizerResults;
export default useAutoSizer;
