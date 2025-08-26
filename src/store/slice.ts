"use client";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authenticated: false,
  questionsAnswers: [],
  rules: {
    generatedRules: '',
    rulesExplanation: '',
  },
  settings: {
    useCustomFunctions: true, // Default to true
    selectedFunctions: ['isAuthenticated', 'isDocOwner'] as string[], // Default selected functions
  },
};

export const slice = createSlice({
  name: "map",
  initialState: initialState,
  reducers: {
    setRules: (state, action) => {
      return { ...state, rules: { ...state.rules, ...action.payload } };
    },
    setUseCustomFunctions: (state, action) => {
      return { ...state, settings: { ...state.settings, useCustomFunctions: action.payload } };
    },
    setSelectedFunctions: (state, action) => {
      return { ...state, settings: { ...state.settings, selectedFunctions: action.payload } };
    },
  },
});

export const { setRules, setUseCustomFunctions, setSelectedFunctions } = slice.actions;

export default slice.reducer;