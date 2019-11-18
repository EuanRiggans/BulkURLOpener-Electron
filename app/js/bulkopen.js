const {
    shell
} = require('electron');

const version = "1.5.0"

$(() => {
    upgradeToJSONFormatting();
    createSettings();
    if (getSetting('auto_open_lists') === 1) {
        if (getSetting('custom_theme') === "fluentDesignBootstrap") {
            $('#savedListsOptions').after("<div class=\"form-check pl-0 checkbox\"><input class=\"form-check-input\" type=\"checkbox\" value=\"\" id=\"overrideAutoOpen\"><label class=\"form-check-label\" for=\"overrideAutoOpen\">&nbsp;Override Auto Open</label></div>");
        } else {
            $('#savedListsOptions').after("<label for=\"overrideAutoOpen\"><input type=\"checkbox\" id=\"overrideAutoOpen\">&nbsp;Override Auto Open</label>");
        }
        $(document).on('change', '#savedLists', function (e) {
            const $overrideSelector = $('#overrideAutoOpen');
            if (!$overrideSelector.is(':checked')) {
                if (getSetting('auto_open_lists') === 1) {
                    openSelectedList();
                    openTextAreaList();
                }
            }
        });
    }
    if (!getSetting("default_list_open") === undefined) {
        openListByID(getSetting("default_list_open"));
    }
    for (let i = 0; i < localStorage.length; i++) {
        const tempStorageArray = loadList(localStorage.key(i));
        try {
            const parsedList = JSON.parse(tempStorageArray);
            if (parsedList.object_description === "list_storage") {
                $('#savedLists').append('<option id="' + parsedList.list_id + '">' + parsedList.list_name + '</option>');
            }
        } catch (e) {

        }
    }
    document.getElementById("openButton").addEventListener('click', () => {
        openTextAreaList();
    });

    document.getElementById("clearList").addEventListener('click', () => {
        clearLinksList();
    });

    document.getElementById("createNewList").addEventListener('click', () => {
        openSaveNewListDialog();
    });

    document.getElementById("openList").addEventListener('click', () => {
        openSelectedList();
    });

    document.getElementById("editList").addEventListener('click', () => {
        editSelectedList();
    });

    document.getElementById("deleteList").addEventListener('click', () => {
        deleteList();
    });

    document.getElementById("openSettings").addEventListener('click', () => {
        openSettingsDialog();
    });

    document.getElementById("openHelp").addEventListener('click', () => {
        openHelpDialog();
    });

    document.getElementById("version").textContent = "- Version " + getCurrentVersion();
})

/**
 *  Will open all of the urls in the textarea
 */
function openTextAreaList() {
    openList(document.getElementById("list").value);
}
/**
 * Clears all of the urls from the textarea
 */
function clearLinksList() {
    const listTextArea = document.getElementById("list");
    listTextArea.value = "";
}

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
};

/**
 * Checks if a given string is a valid url
 * @param string    The string to check
 * @returns {boolean}   Whether string is valid url
 */
function isProbablyUrl(string) {
    let substr = string.substring(0, 4).toLowerCase();
    if (substr === 'ftp:' || substr === 'www.') {
        return true;
    }

    substr = string.substring(0, 5).toLowerCase();
    if (substr === 'http:') {
        return true;
    }

    substr = string.substring(0, 6).toLowerCase();
    if (substr === 'https:') {
        return true;
    }

    substr = string.substring(0, 7).toLowerCase();
    if (substr === 'chrome:') {
        return true;
    }

    return false;
}

/**
 * Handles the opening of lists
 * @param list  The list of urls to open
 */
function openList(list) {
    const strings = list.split(/\r\n|\r|\n/);
    let tabCreationDelay = getSetting("tab_creation_delay");
    if (!(tabCreationDelay > 0) || !(strings.length > 1)) {
        for (let i = 0; i < strings.length; i++) {
            if (strings[i].trim() === '') {
                strings.splice(i, 1);
                i--;
            }
        }
        tabCreationDelay = tabCreationDelay * 1000;
        linksIterator(0, strings, tabCreationDelay);
    } else {
        const linksToOpen = {
            object_description: "link_to_open",
            list_links: []
        };
        for (const link of strings) {
            linksToOpen.list_links.push(link);
        }
        localStorage.setItem("linksToOpen", JSON.stringify(linksToOpen));
        window.location.replace("openingtabs.html");
    }
}

