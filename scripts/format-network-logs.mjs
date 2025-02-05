#!/usr/bin/env zx

import {chalk} from 'zx';
import fs from 'fs';
import path from 'path';

async function parseLogs(filePath = '') {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const entries = data.log.entries;

  const sortedEntries = entries.sort(
    (a, b) => new Date(a.startedDateTime) - new Date(b.startedDateTime),
  );

  let result =
    '# Exported network logs ' +
    new Date(sortedEntries[0].startedDateTime).toUTCString();
  let i = 0;

  for (const entry of sortedEntries) {
    const request = entry.request;
    const response = entry.response;

    let curlCmd = `curl -X ${request.method} '${request.url}'`;

    for (const header of request.headers) {
      curlCmd += ` -H '${header.name}: ${header.value}'`;
    }

    if (request.postData && request.postData.text) {
      curlCmd += ` --data '${request.postData.text}'`;
    }

    let responseJson = response.content.text
      ? JSON.parse(response.content.text)
      : {};

    result += `\n## №${++i}\n### Request:\n\`\`\`sh\n${curlCmd}\n\`\`\`\n ### Response:\n\`\`\`sh\n${JSON.stringify(
      responseJson,
      null,
      2,
    )}\n\`\`\`\n`;
  }

  fs.writeFileSync(path.resolve(filePath.replace('.json', '.md')), result);
}

const filePath = process.argv.slice(2)[1];
console.log('filePath', filePath);
if (!filePath || !filePath.endsWith('.json')) {
  console.error(chalk.red('Invalid log file'));
  process.exit(1);
}

parseLogs(filePath);
