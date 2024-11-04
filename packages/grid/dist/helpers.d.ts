import { ItemSizer, InstanceInterface, AreaProps, CellInterface, CellMetaData, SelectionArea } from "./Grid";
import { Direction } from "./types";
export declare enum Align {
    start = "start",
    end = "end",
    center = "center",
    auto = "auto",
    smart = "smart"
}
export declare enum ItemType {
    row = "row",
    column = "column"
}
export interface IItemMetaData {
    itemType: ItemType;
    offset: number;
    index: number;
    rowCount: number;
    columnCount: number;
    rowHeight: ItemSizer;
    columnWidth: ItemSizer;
    instanceProps: InstanceInterface;
    scale: number;
}
export declare const getRowStartIndexForOffset: ({ rowHeight, columnWidth, rowCount, columnCount, instanceProps, offset, scale, }: Omit<IItemMetaData, "index" | "itemType">) => number;
interface IRowStopIndex extends Omit<IItemMetaData, "itemType" | "index" | "offset" | "columnCount"> {
    startIndex: number;
    containerHeight: number;
    scrollTop: number;
}
export declare const getRowStopIndexForStartIndex: ({ startIndex, rowCount, rowHeight, columnWidth, scrollTop, containerHeight, instanceProps, scale, }: IRowStopIndex) => number;
export declare const getColumnStartIndexForOffset: ({ rowHeight, columnWidth, rowCount, columnCount, instanceProps, offset, scale, }: Omit<IItemMetaData, "index" | "itemType">) => number;
interface IColumnStopIndex extends Omit<IItemMetaData, "itemType" | "index" | "offset" | "rowCount"> {
    startIndex: number;
    containerWidth: number;
    scrollLeft: number;
}
export declare const getColumnStopIndexForStartIndex: ({ startIndex, rowHeight, columnWidth, instanceProps, containerWidth, scrollLeft, columnCount, scale, }: IColumnStopIndex) => number;
export declare const getBoundedCells: (area: AreaProps | null | undefined) => Set<unknown>;
export declare const itemKey: ({ rowIndex, columnIndex }: CellInterface) => string;
export declare const getRowOffset: ({ index, rowHeight, columnWidth, instanceProps, scale, }: Omit<IGetItemMetadata, "itemType">) => number;
export declare const getColumnOffset: ({ index, rowHeight, columnWidth, instanceProps, scale, }: Omit<IGetItemMetadata, "itemType">) => number;
export declare const getRowHeight: (index: number, instanceProps: InstanceInterface) => number;
export declare const getColumnWidth: (index: number, instanceProps: InstanceInterface) => number;
interface IGetItemMetadata extends Pick<IItemMetaData, "itemType" | "index" | "rowHeight" | "columnWidth" | "instanceProps" | "scale"> {
}
export declare const getItemMetadata: ({ itemType, index, rowHeight, columnWidth, instanceProps, scale, }: IGetItemMetadata) => CellMetaData;
export declare const getEstimatedTotalHeight: (rowCount: number, instanceProps: InstanceInterface) => number;
export declare const getEstimatedTotalWidth: (columnCount: number, instanceProps: InstanceInterface) => number;
export declare const cellIdentifier: (rowIndex: number, columnIndex: number) => string;
/**
 * @desc Throttle fn
 * @param func function
 * @param limit Delay in milliseconds
 */
export declare function throttle<T extends Function>(func: T, limit: number): T;
export declare function debounce<T extends Function>(cb: T, wait?: number): T;
export declare function rafThrottle(callback: Function): (e: any) => void;
export interface AlignmentProps extends Omit<IItemMetaData, "offset"> {
    containerHeight: number;
    containerWidth: number;
    align?: Align;
    scrollOffset: number;
    scrollbarSize: number;
    frozenOffset: number;
    estimatedTotalHeight: number;
    estimatedTotalWidth: number;
}
export declare const getOffsetForIndexAndAlignment: ({ itemType, containerHeight, containerWidth, rowHeight, columnWidth, columnCount, rowCount, index, align, scrollOffset, instanceProps, scrollbarSize, frozenOffset, scale, estimatedTotalHeight, estimatedTotalWidth, }: AlignmentProps) => number;
export declare const getOffsetForColumnAndAlignment: (props: Omit<AlignmentProps, "itemType">) => number;
export declare const getOffsetForRowAndAlignment: (props: Omit<AlignmentProps, "itemType">) => number;
export type TimeoutID = {
    id: number;
};
export declare function cancelTimeout(timeoutID: TimeoutID): void;
/**
 * Create a throttler based on RAF
 * @param callback
 * @param delay
 */
export declare function requestTimeout(callback: Function, delay: number): TimeoutID;
export declare const selectionFromActiveCell: (activeCell: CellInterface | null) => SelectionArea[];
/**
 * Check if a selection are spans multiple cells
 * @param sel
 */
export declare const selectionSpansCells: (sel: AreaProps | undefined) => boolean;
/**
 * When user tries to drag a selection
 * @param initialSelection
 * @param from
 * @param to
 */
