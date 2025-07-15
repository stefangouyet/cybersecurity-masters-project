"use client";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authenticated: false,
  questionsAnswers: [],
  rules: {
    generatedRules: '',
    rulesExplanation: '',
  },
};

export const slice = createSlice({
  name: "map",
  initialState: initialState,
  reducers: {
    getMapConfig: (state, action) => {
      return { ...state, mapInfo: action.payload };
    },
    getUserInfo: (state, action) => {
      return { ...state, userInfo: action.payload };
    },
    getFamilyInfo: (state, action) => {
      return { ...state, family: action.payload };
    },
    getQuestions: (state, action) => {
      return { ...state, questionsAnswers: action.payload };
    },
    setRules: (state, action) => {
      return { ...state, rules: { ...state.rules, ...action.payload } };
    },
  },
});

export const { getMapConfig, getQuestions, getUserInfo, getFamilyInfo, setRules } = slice.actions;

export default slice.reducer;