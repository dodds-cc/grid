import React from "react";
import { SelectionArea, CellInterface, GridRef, AreaProps } from "./../Grid";
import { HiddenType } from "./../helpers";
import { SelectionPolicy } from "./../types";
export interface UseSelectionOptions {
    /**
     * Access grid functions
     */
    gridRef: React.MutableRefObject<GridRef | null>;
    /**
     * Initial selections
     */
    initialSelections?: SelectionArea[];
    /**
     * Option to set 0,0 as initially selected cell
     */
    initialActiveCell?: CellInterface | null;
    /**
     * No of columns in the grid
     */
    columnCount?: number;
    /**
     * No of rows in the grid
     */
    rowCount?: number;
    /**
     * Allow deselect a selected area
     */
    allowDeselectSelection?: boolean;
    /**
     * onFill
     */
    onFill?: (activeCell: CellInterface, selection: SelectionArea | null, selections: SelectionArea[]) => void;
    /**
     * Hidden rows
     */
    isHiddenRow?: HiddenType;
    /**
     * Hidden columns
     */
    isHiddenColumn?: HiddenType;
    /**
     * Always scroll to active cell
     */
    alwaysScrollToActiveCell?: boolean;
    /**
     * Top bound of selection
     */
    selectionTopBound?: number;
    /**
     * Bottom bound
     */
    selectionBottomBound?: number;
    /**
     * Left bound
     */
    selectionLeftBound?: number;
    /**
     * Right bound
     */
    selectionRightBound?: number;
    /**
     * merged cells
     */
    mergedCells?: AreaProps[];
    /**
     * Mousedown
     */
    mouseDownInterceptor?: (e: React.MouseEvent<HTMLDivElement>, coords: CellInterface, start: React.MutableRefObject<CellInterface | null>, end: React.MutableRefObject<CellInterface | null>) => boolean | undefined;
    mouseMoveInterceptor?: (e: globalThis.MouseEvent, coords: CellInterface, start: React.MutableRefObject<CellInterface | null>, end: React.MutableRefObject<CellInterface | null>) => boolean | undefined;
    canSelectionSpanMergedCells?: (start: CellInterface, end: CellInterface) => boolean;
    /**
     * Selection policy
     */
    selectionPolicy?: SelectionPolicy;
    /**
     * Value getter
     */
    getValue: (cell: CellInterface) => string | number | undefined;
    /**
     * New selection mode
     */
    newSelectionMode?: NewSelectionMode;
    /**
     * When selection is moved
     */
    onSelectionMove?: (from: SelectionArea, to: SelectionArea) => void;
}
export type NewSelectionMode = "clear" | "modify" | "append";
export interface SelectionResults {
    /**
     * Active selected cell
     */
    activeCell: CellInterface | null;
    /**
     * Use this to invoke a new selection. All old selection will be cleared
     */
    newSelection: (coords: CellInterface) => void;
    /**
     * Use this to update selections without clearning old selection.
     */
    setSelections: (selections: SelectionArea[] | ((selections: SelectionArea[]) => SelectionArea[])) => void;
    /**
     * Modify selectio
     */
    modifySelection: (coords: CellInterface) => void;
    /**
     * Set the currently active cell
     */
    setActiveCell: (coords: CellInterface | null, shouldScroll?: boolean) => void;
    /**
     * Only saves internal state
     */
    setActiveCellState: (coords: CellInterface | null) => void;
    /**
     * Array of all selection bounds
     */
    selections: SelectionArea[];
    /**
     * Handler for mousedown, use to set activeCell
     */
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    /**
     * Used to move selections based on pressed key
     */
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
    /**
     * Mousedown event on fillhandle
     */
    fillHandleProps?: Record<string, (e: any) => void>;
    /**
     *
     * Fill selections
     */
    fillSelection: SelectionArea | undefined;
    /**
     * Clears the last selection
     */
    clearLastSelection: () => void;
    /**
     * Select all cells
     */
    selectAll: () => void;
    /**
     * Add a new selection
     */
    appendSelection: (start: CellInterface, end: CellInterface) => void;
    /**
     * Clear all current selections
     */
    clearSelections: () => void;
    /**
     * On Selection mousedown
     */
    onSelectionMouseDown?: (e: React.MouseEvent<HTMLDivElement>, cell: CellInterface | undefined, selection: SelectionArea | undefined, index: number | undefined, shouldClamp?: boolean) => void;
    /**
     * Boolean to indicate if a selection is being dragged
     */
    isDragging?: boolean;
    /**
     * Currently dragged selection
     */
    draggedSelection?: SelectionArea;
    /**
     * The selection that user selected before beginning
     * the drag
     */
    initialDraggedSelection?: SelectionArea;
}
/**
 * Hook to enable selection in datagrid
 * @param initialSelection
 */
declare const useSelection: ({ gridRef, initialActiveCell, initialSelections, columnCount, rowCount, selectionPolicy, newSelectionMode, allowDeselectSelection, onFill, isHiddenRow, isHiddenColumn, alwaysScrollToActiveCell, selectionTopBound, selectionBottomBound, selectionLeftBound, selectionRightBound, mouseDownInterceptor, mouseMoveInterceptor, mergedCells, canSelectionSpanMergedCells, getValue, onSelectionMove, }: UseSelectionOptions) => SelectionResults;
export default useSelection;
