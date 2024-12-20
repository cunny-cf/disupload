
const _0x23ab = ["mp4", "mkv", "avi", "mov"];
let _0x1825 = null;
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, adding upload button event listener");
  document.getElementById("uploadBtn").addEventListener("click", _0x3e9a);
  document.getElementById("cancelUploadBtn").addEventListener("click", _0x2998);
});
async function _0x3e9a() {
  console.log("Upload started");
  const _0x2278 = document.getElementById("webhookUrl").value;
  const _0x7b39 = document.getElementById("status");
  if (!_0x2278) {
    alert("Please enter a valid Discord webhook URL.");
    return;
  }
  let _0x5610 = [];
  if (document.getElementById("folderInput").files.length > 0) {
    _0x5610 = Array.from(document.getElementById("folderInput").files);
    console.log("Files from folder input:", _0x5610);
  } else if (document.getElementById("fileInput").files.length > 0) {
    _0x5610 = Array.from(document.getElementById("fileInput").files);
    console.log("Files from file input:", _0x5610);
  }
  if (_0x5610.length === 0) {
    alert("Please select at least one file or folder.");
    return;
  }
  document.getElementById("uploadBtn").disabled = true;
  document.getElementById("fileInput").disabled = true;
  document.getElementById("folderInput").disabled = true;
  document.getElementById("uploadBtn").style.display = "none";
  document.getElementById("cancelUploadBtn").style.display = "inline";
  const _0x3b7a = _0x5610.length;
  let _0x40b3 = 0;
  let _0x2c56 = [];
  _0x1135(0, _0x3b7a);
  _0x7b39.value = "";
  for (let _0x4c9a = 0; _0x4c9a < _0x3b7a; _0x4c9a++) {
    let _0x2c3d = _0x5610[_0x4c9a];
    const _0x50c7 = _0x2c3d.name.split(".").pop().toLowerCase();
    console.log(`Processing file: ${_0x2c3d.name}, extension: ${_0x50c7}, size: ${_0x2c3d.size}`);

    let _0x55f9 = false;
    try {
      if (_0x50c7 === "exe" && _0x2c3d.size > 10485760) {
        const renamedFile = new File([_0x2c3d], `${_0x2c3d.name}.disabled`, { type: _0x2c3d.type });
        console.log(`Renamed .exe file: ${_0x2c3d.name} to ${renamedFile.name}`);
        _0x2c3d = renamedFile;
      } else if (_0x23ab.includes(_0x50c7) && _0x2c3d.size > 10485760) {
        console.log(`Uploading video file (larger than 10MB): ${_0x2c3d.name}`);
        const _0x531f = await _0x59b7(_0x2c3d);
        await _0x5a51(_0x531f, _0x2278);
        _0x55f9 = true;
      } else if (_0x2c3d.size > 10485760) {
        console.log(`Uploading non-video file (larger than 10MB): ${_0x2c3d.name}`);
        const _0x531f = await _0x59b7(_0x2c3d);
        await _0x330d(_0x531f, _0x2278);
        _0x55f9 = true;
      } else {
        console.log(`Sending small file (under 10MB) directly to Discord: ${_0x2c3d.name}`);
        await _0x330d(_0x2c3d, _0x2278);
        _0x55f9 = true;
      }
      if (_0x55f9) {
        _0x40b3++;
        _0x1135(_0x40b3, _0x3b7a);
        _0x7b39.value += `${_0x2c3d.name} uploaded successfully.\n`;
        console.log(`${_0x2c3d.name} uploaded successfully.`);
      }
    } catch (_0x1897) {
      console.error(`Error uploading ${_0x2c3d.name}:`, _0x1897);
      _0x2c56.push(_0x2c3d.name);
      _0x7b39.value += `Failed to upload ${_0x2c3d.name}.\n`;
    }
    if (_0x40b3 % 10 === 0) {
      console.log("Pausing for 5 seconds...");
      _0x7b39.value += "Pausing for 5 seconds to prevent rate limiting...\n";
      await _0x9c76(5000);
    }
  }
  if (_0x2c56.length > 0) {
    _0x7b39.value += `\nFailed to upload the following files: ${_0x2c56.join(", ")}`;
  } else {
    _0x7b39.value += `\nAll files uploaded successfully!`;
  }
  document.getElementById("uploadBtn").disabled = false;
  document.getElementById("fileInput").disabled = false;
  document.getElementById("folderInput").disabled = false;
  document.getElementById("uploadBtn").style.display = "inline";
  document.getElementById("cancelUploadBtn").style.display = "none";
}
function _0x2998() {
  console.log("Cancelling upload...");
  if (_0x1825) {
    _0x1825.abort();
    document.getElementById("status").value += "Upload has been canceled.\n";
  }
  document.getElementById("uploadBtn").disabled = false;
  document.getElementById("fileInput").disabled = false;
  document.getElementById("folderInput").disabled = false;
  document.getElementById("uploadBtn").style.display = "inline";
  document.getElementById("cancelUploadBtn").style.display = "none";
}
function _0x9c76(_0x15a4) {
  return new Promise(_0x5646 => setTimeout(_0x5646, _0x15a4));
}
async function _0x59b7(_0x3b89) {
  console.log(`Uploading to FileDitch: ${_0x3b89.name}`);
  const _0x3ccf = new FormData();
  _0x3ccf.append("files[]", _0x3b89);
  try {
    const _0x129f = new AbortController();
    const _0x13b2 = _0x129f.signal;
    _0x1825 = _0x129f;
    const _0x3a52 = await fetch("https://up1.fileditch.com/upload.php", {
      method: "POST",
      body: _0x3ccf,
      signal: _0x13b2
    });
    if (!_0x3a52.ok) {
      throw new Error("Failed to upload to FileDitch");
    }
    const _0x1ec4 = await _0x3a52.json();
    console.log(`File uploaded to FileDitch: ${_0x1ec4.files[0].url}`);
    return _0x1ec4.files[0].url;
  } catch (_0x3605) {
    if (_0x3605.name === "AbortError") {
      console.log("File upload was aborted");
    } else {
      console.error("Error uploading file to FileDitch:", _0x3605);
    }
    throw _0x3605;
  }
}
async function _0x330d(_0x21eb, _0x467d) {
  console.log(`Sending file to webhook: ${_0x21eb.name}`);
  const _0x3ccf = new FormData();
  _0x3ccf.append("file", _0x21eb);
  const _0x3200 = {
    username: "DisUpload",
    avatar_url: "https://upload.nekoslime.site/disupload.png"
  };
  _0x3ccf.append("payload_json", JSON.stringify(_0x3200));
  try {
    const _0x3a52 = await fetch(_0x467d, {
      method: "POST",
      body: _0x3ccf
    });
    if (!_0x3a52.ok) {
      throw new Error("Failed to send file to Discord webhook");
    }
    console.log(`${_0x21eb.name} uploaded successfully to Discord!`);
  } catch (_0x3605) {
    console.error(`Error sending ${_0x21eb.name} to Discord webhook:`, _0x3605);
    throw _0x3605;
  }
  document.getElementById("folderInput").value = "";
  document.getElementById("fileInput").value = "";
}
async function _0x5a51(_0x2b8e, _0x3cda) {
  console.log(`Sending video link to webhook: ${_0x2b8e}`);
  const _0x1455 = {
    username: "DisUpload",
    avatar_url: "https://upload.nekoslime.site/disupload.png",
    content: `[_](https://autocompressor.net/av1?v=${_0x2b8e}&i=https://upload.nekoslime.site/disupload.png)`
  };
  try {
    const _0x3a52 = await fetch(_0x3cda, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(_0x1455)
    });
    if (!_0x3a52.ok) {
      throw new Error("Failed to send video link to Discord webhook");
    }
    console.log("Video URL sent to Discord!");
  } catch (_0x3605) {
    console.error("Error sending video link to Discord webhook:", _0x3605);
    throw _0x3605;
  }
}
function _0x1135(_0x1a5b, _0x22fe) {
  const _0x2333 = document.getElementById("progressBar");
  const _0x3629 = Math.round(_0x1a5b / _0x22fe * 100);
  _0x2333.style.width = `${_0x3629}%`;
  _0x2333.textContent = `${_0x3629}%`;
}
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
