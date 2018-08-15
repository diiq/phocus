const tsc = require('typescript');
const tsConfig = require('../tsconfig.json');

const options = tsConfig.compilerOptions;
options.module="node"

module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      it =  tsc.transpile(
        src,
        options,
        path,
        []
      );
      return it;
    } else {
      return src;
    }
  }
};
