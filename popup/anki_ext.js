
/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {
    function invoke(action, version, params={}) {
      return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.addEventListener('error', () => reject('failed to issue request'));
          xhr.addEventListener('load', () => {
              try {
                  const response = JSON.parse(xhr.responseText);
                  if (Object.getOwnPropertyNames(response).length != 2) {
                      throw 'response has an unexpected number of fields';
                  }
                  if (!response.hasOwnProperty('error')) {
                      throw 'response is missing required error field';
                  }
                  if (!response.hasOwnProperty('result')) {
                      throw 'response is missing required result field';
                  }
                  if (response.error) {
                      throw response.error;
                  }
                  resolve(response.result);
              } catch (e) {
                  reject(e);
              }
          });
  
          xhr.open('POST', 'http://localhost:8765');
          xhr.send(JSON.stringify({action, version, params}));
      });
  }


    function ankiize(tabs) {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "ankiize"
        }).then(response => {
          console.log(response);
          
         
        var params = {
          "note":{
            "deckName":"ChinesePodDeck",
            "modelName":"Basic",
            "fields":
            {
              "Front": response.chinese,
              "Back": response.english,
              "Pinyin": response.pinyin
            },
            "options": {
              "allowDuplicate": false,
              "duplicateScope": "deck",
              "duplicateScopeOptions": {
                  "deckName": "ChinesePodDeck",
                  "checkChildren": false
              }
            }

          }
        }

        invoke('addNote',6,params);
    


        });
    }
    
    /**
     * Remove the page-hiding CSS from the active tab,
     * send a "reset" message to the content script in the active tab.
     */
    
    function reset(tabs) {
      
      browser.tabs.removeCSS({code: hidePage}).then(() => {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "reset",
        });
      });
    }
    
    /**
     * Just log the error to the console.
     */
    
    function reportError(error) {
      console.error(`Could not ankiize: ${error}`);
    }
    
    /**
     * Get the active tab,
     * then call "ankiize()" or "reset()" as appropriate.
     */
  
    if (e.target.classList.contains("anki")) {    
      console.log("Attempting to get selection from page");
      browser.tabs.query({active: true, currentWindow: true})
        .then(ankiize)
        .catch(reportError);
      
    }
    else if (e.target.classList.contains("reset")) {
      console.log("Reset");
      
      browser.tabs.query({active: true, currentWindow: true})
        .then(reset)
        .catch(reportError);
        
    }
    
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */

function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute ankify content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */

browser.tabs.executeScript({file: "/content_scripts/ankify.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);
