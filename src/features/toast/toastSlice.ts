import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Toast {
  id: number;
  message: string;
}

interface ToastState {
  current: Toast | null;
}

const initialState: ToastState = { current: null };
let nextId = 1;

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    toastShown: {
      reducer(state, { payload }: PayloadAction<Toast>) {
        state.current = payload;
      },
      prepare: (message: string) => ({ payload: { id: nextId++, message } }),
    },
    toastDismissed(state) {
      state.current = null;
    },
  },
  selectors: {
    selectToast: (state) => state.current,
  },
});

export const { toastShown, toastDismissed } = toastSlice.actions;
export const { selectToast } = toastSlice.selectors;
export const toastReducer = toastSlice.reducer;
