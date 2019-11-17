$(document).ready(function () {
    $('#closeModal').click(function () {
        window.location.replace("popup.html");
    });
    $('#openChangelog').click(function () {
        browser.tabs.create({
            active: true,
            'url': browser.extension.getURL('changelog.html')
        });
    });
});