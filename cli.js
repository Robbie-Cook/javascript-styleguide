#!/usr/bin/env node

var path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

/**
 * Get the current directory from
 * a given node argument
 *
 * @param {string} arg The node argument
 */
const getTargetDir = (arg) => {
  let array = arg.split('/');

  // Take the last element off
  array = array.slice(0, -1);

  return array.join('/');
};

/**
 * Function to install this package
 *
 * @param {string} srcDir The dir of the files for this package
 * @param {string} targetDir The directory to install to
 */
const install = async (srcDir, targetDir) => {
  const dir = await fs.promises.opendir(srcDir);

  // If directory doesn't exist, make it
  fs.promises.access(targetDir).catch(() => {
    fs.mkdirSync(targetDir);
  });

  for await (const item of dir) {
    const startFile = path.join(srcDir, item.name);
    const stat = await fs.promises.stat(startFile);

    // Check that the item is a file, otherwise skip for loop
    if (!stat.isFile()) {
      continue;
    }

    const targetFile = path.join(targetDir, item.name);

    console.log('Copying', startFile, 'to', targetFile);

    // No real reason to await these
    fs.promises.copyFile(startFile, targetFile);
  }

  // Install eslint
  exec(`npm install eslint --save`);

};

/**
 * Main section (entrypoint)
 */
if (process.argv && Array.isArray(process.argv) && process.argv.length > 1) {
  if (process.argv[2] === 'install') {
    console.log('Installing styleguide...');

    const srcDir = path.join(getTargetDir(process.argv[1]), '.');
    const targetDir = process.argv[3] || '.';

    install(srcDir, targetDir);
  }
}