/**
 * Recursive function to iterate through a list of urls to open
 * @param i                 Counter
 * @param strings           The urls to open
 * @param tabCreationDelay  The delay between opening a new url
 */
function linksIterator(i, strings, tabCreationDelay) {
    let ignoreURL = false;
    strings[i] = strings[i].trim();
    if (strings[i] === '') {
        return;
    }
    let url = strings[i];
    if (!isProbablyUrl(url) && getSetting('non_url_handler') === "searchForString") {
        url = encodeSearchQuery(url);
    } else if (!isProbablyUrl(url) && getSetting('non_url_handler') === "ignoreString") {
        ignoreURL = true;
    } else if (!isProbablyUrl(url) && getSetting('non_url_handler') === "attemptToExtractURL") {
        const extractedString = extractURLFromString(url);
        if (isProbablyUrl(extractedString)) {
            url = extractedString;
        } else {
            ignoreURL = true;
        }
    }
    if (!ignoreURL) {
        shell.openExternal(url);
    }
    i++;
    if (i < strings.length) {
        setTimeout(linksIterator, tabCreationDelay, i, strings, tabCreationDelay);
    }
}

/**
 * Opens the page to create a new list of urls
 */
function openSaveNewListDialog() {
    const lines = $('#list').val().split('\n');
    const tempList = {
        object_description: "temp_storage",
        list_links: []
    };
    for (let i = 0; i < lines.length; i++) {
        if (!(lines[i]) == "\n") {
            tempList.list_links.push(lines[i]);
        }

    }
    localStorage.setItem("temp", JSON.stringify(tempList));
    window.location.replace('newlist.html');
}

/**
 * Loads the urls for the selected list into the text area
 */
function openSelectedList() {
    if (getSelectedListID() === "-1") {
        alert("You need to select a list");
        return;
    }
    for (let i = 0; i < localStorage.length; i++) {
        const tempArray = loadList(localStorage.key(i));
        try {
            const parsedList = JSON.parse(tempArray);
            if (parsedList.list_id === parseInt(getSelectedListID())) {
                const listTextArea = document.getElementById("list");
                $('#list').val('');
                for (const link of parsedList.list_links) {
                    listTextArea.value += link + "\n";
                }
                listTextArea.select();
            }
        } catch (e) {

        }
    }
}

/**
 * Will load a given lists urls into the text area in the popup
 * @param id    The id of the list to get urls from
 */
function openListByID(id) {
    for (let i = 0; i < localStorage.length; i++) {
        const tempArray = loadList(localStorage.key(i));
        try {
            const parsedList = JSON.parse(tempArray);
            if (parsedList.list_id === parseInt(id)) {
                const listTextArea = document.getElementById("list");
                $('#list').val('');
                for (const link of parsedList.list_links) {
                    listTextArea.value += link + "\n";
                }
                listTextArea.select();
            }
        } catch (e) {

        }
    }
}

/**
 * Opens the settings page
 */
function openSettingsDialog() {
    window.location.replace('settings.html');
}

/**
 * Opens the help page
 */
function openHelpDialog() {
    window.location.replace('help.html');
}

/**
 * Opens the dialog to import user data from JSON format
 */
function openImportDialog() {
    window.location.replace('import.html');
}

/**
 * Opens the dialog to export user data as JSON
 */
function openExportDialog() {
    window.location.replace('export.html');
}

/**
 * Deletes a list
 */
function deleteList() {
    if (getSelectedListID() === "-1") {
        alert("You need to select a list");
        return;
    }
    if (confirm("Are you sure you wish to delete the list: " + getSelectedList())) {
        removeList(getSelectedListID());
    }
}

/**
 * Creates a window to edit the selected list
 */
function editSelectedList() {
    if (getSelectedListID() === "-1") {
        alert("You need to select a list");
        return;
    }
    window.location.replace('editlist.html?id=' + getSelectedListID() + "&name=" + getSelectedList());
}

/**
 *  Gets the selected list name
 * @returns {string | jQuery}   Selected list name
 */
function getSelectedList() {
    return $("#savedLists option:selected").html();
}

/**
 * Gets the currently selected list id
 * @returns {string | jQuery}   List id
 */
function getSelectedListID() {
    return $('select[id="savedLists"] option:selected').attr('id');
}

/**
 * Gets a specified setting for the user
 * @param setting   The setting to fetch
 * @returns {*} The setting value
 */
