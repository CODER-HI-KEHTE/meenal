import { story } from "./story.js";

const screens = [...document.querySelectorAll(".screen")];
const form = document.querySelector("#quiz-form");
const inputs = [
  document.querySelector("#answer-one"),
  document.querySelector("#answer-two")
];
const errors = [
  document.querySelector("#error-one"),
  document.querySelector("#error-two")
];
const hintButtons = [...document.querySelectorAll(".hint-toggle")];
const expectedAnswers = ["meenal", "littichokha"];
const errorMessages = [
  "Hmm, think of the DAVV person who's right here 😌",
  "Hint hint... a very tasty two-word classic 👀"
];
const emptyAnswerMessage = "Give it a little guess first 🙂";
let storyIndex = 0;
let toastTimer;

function showScreen(target) {
  const current = screens.find((screen) => !screen.hidden);
  if (current === target) return;
  if (current) {
    current.classList.remove("screen-active");
    current.classList.add("screen-exit");
    window.setTimeout(() => {
      current.hidden = true;
      current.classList.remove("screen-exit");
    }, 240);
  }
  target.hidden = false;
  target.classList.remove("screen-exit");
  requestAnimationFrame(() => target.classList.add("screen-active"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function normalized(value) {
  return value.toLocaleLowerCase().replace(/\s+/g, "");
}

function setHintVisible(index, visible) {
  const button = hintButtons[index];
  const hint = document.getElementById(button.getAttribute("aria-controls"));
  hint.hidden = !visible;
  button.setAttribute("aria-expanded", String(visible));
}

function validateAnswer(index, showError = true) {
  const field = inputs[index];
  const block = field.closest(".question-block");
  const error = errors[index];
  const correct = normalized(field.value) === expectedAnswers[index];
  block.classList.toggle("is-correct", correct);
  const invalid = !correct && showError;
  block.classList.toggle("has-error", invalid);
  field.setAttribute("aria-invalid", String(invalid));
  error.textContent = invalid
    ? field.value.trim() ? errorMessages[index] : emptyAnswerMessage
    : "";
  if (invalid) setHintVisible(index, true);
  if (correct) {
    block.classList.remove("answer-pop");
    requestAnimationFrame(() => block.classList.add("answer-pop"));
  }
  return correct;
}

hintButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    setHintVisible(index, button.getAttribute("aria-expanded") !== "true");
  });
});

function celebrateUnlock() {
  showScreen(document.querySelector("#unlock-screen"));
  document.body.classList.add("celebrating");
  window.setTimeout(() => document.body.classList.remove("celebrating"), 1500);
}

inputs.forEach((field, index) => {
  field.addEventListener("input", () => {
    if (field.value.trim()) validateAnswer(index, false);
    else {
      const block = field.closest(".question-block");
      block.classList.remove("is-correct", "has-error");
      errors[index].textContent = "";
      field.removeAttribute("aria-invalid");
    }
  });
  field.addEventListener("blur", () => {
    if (field.value.trim()) validateAnswer(index);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const results = inputs.map((_, index) => validateAnswer(index));
  if (results.every(Boolean)) {
    celebrateUnlock();
    return;
  }
  const firstIncorrect = results.indexOf(false);
  inputs[firstIncorrect].focus();
});

document.querySelector("#skip-quiz").addEventListener("click", celebrateUnlock);

function renderStory() {
  const item = story[storyIndex];
  const cards = document.querySelector("#timeline-cards");
  cards.innerHTML = `
    <article class="timeline-card" key="${storyIndex}">
      <div class="story-card-top">
        <span class="story-icon" aria-hidden="true">${item.icon}</span>
        <span class="story-kicker">A LITTLE MEMORY <span>·</span> 0${storyIndex + 1}</span>
      </div>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
      <div class="story-note"><span aria-hidden="true">✦</span> ${item.note}</div>
      ${item.photo ? `
        <figure class="story-photo">
          <img src="${item.photo.src}" alt="${item.photo.alt}" width="256" height="256" />
          <figcaption>${item.photo.caption}</figcaption>
        </figure>` : ""}
    </article>`;
  document.querySelector("#story-counter").innerHTML =
    `0${storyIndex + 1} <i>/</i> 0${story.length}`;
  document.querySelector("#story-back").disabled = storyIndex === 0;
  document.querySelector("#story-next").innerHTML = storyIndex === story.length - 1
    ? "Okay jokes apart... <span aria-hidden=\"true\">→</span>"
    : "And then... <span aria-hidden=\"true\">→</span>";
  document.querySelector("#guide-bubble").textContent = item.guide;
  document.querySelector("#rail-progress").style.height =
    `${(storyIndex / (story.length - 1)) * 100}%`;
  document.querySelectorAll(".rail-dot").forEach((dot, index) => {
    dot.classList.toggle("active", index <= storyIndex);
    dot.classList.toggle("current", index === storyIndex);
  });
}

document.querySelector("#story-start").addEventListener("click", () => {
  storyIndex = 0;
  renderStory();
  showScreen(document.querySelector("#story-screen"));
});

document.querySelector("#story-back").addEventListener("click", () => {
  if (storyIndex > 0) {
    storyIndex -= 1;
    renderStory();
  }
});

document.querySelector("#story-next").addEventListener("click", () => {
  if (storyIndex < story.length - 1) {
    storyIndex += 1;
    renderStory();
  } else {
    showScreen(document.querySelector("#apology-screen"));
  }
});

document.querySelector("#final-start").addEventListener("click", () => {
  showScreen(document.querySelector("#final-screen"));
});

document.querySelector("#forgive-button").addEventListener("click", (event) => {
  event.currentTarget.disabled = true;
  event.currentTarget.classList.add("button-done");
  document.querySelector("#no-pressure").hidden = true;
  document.querySelector("#peace-message").hidden = false;
  document.querySelector("#final-screen").classList.add("final-celebration");
  window.setTimeout(() => {
    document.querySelector("#final-screen").classList.remove("final-celebration");
  }, 1800);
});

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("toast-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("toast-visible"), 2600);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") showToast("You can close this whenever you like. Take care 🫶");
});

renderStory();
