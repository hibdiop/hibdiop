const clock = document.querySelector("#clock");
const desktopIcons = document.querySelectorAll(".desktop-icon");
const windows = document.querySelectorAll(".xp-window");
let activeDrag = null;
let topZ = 8;

function updateClock() {
  const now = new Date();
  const formatted = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  clock.textContent = formatted;
  clock.setAttribute("datetime", now.toISOString());
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function activateWindow(win) {
  windows.forEach((item) => item.classList.remove("is-active"));
  win.classList.add("is-active");
  win.style.zIndex = String(++topZ);
}

function beginDrag(event) {
  if (event.target.closest("button")) {
    return;
  }

  const win = event.currentTarget.closest(".xp-window");
  const rect = win.getBoundingClientRect();
  activateWindow(win);

  activeDrag = {
    pointerId: event.pointerId,
    win,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
  };

  win.style.position = "fixed";
  win.style.left = `${rect.left}px`;
  win.style.top = `${rect.top}px`;
  win.style.right = "auto";
  win.style.bottom = "auto";
  win.style.margin = "0";
  event.currentTarget.setPointerCapture(event.pointerId);
}

function dragWindow(event) {
  if (!activeDrag || event.pointerId !== activeDrag.pointerId) {
    return;
  }

  const rect = activeDrag.win.getBoundingClientRect();
  const taskbarHeight = document.querySelector(".taskbar").offsetHeight;
  const maxLeft = window.innerWidth - rect.width;
  const maxTop = window.innerHeight - rect.height - taskbarHeight;

  activeDrag.win.style.left = `${clamp(event.clientX - activeDrag.offsetX, 0, Math.max(0, maxLeft))}px`;
  activeDrag.win.style.top = `${clamp(event.clientY - activeDrag.offsetY, 0, Math.max(0, maxTop))}px`;
}

function endDrag(event) {
  if (!activeDrag || event.pointerId !== activeDrag.pointerId) {
    return;
  }

  event.currentTarget.releasePointerCapture(event.pointerId);
  activeDrag = null;
}

windows.forEach((win) => {
  const handle = win.querySelector("[data-drag-handle]");
  const closeButton = win.querySelector(".close-button");

  win.addEventListener("pointerdown", () => activateWindow(win));
  handle.addEventListener("pointerdown", beginDrag);
  handle.addEventListener("pointermove", dragWindow);
  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);
  closeButton.addEventListener("click", () => {
    win.hidden = true;
  });
});

desktopIcons.forEach((icon) => {
  let clickTimer = null;

  icon.addEventListener("click", (event) => {
    event.preventDefault();
    desktopIcons.forEach((item) => item.classList.remove("is-selected"));
    icon.classList.add("is-selected");

    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      window.open(icon.href, "_blank", "noopener,noreferrer");
      return;
    }

    clickTimer = setTimeout(() => {
      clickTimer = null;
    }, 420);
  });

  icon.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      window.open(icon.href, "_blank", "noopener,noreferrer");
    }
  });
});

activateWindow(document.querySelector("#bioWindow"));
updateClock();
setInterval(updateClock, 1000);
