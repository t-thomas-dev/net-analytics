//    Version created: 2024/7   1.1.0

//ID
let sessionId = self.crypto.randomUUID();
  //debug
  // console.log(`sessionId:${sessionId}`);
let clientIpv6;
let clientIpv4;
let botDetection;
let isBot;
var fpId;
let clId;
let userData;

//clientIp
fetch('https://api64.ipify.org/?format=json')
  .then(response => response.json())
  .then(data => {
    clientIpv6 = data['ip'];
    //debug
    // console.log(clientIpv6);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
  fetch('https://api.ipify.org/?format=json')
  .then(response => response.json())
  .then(data => {
    clientIpv4 = data['ip'];
    //debug
    // console.log(clientIpv4);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

//botd.js
// Initialize an agent at application startup.
botdPromise = import('https://cdn.jsdelivr.net/gh/t-thomas-dev/net-analytics/botd.js').then((Botd) =>
  Botd.load()
);
// Get the bot detection result when you need it.
botdPromise
  .then((botd) => botd.detect())
  .then((result) => {
    botDetection = result;
    //debug
    // console.log(botDetection)
  })
  .catch((error) => console.error(error));
let checkBotRegex = /^true$/i;
isBot = checkBotRegex.test(botDetection);

document.addEventListener('readystatechange', event => {
  if (event.target.readyState === "complete") {
    //finish botd.js
    //debug
    // console.log("Bot:" + isBot);
    //fp.js
    const fpjsScriptWrapper = document.createElement('script');
      fpjsScriptWrapper.innerHTML = 'var fpId; fpPromise = import(`https://cdn.jsdelivr.net/gh/t-thomas-dev/net-analytics/fp.js`) .then(FingerprintJS => FingerprintJS.load()); fpPromise.then(fp => fp.get()) .then(result => {fpId = result.visitorId; /* debug *//*console.log("fpId:" + fpId)*/})';
    document.body.appendChild(fpjsScriptWrapper)
    
    //cl.js
    const ClientJS = window.ClientJS;
    const client = new ClientJS();
    clId = client.getFingerprint();
    //debug
    // console.log("clId:" + clId);
  }
});

//MAIN
function headScript(url) {
  let script = document.createElement('script');
  script.src = url;
  document.head.insertBefore(script, document.head.firstElementChild);
}
//Project dependant
headScript('https://cdn.jsdelivr.net/gh/t-thomas-dev/net-analytics/nr.js')
headScript('https://cdn.jsdelivr.net/gh/t-thomas-dev/net-analytics/cl.js')

//cookie functions
function hasCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(`${name}=`) === 0) {
        return true;
    }
  }
  return false;
}

function createCookie(name, value, days) {
  var expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "";
}
function deleteCookie(cookieName) {
  document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function createTempCookie(name, value) {
  document.cookie = name + "=" + value + ";";
}

//telemetry
let screenWidth = window.screen.width;
let screenHeight = window.screen.height;
let userAgent = encodeURIComponent(window.navigator.userAgent);
let languages = encodeURIComponent(navigator.languages);
let webURL = "https://www.t-dev.pages.dev/analytics";
try {
  webURL= encodeURIComponent(window?.top?.location);
} catch (e) {console.error(e)}
let frameURL = encodeURIComponent(window.location.href);
let referrer = document.referrer;

document.addEventListener('readystatechange', event => {
  if (event.target.readyState === "complete") {
    setTimeout(function(){
      createTempCookie("sessionId", sessionId)
      if (!hasCookie("bot")) {
        createCookie("bot", `${isBot}`, 720)
      }
      if (!hasCookie("clId")) {
        createCookie("clId", clId, 720)
      }
      if (!hasCookie("clientIpv6")) {
        createCookie("clientIpv6", `${clientIpv6}`, 720)
      }
      if (!hasCookie("clientIpv4")) {
        createCookie("clientIpv4", `${clientIpv4}`, 720)
      }
      let checkInterval = setInterval(() => {
        if (typeof fpId !== 'undefined') {
          clearInterval(checkInterval);
          //do stuff after fpId is defined
          createCookie("fpId", fpId, 720)
          //userData nr data loggging
          userData = `sessionId:${sessionId}--bot:${isBot}--fpId:${String(fpId)}--clId:${String(clId)}--clientIpv6:${clientIpv6}--clientIpv4:${clientIpv4}--userAgent:${decodeURIComponent(userAgent)}`;
          //debug
          // console.log(userData);
          //newrelic.setUserId(`fpId-${fpId}--clId-${clId}`);
          newrelic.log(`${userData} ----TELEMETRY---- languages:${decodeURIComponent(languages)}--screen-width:${screenWidth}--screen-height:${screenHeight}--current-url:${decodeURIComponent(frameURL)}--web-url:${decodeURIComponent(webURL)}--referrer:${decodeURIComponent(referrer)}`);
        }
      }, 75);
    }, 500);
  }
});

//delete sessionId on unload
const beforeUnloadHandler = (event) => {
  deleteCookie('sessionId');
};
window.addEventListener("beforeunload", beforeUnloadHandler);

// function inFrame() {
//     try {
//         return window.self !== window.top;
//     } catch (e) {
//         return true;
//     }
// }
// console.log("inFrame", inFrame());

//stop inspect and right click
document.onkeydown = function(e) {
    if(e.keyCode == 123) {
     return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)){
     return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)){
     return false;
    }
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)){
     return false;
    }
}
document.addEventListener('contextmenu', event => {
    event.preventDefault();
});

function loadGoogleAnalytics(id) {
    // Google tag (gtag.js)
    var firstScript= document.getElementsByTagName("script")[0];
    newScript= document.createElement("script");
    newScript.async= "";
    newScript.src= "https://www.googletagmanager.com/gtag/js?id="+ id;
    firstScript.parentNode.insertBefore(newScript, firstScript);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', id);
    gtag('config', id, {
      'user_id': userData
    });
}

window.addEventListener("load", function() {
    if (isBot===true) {
      console.warn('Bot:true');
      //Project dependant
      loadGoogleAnalytics("G-F00706M3ZK");
    } else {
      //Project dependant
      loadGoogleAnalytics("G-F00706M3ZK");
    }
});

//Project dependant
(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "nh7tf1nkst");
