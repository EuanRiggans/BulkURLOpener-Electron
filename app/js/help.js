if(typeof shell === "undefined") {
    const {
        shell
    } = require('electron');
}

$(document).ready(function () {
    document.getElementById('closeModal').addEventListener('click', () => {
        window.location.replace("popup.html");
    });
    document.getElementById('openChangelog').addEventListener('click', () => {
        window.location.replace("changelog.html");
    });
    document.getElementById('openGithub').addEventListener('click', () => {
        openGithub();
    });
    document.getElementById('openGithubBugs').addEventListener('click', () => {
        openElectronIssues();
    });
    document.getElementById('openGithubSuggestions').addEventListener('click', () => {
        openElectronIssues();
    });
});

function openGithub() {
    shell.openExternal("https://euan.link/github");
}

function openElectronIssues() {
    shell.openExternal("https://euan.link/buo-electron-issue");
}