function getSetting(setting) {
    const settingSelected = setting.toLowerCase();
    for (let i = 0; i < localStorage.length; i++) {
        const tempStorage = loadList(localStorage.key(i));
        if (localStorage.key(i) === "settings") {
            const userSettings = JSON.parse(tempStorage);
            switch (settingSelected) {
                case "tab_creation_delay":
                    return userSettings.tab_creation_delay;
                case "auto_open_lists":
                    return userSettings.auto_open_lists;
                case "default_list_open":
                    return userSettings.default_list_open;
                case "custom_theme":
                    return userSettings.custom_theme;
                case "currently_opened_tabs_display":
                    return userSettings.currently_opened_tabs_display;
                case "non_url_handler":
                    return userSettings.non_url_handler;
                case "search_engine":
                    return userSettings.search_engine;
                default:
                    break;
            }
        }
    }
}

/**
 * Builds search engine query url from a string
 * @param {*} string 
 */
function encodeSearchQuery(string) {
    const setting = getSetting("search_engine");
    if (setting === "googleEngine") {
        string = 'http://www.google.com/search?q=' + encodeURI(string);
    } else if (setting === "duckduckgoEngine") {
        string = 'https://duckduckgo.com/?q=' + encodeURI(string);
    } else if (setting === "bingEngine") {
        string = 'https://www.bing.com/search?q=' + encodeURI(string);
    }
    return string;
}

/**
 * Attempts to extract a url from a string
 * @param {*} string 
 */
function extractURLFromString(string) {
    const urlRegex = /(https?:\/\/[^ ]*)/;
    let url;
    if (string.match(urlRegex)) {
        url = string.match(urlRegex)[1];
    } else {
        url = "noextractionsuccess";
    }
    return url;
}

/**
 * Gets the current version of the extension from the manifest
 * @returns {string}    The current version
 */
function getCurrentVersion() {
    return (version);
}

/**
 * Upgrades users from the old array based storage to the new JSON based storage
 */
function upgradeToJSONFormatting() {
    for (let i = 0; i < localStorage.length; i++) {
        const tempArray = loadList(localStorage.key(i));
        if (tempArray[0] === "listStorage") {
            const newList = {
                object_description: "list_storage",
                list_id: parseInt(tempArray[1]),
                list_name: tempArray[2],
                list_links: []
            };
            for (let i = 3; i < tempArray.length; i++) {
                newList.list_links.push(tempArray[i]);
            }
            localStorage.setItem(tempArray[1], JSON.stringify(newList));
        } else if (tempArray[0] === "settings") {
            const newSettings = {
                object_description: "user_settings",
                tab_creation_delay: parseInt(tempArray[1]),
                night_mode: 0,
                auto_open_lists: 0,
                default_list_open: -1,
                custom_theme: "defaultBoostrap"
            };
            localStorage.setItem("settings", JSON.stringify(newSettings));
        }
    }
}

/**
 *  Creates the settings json for the user if the do not have settings
 */
function createSettings() {
    let settingsFound = false;
    const settingsList = loadList("settings");
    if (!settingsList) {
        const newSettings = {
            object_description: "user_settings",
            tab_creation_delay: 1,
            night_mode: 0,
            auto_open_lists: 0,
            default_list_open: -1,
            custom_theme: "defaultBoostrap",
            currently_opened_tabs_display: "currentWindow"
        };
        localStorage.setItem("settings", JSON.stringify(newSettings));
    }
}

/**
 * Automatically converted lists from pre 1.1.0 into the new list format. Now for all versions 1.1.4 > lists are stored using json, so this list has been deprecated
 * @deprecated
 */
function convertOldURLLists() {
    for (let i = 0; i < localStorage.length; i++) {
        const tempArray = loadList(localStorage.key(i));
        const newListStorageArray = [];
        if (tempArray[0] === localStorage.key(i) && !(localStorage.key(i) === "settings") && !(localStorage.key(i) === "maxID")) {
            console.log("Need to convert: " + tempArray);
            localStorage.removeItem(localStorage.key(i));
            newListStorageArray.push("listStorage");
            newListStorageArray.push(getNextAvailableID());
            for (let x = 1; x < tempArray.length; x++) {
                newListStorageArray.push(tempArray[x]);
            }
            const listID = getNextAvailableID();
            localStorage.setItem(listID, newListStorageArray);
        }
    }
}