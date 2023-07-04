function main() {
  btn = document.querySelector("#home > div.container > div.page.pc-max > div > div > button.btn-next");
  var position = btn.getBoundingClientRect();
  console.log(position);
  document.elementFromPoint(position.x, position.y).click();
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab.url.includes('chrome://')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: main
    });
  }
});