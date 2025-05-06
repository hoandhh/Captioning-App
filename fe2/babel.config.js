module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for expo-router
      'expo-router/babel',
      // For path aliases
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './',
            '@components': './components',
            '@constants': './constants',
            '@context': './context',
            '@hooks': './hooks',
            '@services': './services',
            '@utils': './utils',
            '@assets': './assets',
          },
        },
      ],
      // For animations
      'react-native-reanimated/plugin',
    ],
  };
};
