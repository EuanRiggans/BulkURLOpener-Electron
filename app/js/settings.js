$(document).ready(function () {
    const $tabCreationDelaySelector = $('#tabCreationDelay');
    const $nightModeSelector = $('#nightMode');
    const $autoOpenSelector = $('#autoOpenLists');
    let selectedListID = -1;
    let selectedTheme = "defaultBootstrap";
    let currentlyOpenedTabsSetting = "allOpenedTabs";
    let nonURLHandlerSetting = "searchForString";
    let searchEngineSetting = "googleEngine";
    $tabCreationDelaySelector.val(0);
    let settingsObjPresent = false;
    for (let i = 0; i < localStorage.length; i++) {
        const tempArray = loadList(localStorage.key(i));
        if (localStorage.key(i) === "settings") {
            settingsObjPresent = true;
            const userSettings = JSON.parse(tempArray);
            if ($tabCreationDelaySelector.val() === undefined) {
                $tabCreationDelaySelector.val(0);
            } else {
                $tabCreationDelaySelector.val(userSettings.tab_creation_delay);
            }

            if (userSettings.custom_theme === "fluentDesignBootstrap") {
                if (userSettings.night_mode === 1) {
                    $('#nightModeGroup').append('<div class="form-check pl-0 checkbox"><input class="form-check-input" type="checkbox" value="" id="nightMode" checked><label class="form-check-label" for="nightMode">&nbsp; Enable night theme</label></div>');
                } else {
                    $('#nightModeGroup').append('<div class="form-check pl-0 checkbox"><input class="form-check-input" type="checkbox" value="" id="nightMode"><label class="form-check-label" for="nightMode">&nbsp; Enable night theme</label></div>');
                }

                if (userSettings.auto_open_lists === 1) {
                    $('#autoOpenListsGroup').append('<div class="form-check pl-0 checkbox"><input class="form-check-input" type="checkbox" value="" id="autoOpenLists" checked><label class="form-check-label" for="autoOpenLists">&nbsp; Automatically open lists<a id="autoOpenListsTooltip" data-toggle="tooltip" data-placement="top" title="When you select a link list from the dropdown, it will be automatically opened.">(?)</a><b>(Experimental feature)</b></label></div>')
                } else {
                    $('#autoOpenListsGroup').append('<div class="form-check pl-0 checkbox"><input class="form-check-input" type="checkbox" value="" id="autoOpenLists"><label class="form-check-label" for="autoOpenLists">&nbsp; Automatically open lists<a id="autoOpenListsTooltip" data-toggle="tooltip" data-placement="top" title="When you select a link list from the dropdown, it will be automatically opened.">(?)</a><b>(Experimental feature)</b></label></div>')
                }
            } else {
                if (userSettings.night_mode === 1) {
                    $('#nightModeGroup').append('<div class="checkbox"><label><input type="checkbox" id="nightMode" checked>&nbsp; Enable night theme</label></div>');
                } else {
                    $('#nightModeGroup').append('<div class="checkbox"><label><input type="checkbox" id="nightMode">&nbsp; Enable night theme</label></div>');
                }

                if (userSettings.auto_open_lists === 1) {
                    $('#autoOpenListsGroup').append('<div class="checkbox"><label><input type="checkbox" id="autoOpenLists" checked>&nbsp; Automatically open lists <a id="autoOpenListsTooltip" data-toggle="tooltip" data-placement="top" title="When you select a link list from the dropdown, it will be automatically opened.">(?)</a><b> (Experimental feature)</b></label></div>');
                } else {
                    $('#autoOpenListsGroup').append('<div class="checkbox"><label><input type="checkbox" id="autoOpenLists">&nbsp; Automatically open lists <a id="autoOpenListsTooltip" data-toggle="tooltip" data-placement="top" title="When you select a link list from the dropdown, it will be automatically opened.">(?)</a><b> (Experimental feature)</b></label></div>');
                }
            }

            if (userSettings.default_list_open !== -1) {
                selectedListID = userSettings.default_list_open;
            }
        }
    }
    if (!settingsObjPresent) {
        $('#nightModeGroup').append('<div class="checkbox"><label><input type="checkbox" id="nightMode">&nbsp; Enable night theme</label></div>');
        $('#autoOpenListsGroup').append('<div class="checkbox"><label><input type="checkbox" id="autoOpenLists">&nbsp; Automatically open lists <a id="autoOpenListsTooltip" data-toggle="tooltip" data-placement="top" title="When you select a link list from the dropdown, it will be automatically opened.">(?)</a><b> (Experimental feature)</b></label></div>');
    }
    for (let i = 0; i < localStorage.length; i++) {
        const tempStorageArray = loadList(localStorage.key(i));
        try {
            const parsedList = JSON.parse(tempStorageArray);
            if (parsedList.object_description === "list_storage") {
                $('#defaultList').append('<option id="' + parsedList.list_id + '">' + parsedList.list_name + '</option>');
            }
            if (parsedList.object_description === "user_settings") {
                currentlyOpenedTabsSetting = parsedList.currently_opened_tabs_display;
                selectedTheme = parsedList.custom_theme;
                nonURLHandlerSetting = parsedList.non_url_handler;
                searchEngineSetting = parsedList.search_engine;
            }
        } catch (e) {
            console.log(e);
        }
    }
    $("#defaultList option[id=" + selectedListID + "]").prop('selected', true);
    $("#customTheme option[id=" + selectedTheme + "]").prop('selected', true);
    $("#currentlyOpenedSetting option[id=" + currentlyOpenedTabsSetting + "]").prop('selected', true);
    $("#nonURLHandlerSetting option[id=" + nonURLHandlerSetting + "]").prop('selected', true);
    $("#selectedSearchEngineSetting option[id=" + searchEngineSetting + "]").prop('selected', true);
    document.getElementById("closeModal").addEventListener('click', (e) => {
        window.location.replace("popup.html");
    });
    document.getElementById("saveSettings").addEventListener('click', (e) => {
        initSettingsSave();
    });
    document.getElementById("nightMode").addEventListener('change', (e) => {
        const isChecked = document.getElementById("nightMode").checked;
        if (isChecked) {
            if (!(document.getElementById("styles-dark"))) {
                const head = document.getElementsByTagName('head')[0];
                const nightModeStylesheet = document.createElement('link');
                nightModeStylesheet.href = "css/style-dark.css";
                nightModeStylesheet.rel = "stylesheet";
                nightModeStylesheet.id = "styles-dark";
                head.appendChild(nightModeStylesheet);
            }
        } else {
            if (document.getElementById("styles-dark")) {
                document.getElementById("styles-dark").remove();
            }
        }
    })
});

