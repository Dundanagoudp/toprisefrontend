'use client';

import { Provider } from "react-redux";

import { ReactNode } from "react";
import { makeStore } from "./store";

const store = makeStore();

export default function ReduxProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
