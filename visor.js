const stage = document.getElementById('viewerStage');
const image = document.getElementById('viewerImage');
const zoomSlider = document.getElementById('zoomSlider');
const zoomReadout = document.getElementById('zoomReadout');
const zoomInButton = document.getElementById('zoomIn');
const zoomOutButton = document.getElementById('zoomOut');
const presetButtons = document.querySelectorAll('[data-zoom][data-magnification]');
const magnificationReadout = document.getElementById('magnificationReadout');
const infoPanel = document.getElementById('tissueInfo');
const infoToggle = document.getElementById('toggleInfo');
const infoBackdrop = document.getElementById('infoBackdrop');
const viewerLayout = document.getElementById('viewerLayout');
const viewerStatus = document.getElementById('viewerStatus');
const fullscreenButton = document.getElementById('toggleFullscreen');
const overlayToggle = document.getElementById('toggleViewerOverlay');

const tissues = {
  esofago: {
    title: 'Esófago',
    englishTitle: 'Esophagus',
    description: 'Conducto muscular revestido por epitelio plano estratificado no queratinizado. La mucosa protege frente a la fricción del bolo alimenticio y la muscular propia cambia de músculo esquelético a liso a lo largo de su trayecto.',
    structures: ['Mucosa con epitelio plano estratificado no queratinizado.', 'Lámina propia y muscular de la mucosa.', 'Submucosa con glándulas esofágicas.', 'Muscular propia circular interna y longitudinal externa.', 'Adventicia; serosa únicamente en el segmento abdominal.']
  },
  estomago: {
    title: 'Estómago',
    englishTitle: 'Stomach',
    description: 'La mucosa gástrica forma fositas que continúan en glándulas tubulares. Su epitelio cilíndrico simple y las células especializadas participan en la secreción de moco, ácido y enzimas digestivas.',
    structures: ['Mucosa con fositas y glándulas gástricas.', 'Células mucosas superficiales y del cuello.', 'Células parietales productoras de ácido.', 'Células principales productoras de pepsinógeno.', 'Muscular externa con tres capas características.']
  },
  'intestino-delgado': {
    title: 'Intestino delgado',
    englishTitle: 'Small intestine',
    description: 'La superficie de absorción se amplía mediante pliegues, vellosidades y microvellosidades. Las criptas contienen células madre, enteroendocrinas y células de Paneth, especialmente evidentes en el íleon.',
    structures: ['Mucosa con vellosidades y criptas de Lieberkühn.', 'Enterocitos con borde en cepillo.', 'Células caliciformes secretoras de moco.', 'Células de Paneth en la base de las criptas.', 'Submucosa con glándulas de Brunner en duodeno o placas de Peyer en íleon.']
  },
  'intestino-grueso': {
    title: 'Intestino grueso',
    englishTitle: 'Large intestine',
    description: 'El colon presenta mucosa sin vellosidades y criptas rectas, numerosas y ricas en células caliciformes. La absorción de agua y la secreción de moco caracterizan su función.',
    structures: ['Mucosa lisa sin vellosidades.', 'Criptas de Lieberkühn largas y paralelas.', 'Abundantes células caliciformes.', 'Muscular de la mucosa y submucosa bien delimitadas.', 'Muscular externa; tenias del colon en la capa longitudinal.']
  },
  higado: {
    title: 'Hígado',
    englishTitle: 'Liver',
    description: 'El parénquima se organiza en lobulillos y cordones de hepatocitos separados por sinusoides. La sangre fluye hacia la vena central mientras la bilis avanza en dirección opuesta hacia los conductos biliares.',
    structures: ['Lobulillos hepáticos y vena central.', 'Cordones de hepatocitos.', 'Sinusoides con células endoteliales y de Kupffer.', 'Espacios porta con rama de vena porta y arteria hepática.', 'Canalículos biliares entre hepatocitos.']
  },
  pancreas: {
    title: 'Páncreas',
    englishTitle: 'Pancreas',
    description: 'Glándula mixta lobulada: los acinos serosos producen secreción digestiva y los islotes de Langerhans forman el componente endocrino. Los conductos intercalares comienzan dentro del acino.',
    structures: ['Acinos serosos con gránulos de zimógeno.', 'Células centroacinares en el inicio de los conductos.', 'Conductos intercalares e intralobulillares.', 'Islotes de Langerhans más pálidos que el acino.', 'Tabiques de tejido conectivo entre lobulillos.']
  },
  'paladar-duro': {
    title: 'Paladar duro',
    englishTitle: 'Hard palate',
    description: 'La mucosa oral del paladar duro está recubierta por epitelio estratificado queratinizado, resistente a la fricción. Las rugas y la submucosa fibrosa sostienen la superficie masticatoria.',
    structures: ['Epitelio plano estratificado queratinizado.', 'Rugas palatinas y crestas epiteliales.', 'Lámina propia con tejido conectivo denso.', 'Submucosa fibrosa con glándulas menores.', 'Relación entre estructura y función masticatoria.']
  }
};

