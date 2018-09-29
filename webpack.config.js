module.exports = {
  mode : 'production',
  entry : './index.js',
  output: {
    library: 'avmoptimizer',
    libraryTarget: 'umd',
    filename: './bundle.js',
    auxiliaryComment: 'Test Comment'
  }
};
