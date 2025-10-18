export default {
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' }
    }]
  ],
  env: {
    test: {
      plugins: ['istanbul']
    },
    development: {
      plugins: ['istanbul']
    }
  }
};