const state = {
  zoom: 1,
  minZoom: 1,
  maxZoom: 4,
  magnification: 4,
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
  magnificationReadout.textContent = `Objetivo ${state.magnification}×`;
  presetButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.magnification) === state.magnification));
  });
}

function renderImage() {
  image.style.backgroundSize = `${state.zoom * 100}%`;
  image.style.backgroundPosition = `calc(50% + ${state.panX}px) calc(50% + ${state.panY}px)`;
  updateZoomUI();
}

function setZoom(nextZoom) {
  state.zoom = clamp(nextZoom, state.minZoom, state.maxZoom);
  limitPan();
  renderImage();
}

function setMagnification(button) {
  state.magnification = Number(button.dataset.magnification);
  setZoom(Number(button.dataset.zoom));
}

function resetView() {
  state.panX = 0;
  state.panY = 0;
  setZoom(1);
  const defaultPreset = Array.from(presetButtons).find((button) => button.dataset.magnification === '4');
  if (defaultPreset) {
    state.magnification = 4;
    updateZoomUI();
  }
}

function setInfoOpen(isOpen) {
  infoPanel.classList.toggle('is-open', isOpen);
  infoToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('info-drawer-open', isOpen);
}

function loadTissue() {
  const requestedOrgan = new URLSearchParams(window.location.search).get('organ');
  const tissue = requestedOrgan ? tissues[requestedOrgan] : tissues['paladar-duro'];

  if (!tissue) {
    viewerStatus.textContent = 'No se reconoció ese preparado. Se muestra la lámina de referencia.';
    return;
  }

  document.getElementById('tissue-title').textContent = `${tissue.title} / ${tissue.englishTitle}`;
  document.getElementById('tissueDescription').textContent = tissue.description;
  document.getElementById('viewerImageTitle').textContent = tissue.title;
  document.getElementById('viewerImage').setAttribute('aria-label', `Imagen de referencia ilustrativa de ${tissue.title}; no representa un preparado real`);

  const structureList = document.getElementById('tissueStructures');
  structureList.replaceChildren(...tissue.structures.map((structure) => {
    const item = document.createElement('li');
    item.textContent = structure;
    return item;
  }));
}

zoomSlider.addEventListener('input', (event) => {
  setZoom(Number(event.target.value) / 100);
});

zoomInButton.addEventListener('click', () => {
  setZoom(state.zoom + 0.1);
});

zoomOutButton.addEventListener('click', () => {
  setZoom(state.zoom - 0.1);
});

presetButtons.forEach((button) => {
  button.addEventListener('click', () => setMagnification(button));
});

document.getElementById('resetView').addEventListener('click', resetView);

