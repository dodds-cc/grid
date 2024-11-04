import React from "react";
/**
 * Spec: https://tools.ietf.org/html/rfc6902
 *
 * add, { "op": "add", "path": ["data", "1,2"], "value": "hello world" }
 * remove { "op": "remove", "path": ["data", "1,2"], "value": "hello world" }
 * replace { "op": "replace", "path": ["data", "1,2"], "value": "hello world" }
 * move { "op": "move", "from": "/a/b/c", "path": "/a/b/d" }
 * copy
 */
export interface UndoProps {
    enableGlobalKeyHandlers?: boolean;
    onRedo?: (patches: any) => void;
    onUndo?: (patches: any) => void;
    identifier?: (patch: any) => any;
}
export interface UndoManager {
    undo: () => void;
    redo: () => void;
    add: (patches: any) => void;
    replace: (patches: any, inversePatches: any) => void;
    canUndo: boolean;
    canRedo: boolean;
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}
export interface PatchInterface<T> {
    patches: T[];
    inversePatches: T[];
}
/**
 * Undo/Redo hook
 * @param
 */
declare const useUndo: <T>(props?: UndoProps) => UndoManager;
export default useUndo;
