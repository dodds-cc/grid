"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultEditor = void 0;
const react_1 = __importStar(require("react"));
const types_1 = require("./../types");
const helpers_1 = require("../helpers");
/**
 * Default cell editor
 * @param props
 */
const DefaultEditor = (props) => {
    const { onChange, onSubmit, onCancel, position, cell, nextFocusableCell, value = "", activeCell, autoFocus = true, onKeyDown, selections, scrollPosition, maxWidth, maxHeight, isFrozenRow, isFrozenColumn, frozenRowOffset, frozenColumnOffset, ...rest } = props;
    const borderWidth = 2;
    const padding = 10; /* 2 + 1 + 1 + 2 + 2 */
    const inputRef = (0, react_1.useRef)(null);
    const { x = 0, y = 0, width = 0, height = 0 } = position;
    const getWidth = (0, react_1.useCallback)((text) => {
        var _a;
        const textWidth = ((_a = helpers_1.autoSizerCanvas.measureText(text)) === null || _a === void 0 ? void 0 : _a.width) || 0;
        return Math.max(textWidth + padding, width + borderWidth / 2);
    }, [width]);
    (0, react_1.useEffect)(() => {
        setInputWidth(getWidth(value));
    }, [value]);
    const [inputWidth, setInputWidth] = (0, react_1.useState)(() => getWidth(value));
    (0, react_1.useEffect)(() => {
        var _a, _b;
        if (!inputRef.current)
            return;
        if (autoFocus)
            inputRef.current.focus();
        /* Focus cursor at the end */
        inputRef.current.selectionStart = (_b = (_a = (0, helpers_1.castToString)(value)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    }, []);
    const inputHeight = height;
    return (react_1.default.createElement("div", { style: {
            top: y - borderWidth / 2,
            left: x,
            position: "absolute",
            width: inputWidth,
            height: inputHeight + borderWidth,
            padding: borderWidth,
            boxShadow: "0 2px 6px 2px rgba(60,64,67,.15)",
            border: "2px #1a73e8 solid",
            background: "white",
        } },
        react_1.default.createElement("textarea", { rows: 1, cols: 1, ref: inputRef, value: value, style: {
                font: "12px Arial",
                lineHeight: 1.2,
                width: "100%",
                height: "100%",
                padding: "0 1px",
                margin: 0,
                boxSizing: "border-box",
                borderWidth: 0,
                outline: "none",
                resize: "none",
                overflow: "hidden",
                verticalAlign: "top",
                background: "transparent",
            }, onChange: (e) => {
                onChange === null || onChange === void 0 ? void 0 : onChange(e.target.value, cell);
            }, onKeyDown: (e) => {
                if (!inputRef.current)
                    return;
                const isShiftKey = e.nativeEvent.shiftKey;
                const value = inputRef.current.value;
                // Enter key
                if (e.which === types_1.KeyCodes.Enter) {
                    onSubmit &&
                        onSubmit(value, cell, nextFocusableCell === null || nextFocusableCell === void 0 ? void 0 : nextFocusableCell(cell, isShiftKey ? types_1.Direction.Up : types_1.Direction.Down));
                }
                if (e.which === types_1.KeyCodes.Escape) {
                    onCancel && onCancel(e);
                }
                if (e.which === types_1.KeyCodes.Tab) {
                    e.preventDefault();
                    onSubmit &&
                        onSubmit(value, cell, nextFocusableCell === null || nextFocusableCell === void 0 ? void 0 : nextFocusableCell(cell, isShiftKey ? types_1.Direction.Left : types_1.Direction.Right));
                }
                onKeyDown === null || onKeyDown === void 0 ? void 0 : onKeyDown(e);
            }, ...rest })));
};
const getDefaultEditor = (cell) => DefaultEditor;
exports.getDefaultEditor = getDefaultEditor;
const defaultCanEdit = (cell) => true;
const defaultIsHidden = (i) => false;
/**
 * Hook to make grid editable
 * @param param
 */
const useEditable = ({ getEditor = exports.getDefaultEditor, gridRef, getValue, onChange, onSubmit, onCancel, onDelete, selections = [], activeCell, canEdit = defaultCanEdit, frozenRows = 0, frozenColumns = 0, hideOnBlur = true, isHiddenRow = defaultIsHidden, isHiddenColumn = defaultIsHidden, rowCount, columnCount, selectionTopBound = 0, selectionBottomBound = rowCount - 1, selectionLeftBound = 0, selectionRightBound = columnCount - 1, editorProps, onBeforeEdit, onKeyDown, sticky = false, }) => {
    var _a, _b, _c, _d, _e, _f;
    const [isEditorShown, setShowEditor] = (0, react_1.useState)(false);
    const [value, setValue] = (0, react_1.useState)("");
    const [position, setPosition] = (0, react_1.useState)({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const currentActiveCellRef = (0, react_1.useRef)(null);
    const initialActiveCell = (0, react_1.useRef)();
    const [scrollPosition, setScrollPosition] = (0, react_1.useState)({
        scrollLeft: 0,
        scrollTop: 0,
    });
    const [autoFocus, setAutoFocus] = (0, react_1.useState)(true);
    const isDirtyRef = (0, react_1.useRef)(false);
    const currentValueRef = (0, react_1.useRef)(value);
    const initialValueRef = (0, react_1.useRef)();
    const maxEditorDimensionsRef = (0, react_1.useRef)();
    /* To prevent stale closures data */
    const getValueRef = (0, react_1.useRef)(getValue);
    const showEditor = (0, react_1.useCallback)(() => setShowEditor(true), []);
    const hideEditor = (0, react_1.useCallback)(() => {
        setShowEditor(false);
        currentActiveCellRef.current = null;
    }, []);
    const focusGrid = (0, react_1.useCallback)(() => {
        requestAnimationFrame(() => gridRef.current && gridRef.current.focus());
    }, []);
    /* Keep ref in sync */
    (0, react_1.useEffect)(() => {
        currentValueRef.current = value;
    });
    /* Keep getvalue ref in sync with upstream prop */
    (0, react_1.useEffect)(() => {
        getValueRef.current = getValue;
    }, [getValue]);
    /**
     * Make a cell editable
     * @param coords
     * @param initialValue
     */
    const makeEditable = (0, react_1.useCallback)((coords, initialValue, autoFocus = true) => {
        var _a, _b, _c;
        if (!gridRef.current)
            return;
        /* Get actual coords for merged cells */
        coords = gridRef.current.getActualCellCoords(coords);
        /* Check if its the same cell */
        if ((0, helpers_1.isEqualCells)(coords, currentActiveCellRef.current)) {
            return;
        }
        /* Call on before edit */
        if (canEdit(coords)) {
            /* Let user modify coords before edit */
            onBeforeEdit === null || onBeforeEdit === void 0 ? void 0 : onBeforeEdit(coords);
            /*  Focus */
            (_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.scrollToItem(coords);
            currentActiveCellRef.current = coords;
            /* Get offsets */
            const pos = gridRef.current.getCellOffsetFromCoords(coords);
            const scrollPosition = gridRef.current.getScrollPosition();
            const cellValue = getValueRef.current(coords);
            const value = initialValue || cellValue || "";
            const cellPosition = sticky
                ? // Editor is rendered outside the <Grid /> component
                    // If the user has scrolled down, and then activate the editor, we will need to adjust the position
                    // of the sticky editor accordingly
                    // Subsequent scroll events has no effect, cos of sticky option
                    getCellPosition(pos, scrollPosition)
                : pos;
            /**
             * Set max editor ref based on grid container
             */
            const { containerWidth, containerHeight } = gridRef.current.getDimensions();
            maxEditorDimensionsRef.current = {
                height: containerHeight - ((_b = cellPosition.y) !== null && _b !== void 0 ? _b : 0),
                width: containerWidth - ((_c = cellPosition.x) !== null && _c !== void 0 ? _c : 0),
            };
            /**
             * If the user has entered a value in the cell, mark it as dirty
             * So that during mousedown, onSubmit gets called
             */
            isDirtyRef.current = !!initialValue;
            initialValueRef.current = initialValue;
            /* Trigger onChange handlers */
            setValue(value);
            onChange === null || onChange === void 0 ? void 0 : onChange(value, coords);
            setAutoFocus(autoFocus);
            setScrollPosition(scrollPosition);
            setPosition(cellPosition);
            showEditor();
        }
    }, [frozenRows, frozenColumns, onBeforeEdit, canEdit, sticky]);
    /* Frozen flags */
    const isFrozenRow = currentActiveCellRef.current &&
        ((_a = currentActiveCellRef.current) === null || _a === void 0 ? void 0 : _a.rowIndex) < frozenRows;
    const isFrozenColumn = currentActiveCellRef.current &&
        ((_b = currentActiveCellRef.current) === null || _b === void 0 ? void 0 : _b.columnIndex) < frozenColumns;
    /**
     * Get current cell position based on scroll position
     * @param position
     * @param scrollPosition
     */
    const getCellPosition = (position, scrollPosition) => {
        if (!currentActiveCellRef.current)
            return { x: 0, y: 0 };
        return {
            ...position,
            x: position.x -
                (isFrozenColumn ? 0 : scrollPosition.scrollLeft),
            y: position.y - (isFrozenRow ? 0 : scrollPosition.scrollTop),
        };
    };
    /* Activate edit mode */
    const handleDoubleClick = (0, react_1.useCallback)((e) => {
        if (!gridRef.current)
            return;
        const coords = gridRef.current.getCellCoordsFromOffset(e.nativeEvent.clientX, e.nativeEvent.clientY);
        if (!coords)
            return;
        const { rowIndex, columnIndex } = coords;
        makeEditable({ rowIndex, columnIndex });
    }, [getValue, frozenRows, frozenColumns]);
    const isSelectionKey = (0, react_1.useCallback)((keyCode) => {
        return ([
            types_1.KeyCodes.Right,
            types_1.KeyCodes.Left,
            types_1.KeyCodes.Up,
            types_1.KeyCodes.Down,
            types_1.KeyCodes.Meta,
            types_1.KeyCodes.Escape,
            types_1.KeyCodes.Tab,
            types_1.KeyCodes.Home,
            types_1.KeyCodes.End,
            types_1.KeyCodes.CapsLock,
            types_1.KeyCodes.PageDown,
            types_1.KeyCodes.PageUp,
            types_1.KeyCodes.ScrollLock,
            types_1.KeyCodes.NumLock,
            types_1.KeyCodes.Insert,
            types_1.KeyCodes.Pause,
        ].includes(keyCode) ||
            // Exclude Function keys
            (keyCode >= types_1.KeyCodes.F1 && keyCode <= types_1.KeyCodes.F12));
    }, []);
    const handleKeyDown = (0, react_1.useCallback)((e) => {
        const keyCode = e.nativeEvent.keyCode;
        if (keyCode === types_1.KeyCodes.Tab && !initialActiveCell.current) {
            initialActiveCell.current = activeCell;
        }
        if ((0, helpers_1.isArrowKey)(keyCode)) {
            initialActiveCell.current = undefined;
        }
        if (isSelectionKey(keyCode) ||
            e.nativeEvent.ctrlKey ||
            (e.nativeEvent.shiftKey &&
                (e.nativeEvent.key === "Shift" ||
                    e.nativeEvent.which === types_1.KeyCodes.SPACE)) ||
            e.nativeEvent.metaKey ||
            e.nativeEvent.which === types_1.KeyCodes.ALT)
            return;
        /* If user has not made any selection yet */
        if (!activeCell)
            return;
        const { rowIndex, columnIndex } = activeCell;
        if (keyCode === types_1.KeyCodes.Delete || keyCode === types_1.KeyCodes.BackSpace) {
            // TODO: onbefore  delete
            onDelete && onDelete(activeCell, selections);
            e.preventDefault();
            return;
        }
        const initialValue = keyCode === types_1.KeyCodes.Enter // Enter key
            ? undefined
            : e.nativeEvent.key;
        makeEditable({ rowIndex, columnIndex }, initialValue);
        /* Prevent the first keystroke */
        e.preventDefault();
    }, [getValue, selections, activeCell, onDelete]);
    /**
     * Get next focusable cell
     * Respects selection bounds
     */
    const nextFocusableCell = (0, react_1.useCallback)((currentCell, direction = types_1.Direction.Right) => {
        var _a, _b, _c, _d, _e;
        /* Next immediate cell */
        const bounds = (_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.getCellBounds(currentCell);
        if (!bounds)
            return null;
        let nextActiveCell;
        switch (direction) {
            case types_1.Direction.Right: {
                let columnIndex = (0, helpers_1.clampIndex)(Math.min(bounds.right + 1, selectionRightBound), isHiddenColumn, direction);
                nextActiveCell = {
                    rowIndex: bounds.top,
                    columnIndex,
                };
                break;
            }
            case types_1.Direction.Up:
                let rowIndex = (0, helpers_1.clampIndex)(Math.max(bounds.top - 1, selectionTopBound), isHiddenRow, direction);
                nextActiveCell = {
                    rowIndex,
                    columnIndex: bounds.left,
                };
                break;
            case types_1.Direction.Left: {
                let columnIndex = (0, helpers_1.clampIndex)(Math.max(bounds.left - 1, selectionLeftBound), isHiddenColumn, direction);
                nextActiveCell = {
                    rowIndex: bounds.top,
                    columnIndex,
                };
                break;
            }
            default: {
                // Down
                let rowIndex = (0, helpers_1.clampIndex)(Math.min(((_c = (_b = initialActiveCell.current) === null || _b === void 0 ? void 0 : _b.rowIndex) !== null && _c !== void 0 ? _c : bounds.bottom) + 1, selectionBottomBound), isHiddenRow, direction);
                nextActiveCell = {
                    rowIndex,
                    columnIndex: (_e = (_d = initialActiveCell.current) === null || _d === void 0 ? void 0 : _d.columnIndex) !== null && _e !== void 0 ? _e : bounds.left,
                };
                break;
            }
        }
        if (direction === types_1.Direction.Right && !initialActiveCell.current) {
            initialActiveCell.current = currentCell;
        }
        if (direction === types_1.Direction.Down) {
            /* Move to the next row + cell */
            initialActiveCell.current = undefined;
        }
        /* If user has selected some cells and active cell is within this selection */
        if (selections.length && currentCell && gridRef.current) {
            const { bounds } = selections[selections.length - 1];
            const activeCellBounds = gridRef.current.getCellBounds(currentCell);
            const nextCell = (0, helpers_1.findNextCellWithinBounds)(activeCellBounds, bounds, direction);
            if (nextCell)
                nextActiveCell = nextCell;
        }
        return nextActiveCell;
    }, [
        selections,
        isHiddenRow,
        isHiddenColumn,
        selectionBottomBound,
        selectionTopBound,
    ]);
    /* Save the value */
    const handleSubmit = (0, react_1.useCallback)((value, activeCell, nextActiveCell) => {
        /**
         * Hide the editor first, so that we can handle onBlur events
         * 1. Editor hides -> Submit
         * 2. If user clicks outside the grid, onBlur is called, if there is a activeCell, we do another submit
         */
        hideEditor();
        /* Save the new value */
        onSubmit && onSubmit(value, activeCell, nextActiveCell);
        /* Keep the focus */
        focusGrid();
    }, [onSubmit]);
    /* When the input is blurred out */
    const handleCancel = (0, react_1.useCallback)((e) => {
        hideEditor();
        onCancel && onCancel(e);
        /* Keep the focus back in the grid */
        focusGrid();
    }, [onCancel]);
    const handleMouseDown = (0, react_1.useCallback)((e) => {
        /* Persistent input, hides only during Enter key or during submit or cancel calls */
        if (!hideOnBlur) {
            return;
        }
        if (currentActiveCellRef.current) {
            if (isDirtyRef.current) {
                handleSubmit(currentValueRef.current, currentActiveCellRef.current);
            }
            else {
                handleCancel();
            }
        }
        initialActiveCell.current = undefined;
    }, [hideOnBlur, handleSubmit, handleCancel]);
    const handleChange = (0, react_1.useCallback)((newValue, activeCell) => {
        /**
         * Make sure we dont call onChange if initialValue is set
         * This is to accomodate for editor that fire onChange during initialvalue
         * Eg: Slate  <Editor value='' onChange />
         */
        if (initialValueRef.current !== void 0 &&
            initialValueRef.current === newValue) {
            initialValueRef.current = void 0;
            return;
        }
        if (!currentActiveCellRef.current)
            return;
        /* Check if the value has changed. Used to conditionally submit if editor is not in focus */
        isDirtyRef.current = newValue !== value;
        setValue(newValue);
        onChange === null || onChange === void 0 ? void 0 : onChange(newValue, activeCell);
    }, [value]);
    const handleScroll = (0, react_1.useCallback)((scrollPos) => {
        if (!currentActiveCellRef.current)
            return;
        setScrollPosition(scrollPos);
    }, []);
    /* Editor */
    const editingCell = currentActiveCellRef.current;
    const Editor = (0, react_1.useMemo)(() => {
        return editingCell
            ? getEditor(editingCell) || (0, exports.getDefaultEditor)(editingCell)
            : null;
    }, [editingCell]);
    const handleBlur = (0, react_1.useCallback)((e) => {
        if (currentActiveCellRef.current) {
            /* Keep the focus */
            focusGrid();
        }
    }, []);
    const finalCellPosition = (0, react_1.useMemo)(() => {
        /**
         * Since the editor is sticky,
         * we dont need to adjust the position,
         * as scrollposition wont move the editor
         *
         * When the editor is first active, in makeEditable,
         * we accomodate for the initial scrollPosition
         */
        if (sticky) {
            return position;
        }
        /**
         * If editor is not sticky, keep adjusting
         * its position to accomodate for scroll
         */
        return getCellPosition(position, scrollPosition);
    }, [sticky, position, scrollPosition, frozenColumns, frozenRows]);
    /* Get offset of frozen rows and columns */
    const frozenRowOffset = (_c = gridRef.current) === null || _c === void 0 ? void 0 : _c.getRowOffset(frozenRows);
    const frozenColumnOffset = (_d = gridRef.current) === null || _d === void 0 ? void 0 : _d.getColumnOffset(frozenColumns);
    const editorComponent = isEditorShown && Editor ? (react_1.default.createElement(Editor, { ...editorProps === null || editorProps === void 0 ? void 0 : editorProps(), 
        /* This is the cell that is currently being edited */
        cell: editingCell, activeCell: activeCell, autoFocus: autoFocus, value: value, selections: selections, onChange: handleChange, onSubmit: handleSubmit, onCancel: handleCancel, position: finalCellPosition, scrollPosition: scrollPosition, nextFocusableCell: nextFocusableCell, onBlur: handleBlur, onKeyDown: onKeyDown, maxWidth: (_e = maxEditorDimensionsRef.current) === null || _e === void 0 ? void 0 : _e.width, maxHeight: (_f = maxEditorDimensionsRef.current) === null || _f === void 0 ? void 0 : _f.height, isFrozenRow: isFrozenRow, isFrozenColumn: isFrozenColumn, frozenRowOffset: frozenRowOffset, frozenColumnOffset: frozenColumnOffset })) : null;
    return {
        editorComponent,
        onDoubleClick: handleDoubleClick,
        onKeyDown: handleKeyDown,
        nextFocusableCell,
        isEditInProgress: !!editingCell,
        editingCell,
        makeEditable,
        setValue: handleChange,
        hideEditor,
        showEditor,
        submitEditor: handleSubmit,
        cancelEditor: handleCancel,
        onMouseDown: handleMouseDown,
        onScroll: handleScroll,
    };
};
exports.default = useEditable;
//# sourceMappingURL=useEditable.js.map