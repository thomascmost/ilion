import { Layout } from "react-grid-layout";

export const CHANGE_LAYOUT = "CHANGE_LAYOUT";

export const changeLayout = (layout: Layout[]) => {
   return {
      type: CHANGE_LAYOUT,
      payload: layout
   };
};