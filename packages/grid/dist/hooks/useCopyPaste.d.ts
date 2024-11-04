import React from "react";
import { CellInterface, GridRef, SelectionArea } from "../Grid";
export interface CopyProps {
    /**
     * Selection bounds
     */
    selections: SelectionArea[];
    /**
     * Active cell
     */
    activeCell?: CellInterface | null;
    /**
     * Value getter of a cell
     */
    getValue: (cell: CellInterface) => any;
    /**
     * Get text value
     */
    getText: (config: any) => string | undefined;
    /**
     * Grid reference to access grid methods
     */
    gridRef: React.MutableRefObject<GridRef | null>;
    /**
     * Callback when a paste is executed
     */
    onPaste?: (rows: (string | null)[][], activeCell: CellInterface | null, selectionArea: SelectionArea[], selection?: SelectionArea) => void;
    /**
     * When user tries to cut a selection
     */
    onCut?: (selection: SelectionArea) => void;
    /**
     * Callback on copy event
     */
    onCopy?: (selection: SelectionArea[]) => void;
}
export interface CopyResults {
    copy: () => void;
    paste: () => void;
    cut: () => void;
}
/**
 * Copy paste hook
 * Usage
 *
 * useCopyPaste ({
 *  onPaste: (text) => {
 *  }
 * })
 */
declare const useCopyPaste: ({ selections, activeCell, getValue, gridRef, onPaste, onCut, onCopy, getText, }: CopyProps) => CopyResults;
export default useCopyPaste;
