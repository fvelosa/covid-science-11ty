#!/usr/bin/env node

const { readdirSync, rename } = require('fs');
const { resolve } = require('path');

// Get path to image directory
const imageDirPath = resolve(__dirname, 'posts');

// Get an array of the files inside the folder
const files = readdirSync(imageDirPath);

// Loop through each file that was retrieved
files.forEach(file => {
  const data = require(file);

  rename(
    imageDirPath + `/${file}`,
    imageDirPath + `/${data.date}-${data.assetId}}`,
    err => console.log(err)
  );
});

