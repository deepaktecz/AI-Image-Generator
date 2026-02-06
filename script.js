// ================= DOM ELEMENTS =================
const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

// HuggingFace API key
const API_KEY = "hf_TfNMIBZoah1GTcRGPiDMMUMWopBcBedRqL";


// ================= EXAMPLE PROMPTS =================
const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future mars colony with glass domes and garden against red mountains"
];


// ================= THEME SETUP =================
// Get saved theme from localStorage
const savedTheme = localStorage.getItem("theme");

// Detect system dark mode
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

// Apply theme on page load
if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
  document.body.classList.add("dark-theme");
  themeToggle.querySelector("i").className = "fa-solid fa-sun";
} else {
  themeToggle.querySelector("i").className = "fa-solid fa-moon";
}

// Toggle theme function
const toggleTheme = () => {
  const isDark = document.body.classList.toggle("dark-theme");

  // Save theme in localStorage
  localStorage.setItem("theme", isDark ? "dark" : "light");

  // Update icon
  themeToggle.querySelector("i").className =
    isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
};


// ================= IMAGE DIMENSION CALCULATOR =================
const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const [width, height] = aspectRatio.split("/").map(Number);

  // Maintain aspect ratio while scaling
  const scaleFactor = baseSize / Math.sqrt(width * height);

  let calculatedWidth = Math.round(width * scaleFactor);
  let calculatedHeight = Math.floor(height * scaleFactor);

  // Ensure dimensions are multiples of 16 (AI model requirement)
  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

  return { width: calculatedWidth, height: calculatedHeight };
};


// ================= UPDATE IMAGE CARD =================
const updateImageCard = (imgIndex, imgUrl) => {
  const imgCard = document.getElementById(`img-card-${imgIndex}`);
  if (!imgCard) return;

  // Remove loading state
  imgCard.classList.remove("loading");

  // Insert generated image + download button
  imgCard.innerHTML = `
    <img src="${imgUrl}" class="result-img" />
    <div class="img-overlay">
      <a href="${imgUrl}" download class="img-download-btn" download="${Date.now()}.png">
        <i class="fa-solid fa-download"></i>
      </a>
    </div>`;
};


// ================= IMAGE GENERATION =================
// Send request to HuggingFace API
const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
  const MODEL_URL = `https://api-inference.huggingface.co/models/${selectedModel}`;

  // Calculate image dimensions
  const { width, height } = getImageDimensions(aspectRatio);

  // Create promises for multiple images
  const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
    try {
      const response = await fetch(MODEL_URL, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: promptText,
          parameters: { width, height },
          options: { wait_for_model: true, user_cache: false },
        }),
      });

      // Handle API error
      if (!response.ok) throw new Error((await response.json())?.error);

      // Convert response to image blob
      const result = await response.blob();

      // Update UI
      updateImageCard(i, URL.createObjectURL(result));
    } catch (error) {
      console.log(error);
    }
  });

  await Promise.allSettled(imagePromises);
};


// ================= CREATE IMAGE CARDS =================
const createImageCard = (selectedModel, imageCount, aspectRatio, promptText) => {
  gridGallery.innerHTML = "";

  // Create loading placeholders
  for (let i = 0; i < imageCount; i++) {
    gridGallery.innerHTML += `
      <div class="img-card loading" style="aspect-ratio: ${aspectRatio}">
        <div class="status-container">
          <div class="spinner"></div>
          <p class="status-text">Generating...</p>
        </div>
      </div>
    `;
  }

  // Start image generation
  generateImages(selectedModel, imageCount, aspectRatio, promptText);
};


// ================= FORM SUBMIT =================
const handleFormSubmit = (e) => {
  e.preventDefault();

  const selectedModel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const prompt = promptInput.value.trim();

  if (!prompt) {
    alert("Please enter a prompt");
    return;
  }

  createImageCard(selectedModel, imageCount, aspectRatio, prompt);
};


// ================= RANDOM PROMPT =================
promptBtn.addEventListener("click", () => {
  const randomPrompt =
    examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = randomPrompt;
  promptInput.focus();
});


// ================= EVENT LISTENERS =================
promptForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);