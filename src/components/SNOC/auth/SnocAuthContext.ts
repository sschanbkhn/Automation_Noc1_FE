import React from "react";

/** true = đã được guard bởi Route (RequireSnocAuthInline) */
export const SnocAuthGuardContext = React.createContext<boolean>(false);
