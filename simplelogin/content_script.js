// Put all the javascript code here, that you want to execute after page load.
document.addEventListener("mouseover", handleLoad);

function handleLoad(event) {
  browser.runtime.sendMessage({"ev":"asd"});
  document.removeEventListener("mouseover", handleLoad);
}
