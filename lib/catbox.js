const { Catbox } = require("node-catbox");
const fs = require('fs-extra');
const axios = require('axios');
const catbox = new Catbox();

async function uploadToCatbox(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("File does not exist");
  }
  try {
    const uploadResult = await catbox.uploadFile({ path: filePath });
    return uploadResult;
  } catch (error) {
    throw new Error(`Catbox upload failed: ${error.message}`);
  }
}

module.exports = uploadToCatbox;
