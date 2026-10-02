const stage = document.getElementById('viewerStage');
const image = document.getElementById('viewerImage');
const zoomSlider = document.getElementById('zoomSlider');
const zoomReadout = document.getElementById('zoomReadout');
const zoomInButton = document.getElementById('zoomIn');
const zoomOutButton = document.getElementById('zoomOut');
const presetButtons = document.querySelectorAll('[data-zoom]');

const state = {
  zoom: 1,
  minZoom: 1,
  maxZoom: 4,
  panX: 0,
  panY: 0,
  dragging: false,
  startX: 0,
  startY: 0,
  startPanX: 0,
  startPanY: 0
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function limitPan() {
  const maxPanX = ((state.zoom - 1) * stage.clientWidth) / 2;
  const maxPanY = ((state.zoom - 1) * stage.clientHeight) / 2;

  state.panX = clamp(state.panX, -maxPanX, maxPanX);
  state.panY = clamp(state.panY, -maxPanY, maxPanY);
}

function updateZoomUI() {
  const percent = Math.round(state.zoom * 100);
  zoomSlider.value = String(percent);
  zoomReadout.textContent = `${percent}%`;
}

function renderImage() {
  image.style.backgroundSize = `${state.zoom * 100}%`;
  image.style.backgroundPosition = `${state.panX}px ${state.panY}px`;
  updateZoomUI();
}

function setZoom(nextZoom) {
  state.zoom = clamp(nextZoom, state.minZoom, state.maxZoom);
  limitPan();
  renderImage();
}

function setZoomFromPercent(percent) {
  setZoom(percent / 100);
}

zoomSlider.addEventListener('input', (event) => {
  setZoomFromPercent(Number(event.target.value));
});

zoomInButton.addEventListener('click', () => {
  setZoom(state.zoom + 0.1);
});

zoomOutButton.addEventListener('click', () => {
  setZoom(state.zoom - 0.1);
});

presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setZoom(Number(button.dataset.zoom));
  });
});

stage.addEventListener(
  'wheel',
  (event) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.12 : -0.12;
    const nextZoom = clamp(state.zoom * (1 + delta), state.minZoom, state.maxZoom);
    setZoom(nextZoom);
  },
  { passive: false }
);

stage.addEventListener('pointerdown', (event) => {
  if (state.zoom <= state.minZoom) {
    return;
  }

  state.dragging = true;
  state.startX = event.clientX;
  state.startY = event.clientY;
  state.startPanX = state.panX;
  state.startPanY = state.panY;
  stage.setPointerCapture(event.pointerId);
  stage.style.cursor = 'grabbing';
});

stage.addEventListener('pointermove', (event) => {
  if (!state.dragging) {
    return;
  }

  const deltaX = (event.clientX - state.startX) * 1.6;
  const deltaY = (event.clientY - state.startY) * 1.6;

  state.panX = state.startPanX + deltaX;
  state.panY = state.startPanY + deltaY;
  limitPan();
  renderImage();
});

stage.addEventListener('pointerup', () => {
  state.dragging = false;
  stage.style.cursor = 'grab';
});

stage.addEventListener('pointerleave', () => {
  state.dragging = false;
  stage.style.cursor = 'grab';
});

window.addEventListener('resize', () => {
  limitPan();
  renderImage();
});

setZoom(1);
renderImage();
