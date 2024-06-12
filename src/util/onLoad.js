function onLoad() {
  // Load and execute additional JavaScript files
  loadScript("./src/util/script.js", function () {
    // Call functions from script1.js if needed
    onPageLoad();
  });

  access_token = localStorage.getItem("access_token");
  if(access_token) {
    console.log('access token valid from onLoad')
    loadScript("./src/util/animation.js", function () {
      // Call functions from script2.js if needed
      changeCenter();
    });
  }
}

// Function to load external JavaScript files dynamically
function loadScript(url, callback) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  script.onload = callback;
  document.head.appendChild(script);
}