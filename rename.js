#!/usr/bin/env node

const { readdirSync, renameSync, readFileSync } = require('fs');
const { resolve } = require('path');
const fm = require('front-matter')

// Get path to image directory
const imageDirPath = resolve(__dirname, 'posts');

// Get an array of the files inside the folder
const files = readdirSync(imageDirPath);

// Loop through each file that was retrieved
files.forEach(file => {
  console.log(`Reading file:${file}`);
  if (file.includes('.md')) {
    const content = readFileSync(`${imageDirPath}/${file}`, 'utf-8')
    const data = fm(content);

    const shortDate = new Date(data.attributes.date).toISOString().split('T')[0];

    const dest = data.attributes.assetId.split('/').pop() || data.attributes.assetId;

    renameSync(`${imageDirPath}/${file}`, `${imageDirPath}/${shortDate}_${dest}.md`)
  } else {
    console.log(`Skiping file:${file}`)
  }
});
