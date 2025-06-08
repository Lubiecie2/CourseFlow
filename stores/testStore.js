import { defineStore } from "pinia";

export const useTestStore = defineStore("test", {
  state: () => ({
    passedTests: {},
    recentlyPassedTests: [],
  }),

  actions: {
    markTestAsPassed(testId, chapterId) {
      this.passedTests[testId] = true;
      this.recentlyPassedTests.push({
        testId,
        chapterId,
        timestamp: Date.now(),
      });
    },

    isTestPassed(testId) {
      return !!this.passedTests[testId];
    },
  },
});
