const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

const API_KEY = "hf_TfNMIBZoah1GTcRGPiDMMUMWopBcBedRqL";


// EXAMPLE PROMPTS
const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future mars colony with glass domes and garden against red mountains"
];


// THEME SETUP
const savedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
  document.body.classList.add("dark-theme");
  themeToggle.querySelector("i").className = "fa-solid fa-sun";
} else {
  themeToggle.querySelector("i").className = "fa-solid fa-moon";
}

const toggleTheme = () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");

  themeToggle.querySelector("i").className =
    isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const [width, height] = aspectRatio.split("/").map(Number);

  const scaleFactor = baseSize / Math.sqrt(width * height);

  let calculatedWidth = Math.round(width * scaleFactor);
  let calculatedHeight = Math.floor(height * scaleFactor);

  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

  return { width: calculatedWidth, height: calculatedHeight };
};

// send request to Hugging Face API to create images
const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
    const MODEL_URL = `https://api-inference.huggingface.co/models/${selectedModel}`;
    const { width, height } = getImageDimensions(aspectRatio);

  // Create an array of image generation promises
  const imagePromises = Array.from({length: imageCount}, async(_, i) => {
    // Send request to the AI model API
    try {
        const response = await fetch(MODEL_URL, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                inputs: promptText,
                parameters: {width, height},
                options: {wait_for_model: true, user_cache: false},
            }),
        });

        if (!response.ok) throw new Error((await response.json())?.error);

        const result = await response.blob();
        console.log(result);
    } catch (error) {
        console.log(error);
    }
  })  

  await Promise.allSettled(imagePromises);
};


// CREATE IMAGE CARDS
const createImageCard = (selectedModel, imageCount, aspectRatio, promptText) => {
  gridGallery.innerHTML = "";

  for (let i = 0; i < imageCount; i++) {
    gridGallery.innerHTML += `
      <div class="img-card loading" style="aspect-ratio: ${aspectRatio}">
        <div class="status-container">
          <div class="spinner"></div>
          <p class="status-text">Generating...</p>
        </div>
        <img src="test.jpg" class="result-img" />
      </div>
    `;
  }

  generateImages(selectedModel, imageCount, aspectRatio, promptText);
};


// FORM SUBMIT
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


// RANDOM PROMPT BUTTON
promptBtn.addEventListener("click", () => {
  const randomPrompt =
    examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = randomPrompt;
  promptInput.focus();
});


// EVENT LISTENERS
promptForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);