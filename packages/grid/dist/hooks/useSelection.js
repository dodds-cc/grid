"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const helpers_1 = require("./../helpers");
const types_1 = require("./../types");
const EMPTY_SELECTION = [];
const defaultIsHidden = (i) => false;
const defaultSelectionSpan = () => true;
/**
 * Hook to enable selection in datagrid
 * @param initialSelection
 */
const useSelection = ({ gridRef, initialActiveCell = null, initialSelections = EMPTY_SELECTION, columnCount = 0, rowCount = 0, selectionPolicy = "multiple", newSelectionMode = "clear", allowDeselectSelection = true, onFill, isHiddenRow = defaultIsHidden, isHiddenColumn = defaultIsHidden, alwaysScrollToActiveCell = true, selectionTopBound = 0, selectionBottomBound = rowCount - 1, selectionLeftBound = 0, selectionRightBound = columnCount - 1, mouseDownInterceptor, mouseMoveInterceptor, mergedCells = [], canSelectionSpanMergedCells = defaultSelectionSpan, getValue, onSelectionMove, }) => {
    const [activeCell, setActiveCell] = (0, react_1.useState)(initialActiveCell);
    const [selections, setSelections] = (0, react_1.useState)(initialSelections);
    const [fillSelection, setFillSelection] = (0, react_1.useState)();
    const selectionStart = (0, react_1.useRef)(null);
    const selectionEnd = (0, react_1.useRef)(null);
    const isSelecting = (0, react_1.useRef)(false);
    const isFilling = (0, react_1.useRef)(false);
    const firstActiveCell = (0, react_1.useRef)(null);
    const fillSelectionRef = (0, react_1.useRef)();
    /* Drag drop selection */
    const [_, forceRender] = (0, react_1.useReducer)((s) => s + 1, 0);
    const isDragging = (0, react_1.useRef)(false);
    const hasUserMovedSelection = (0, react_1.useRef)(false);
    const initialDraggedSelection = (0, react_1.useRef)();
    const initialDraggedCell = (0, react_1.useRef)();
    const draggedSelection = (0, react_1.useRef)();
    const draggedSelectionIndex = (0, react_1.useRef)();
    /**
     * Need to store in ref because on mousemove and mouseup event that are
     * registered in document
     */
    const activeCellRef = (0, react_1.useRef)(activeCell);
    const activeSelectionsRef = (0, react_1.useRef)(selections);
    const mergedCellsRef = (0, react_1.useRef)(mergedCells);
    (0, react_1.useEffect)(() => {
        activeCellRef.current = activeCell;
    }, [activeCell]);
    (0, react_1.useEffect)(() => {
        activeSelectionsRef.current = selections;
    }, [selections]);
    (0, react_1.useEffect)(() => {
        mergedCellsRef.current = mergedCells;
    }, [mergedCells]);
    (0, react_1.useEffect)(() => {
        fillSelectionRef.current = fillSelection;
    }, [fillSelection]);
    /* Check if cell is out of bounds */
    const isCellOutOfBounds = (0, react_1.useCallback)((cell) => {
        return (cell.rowIndex < selectionTopBound ||
            cell.columnIndex < selectionLeftBound);
    }, [selectionTopBound, selectionLeftBound]);
    /* New selection */
    const newSelection = (start, end = start) => {
        /* Validate bounds */
        if (isCellOutOfBounds(start)) {
            return;
        }
        selectionStart.current = start;
        selectionEnd.current = end;
        const bounds = selectionFromStartEnd(start, end);
        if (!bounds)
            return;
        const coords = { rowIndex: bounds.top, columnIndex: bounds.left };
        /* Keep track  of first cell that was selected by user */
        setActiveCell(coords);
        if (newSelectionMode === "clear") {
            firstActiveCell.current = coords;
            clearSelections();
        }
        else if (newSelectionMode === "modify") {
            modifySelection(coords);
        }
        else {
            appendSelection(coords);
        }
    };
    /**
     * selection object from start, end
     * @param start
     * @param end
     */
    const selectionFromStartEnd = (start, end) => {
        if (!(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current))
            return null;
        const spanMerges = canSelectionSpanMergedCells === null || canSelectionSpanMergedCells === void 0 ? void 0 : canSelectionSpanMergedCells(start, end);
        return (0, helpers_1.cellRangeToBounds)(start, end, spanMerges, gridRef.current.getCellBounds);
    };
    /* Modify current selection */
    const modifySelection = (coords, setInProgress) => {
        if (selectionPolicy === "single") {
            return;
        }
        if (!selectionStart.current)
            return;
        if (isCellOutOfBounds(coords)) {
            return;
        }
        selectionEnd.current = coords;
        const bounds = selectionFromStartEnd(selectionStart.current, coords);
        if (!bounds)
            return;
        /**
         * 1. Multiple selections on mousedown/mousemove
         * 2. Move the activeCell to newly selection. Done by appendSelection
         */
        setSelections((prevSelection) => {
            const len = prevSelection.length;
            if (!len) {
                return [{ bounds, inProgress: setInProgress ? true : false }];
            }
            return prevSelection.map((sel, i) => {
                if (len - 1 === i) {
                    return {
                        ...sel,
                        bounds,
                        inProgress: setInProgress ? true : false,
                    };
                }
                return sel;
            });
        });
    };
    /* Adds a new selection, CMD key */
    const appendSelection = (start, end = start) => {
        if (selectionPolicy !== "multiple") {
            return;
        }
        if (!start)
            return;
        /* Validate bounds */
        if (isCellOutOfBounds(start)) {
            return;
        }
        selectionStart.current = start;
        selectionEnd.current = end;
        const bounds = selectionFromStartEnd(start, end);
        if (!bounds)
            return;
        setActiveCell({ rowIndex: bounds.top, columnIndex: bounds.left });
        setSelections((prev) => [...prev, { bounds }]);
    };
    const removeSelectionByIndex = (0, react_1.useCallback)((index) => {
        const newSelection = selections.filter((_, idx) => idx !== index);
        setSelections(newSelection);
        return newSelection;
    }, [selections]);
    const clearSelections = () => {
        setSelections(EMPTY_SELECTION);
    };
    const getPossibleActiveCellFromSelections = (selections) => {
        if (!selections.length)
            return null;
        const { bounds } = selections[selections.length - 1];
        return {
            rowIndex: bounds.top,
            columnIndex: bounds.left,
        };
    };
    const cellIndexInSelection = (cell, selections) => {
        const id = (0, helpers_1.cellIdentifier)(Math.max(selectionTopBound, cell.rowIndex), Math.max(selectionLeftBound, cell.columnIndex));
        return selections.findIndex((sel) => {
            const boundedCells = (0, helpers_1.getBoundedCells)(sel.bounds);
            return boundedCells.has(id);
        });
    };
    const cellEqualsSelection = (cell, selections) => {
        if (cell === null)
            return false;
        return selections.some((sel) => {
            return (sel.bounds.left === cell.columnIndex &&
                sel.bounds.top === cell.rowIndex &&
                sel.bounds.right === cell.columnIndex &&
                sel.bounds.bottom === cell.rowIndex);
        });
    };
    const boundsSubsetOfSelection = (bounds, selection) => {
        return (bounds.top >= selection.top &&
            bounds.bottom <= selection.bottom &&
            bounds.left >= selection.left &&
            bounds.right <= selection.right);
    };
    /**
     * Triggers a new selection start
     */
    const handleMouseDown = (0, react_1.useCallback)((e) => {
        var _a;
        /* Exit early if grid is not initialized */
        if (!gridRef || !gridRef.current)
            return;
        const coords = gridRef.current.getCellCoordsFromOffset(e.nativeEvent.clientX, e.nativeEvent.clientY);
        if (!coords)
            return;
        /* Check if its context menu click */
        const isContextMenuClick = e.nativeEvent.which === types_1.MouseButtonCodes.right;
        if (isContextMenuClick) {
            const cellIndex = cellIndexInSelection(coords, selections);
            if (cellIndex !== -1)
                return;
        }
        const isShiftKey = e.nativeEvent.shiftKey;
        const isMetaKey = e.nativeEvent.ctrlKey || e.nativeEvent.metaKey;
        const allowMultiple = isMetaKey;
        const allowDeselect = allowDeselectSelection;
        const hasSelections = selections.length > 0;
        const isDeselecting = isMetaKey && allowDeselect;
        if (!isContextMenuClick && selectionPolicy !== "single") {
            document.addEventListener("mouseup", handleMouseUp);
            document.addEventListener("mousemove", handleMouseMove);
        }
        /* Activate selection mode */
        isSelecting.current = true;
        if ((mouseDownInterceptor === null || mouseDownInterceptor === void 0 ? void 0 : mouseDownInterceptor(e, coords, selectionStart, selectionEnd)) ===
            false) {
            return;
        }
        /* Shift key */
        if (isShiftKey) {
            modifySelection(coords);
            return;
        }
        /* Is the current cell same as active cell */
        const isSameAsActiveCell = (0, helpers_1.isEqualCells)(coords, activeCell);
        /* Command  or Control key */
        if (activeCell && allowMultiple) {
            /**
             * User is adding activeCell to selection
             *
             * 1. User is selecting and not de-selecting
             * 2. User has not made any selection
             * 3. Trying to add active cell to selection
             */
            if (isSameAsActiveCell && (!isDeselecting || !hasSelections)) {
                return;
            }
            /**
             * User is manually trying to select multiple selections,
             * So add the current active cell to the list
             */
            if (isMetaKey && !hasSelections) {
                appendSelection(activeCell);
            }
            /**
             * Check if this cell has already been selected (only for manual deselect)
             * Remove it from selection
             *
             * Future enhancements -> Split selection, so that 1 cell can be removed from range
             */
            if (isMetaKey && allowDeselect) {
                const cellIndex = cellIndexInSelection(coords, selections);
                if (cellIndex !== -1) {
                    const newSelection = removeSelectionByIndex(cellIndex);
                    const nextActiveCell = getPossibleActiveCellFromSelections(newSelection);
                    if (nextActiveCell !== null) {
                        setActiveCell(nextActiveCell);
                    }
                    if (newSelection.length === 1 &&
                        cellEqualsSelection(nextActiveCell, newSelection)) {
                        /* Since we only have 1 cell, lets clear the selections and only keep activeCell */
                        clearSelections();
                    }
                    return;
                }
            }
            /**
             * TODO
             * 1. Ability to remove selection
             * 2. Ability to remove from selection area
             * 3. Ability to switch activeCell if its part of removed selection
             */
            appendSelection(coords);
            return;
        }
        /**
         * Scroll to the selected cell
         */
        if (alwaysScrollToActiveCell) {
            (_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.scrollToItem(coords);
        }
        /**
         * If user is selecting the same same,
         * let not trigger another state change
         */
        if (isSameAsActiveCell)
            return;
        /* Trigger new selection */
        newSelection(coords);
    }, [
        activeCell,
        selections,
        selectionPolicy,
        allowDeselectSelection,
        alwaysScrollToActiveCell,
        rowCount,
        columnCount,
        newSelectionMode,
    ]);
    /**
     * Mousemove handler
     */
    const handleMouseMove = (0, react_1.useCallback)((e) => {
        var _a;
        /* Exit if user is not in selection mode */
        if (!isSelecting.current || !(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current))
            return;
        const coords = gridRef.current.getCellCoordsFromOffset(e.clientX, e.clientY);
        if (!coords)
            return;
        if ((mouseMoveInterceptor === null || mouseMoveInterceptor === void 0 ? void 0 : mouseMoveInterceptor(e, coords, selectionStart, selectionEnd)) === false) {
            return;
        }
        if ((0, helpers_1.isEqualCells)(firstActiveCell.current, coords)) {
            return clearSelections();
        }
        modifySelection(coords, true);
        (_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.scrollToItem(coords);
    }, []);
    /**
     * Mouse up handler
     */
    const handleMouseUp = (0, react_1.useCallback)(() => {
        /* Reset selection mode */
        isSelecting.current = false;
        /* Remove listener */
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        /* Update last selection */
        setSelections((prevSelection) => {
            const len = prevSelection.length;
            if (!len)
                return EMPTY_SELECTION;
            return prevSelection.map((sel, i) => {
                if (len - 1 === i) {
                    return {
                        ...sel,
                        inProgress: false,
                    };
                }
                return sel;
            });
        });
    }, []);
    /**
     * Navigate selection using keyboard
     * @param direction
     * @param modify
     */
    const keyNavigate = (0, react_1.useCallback)((direction, modify, metaKeyPressed) => {
        if (!selectionStart.current ||
            !selectionEnd.current ||
            !(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current) ||
            !activeCell)
            return;
        const currentCell = modify ? selectionEnd.current : activeCell;
        var { rowIndex, columnIndex } = currentCell;
        const isMergedCell = gridRef === null || gridRef === void 0 ? void 0 : gridRef.current.isMergedCell({
            rowIndex,
            columnIndex,
        });
        const currentBounds = gridRef.current.getCellBounds({
            rowIndex,
            columnIndex,
        });
        switch (direction) {
            case types_1.Direction.Up:
                if (isMergedCell)
                    rowIndex = currentBounds.top;
                rowIndex = (0, helpers_1.clampIndex)(Math.max(rowIndex - 1, selectionTopBound), isHiddenRow, direction);
                // Shift + Ctrl/Commmand
                // TODO: Scroll to last contentful cell
                if (metaKeyPressed) {
                    const startCell = {
                        ...currentCell,
                        // Expand from the starting cell
                        columnIndex: selectionStart.current.columnIndex,
                    };
                    rowIndex = (0, helpers_1.findNextCellInDataRegion)(startCell, getValue, isHiddenRow, direction, selectionTopBound);
                }
                break;
            case types_1.Direction.Down:
                if (isMergedCell)
                    rowIndex = currentBounds.bottom;
                rowIndex = (0, helpers_1.clampIndex)(Math.min(rowIndex + 1, selectionBottomBound), isHiddenRow, direction);
                // Shift + Ctrl/Commmand
                if (metaKeyPressed) {
                    const startCell = {
                        ...currentCell,
                        // Expand from the starting cell
                        columnIndex: selectionStart.current.columnIndex,
                    };
                    rowIndex = (0, helpers_1.findNextCellInDataRegion)(startCell, getValue, isHiddenRow, direction, selectionBottomBound);
                }
                break;
            case types_1.Direction.Left:
                if (isMergedCell)
                    columnIndex = currentBounds.left;
                columnIndex = (0, helpers_1.clampIndex)(Math.max(columnIndex - 1, selectionLeftBound), isHiddenColumn, direction);
                // Shift + Ctrl/Commmand
                if (metaKeyPressed) {
                    const startCell = {
                        ...currentCell,
                        // Expand from the starting cell
                        rowIndex: selectionStart.current.rowIndex,
                    };
                    columnIndex = (0, helpers_1.findNextCellInDataRegion)(startCell, getValue, isHiddenColumn, direction, selectionLeftBound);
                }
                break;
            case types_1.Direction.Right:
                if (isMergedCell)
                    columnIndex = currentBounds.right;
                columnIndex = (0, helpers_1.clampIndex)(Math.min(columnIndex + 1, selectionRightBound), isHiddenColumn, direction);
                // Shift + Ctrl/Commmand
                if (metaKeyPressed) {
                    const startCell = {
                        ...currentCell,
                        // Expand from the starting cell
                        rowIndex: selectionStart.current.rowIndex,
                    };
                    columnIndex = (0, helpers_1.findNextCellInDataRegion)(startCell, getValue, isHiddenColumn, direction, selectionRightBound);
                }
                break;
        }
        const newBounds = gridRef.current.getCellBounds({
            rowIndex,
            columnIndex,
        });
        const coords = { rowIndex: newBounds.top, columnIndex: newBounds.left };
        const scrollToCell = modify
            ? selectionEnd.current.rowIndex === coords.rowIndex
                ? // Scroll to a column
                    { columnIndex: coords.columnIndex }
                : // Scroll to row
                    { rowIndex: coords.rowIndex }
            : // Scroll to cell
                { rowIndex, columnIndex };
        const isUserNavigatingToActiveCell = (0, helpers_1.isEqualCells)(firstActiveCell.current, coords);
        if (modify && !isUserNavigatingToActiveCell) {
            modifySelection(coords);
        }
        else {
            newSelection(coords);
        }
        /* Keep the item in view */
        gridRef.current.scrollToItem(scrollToCell);
    }, [
        activeCell,
        isHiddenRow,
        isHiddenColumn,
        selectionLeftBound,
        selectionTopBound,
        selectionPolicy,
        newSelectionMode,
    ]);
    // ⌘A or ⌘+Shift+Space
    const selectAll = () => {
        selectionStart.current = {
            rowIndex: selectionTopBound,
            columnIndex: selectionLeftBound,
        };
        modifySelection({
            rowIndex: selectionBottomBound,
            columnIndex: selectionRightBound,
        });
    };
    // Ctrl+Space
    const selectColumn = (0, react_1.useCallback)(() => {
        if (!selectionEnd.current || !selectionStart.current)
            return;
        selectionStart.current = {
            rowIndex: selectionTopBound,
            columnIndex: selectionStart.current.columnIndex,
        };
        modifySelection({
            rowIndex: rowCount - 1,
            columnIndex: selectionEnd.current.columnIndex,
        });
    }, [selectionTopBound]);
    // Shift+Space
    const selectRow = (0, react_1.useCallback)(() => {
        if (!selectionEnd.current || !selectionStart.current)
            return;
        selectionStart.current = {
            rowIndex: selectionStart.current.rowIndex,
            columnIndex: selectionLeftBound,
        };
        modifySelection({
            rowIndex: selectionEnd.current.rowIndex,
            columnIndex: selectionRightBound,
        });
    }, [selectionLeftBound]);
    //  Home
    const selectFirstCellInRow = () => {
        if (!selectionStart.current || !(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current))
            return;
        const cell = {
            rowIndex: selectionStart.current.rowIndex,
            columnIndex: selectionLeftBound,
        };
        newSelection(cell);
        gridRef === null || gridRef === void 0 ? void 0 : gridRef.current.scrollToItem(cell);
    };
    //  End
    const selectLastCellInRow = () => {
        if (!selectionStart.current || !(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current))
            return;
        const cell = {
            rowIndex: selectionStart.current.rowIndex,
            columnIndex: selectionRightBound,
        };
        newSelection(cell);
        gridRef === null || gridRef === void 0 ? void 0 : gridRef.current.scrollToItem(cell);
    };
    //  ⌘+Home
    const selectFirstCellInColumn = () => {
        if (!selectionStart.current || !(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current))
            return;
        const cell = {
            rowIndex: selectionTopBound,
            columnIndex: selectionStart.current.columnIndex,
        };
        newSelection(cell);
        gridRef === null || gridRef === void 0 ? void 0 : gridRef.current.scrollToItem(cell);
    };
    //  ⌘+End
    const selectLastCellInColumn = () => {
        if (!selectionStart.current || !(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current))
            return;
        const cell = {
            rowIndex: rowCount - 1,
            columnIndex: selectionStart.current.columnIndex,
        };
        newSelection(cell);
        gridRef === null || gridRef === void 0 ? void 0 : gridRef.current.scrollToItem(cell);
    };
    //  ⌘+Backspace
    const scrollToActiveCell = () => {
        if (!activeCell || !(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current))
            return;
        gridRef === null || gridRef === void 0 ? void 0 : gridRef.current.scrollToItem(activeCell, helpers_1.Align.smart);
    };
    // Page down
    const pageDown = () => {
        if (!activeCell || !(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current))
            return;
        const { visibleRowStartIndex, visibleRowStopIndex } = gridRef.current.getViewPort();
        const pageSize = visibleRowStopIndex - visibleRowStartIndex;
        const rowIndex = Math.min(activeCell.rowIndex + pageSize, rowCount - 1);
        const newActiveCell = {
            rowIndex,
            columnIndex: activeCell.columnIndex,
        };
        handleSetActiveCell(newActiveCell, false);
        /* Scroll to the new row */
        gridRef === null || gridRef === void 0 ? void 0 : gridRef.current.scrollToItem({ rowIndex }, helpers_1.Align.end);
    };
    // Page up
    const pageUp = () => {
        if (!activeCell || !(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current))
            return;
        const { visibleRowStartIndex, visibleRowStopIndex } = gridRef.current.getViewPort();
        const pageSize = visibleRowStopIndex - visibleRowStartIndex;
        const rowIndex = Math.max(activeCell.rowIndex - pageSize, selectionTopBound);
        const newActiveCell = {
            rowIndex,
            columnIndex: activeCell.columnIndex,
        };
        handleSetActiveCell(newActiveCell, false);
        /* Scroll to the new row */
        gridRef === null || gridRef === void 0 ? void 0 : gridRef.current.scrollToItem({ rowIndex }, helpers_1.Align.end);
    };
    // Page right
    const pageRight = () => {
        if (!activeCell || !(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current))
            return;
        const { visibleColumnStartIndex, visibleColumnStopIndex } = gridRef.current.getViewPort();
        const pageSize = visibleColumnStopIndex - visibleColumnStartIndex;
        const columnIndex = Math.min(activeCell.columnIndex + pageSize, selectionRightBound);
        const newActiveCell = {
            columnIndex,
            rowIndex: activeCell.rowIndex,
        };
        handleSetActiveCell(newActiveCell, false);
        /* Scroll to the new row */
        gridRef === null || gridRef === void 0 ? void 0 : gridRef.current.scrollToItem({ columnIndex }, helpers_1.Align.end);
    };
    // Page left
    const pageLeft = () => {
        if (!activeCell || !(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current))
            return;
        const { visibleColumnStartIndex, visibleColumnStopIndex } = gridRef.current.getViewPort();
        const pageSize = visibleColumnStopIndex - visibleColumnStartIndex;
        const columnIndex = Math.max(activeCell.columnIndex - pageSize, selectionLeftBound);
        const newActiveCell = {
            columnIndex,
            rowIndex: activeCell.rowIndex,
        };
        handleSetActiveCell(newActiveCell, false);
        /* Scroll to the new row */
        gridRef === null || gridRef === void 0 ? void 0 : gridRef.current.scrollToItem({ columnIndex }, helpers_1.Align.end);
    };
    const handleKeyDown = (0, react_1.useCallback)((e) => {
        if (!(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current))
            return;
        const isShiftKey = e.nativeEvent.shiftKey;
        const isAltKey = e.nativeEvent.altKey;
        const isMetaKey = e.nativeEvent.ctrlKey || e.nativeEvent.metaKey;
        switch (e.nativeEvent.which) {
            case types_1.KeyCodes.Right:
                keyNavigate(types_1.Direction.Right, isShiftKey, isMetaKey);
                e.preventDefault();
                break;
            case types_1.KeyCodes.Left:
                keyNavigate(types_1.Direction.Left, isShiftKey, isMetaKey);
                e.preventDefault();
                break;
            // Up
            case types_1.KeyCodes.Up:
                keyNavigate(types_1.Direction.Up, isShiftKey, isMetaKey);
                e.preventDefault();
                break;
            case types_1.KeyCodes.Down:
                keyNavigate(types_1.Direction.Down, isShiftKey, isMetaKey);
                e.preventDefault();
                break;
            case types_1.KeyCodes.A:
                if (isMetaKey) {
                    selectAll();
                }
                e.preventDefault();
                break;
            case types_1.KeyCodes.Home:
                if (isMetaKey) {
                    selectFirstCellInColumn();
                }
                else {
                    selectFirstCellInRow();
                }
                break;
            case types_1.KeyCodes.End:
                if (isMetaKey) {
                    selectLastCellInColumn();
                }
                else {
                    selectLastCellInRow();
                }
                break;
            case types_1.KeyCodes.BackSpace:
                if (isMetaKey)
                    scrollToActiveCell();
                break;
            case types_1.KeyCodes.SPACE:
                if (isMetaKey && isShiftKey) {
                    selectAll();
                }
                else if (isMetaKey) {
                    selectColumn();
                }
                else if (isShiftKey) {
                    selectRow();
                }
                break;
            case types_1.KeyCodes.Tab:
                /* Cycle through the selections if selections.length > 0 */
                if (selections.length && activeCell && gridRef) {
                    const { bounds } = selections[selections.length - 1];
                    const activeCellBounds = gridRef.current.getCellBounds(activeCell);
                    const direction = isShiftKey ? types_1.Direction.Left : types_1.Direction.Right;
                    const nextCell = (0, helpers_1.findNextCellWithinBounds)(activeCellBounds, bounds, direction);
                    if (nextCell) {
                        setActiveCell(nextCell);
                        if (gridRef.current)
                            gridRef.current.scrollToItem(nextCell);
                    }
                }
                else {
                    if (isShiftKey) {
                        keyNavigate(types_1.Direction.Left);
                    }
                    else {
                        keyNavigate(types_1.Direction.Right);
                    }
                }
                e.preventDefault();
                break;
            case types_1.KeyCodes.PageDown:
                if (isAltKey) {
                    pageRight();
                }
                else
                    pageDown();
                break;
            case types_1.KeyCodes.PageUp:
                if (isAltKey) {
                    pageLeft();
                }
                else
                    pageUp();
                break;
        }
    }, [
        rowCount,
        columnCount,
        activeCell,
        selections,
        selectionPolicy,
        newSelectionMode,
    ]);
    /**
     * User modified active cell deliberately
     */
    const handleSetActiveCell = (0, react_1.useCallback)((coords, shouldScroll = true) => {
        selectionStart.current = coords;
        firstActiveCell.current = coords;
        selectionEnd.current = coords;
        setActiveCell(coords);
        /* Scroll to the cell */
        if (shouldScroll && coords && (gridRef === null || gridRef === void 0 ? void 0 : gridRef.current)) {
            gridRef.current.scrollToItem(coords);
        }
    }, []);
    /**
     * TODO
     * 1. Fill does not extend to merged cells
     */
    const handleFillHandleMouseMove = (0, react_1.useCallback)((e) => {
        /* Exit if user is not in selection mode */
        if (!isFilling.current || !(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current) || !activeCellRef.current)
            return;
        const coords = gridRef.current.getCellCoordsFromOffset(e.clientX, e.clientY, false);
        if (!coords)
            return;
        const selections = activeSelectionsRef.current;
        let bounds = selectionFromStartEnd(activeCellRef.current, coords);
        const hasSelections = selections.length > 0;
        const activeCellBounds = hasSelections
            ? selections[selections.length - 1].bounds
            : gridRef.current.getCellBounds(activeCellRef.current);
        if (!bounds)
            return;
        const direction = bounds.top < activeCellBounds.top
            ? types_1.Direction.Up
            : bounds.bottom > activeCellBounds.bottom
                ? types_1.Direction.Down
                : bounds.right > activeCellBounds.right
                    ? types_1.Direction.Right
                    : types_1.Direction.Left;
        if (direction === types_1.Direction.Right) {
            bounds = {
                ...activeCellBounds,
                right: Math.min(selectionRightBound, bounds.right),
            };
        }
        if (direction === types_1.Direction.Up) {
            bounds = {
                ...activeCellBounds,
                top: Math.max(selectionTopBound, bounds.top),
            };
        }
        if (direction === types_1.Direction.Left) {
            bounds = {
                ...activeCellBounds,
                left: Math.max(selectionLeftBound, bounds.left),
            };
        }
        if (direction === types_1.Direction.Down) {
            bounds = {
                ...activeCellBounds,
                bottom: Math.min(selectionBottomBound, bounds.bottom),
            };
        }
        /**
         * If user moves back to the same selection, clear
         */
        if (hasSelections &&
            boundsSubsetOfSelection(bounds, selections[0].bounds)) {
            setFillSelection(undefined);
            return;
        }
        setFillSelection({ bounds });
        gridRef.current.scrollToItem(coords);
    }, []);
    /**
     * When user releases mouse on the fill handle
     */
    const handleFillHandleMouseUp = (0, react_1.useCallback)((e) => {
        var _a;
        isFilling.current = false;
        /* Remove listener */
        document.removeEventListener("mousemove", handleFillHandleMouseMove);
        document.removeEventListener("mouseup", handleFillHandleMouseUp);
        /* Exit early */
        if (!gridRef || !activeCellRef.current)
            return;
        /* Update last selection */
        let fillSelection = fillSelectionRef.current;
        /* Update last selection */
        setFillSelection(undefined);
        /* Use ref, as we are binding to document */
        const selections = activeSelectionsRef.current;
        const activeCell = activeCellRef.current;
        if (!activeCell || !fillSelection)
            return;
        const newBounds = fillSelection === null || fillSelection === void 0 ? void 0 : fillSelection.bounds;
        if (!newBounds)
            return;
        /* Focus on the grid */
        (_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        /* Callback */
        onFill && onFill(activeCell, fillSelection, selections);
        /* Modify last selection */
        setSelections((prevSelection) => {
            const len = prevSelection.length;
            if (!len) {
                return [{ bounds: newBounds }];
            }
            return prevSelection.map((sel, i) => {
                if (len - 1 === i) {
                    return {
                        ...sel,
                        bounds: newBounds,
                    };
                }
                return sel;
            });
        });
    }, [onFill]);
    const handleFillHandleMouseDown = (0, react_1.useCallback)((e) => {
        e.stopPropagation();
        isFilling.current = true;
        document.addEventListener("mousemove", handleFillHandleMouseMove);
        document.addEventListener("mouseup", handleFillHandleMouseUp);
    }, [handleFillHandleMouseMove, handleFillHandleMouseUp]);
    /**
     * Remove the last selection from state
     */
    const handleClearLastSelection = (0, react_1.useCallback)(() => {
        setSelections((prev) => prev.slice(0, -1));
    }, []);
    const fillHandleProps = (0, react_1.useMemo)(() => {
        return {
            onMouseDown: handleFillHandleMouseDown,
        };
    }, [handleFillHandleMouseDown]);
    /**
     * When user mouse downs on selection
     */
    const handleSelectionMouseDown = (0, react_1.useCallback)((e, activeCell, selection, index, shouldClamp = true) => {
        if (!gridRef.current) {
            return;
        }
        let coords = gridRef.current.getCellCoordsFromOffset(e.nativeEvent.clientX, e.nativeEvent.clientY, false // Todo
        );
        if (!coords) {
            return;
        }
        /* Initial cell that is selected by user */
        initialDraggedCell.current = coords;
        /* Make sure the coords do not extend selection bounds */
        if (shouldClamp) {
            coords = (0, helpers_1.clampCellCoords)(coords, activeCell, selection);
        }
        /* Set selection */
        if (activeCell) {
            initialDraggedSelection.current = draggedSelection.current = {
                bounds: gridRef.current.getCellBounds(activeCell),
            };
        }
        if (selection) {
            initialDraggedSelection.current = draggedSelection.current = selection;
            draggedSelectionIndex.current = index;
        }
        /* Set dragging flag */
        isDragging.current = true;
        /* Listen to mousemove and mousedown events */
        document.addEventListener("mouseup", handleSelectionMouseUp);
        document.addEventListener("mousemove", handleSelectionMouseMove);
        /* Force a re-render */
        forceRender();
    }, [selectionTopBound, selectionLeftBound, rowCount, columnCount, selections]);
    /**
     * Ond drag move
     */
    const handleSelectionMouseMove = (0, react_1.useCallback)((e) => {
        var _a;
        if (!(gridRef === null || gridRef === void 0 ? void 0 : gridRef.current))
            return;
        const coords = gridRef.current.getCellCoordsFromOffset(e.clientX, e.clientY);
        if (!coords) {
            return;
        }
        if (!initialDraggedSelection.current || !initialDraggedCell.current) {
            return;
        }
        /**
         * Skip if user is moving the selection
         * to the same starting position
         */
        if (!hasUserMovedSelection.current &&
            (0, helpers_1.isEqualCells)(initialDraggedCell.current, coords)) {
            return;
        }
        let sel = (0, helpers_1.newSelectionFromDrag)(initialDraggedSelection.current, initialDraggedCell.current, coords, selectionTopBound, selectionLeftBound, rowCount, columnCount);
        // Not required
        // sel = { bounds : extendAreaToMergedCells(sel.bounds, mergedCellsRef.current) }
        draggedSelection.current = sel;
        // User has now moved the selection,
        hasUserMovedSelection.current = true;
        /* Scroll to the cell */
        (_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.scrollToItem(coords);
        /* Re-render */
        forceRender();
    }, []);
    /**
     * When drag/drop is complete
     */
    const handleSelectionMouseUp = (0, react_1.useCallback)(() => {
        var _a;
        const sel = draggedSelection.current;
        if (sel) {
            /* Select the first cell in the selection area */
            const coords = { rowIndex: sel.bounds.top, columnIndex: sel.bounds.left };
            setActiveCell(coords);
            /* Update selection start */
            selectionStart.current = coords;
            if ((0, helpers_1.selectionSpansCells)(sel === null || sel === void 0 ? void 0 : sel.bounds)) {
                setSelections((prev) => {
                    return prev.map((cur, index) => {
                        if (index === draggedSelectionIndex.current) {
                            return sel;
                        }
                        return cur;
                    });
                });
                /* Update selection end */
                selectionEnd.current = {
                    rowIndex: sel.bounds.bottom,
                    columnIndex: sel.bounds.right,
                };
            }
        }
        if (initialDraggedSelection.current && sel) {
            onSelectionMove === null || onSelectionMove === void 0 ? void 0 : onSelectionMove(initialDraggedSelection.current, sel);
        }
        /* Focus on the grid */
        (_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        /* Reset all references */
        isDragging.current = false;
        draggedSelection.current = void 0;
        draggedSelectionIndex.current = void 0;
        hasUserMovedSelection.current = false;
        /* Remove event handlers */
        document.removeEventListener("mouseup", handleSelectionMouseUp);
        document.removeEventListener("mousemove", handleSelectionMouseMove);
        /* Force render */
        forceRender();
    }, []);
    return {
        activeCell,
        selections,
        isDragging: isDragging.current,
        draggedSelection: draggedSelection.current,
        initialDraggedSelection: initialDraggedSelection.current,
        onSelectionMouseDown: handleSelectionMouseDown,
        onMouseDown: handleMouseDown,
        onKeyDown: handleKeyDown,
        newSelection,
        setSelections,
        setActiveCell: handleSetActiveCell,
        setActiveCellState: setActiveCell,
        fillHandleProps,
        fillSelection,
        clearLastSelection: handleClearLastSelection,
        modifySelection,
        selectAll,
        appendSelection,
        clearSelections,
    };
};
exports.default = useSelection;
//# sourceMappingURL=useSelection.js.map