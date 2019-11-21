$(document).ready(function () {
    $('#closeModal').click(function () {
        window.location.replace("help.html");
    });
    document.getElementById('view-source').addEventListener('click', () => {
       shell.openExternal("https://github.com/EuanRiggans/BulkURLOpener");
    });
});
