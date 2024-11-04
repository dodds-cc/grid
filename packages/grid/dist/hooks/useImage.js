"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const useImage = ({ url, crossOrigin }) => {
    const [state, setState] = (0, react_1.useState)(() => ({
        image: undefined,
        status: "loading",
        width: 0,
        height: 0,
    }));
    (0, react_1.useEffect)(() => {
        if (!url)
            return;
        var img = new Image();
        function onload() {
            setState({
                image: img,
                height: img.height,
                width: img.width,
                status: "loaded",
            });
        }
        function onerror() {
            setState((prev) => ({
                ...prev,
                image: undefined,
                status: "failed",
            }));
        }
        img.addEventListener("load", onload);
        img.addEventListener("error", onerror);
        crossOrigin && (img.crossOrigin = crossOrigin);
        img.src = url;
        return () => {
            img.removeEventListener("load", onload);
            img.removeEventListener("error", onerror);
        };
    }, [url, crossOrigin]);
    return state;
};
exports.default = useImage;
//# sourceMappingURL=useImage.js.map