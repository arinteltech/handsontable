/**
 * Translate the custom workspace delegation scripts to their native npm counterparts.
 */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  displayErrorMessage,
  spawnProcess
} from './utils/index.mjs';

const argv = yargs(hideBin(process.argv))
  .boolean('if-present')
  .array('exclude')
  .alias('exclude', 'e')
  .argv;
const modifier = process.env.COMMAND_ENV;

if (argv._.length === 0) {
  displayErrorMessage(`No arguments were provided for the 'npm run ${modifier}' command.`);

  process.exit(1);
}

(async() => {
  const prependWithScope = (packageName) => {
    if (packageName !== 'handsontable' && packageName !== 'examples') {
      return `@handsontable/${packageName}`;
    }

    return packageName;
  };

  switch (modifier) {
    case 'in': {
      const [project, command] = argv._;

      await spawnProcess(
        `npm run ${command} --workspace=${prependWithScope(project)}${argv.ifPresent ? ' --if-present' : ''}`
      );

      break;
    }
    case 'all': {
      const [command] = argv._;
      let workspacesCommandList = '-w handsontable -w @handsontable/angular -w @handsontable/react -w' +
        ' @handsontable/vue -w examples';

      if (argv.exclude) {
        argv.exclude.forEach((packageName) => {
          const packageNameWithScope = prependWithScope(packageName);
          const packageArgument = `-w ${packageNameWithScope}`;

          if (workspacesCommandList.includes(packageArgument)) {
            workspacesCommandList = workspacesCommandList.replace(packageArgument, '').trim();
          }
        });
      }

      await spawnProcess(
        `npm run ${command} ${workspacesCommandList}${argv.ifPresent ? ' --if-present' : ''}`
      );

      break;
    }
    default:
  }
})();
