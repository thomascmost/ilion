import { Layout } from "react-grid-layout";

export const CHANGE_LAYOUT = "CHANGE_LAYOUT";

export const changeLayout = (layout: Layout[]) => {
   return {
      type: CHANGE_LAYOUT,
      payload: layout.map((item) => ({
         id: item.i,
         x_col: item.x,
         gridY: item.y,
         lengthGrid: item.h
      }))
   };
};