"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const types_1 = require("../types");
const helpers_1 = require("../helpers");
/**
 * Undo/Redo hook
 * @param
 */
const useUndo = (props = {}) => {
    const { enableGlobalKeyHandlers, onRedo, onUndo, identifier } = props;
    const undoStack = (0, react_1.useRef)([]);
    const undoStackPointer = (0, react_1.useRef)(-1);
    const [_, forceRender] = (0, react_1.useReducer)((s) => s + 1, 0);
    (0, react_1.useEffect)(() => {
        if (enableGlobalKeyHandlers)
            document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [enableGlobalKeyHandlers]);
    const handleKeyDown = (0, react_1.useCallback)((e) => {
        var _a;
        /* Is user focused on an input, textarea or select element */
        if (document.activeElement &&
            helpers_1.focusableNodeNames.has((_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.nodeName)) {
            return;
        }
        const isMeta = e.metaKey || e.ctrlKey;
        const isUndo = isMeta && e.which === types_1.KeyCodes.Z;
        const isRedo = (e.shiftKey && isUndo) || e.which === types_1.KeyCodes.KEY_Y;
        if (!isRedo && !isUndo)
            return;
        if (isRedo) {
            handleRedo();
        }
        else {
            handleUndo();
        }
    }, []);
    const handleUndo = (0, react_1.useCallback)(() => {
        if (undoStackPointer.current < 0)
            return;
        const patches = undoStack.current[undoStackPointer.current].inversePatches;
        undoStackPointer.current--;
        onUndo && onUndo(patches);
        forceRender();
    }, []);
    const handleRedo = (0, react_1.useCallback)(() => {
        if (undoStackPointer.current === undoStack.current.length - 1)
            return;
        undoStackPointer.current++;
        const patches = undoStack.current[undoStackPointer.current].patches;
        onRedo && onRedo(patches);
        forceRender();
    }, []);
    const addUndoable = (0, react_1.useCallback)((history) => {
        const { patches, inversePatches } = history;
        const pointer = ++undoStackPointer.current;
        undoStack.current.length = pointer;
        undoStack.current[pointer] = { patches, inversePatches };
        forceRender();
    }, []);
    /**
     * Use for async update where you want to replace the last patch
     */
    const replaceLastPatch = (0, react_1.useCallback)((patches, inversePatches) => {
        if (patches === void 0) {
            return;
        }
        const currentStack = undoStack.current;
        const pointer = undoStackPointer.current;
        const curPatches = currentStack[pointer];
        if ((curPatches === null || curPatches === void 0 ? void 0 : curPatches.patches) === void 0) {
            return;
        }
        curPatches.patches.push(...patches);
        if (inversePatches && (curPatches === null || curPatches === void 0 ? void 0 : curPatches.inversePatches)) {
            curPatches.inversePatches.unshift(...inversePatches);
        }
    }, []);
    return {
        undo: handleUndo,
        redo: handleRedo,
        add: addUndoable,
        replace: replaceLastPatch,
        onKeyDown: enableGlobalKeyHandlers ? undefined : handleKeyDown,
        canUndo: !(undoStackPointer.current < 0),
        canRedo: !(undoStackPointer.current === undoStack.current.length - 1),
    };
};
exports.default = useUndo;
//# sourceMappingURL=useUndo.js.map