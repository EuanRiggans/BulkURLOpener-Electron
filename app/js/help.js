const {
    shell
} = require('electron');

$(document).ready(function () {
    $('#closeModal').click(function () {
        window.location.replace("popup.html");
    });
    $('#openChangelog').click(function () {
        window.location.replace("changelog.html");
    });
    $('#openGithub').click(function () {
        openGithub();
    });
    $('#openGithubBugs').click(function () {
        openElectronIssues();
    });
    $('#openGithubSuggestions').click(function () {
        openElectronIssues();
    });
});

function openGithub() {
    shell.openExternal('https://euan.link/github');
}

function openElectronIssues() {
    shell.openExternal('https://euan.link/buo-electron-issue');
}