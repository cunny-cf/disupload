const videoExtensions = ["mp4", "mkv", "avi", "mov"];
const maxFileSizeMB = 10; // 10 MB
let uploadAbortController = null; // To manage the cancellation of uploads

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, adding upload button event listener");
  document.getElementById("uploadBtn").addEventListener("click", uploadFiles);
  document.getElementById("cancelUploadBtn").addEventListener(
    "click",
    cancelUpload,
  );
});

// Start the file upload process
async function uploadFiles() {
  console.log("Upload started");

  const webhookUrl = document.getElementById("webhookUrl").value;
  const statusBox = document.getElementById("status");

  if (!webhookUrl) {
    alert("Please enter a valid Discord webhook URL.");
    return;
  }

  let files = [];
  if (document.getElementById("folderInput").files.length > 0) {
    files = Array.from(document.getElementById("folderInput").files);
    console.log("Files from folder input:", files);
  } else if (document.getElementById("fileInput").files.length > 0) {
    files = Array.from(document.getElementById("fileInput").files);
    console.log("Files from file input:", files);
  }

  if (files.length === 0) {
    alert("Please select at least one file or folder.");
    return;
  }

  // Disable the Upload button and file inputs during the upload
  document.getElementById("uploadBtn").disabled = true;
  document.getElementById("fileInput").disabled = true;
  document.getElementById("folderInput").disabled = true;
  document.getElementById("uploadBtn").style.display = "none";
  document.getElementById("cancelUploadBtn").style.display = "inline"; // Show cancel button

  const totalFiles = files.length;
  let uploadedFilesCount = 0;
  let failedUploads = []; // To track failed uploads

  updateProgress(0, totalFiles);
  statusBox.value = ""; // Clear status box before updating

  // Process each file
  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    console.log(
      `Processing file: ${file.name}, extension: ${fileExtension}, size: ${file.size}`,
    );

    let success = false;

    try {
      // If the file is a video and larger than 10MB, upload to FileDitch, then send the link to Discord
      if (
        videoExtensions.includes(fileExtension) &&
        file.size > maxFileSizeMB * 1024 * 1024
      ) {
        console.log(`Uploading video file (larger than 10MB): ${file.name}`);
        const fileDitchUrl = await uploadToFileDitch(file);
        await sendVideoToWebhook(fileDitchUrl, webhookUrl);
        success = true;
      } else if (file.size > maxFileSizeMB * 1024 * 1024) {
        // If the file is larger than 10MB but not a video, upload to FileDitch
        console.log(
          `Uploading non-video file (larger than 10MB): ${file.name}`,
        );
        const fileDitchUrl = await uploadToFileDitch(file);
        await sendFileToWebhook(fileDitchUrl, webhookUrl);
        success = true;
      } else {
        // If the file is smaller than 10MB, send it directly to Discord webhook
        console.log(
          `Sending small file (under 10MB) directly to Discord: ${file.name}`,
        );
        await sendFileToWebhook(file, webhookUrl);
        success = true;
      }

      // Update progress bar if the upload is successful
      if (success) {
        uploadedFilesCount++;
        updateProgress(uploadedFilesCount, totalFiles);
        statusBox.value += `${file.name} uploaded successfully.\n`;
        console.log(`${file.name} uploaded successfully.`);
      }
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      failedUploads.push(file.name);
      statusBox.value += `Failed to upload ${file.name}.\n`;
    }

    // Add delay every 10 uploads to prevent rate limiting
    if (uploadedFilesCount % 10 === 0) {
      statusBox.value += `Pausing for 5 seconds to prevent rate limiting...\n`;
      console.log("Pausing for 5 seconds...");
      await delay(5000); // Wait for 5 seconds
    }
  }

  // After all files are processed, show the final message
  if (failedUploads.length > 0) {
    statusBox.value += `\nFailed to upload the following files: ${
      failedUploads.join(", ")
    }`;
  } else {
    statusBox.value += `\nAll files uploaded successfully!`;
  }

  // Re-enable the Upload button and file inputs
  document.getElementById("uploadBtn").disabled = false;
  document.getElementById("fileInput").disabled = false;
  document.getElementById("folderInput").disabled = false;
  document.getElementById("uploadBtn").style.display = "inline";
  document.getElementById("cancelUploadBtn").style.display = "none"; // Hide cancel button after completion

  // alert('Upload process completed!');
}

// Cancel the upload
function cancelUpload() {
  console.log("Cancelling upload...");
  if (uploadAbortController) {
    uploadAbortController.abort();
    document.getElementById("status").value += "Upload has been canceled.\n";
  }
  // Re-enable the Upload button and file inputs after cancel
  document.getElementById("uploadBtn").disabled = false;
  document.getElementById("fileInput").disabled = false;
  document.getElementById("folderInput").disabled = false;
  document.getElementById("uploadBtn").style.display = "inline";
  document.getElementById("cancelUploadBtn").style.display = "none"; // Hide cancel button
}

// Function to create a delay (in milliseconds)
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Upload the file to FileDitch (if the file is larger than 10MB)
async function uploadToFileDitch(file) {
  console.log(`Uploading to FileDitch: ${file.name}`);
  const formData = new FormData();
  formData.append("files[]", file);

  try {
    // Create an AbortController instance for the upload
    const controller = new AbortController();
    const signal = controller.signal;
    uploadAbortController = controller; // Store the controller to be able to cancel

    const response = await fetch("https://up1.fileditch.com/upload.php", {
      method: "POST",
      body: formData,
      signal: signal, // Add the signal to the fetch request
    });

    if (!response.ok) throw new Error("Failed to upload to FileDitch");

    const data = await response.json();
    console.log(`File uploaded to FileDitch: ${data.files[0].url}`);
    return data.files[0].url; // Return the FileDitch URL
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("File upload was aborted");
    } else {
      console.error("Error uploading file to FileDitch:", error);
    }
    throw error; // Propagate the error so the main function can handle it
  }
}

// Send the uploaded file URL to Discord webhook (for normal or larger non-video files)
async function sendFileToWebhook(file, webhookUrl) {
  console.log(`Sending file to webhook: ${file.name}`);
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to send file to Discord webhook");

    console.log(`${file.name} uploaded successfully to Discord!`);
  } catch (error) {
    console.error(`Error sending ${file.name} to Discord webhook:`, error);
    throw error;
  }
  document.getElementById("fileInput").value = "";
  document.getElementById("folderInput").value = "";
}

// Send the uploaded video URL to Discord webhook along with the AutoCompressor link
async function sendVideoToWebhook(fileDitchUrl, webhookUrl) {
  console.log(`Sending video link to webhook: ${fileDitchUrl}`);
  const payload = JSON.stringify({
    content: `[_](https://autocompressor.net/av1?v=${fileDitchUrl})`,
  });

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    if (!response.ok) {
      throw new Error("Failed to send video link to Discord webhook");
    }
    console.log("Video URL sent to Discord!");
  } catch (error) {
    console.error("Error sending video link to Discord webhook:", error);
    throw error;
  }
}

// Update the progress bar and text
function updateProgress(uploaded, total) {
  const progressBar = document.getElementById("progressBar");
  const progressPercent = Math.round((uploaded / total) * 100);
  progressBar.style.width = `${progressPercent}%`;
  progressBar.textContent = `${progressPercent}%`;
}
