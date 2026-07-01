/** Jest config for the Expo app (jest-expo preset + React Native Testing Library). */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  // Transform RN/Expo ESM/TS packages AND the workspace packages (TS source).
  // Note: expo packages (e.g. expo-modules-core) resolve to TS `src` under pnpm,
  // so they must be transformed — hence the broad expo-*/react-native-* entries.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|react-native-.*|@react-native/.*|@react-native-community/.*|expo|expo-.*|@expo/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@barriapp/.*)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
};
