const Enzyme = require('enzyme');
const raf = global.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0);
};

const EnzymeAdapter = require('enzyme-adapter-react-16');

// Setup enzyme's react adapter
Enzyme.configure({ adapter: new EnzymeAdapter() });
