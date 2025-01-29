#!/usr/bin/env zx
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import {$, spinner, chalk} from 'zx';

/**
 * This script is used to start the Metro server and run Detox end-to-end tests.
 *
 * Usage:
 * ```sh
 * yarn detox:test:dev [--ios|--android] [testFileNumber]
 * ```
 *
 * Options:
 * - `[--ios|--android]`: (Optional) Run the tests on the iOS/Android simulator.
 * - `testFileNumber`: (Optional) The prefix number of the test file to run.
 *
 * Examples:
 * - yarn detox:test:dev
 * - yarn detox:test:dev --ios
 * - yarn detox:test:dev --android 2
 */
let metroProcess;
let detoxProcess;

const cleanup = async () => {
  console.log(
    chalk.bgWhite(
      chalk.bold(chalk.magenta('='.repeat(process.stdout.columns))),
    ),
  );
  console.log(chalk.yellow('Cleaning up processes...\n'));
  try {
    if (metroProcess?.pid) {
      await $`kill -9 ${metroProcess.pid}`;
    }
    if (detoxProcess?.pid) {
      await $`kill -15 ${detoxProcess.pid}`;
    }
    await $`lsof -ti tcp:8081 | xargs kill -9 || true`;
  } catch {}
};

const startMetroServer = async () => {
  await spinner('🚀 Starting Metro server', async () => {
    await cleanup();

    metroProcess = $`FOR_DETOX=true NODE_ENV=development npx react-native start --reset-cache`;

    metroProcess.stdout.on('data', data => {
      console.log(
        chalk.bgWhite(chalk.blue(chalk.bold('[Metro]'))) +
          '  ' +
          data.toString(),
      );
    });
  });
  return metroProcess;
};

const waitForMetroReady = async () => {
  await spinner('⏳ Waiting for Metro', async () => {
    await $`until curl -sf http://localhost:8081/status > /dev/null; do sleep 1; done`;
  });
};

const chooseDetoxConfiguration = async () => {
  const args = process.argv.slice(2);
  if (args.includes('--ios')) {
    return 'ios.sim.debug';
  }
  if (args.includes('--android')) {
    return 'android.sim.debug';
  }

  const {selectedConfiguration} = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedConfiguration',
      message: 'Choose platform:',
      choices: [
        {name: 'iOS (ios.sim.debug)', value: 'ios.sim.debug'},
        {name: 'Android (android.sim.debug)', value: 'android.sim.debug'},
      ],
    },
  ]);
  return selectedConfiguration;
};

const chooseE2ETestFile = async () => {
  const e2eDir = path.join(__dirname, '../e2e');
  const files = fs
    .readdirSync(e2eDir)
    .filter(file => file.endsWith('.test.ts'))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const args = process.argv.slice(2);
  const testFileIndex = args.findLast(arg => !isNaN(parseInt(arg, 10)));

  if (testFileIndex !== undefined) {
    const targetFile = files.find(file => file.startsWith(`${testFileIndex}_`));
    if (targetFile) {
      return targetFile;
    }
  }

  const {selectedTestFile} = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedTestFile',
      message: 'Choose test file:',
      choices: files.map(file => ({name: file, value: file})),
    },
  ]);
  return selectedTestFile;
};

const runDetoxTests = async (configuration, testFile) => {
  await spinner('🧪 Running Detox tests', async () => {
    detoxProcess = $`detox test --configuration ${configuration} ${testFile}`;

    detoxProcess.stdout.on('data', data => {
      console.log(
        chalk.bgWhite(chalk.green(chalk.bold('[Detox]'))) +
          '  ' +
          data.toString(),
      );
    });

    detoxProcess.stderr.on('data', data => {
      console.log(
        chalk.bgWhite(chalk.green(chalk.bold('[Detox]'))) +
          '  ' +
          data.toString(),
      );
    });

    await detoxProcess;
  });
};

const main = async () => {
  if (process.argv.includes('-h') || process.argv.includes('--help')) {
    console.log(
      chalk.bold(' Description:\n'),
      chalk.yellow(
        ' This script is used to start the Metro server and run Detox end-to-end tests.',
      ),
      chalk.bold('\n\n Usage:\n'),
      chalk.yellow(' yarn detox:test:dev [--ios|--android] [testFileNumber]'),
      '\n',
      chalk.bold('\n Options:\n'),
      chalk.yellow(
        ' - [--ios|--android]: (Optional) Run the tests on the iOS/Android simulator.',
      ),
      '\n',
      chalk.yellow(
        ' - testFileNumber: (Optional) The prefix number of the test file to run.',
      ),
      '\n',
      chalk.bold('\n Examples:\n'),
      chalk.yellow(' yarn detox:test:dev'),
      '\n',
      chalk.yellow(' yarn detox:test:dev --ios'),
      '\n',
      chalk.yellow(' yarn detox:test:dev --android 2'),
    );
    process.exit(0);
  }
  const configuration = await chooseDetoxConfiguration();
  const testFile = await chooseE2ETestFile();

  startMetroServer();
  await waitForMetroReady();

  await runDetoxTests(configuration, testFile);
  await cleanup();
  process.exit(0);
};

process.on('SIGINT', async () => {
  if (process.argv.includes('-h') || process.argv.includes('--help')) {
    process.exit(0);
  }
  console.log(chalk.yellow('\nReceived termination signal'));
  await cleanup();
});

await main();
