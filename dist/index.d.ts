export default function (): {
    inherits: any;
    visitor: {
        JSXElement: {
            exit: typeof import("./visitor").transform;
        };
    };
};