function isNumber(varToTest) {
    return !isNaN(parseFloat(varToTest))
}

function initSettingsSave() {
    const $tabCeationDelaySelector = $('#tabCreationDelay');
    const $nightModeSelector = $('#nightMode');
    const $autoOpenListsSelector = $('#autoOpenLists');
    const tabCreationDelay = parseInt($tabCeationDelaySelector.val());
    let nightMode = 0;
    let autoOpenLists = 0;
    const defaultList = getSelectedListID();
    const theme = getSelectedTheme();
    const currentlyOpenedTabsSetting = getCurrentlyOpenedTabsSetting();
    const nonURLHandlerSetting = getNonURLHandlerSetting();
    const searchEngineSetting = getSearchEngineSetting();
    if ($nightModeSelector.is(":checked")) {
        nightMode = 1;
    }
    if ($autoOpenListsSelector.is(":checked")) {
        autoOpenLists = 1;
    }
    if (!(isNumber(tabCreationDelay)) || tabCreationDelay < 0) {
        alert("Your tab creation delay must be zero or a positive number!");
        return;
    }
    const userSettings = {
        object_description: "user_settings",
        tab_creation_delay: 0,
        night_mode: 0,
        auto_open_lists: 0,
        default_list_open: -1,
        custom_theme: "defaultBoostrap",
        currently_opened_tabs_display: "currentWindow",
        non_url_handler: "searchForString",
        search_engine: "googleEngine"
    };
    userSettings.tab_creation_delay = tabCreationDelay;
    userSettings.night_mode = nightMode;
    userSettings.auto_open_lists = autoOpenLists;
    userSettings.default_list_open = parseInt(defaultList);
    userSettings.custom_theme = theme;
    userSettings.currently_opened_tabs_display = currentlyOpenedTabsSetting;
    userSettings.non_url_handler = nonURLHandlerSetting;
    userSettings.search_engine = searchEngineSetting;
    saveSettings(userSettings);
}

function getSelectedList() {
    return $("#defaultList option:selected").html();
}

function getSelectedListID() {
    return $('select[id="defaultList"] option:selected').attr('id');
}

function getSelectedTheme() {
    return $('select[id="customTheme"] option:selected').attr('id');
}

function getCurrentlyOpenedTabsSetting() {
    return $('select[id="currentlyOpenedSetting"] option:selected').attr('id');
}

function getNonURLHandlerSetting() {
    return $('select[id="nonURLHandlerSetting"] option:selected').attr('id');
}

function getSearchEngineSetting() {
    return $('select[id="selectedSearchEngineSetting"] option:selected').attr('id');
}