(function() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {

    return;
  }
  window.hasRun = true;


  

  /**
   * Listen for messages from the background script.
  */
 
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "ankiize") {
      selection = window.getSelection();
      
      console.log(selection.toString());
      console.log(selection.rangeCount);
      for(let i = 0; i < selection.rangeCount; i++) {
        console.log(selection.getRangeAt(i).toString());
      }
      return Promise.resolve({chinese: selection.getRangeAt(0).toString() , pinyin: selection.getRangeAt(1).toString() , english:selection.getRangeAt(2).toString()}); 
    } else if (message.command === "reset") {
      console.log("Received a request to stop");
    }
  }
  );
  
})();
