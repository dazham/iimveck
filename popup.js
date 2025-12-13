document.addEventListener("DOMContentLoaded", () => {
    // Select elements
    const fileInput = document.getElementById("fileInput");
    const fileDropArea = document.getElementById("fileDropArea");
    const dropContent = document.querySelector(".drop-content"); // The "Click or Drop" icon text
    const fileDetails = document.getElementById("fileDetails"); // The Preview container
    const fileNameDisplay = document.getElementById("fileNameDisplay");
    const filePreview = document.getElementById("filePreview");
    const formatSelect = document.getElementById("formatSelect");
    const convertButton = document.getElementById("convertButton");
    const loadingBar = document.getElementById("loadingBar");
    const loadingProgress = document.getElementById("loadingProgress");

    let originalFileName = "";

    // Helper: Reset UI to initial state
    function resetView() {
        dropContent.style.display = "flex";
        fileDetails.classList.add("hidden");
        fileInput.value = ""; 
    }

    // Helper: Show the file preview
    function showPreview(file) {
        originalFileName = file.name;
        fileNameDisplay.textContent = file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
            filePreview.src = e.target.result;
            // Toggle Visibility
            dropContent.style.display = "none";
            fileDetails.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
    }

    // 1. File Input Change Event
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            showPreview(file);
        } else {
            resetView();
        }
    });

    // 2. Drag & Drop Events
    fileDropArea.addEventListener("dragover", (event) => {
        event.preventDefault();
        fileDropArea.classList.add("hover");
    });

    fileDropArea.addEventListener("dragleave", () => {
        fileDropArea.classList.remove("hover");
    });

    fileDropArea.addEventListener("drop", (event) => {
        event.preventDefault();
        fileDropArea.classList.remove("hover");
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files; // Sync input with dropped file
            showPreview(files[0]);
        }
    });

    // 3. Click area to trigger hidden input
    fileDropArea.addEventListener("click", () => fileInput.click());

    // 4. Conversion Logic
    convertButton.addEventListener("click", async () => {
        const file = fileInput.files[0];
        const format = formatSelect.value;

        if (!file) {
            alert("Please choose an image file first.");
            return;
        }

        // Show loading
        loadingBar.style.display = "block";
        loadingProgress.style.width = "0%";

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const img = new Image();
                img.src = event.target.result;
                await img.decode(); // Wait for image load

                // Create Canvas
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Convert
                const dataURL = canvas.toDataURL(format);
                loadingProgress.style.width = "100%";

                // Determine file extension
                let ext = format.split("/")[1];
                if (ext === "x-icon") ext = "ico";
                if (ext === "svg+xml") ext = "svg";

                // Clean filename generation
                const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;
                const newFileName = `Converted_${baseName}.${ext}`;

                // Download
                const link = document.createElement("a");
                link.href = dataURL;
                link.download = newFileName;
                link.click();

                // Reset loading bar after short delay
                setTimeout(() => {
                    loadingBar.style.display = "none";
                    loadingProgress.style.width = "0%";
                }, 500);

            } catch (error) {
                console.error(error);
                alert("An error occurred during conversion.");
                loadingBar.style.display = "none";
            }
        };
        reader.readAsDataURL(file);
    });
});