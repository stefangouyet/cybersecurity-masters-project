"use client";
import { configureStore } from "@reduxjs/toolkit";
import slice from "./slice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            reducer: slice,
        },
        devTools: process.env.NODE_ENV !== "production",
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }),
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];