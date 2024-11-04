import React from "react";
import { CellInterface, ScrollCoords, CellPosition, GridRef, SelectionArea } from "../Grid";
import { Direction } from "./../types";
import { HiddenType } from "../helpers";
export interface UseEditableOptions {
    editorProps?: () => any;
    /**
     * Inject custom editors based on a cell
     */
    getEditor?: (cell: CellInterface | null) => React.ElementType;
    /**
     * Access grid methods
     */
    gridRef: React.MutableRefObject<GridRef | null>;
    /**
     * Value getter
     */
    getValue: (cell: CellInterface) => any;
    /**
     * Callback when user cancels editing
     */
    onCancel?: (e?: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement | HTMLDivElement>) => void;
    /**
     * Callback when user changes a value in editor
     */
    onChange?: (value: string, activeCell: CellInterface) => void;
    /**
     * Callback when user submits a value. Use this to update state
     */
    onSubmit?: (value: string, activeCell: CellInterface, nextActiveCell?: CellInterface | null) => void;
    /**
     * Callback when user selects an area and presses delete key
     */
    onDelete?: (activeCell: CellInterface, selections: SelectionArea[]) => void;
    /**
     * Currently selected cells, injected by useSelection
     */
    selections: SelectionArea[];
    /**
     * Active selected cell. This can change, if the user is in formula mode
     */
    activeCell: CellInterface | null;
    /**
     * Callback fired before editing. Can be used to prevent editing. Do not use it, Can be removed in next release.
     */
    canEdit?: (coords: CellInterface) => boolean;
    /**
     * Number of frozen columns
     */
    frozenColumns?: number;
    /**
     * Number of frozen rows
     */
    frozenRows?: number;
    /**
     * Hide editor on blur
     */
    hideOnBlur?: boolean;
    /**
     * Hidden rows
     */
    isHiddenRow: HiddenType;
    /**
     * Hidden columns
     */
    isHiddenColumn: HiddenType;
    /**
     * No of columns in the grid
     */
    columnCount: number;
    /**
     * No of rows in the grid
     */
    rowCount: number;
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
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>) => void;
    /**
     * Sync callback before a cell is edited
     */
    onBeforeEdit?: (coords: CellInterface) => void;
    /**
     * If true, Once the editor is active, it will be always visible.
     * Editor will not scroll with the grid
     */
    sticky?: boolean;
}
export interface EditableResults {
    /**
     * Editor component that can be injected
     */
    editorComponent: React.ReactNode;
    /**
     * Double click listener, activates the grid
     */
    onDoubleClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    /**
     * OnScroll listener to align the editor
     */
    onScroll?: (props: ScrollCoords) => void;
    /**
     * Key down listeners
     */
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    /**
     * Get next focusable cell based on current activeCell and direction user is moving
     */
    nextFocusableCell: (currentCell: CellInterface, direction: Direction) => CellInterface | null;
    /**
     * Is editing in progress
     */
    isEditInProgress: boolean;
    /**
     * Currently editing cell
     */
    editingCell: CellInterface | null;
    /**
     * Make a cell editable
     */
    makeEditable: (cell: CellInterface, value?: string) => void;
    /**
     * Set editable value imperatively
     */
    setValue: (value: string, activeCell: CellInterface, previousValue?: string) => void;
    /**
     * Hide editor
     */
    hideEditor: () => void;
    /**
     * Show editor
     */
    showEditor: () => void;
    /**
     * Bind to mousedown event
     */
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    /**
     * Imperatively trigger submit
     */
    submitEditor: (value: string, activeCell: CellInterface, nextActiveCell?: CellInterface | null) => void;
    /**
     * Cancels an edit
     */
    cancelEditor: () => void;
}
export interface EditorProps {
    /**
     * Currently selected bounds, useful for fomulas
     */
    selections?: SelectionArea[];
    /**
     * Initial value of the cell
     */
    value?: string | number;
    /**
     * Callback when a value has changed.
     */
    onChange?: (value: string, activeCell: CellInterface) => void;
    /**
     * Callback to submit the value back to data store
     */
    onSubmit?: (value: string | number, activeCell: CellInterface, nextActiveCell?: CellInterface | null) => void;
    /**
     * On Cancel callbacks. Hides the editor
     */
    onCancel?: (e?: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement | HTMLDivElement>) => void;
    /**
     * Cell position, x, y, width and height
     */
    position: CellPosition;
    /**
     * Currently active cell, based on selection
     */
    activeCell: CellInterface;
    /**
     * Currrently edited cell
     */
    cell: CellInterface;
    /**
     * Scroll position of the grid
     */
    scrollPosition: ScrollCoords;
    /**
     * Next cell that should receive focus
     */
    nextFocusableCell?: (activeCell: CellInterface, direction?: Direction) => CellInterface | null;
    /**
     * Autofocus the editor when open
     */
    autoFocus?: boolean;
    /**
     * On keydown event
     */
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>) => void;
    /**
     * Max editor width
     */
    maxWidth?: string | number;
    /**
     * Max editor height
     */
    maxHeight?: string | number;
    /**
     * Indicates if the cell is part of frozen row
     */
    isFrozenRow?: boolean;
    /**
     * Indicates if the cell is part of frozen column
     */
    isFrozenColumn?: boolean;
    /**
     * Frozen row offset
     */
    frozenRowOffset?: number;
    /**
     * Frozen column offset
     */
    frozenColumnOffset?: number;
}
export declare const getDefaultEditor: (cell: CellInterface | null) => React.FC<EditorProps>;
/**
 * Hook to make grid editable
 * @param param
 */
declare const useEditable: ({ getEditor, gridRef, getValue, onChange, onSubmit, onCancel, onDelete, selections, activeCell, canEdit, frozenRows, frozenColumns, hideOnBlur, isHiddenRow, isHiddenColumn, rowCount, columnCount, selectionTopBound, selectionBottomBound, selectionLeftBound, selectionRightBound, editorProps, onBeforeEdit, onKeyDown, sticky, }: UseEditableOptions) => EditableResults;
export default useEditable;
