const {
    shell
} = require('electron')
$(document).ready(function () {
    let tabCreationDelay = getSetting("tab_creation_delay");
    tabCreationDelay = tabCreationDelay * 1000;
    const tempArray = loadList("linksToOpen");
    const parsedList = JSON.parse(tempArray);
    const linksToOpen = [];
    for (const link of parsedList.list_links) {
        linksToOpen.push(link);
    }
    linksIterator(0, linksToOpen, tabCreationDelay);
    removeLinksToOpenList();
});

function linksIterator(i, strings, tabCreationDelay) {
    strings[i] = strings[i].trim();
    if (!(strings[i] === '') && !(strings[i] === "linksToOpen")) {
        let url = strings[i];
        linksIteratorProcessURL(url);
        i++;
        if (i - 1 < strings.length) {
            if (strings[i] == null || strings[i].trim() === '') {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('completed').style.display = 'block';
                window.location.replace("popup.html");
            }
            setTimeout(linksIterator, tabCreationDelay, i, strings, tabCreationDelay);
        }
    } else {
        i++;
        if (i >= strings.length) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('completed').style.display = 'block';
            window.location.replace("popup.html");
        }
        if (i < strings.length) {
            linksIterator(i, strings, tabCreationDelay);
        }
    }
}