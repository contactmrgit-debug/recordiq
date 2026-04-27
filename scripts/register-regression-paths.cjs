const path = require("path");
const Module = require("module");

const rootDir = path.resolve(__dirname, "..");
const tempRoot = path.join(rootDir, "tmp-regression");
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveRegressionPath(
  request,
  parent,
  isMain,
  options
) {
  if (request.startsWith("@/")) {
    const mappedRequest = path.join(tempRoot, request.slice(2));
    return originalResolveFilename.call(
      this,
      mappedRequest,
      parent,
      isMain,
      options
    );
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