export declare const newSelectionFromDrag: (initialSelection: SelectionArea, from: CellInterface, to: CellInterface, topBound: number | undefined, leftBound: number | undefined, rowCount: number, columnCount: number) => {
    bounds: {
        top: number;
        left: number;
        bottom: number;
        right: number;
    };
};
/**
 * Clamp cell coordinates to be inside activeCell and selection
 * @param coords
 * @param activeCell
 * @param selection
 */
export declare const clampCellCoords: (coords: CellInterface, activeCell: CellInterface | undefined, selection: SelectionArea | undefined) => CellInterface;
/**
 * Converts a number to alphabet
 * @param i
 */
export declare const numberToAlphabet: (i: number) => string;
/**
 * Convert selections to html and csv data
 * @param rows
 */
export declare const prepareClipboardData: (rows: (string | undefined)[][]) => [string, string];
/**
 * Cycles active cell within selecton bounds
 * @param activeCellBounds
 * @param selectionBounds
 * @param direction
 */
export declare const findNextCellWithinBounds: (activeCellBounds: AreaProps, selectionBounds: AreaProps, direction?: Direction) => CellInterface | null;
/**
 * Check if 2 areas overlap
 * @param area1
 * @param area2
 */
export declare const areaIntersects: (area1: AreaProps, area2: AreaProps) => boolean;
/**
 * Check if area is inside another area
 * @param needle
 * @param haystack
 */
export declare const areaInsideArea: (needle: AreaProps, haystack: AreaProps) => boolean;
/**
 * Check if two areas are equal
 * @param area1
 * @param area2
 */
export declare const isAreasEqual: (area1: AreaProps | undefined, area2: AreaProps | undefined) => boolean;
/**
 * Get maximum bound of an area, caters to merged cells
 * @param area
 * @param boundGetter
 */
export declare const extendAreaToMergedCells: (_area: AreaProps, mergedCells: AreaProps[]) => AreaProps;
/**
 * Convert 2 cells to bounds
 * @param start
 * @param end
 * @returns
 *
 * 2 loops O(n)
 */
export declare const cellRangeToBounds: (start: CellInterface, end: CellInterface, spanMerges: boolean | undefined, getCellBounds: (cell: CellInterface) => AreaProps) => {
    top: number;
    left: number;
    right: number;
    bottom: number;
};
/**
 * Check if its being rendered in Browser or SSR
 */
export declare const canUseDOM: boolean;
/**
 * Simple Canvas element to measure text size
 *
 * Usage
 *
 * ```
 * const textSizer = new AutoSizer()
 * textSizer.measureText('Hello world').width
 * ```
 */
interface AutoSizerProps {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    lineHeight?: number;
    scale?: number;
}
type IOptions = {
    [key: string]: any;
};
export declare const AutoSizerCanvas: (defaults?: AutoSizerProps) => {
    context: CanvasRenderingContext2D | null;
    measureText: (text: string | number) => {
        width: number;
        height: number;
    };
    setFont: (options?: IOptions) => void;
    reset: () => void;
};
export declare const autoSizerCanvas: {
    context: CanvasRenderingContext2D | null;
    measureText: (text: string | number) => {
        width: number;
        height: number;
    };
    setFont: (options?: IOptions) => void;
    reset: () => void;
};
export declare const isNull: (value: any) => boolean;
export declare const isEqualCells: (a: CellInterface | null, b: CellInterface | null) => boolean;
/**
 * Simple utility function to check if cell is within bounds
 * @param cell
 * @param bounds
 */
export declare const isCellWithinBounds: (cell: CellInterface, bounds: AreaProps) => boolean;
/**
 * Find next row Index
 * @param rowIndex
 * @param direction
 */
export type HiddenType = (i: number) => boolean;
export declare const clampIndex: (index: number, isHidden: HiddenType | undefined, direction: Direction) => number;
type ValueGetter = (cell: CellInterface) => string | number | undefined;
/**
 * Find a cell with content if the current cell is out of the current dataregion
 * [
 *  1, 2, 3,
 *  x, x, x
 *  7, 8, 9
 * ]
 * activeCel = 2
 * direction = Down
 * New Cell = 8
 *
 * @param activeCell
 * @param getValue
 * @param isHidden
 * @param direction
 * @param limit
 */
export declare const findNextContentfulCell: (activeCell: CellInterface, getValue: ValueGetter, isHidden: HiddenType | undefined, direction: Direction, limit: number) => CellInterface;
/**
 * Find the next cell
 * @param activeCell
 * @param getValue
 * @param isHidden
 * @param direction
 * @param limit
 */
export declare const findLastContentfulCell: (activeCell: CellInterface, getValue: ValueGetter, isHidden: HiddenType | undefined, direction: Direction, limit: number) => CellInterface;
/**
 * Ex
 */
export declare const findNextCellInDataRegion: (activeCell: CellInterface, getValue: ValueGetter, isHidden: HiddenType | undefined, direction: Direction, limit: number) => number;
export declare const focusableNodeNames: Set<string>;
/**
 * Converts a value to string
 * @param value
 */
export declare const castToString: (value: any) => string | undefined;
export declare const isArrowKey: (keyCode: number) => boolean;
export {};
