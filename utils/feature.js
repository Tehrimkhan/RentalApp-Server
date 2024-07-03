import DataURIParser from "datauri/parser.js";

import path from "path";

export const getDataUri = (file) => {
  console.log("File in getDataUri:", file);
  const parser = new DataURIParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};
