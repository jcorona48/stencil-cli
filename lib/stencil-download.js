import async from 'async';
import inquirer from 'inquirer';
import stencilPushUtils from './stencil-push.utils.js';
import stencilPullUtils from './stencil-pull.utils.js';
import stencilDownloadUtil from './stencil-download.utils.js';

const utils = {};

utils.promptUserForTheme = async (options) => {
    if (options.themeId && options.themeId !== 'list') return options;
    const data = await stencilPushUtils.getThemes(options);
    const themeChoices = data.themes.map((theme) => {
        return {
            name: `${theme.name}`,
            value: theme.uuid,
        };
    });
    const selectedTheme = await utils.promptUserForSelection(
        'Select a theme to download:',
        themeChoices,
    );
    return { ...options, themeId: selectedTheme };
};

utils.promptUserForSelection = async (message, choices) => {
    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'selection',
            message,
            choices,
        },
    ]);
    return answer.selection;
};

function stencilDownload(options) {
    return async.waterfall([
        async.constant(options),
        stencilPushUtils.readStencilConfigFile,
        stencilPushUtils.getStoreHash,
        utils.promptUserForTheme,
        stencilPushUtils.getChannels,
        stencilPushUtils.promptUserForChannel,
        stencilPullUtils.getChannelActiveTheme,
        stencilDownloadUtil.startThemeDownloadJob,
        stencilPushUtils.pollForJobCompletion(({ download_url: downloadUrl }) => ({ downloadUrl })),
        stencilDownloadUtil.downloadThemeFiles,
    ]);
}
export default stencilDownload;
