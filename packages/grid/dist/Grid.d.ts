import React, { Key } from "react";
import { Align } from "./helpers";
import type { ShapeConfig } from "konva/lib/Shape";
import type { StageConfig } from "konva/lib/Stage";
import { Direction } from "./types";
import Konva from "konva";
export interface GridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onScroll" | "children"> {
    /**
     * Width of the grid
     */
    width?: number;
    /**
     * Height of the grid
     */
    height?: number;
    /**
     * No of columns in the grid
     */
    columnCount: number;
    /**
     * No of rows in the grid
     */
    rowCount: number;
    /**
     * Should return height of a row at an index
     */
    rowHeight?: ItemSizer;
    /**
     * Should return width of a column at an index
     */
    columnWidth?: ItemSizer;
    /**
     * Size of the scrollbar. Default is 13
     */
    scrollbarSize?: number;
    /**
     * Helps in lazy grid width calculation
     */
    estimatedColumnWidth?: number;
    /**
     * Helps in lazy grid height calculation
     */
    estimatedRowHeight?: number;
    /**
     * Called when user scrolls the grid
     */
    onScroll?: ({ scrollLeft, scrollTop }: ScrollCoords) => void;
    /**
     * Called immediately on scroll
     */
    onImmediateScroll?: ({ scrollLeft, scrollTop }: ScrollCoords) => void;
    /**
     * Show scrollbars on the left and right of the grid
     */
    showScrollbar?: boolean;
    /**
     * Currently active cell
     */
    activeCell?: CellInterface | null;
    /**
     * Background of selection
     */
    selectionBackgroundColor?: string;
    /**
     * Border color of selected area
     */
    selectionBorderColor?: string;
    /**
     * Stroke width of the selection
     */
    selectionStrokeWidth?: number;
    /**
     * Active Cell Stroke width
     */
    activeCellStrokeWidth?: number;
    /**
     * Array of selected cell areas
     */
    selections?: SelectionArea[];
    /**
     * Fill selection
     */
    fillSelection?: SelectionArea | null;
    /**
     * Array of merged cells
     */
    mergedCells?: AreaProps[];
    /**
     * Number of frozen rows
     */
    frozenRows?: number;
    /**
     * Number of frozen columns
     */
    frozenColumns?: number;
    /**
     * Snap to row and column when scrolling
     */
    snap?: boolean;
    /**
     * Show shadow as you scroll for frozen rows and columns
     */
    showFrozenShadow?: boolean;
    /**
     * Shadow settings
     */
    shadowSettings?: ShapeConfig;
    /**
     * Scroll throttle wait timeout
     */
    scrollThrottleTimeout?: number;
    /**
     * Cell styles for border
     */
    borderStyles?: StylingProps;
    /**
     * Extend certains to coords
     */
    cellAreas?: CellRangeArea[];
    /**
     * Cell renderer. Must be a Konva Component eg: Group, Rect etc
     */
    itemRenderer?: (props: RendererProps) => React.ReactNode;
    /**
     * Render custom overlays like stroke on top of cell
     */
    overlayRenderer?: (props: RendererProps) => React.ReactNode;
    /**
     * Allow users to customize selected cells design
     */
    selectionRenderer?: (props: SelectionProps) => React.ReactNode;
    /**
     * Bind to fill handle
     */
    fillHandleProps?: Record<string, (e: any) => void>;
    /**
     * Fired when scroll viewport changes
     */
    onViewChange?: (view: ViewPortProps) => void;
    /**
     * Called right before a row is being rendered.
     * Will be called for frozen cells and merged cells
     */
    onBeforeRenderRow?: (rowIndex: number) => void;
    /**
     * Custom grid overlays
     */
    children?: (props: ScrollCoords) => React.ReactNode;
    /**
     * Allows users to Wrap stage children in Top level Context
     */
    wrapper?: (children: React.ReactNode) => React.ReactNode;
    /**
     * Props that can be injected to Konva stage
     */
    stageProps?: Omit<StageConfig, "container">;
    /**
     * Show fillhandle
     */
    showFillHandle?: boolean;
    /**
     * Overscan row and columns
     */
    overscanCount?: number;
    /**
     * Border color of fill handle
     */
    fillhandleBorderColor?: string;
    /**
     * Show grid lines.
     * Useful for spreadsheets
     */
    showGridLines?: boolean;
    /**
     * Customize grid line color
     */
    gridLineColor?: string;
    /**
     * Width of the grid line
     */
    gridLineWidth?: number;
    /**
     * Gridline component
     */
    gridLineRenderer?: (props: ShapeConfig) => React.ReactNode;
    /**
     * Shadow stroke color
     */
    shadowStroke?: string;
    /**
     * Draw overlay for each cell.
     * Can be used to apply stroke or draw on top of a cell
     */
    enableCellOverlay?: boolean;
    /**
     * Check if its hidden row
     */
    isHiddenRow?: (rowIndex: number) => boolean;
    /**
     * Check if its a hidden column. Skip rendering hidden
     */
    isHiddenColumn?: (columnIndex: number) => boolean;
    /**
     * Is Hidden cell
     */
    isHiddenCell?: (rowIndex: number, columnIndex: number) => boolean;
    /**
     * Scale
     */
    scale?: number;
    /**
     * Enable draging active cell and selections
     */
    enableSelectionDrag?: boolean;
    /**
     * Is user currently dragging a selection
     */
    isDraggingSelection?: boolean;
}
export interface CellRangeArea extends CellInterface {
    toColumnIndex: number;
}
export type RefAttribute = {
    ref?: React.Ref<GridRef>;
};
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export interface SelectionProps extends AreaMeta, ShapeConfig, Omit<React.HTMLAttributes<HTMLDivElement>, "draggable"> {
    fillHandleProps?: Record<string, (e: any) => void>;
    type: "fill" | "activeCell" | "selection" | "border";
    isDragging?: boolean;
    inProgress?: boolean;
    activeCell?: CellInterface;
    selection?: SelectionArea;
    key: number;
    draggable?: boolean;
    bounds?: AreaProps;
    borderCoverWidth?: number;
}
export type ScrollCoords = {
    scrollTop: number;
    scrollLeft: number;
};
export type OptionalScrollCoords = {
    scrollTop?: number;
    scrollLeft?: number;
};
export interface ScrollState extends ScrollCoords {
    isScrolling: boolean;
    verticalScrollDirection: Direction;
    horizontalScrollDirection: Direction;
}
export type RenderComponent = React.FC<RendererProps>;
export interface CellPosition extends Pick<ShapeConfig, "x" | "y"> {
    width?: ShapeConfig["width"];
    height?: ShapeConfig["height"];
}
export interface RendererProps extends CellInterface, CellPosition, Omit<ShapeConfig, "scale"> {
    key: Key;
    isMergedCell?: boolean;
    isOverlay?: boolean;
}
export type ItemSizer = (index: number) => number;
export interface SelectionArea extends AreaStyle {
    bounds: AreaProps;
    inProgress?: boolean;
    /**
     * When user drags the fill handle
     */
    isFilling?: boolean;
}
export interface AreaProps {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
export interface CellInterface {
    rowIndex: number;
    columnIndex: number;
}
export interface OptionalCellInterface {
    rowIndex?: number;
    columnIndex?: number;
}
export interface ViewPortProps {
    rowStartIndex: number;
    rowStopIndex: number;
    columnStartIndex: number;
    columnStopIndex: number;
    visibleRowStartIndex: number;
    visibleRowStopIndex: number;
    visibleColumnStartIndex: number;
    visibleColumnStopIndex: number;
}
export interface InstanceInterface {
    columnMetadataMap: CellMetaDataMap;
    rowMetadataMap: CellMetaDataMap;
    lastMeasuredColumnIndex: number;
    lastMeasuredRowIndex: number;
    estimatedRowHeight: number;
    estimatedColumnWidth: number;
    recalcColumnIndices: number[];
    recalcRowIndices: number[];
}
export type CellMetaDataMap = Record<number, CellMetaData>;
export type CellMetaData = {
    offset: number;
    size: number;
};
export interface SnapRowProps {
    deltaY: number;
}
export interface SnapColumnProps {
    deltaX: number;
}
export interface PosXY {
    x?: number;
    y?: number;
}
export interface PosXYRequired {
    x: number;
    y: number;
}
export type GridRef = {
    scrollTo: (scrollPosition: ScrollCoords) => void;
    scrollBy: (pos: PosXY) => void;
    stage: Konva.Stage | null;
    container: HTMLDivElement | null;
    resetAfterIndices: (coords: OptionalCellInterface, shouldForceUpdate?: boolean) => void;
    getScrollPosition: () => ScrollCoords;
    isMergedCell: (coords: CellInterface) => boolean;
    getCellBounds: (coords: CellInterface, spanMerges?: boolean) => AreaProps;
    getCellCoordsFromOffset: (x: number, y: number, includeFrozen?: boolean) => CellInterface | null;
    getCellOffsetFromCoords: (coords: CellInterface) => CellPosition;
    getActualCellCoords: (coords: CellInterface) => CellInterface;
    scrollToItem: (coords: OptionalCellInterface, align?: Align) => void;
    focus: () => void;
    resizeColumns: (indices: number[]) => void;
    resizeRows: (indices: number[]) => void;
    getViewPort: () => ViewPortProps;
    getRelativePositionFromOffset: (x: number, y: number) => PosXYRequired | null;
    scrollToTop: () => void;
    scrollToBottom: () => void;
    getDimensions: () => {
        containerWidth: number;
        containerHeight: number;
        estimatedTotalWidth: number;
        estimatedTotalHeight: number;
    };
    getRowOffset: (index: number) => number;
    getColumnOffset: (index: number) => number;
};
export type MergedCellMap = Map<string, AreaProps>;
export type StylingProps = AreaStyle[];
export interface AreaStyle extends AreaMeta {
    bounds: AreaProps;
    style?: Style;
    strokeStyle?: "dashed" | "solid" | "dotted";
}
export interface AreaMeta {
    title?: string;
    [key: string]: any;
}
export interface Style {
    stroke?: string;
    strokeLeftColor?: string;
    strokeTopColor?: string;
    strokeRightColor?: string;
    strokeBottomColor?: string;
    strokeWidth?: number;
    strokeTopWidth?: number;
    strokeRightWidth?: number;
    strokeBottomWidth?: number;
    strokeLeftWidth?: number;
    strokeStyle?: string;
}
export declare const RESET_SCROLL_EVENTS_DEBOUNCE_INTERVAL = 150;
/**
 * Grid component using React Konva
 * @param props
 *
 * TODO: Fix bug with snapping, since onWheel is a global handler, rowCount, columnCount becomes state
 */
declare const Grid: React.FC<GridProps & RefAttribute>;
export default Grid;
