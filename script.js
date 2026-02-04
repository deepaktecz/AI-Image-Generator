const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");


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

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
    const MODEL_URL = `https://api-inference.huggingface.co/models/${selectedModel}`;
}


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