fullscreenButton.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (viewerLayout.classList.contains('is-fullscreen')) {
      viewerLayout.classList.remove('is-fullscreen');
      viewerStatus.textContent = '';
      updateFullscreenButton();
    } else {
      await viewerLayout.requestFullscreen();
      viewerStatus.textContent = '';
    }
  } catch (error) {
    const enteringFullscreen = !document.fullscreenElement && !viewerLayout.classList.contains('is-fullscreen');
    if (enteringFullscreen) {
      viewerLayout.classList.add('is-fullscreen');
      viewerStatus.textContent = 'Pantalla completa del navegador no disponible; se activó la vista expandida.';
      updateFullscreenButton();
      console.warn('Se activó la vista expandida porque el navegador no permitió usar pantalla completa.', error);
    } else {
      viewerStatus.textContent = 'No se pudo salir de la pantalla completa. Usa Escape o revisa los permisos del navegador.';
      console.error('No se pudo salir de la pantalla completa.', error);
    }
  }
});

function setCleanView(isClean) {
  if (isClean) {
    setInfoOpen(false);
  }
  viewerLayout.classList.toggle('is-clean-view', isClean);
  overlayToggle.setAttribute('aria-pressed', String(isClean));
  overlayToggle.setAttribute(
    'aria-label',
    isClean ? 'Mostrar controles y guía anatómica' : 'Ocultar controles y guía anatómica'
  );
  overlayToggle.querySelector('.viewer-overlay-toggle-label').textContent = isClean
    ? 'Mostrar controles'
    : 'Vista limpia';
  overlayToggle.querySelector('[aria-hidden="true"]').textContent = isClean ? '◎' : '◉';
}

function updateFullscreenButton() {
  const isFullscreen = document.fullscreenElement === viewerLayout || viewerLayout.classList.contains('is-fullscreen');
  fullscreenButton.setAttribute('aria-label', isFullscreen ? 'Salir de pantalla completa' : 'Activar pantalla completa');
  fullscreenButton.querySelector('span').textContent = isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa';
}

overlayToggle.addEventListener('click', () => {
  setCleanView(!viewerLayout.classList.contains('is-clean-view'));
});

document.addEventListener('fullscreenchange', () => {
  const isFullscreen = document.fullscreenElement === viewerLayout;
  viewerLayout.classList.toggle('is-fullscreen', isFullscreen);
  updateFullscreenButton();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !document.fullscreenElement && viewerLayout.classList.contains('is-fullscreen')) {
    viewerLayout.classList.remove('is-fullscreen');
    viewerStatus.textContent = '';
    updateFullscreenButton();
  }
});

infoToggle.addEventListener('click', () => setInfoOpen(!infoPanel.classList.contains('is-open')));
document.getElementById('closeInfo').addEventListener('click', () => setInfoOpen(false));
infoBackdrop.addEventListener('click', () => setInfoOpen(false));

stage.addEventListener('wheel', (event) => {
  event.preventDefault();
  const delta = event.deltaY < 0 ? 0.12 : -0.12;
  setZoom(state.zoom * (1 + delta));
}, { passive: false });

stage.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button')) {
    return;
  }

  if (state.zoom <= state.minZoom) {
    return;
  }

  state.dragging = true;
  state.startX = event.clientX;
  state.startY = event.clientY;
  state.startPanX = state.panX;
  state.startPanY = state.panY;
  stage.setPointerCapture(event.pointerId);
  stage.classList.add('is-dragging');
});

stage.addEventListener('pointermove', (event) => {
  if (!state.dragging) {
    return;
  }

  state.panX = state.startPanX + (event.clientX - state.startX);
  state.panY = state.startPanY + (event.clientY - state.startY);
  limitPan();
  renderImage();
});

function stopDragging() {
  state.dragging = false;
  stage.classList.remove('is-dragging');
}

stage.addEventListener('pointerup', stopDragging);
stage.addEventListener('pointercancel', stopDragging);
stage.addEventListener('lostpointercapture', stopDragging);
window.addEventListener('resize', () => {
  limitPan();
  renderImage();
});

loadTissue();
resetView();
