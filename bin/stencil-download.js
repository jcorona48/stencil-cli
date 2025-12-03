#!/usr/bin/env node
import 'colors';
import inquirer from 'inquirer';
import program from '../lib/commander.js';
import { PACKAGE_INFO } from '../constants.js';
import stencilDownload from '../lib/stencil-download.js';
import { prepareCommand, printCliResultErrorAndExit } from '../lib/cliCommon.js';

program
    .version(PACKAGE_INFO.version)
    .option('-f, --file [filename]', 'specify the filename to download only')
    .option('-e, --exclude [exclude]', 'specify a directory to exclude from download')
    .option('-c, --channel_id [channelId]', 'specify the channel ID of the storefront', parseInt)
    .option('-o, --overwrite', 'overwrite local with remote files')
    .option('-t, --theme_id [themeId]', 'specify the theme ID to download');
const cliOptions = prepareCommand(program);
console.log('Downloading theme files from remote'.cyan);
const extraExclude = cliOptions.exclude ? [cliOptions.exclude] : [];
const options = {
    exclude: ['parsed', 'manifest.json', ...extraExclude],
    apiHost: cliOptions.host,
    channelId: cliOptions.channel_id,
    overwrite: cliOptions.overwrite,
    applyTheme: true,
    file: cliOptions.file,
    themeId: cliOptions.theme_id,
};
async function run(opts) {
    const overwriteType = opts.file ? opts.file : 'files';
    const promptAnswers = await inquirer.prompt([
        {
            message: `${'Warning'.yellow} -- overwrite local with remote ${overwriteType}?`,
            name: 'overwrite',
            type: 'confirm',
            when() {
                return !opts.overwrite;
            },
        },
    ]);
    const answers = {
        ...opts,
        ...promptAnswers,
    };
    if (!answers.overwrite) {
        console.log(`Request cancelled by user ${'No'.red}`);
        return;
    }
    console.log(`${'ok'.green} -- ${overwriteType} will be overwritten by the changes`);
    try {
        await stencilDownload(opts);
    } catch (err) {
        printCliResultErrorAndExit(err);
    }
    console.log(`${'ok'.green} -- Theme file(s) updated from remote`);
}
run(options);
