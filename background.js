chrome.storage.local.get(['disabled'], function(data) {
    if (!!data.disabled) {
	chrome.browserAction.setIcon({path: './icon_disabled.png'});
    } else {
	chrome.browserAction.setIcon({path: './icon.png'});
    }
});
