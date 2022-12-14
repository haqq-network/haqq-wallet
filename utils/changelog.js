const {exec} = require('child_process');

const regex =
  /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test){1}(\([\w\-\.]+\))?(!)?: (([\w ])+([\s\S]*))$/gm;

const isPR = /\(#(\d{3,7})\)/;

new Promise(resolve => {
  exec(
    `git log ${process.argv[2]}..HEAD --pretty=format:"%H||%h||%s||%N"`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }

      const cache = {};
      const rows = stdout.split('\n').map(r => r.split('||'));

      for (const row of rows) {
        regex.lastIndex = 0;
        const msg = regex.exec(row[2]);
        if (msg) {
          if (!cache[msg[1]]) {
            cache[msg[1]] = {};
          }

          const key = msg[2] || 'unknown';

          if (!cache[msg[1]][key]) {
            cache[msg[1]][key] = [];
          }

          cache[msg[1]][key].push({
            raw: row,
            type: msg[1],
            scope: msg[2],
            message: msg[4]
              .split(/\s/)
              .map(word => {
                const w = isPR.exec(word);
                return {
                  type: w ? 'pr' : 'text',
                  value: w ? w[1] : word,
                };
              })
              .reduce(
                (memo, curr) => {
                  if (curr.type !== memo[memo.length - 1].type) {
                    return memo.concat(curr);
                  }

                  memo[memo.length - 1].value = `${
                    memo[memo.length - 1].value
                  } ${curr.value}`.trim();

                  return memo;
                },
                [{type: 'text', value: ''}],
              ),
          });
        }
      }

      let blocks = [];

      const viewed = [];

      if (cache.feat) {
        blocks = blocks.concat(formatBlock('feat', cache.feat));
        viewed.push('feat');
      }

      if (cache.fix) {
        blocks = blocks.concat(formatBlock('fix', cache.fix));
        viewed.push('fix');
      }

      if (cache.refactor) {
        blocks = blocks.concat(formatBlock('refactor', cache.refactor));
        viewed.push('refactor');
      }
      let otherBlocks = [];
      for (const type of Object.keys(cache)) {
        if (!viewed.includes(type)) {
          otherBlocks = otherBlocks.concat(formatBlock(type, cache[type]));
          viewed.push(type);
        }
      }

      if (otherBlocks.length) {
        blocks = blocks.concat(
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: blockNames.magic,
            },
          },
          otherBlocks,
        );
      }

      resolve({
        icon_emoji: ':iphone:',
        name: 'New build',
        blocks,
      });
    },
  );
}).then(result => {
  console.log(JSON.stringify(result));
});

const blockNames = {
  feat: '🏗️ New features',
  fix: '🩼 Fixes',
  refactor: '💅 Refactor',
  magic: '🪄 Other magic',
};

function formatBlock(type, variants = {}) {
  const block = [];

  for (const variant of Object.entries(variants)) {
    if (variant[1].length) {
      const title =
        variant[0] === 'unknown'
          ? 'Other'
          : variant[0].substring(1, variant[0].length - 1);

      const msg = variant[1]
        .map(v =>
          v.message.reduce((memo, curr) => {
            if (curr.type === 'text') {
              return `${memo} ${curr.value}`;
            }

            return `${memo} <https://github.com/haqq-network/haqq-wallet/pull/${curr.value}| #${curr.value}>`;
          }, '-'),
        )
        .join('\n');

      block.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${title}*\n${msg}`,
        },
      });
    }
  }

  if (block.length && blockNames[type]) {
    return [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: blockNames[type],
        },
      },
    ].concat(block);
  }

  return block;
}
