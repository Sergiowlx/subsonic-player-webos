#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');

const appinfo = require('../appinfo.json');
const majorVersion = appinfo.version.split('.')[0];
const outfile =
  process.argv[2] || `${appinfo.id}.v${majorVersion}.manifest.json`;
const ipkfile = `${appinfo.id}_${appinfo.version}_all.ipk`;
const ipkhash = crypto
  .createHash('sha256')
  .update(fs.readFileSync(ipkfile))
  .digest('hex');

fs.writeFileSync(
  outfile,
  JSON.stringify({
    appDescription: appinfo.appDescription,
    iconUri:
      'https://raw.githubusercontent.com/Sergiowlx/subsonic-player-webos/main/webos/assets/icon_160.png',
    id: appinfo.id,
    ipkHash: {
      sha256: ipkhash,
    },
    ipkUrl: ipkfile,
    rootRequired: false,
    sourceUrl: 'https://github.com/Sergiowlx/subsonic-player-webos',
    title: appinfo.title,
    type: appinfo.type,
    version: appinfo.version,
  }),
);
