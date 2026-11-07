const stage = document.getElementById('viewerStage');
const image = document.getElementById('viewerImage');
const imageSource = document.getElementById('viewerImageSource');
const annotationLayer = document.getElementById('annotationLayer');
const annotationToggle = document.getElementById('toggleAnnotations');
imageSource.addEventListener('dragstart', (event) => event.preventDefault());
imageSource.addEventListener('load', () => {
  updateAnnotationLayerBounds();
  renderAnnotationTransform();
});
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
const captionDetailsButton = document.getElementById('toggleCaptionDetails');
const captionDetailsPanel = document.getElementById('captionDetailsPanel');
const captionDetailsButton16 = document.getElementById('toggleCaptionDetails16');
const captionDetailsPanel16 = document.getElementById('captionDetailsPanel16');
const captionDetailsButton10 = document.getElementById('toggleCaptionDetails10');
const captionDetailsPanel10 = document.getElementById('captionDetailsPanel10');
const captionDetailsButton14 = document.getElementById('toggleCaptionDetails14');
const captionDetailsPanel14 = document.getElementById('captionDetailsPanel14');
const utilityActions = document.querySelector('.viewer-utility-actions');
let overlayInteractionTimeout;
const overlayPointerIds = new Set();
let annotationsChapterEnabled = false;
let annotationsActive = true;
let activeAnnotationConfig = null;

const annotationChapters = {
  '15': {
    ariaLabel: 'Anotaciones histológicas del yeyuno',
    toggleLabel: 'Alternar etiquetas de las estructuras del yeyuno',
    tags: [
      { label: 'V', className: 'annotation-tag-v', title: 'Vellosidades' },
      { label: 'PC', className: 'annotation-tag-pc', title: 'Pliegues circulares' },
      {
        label: 'Muc',
        className: 'annotation-tag-muc',
        href: '#mucosa',
        title: 'Ir a Mucosa',
        ariaLabel: 'Ir a la descripción de la mucosa'
      },
      {
        label: 'SubM',
        className: 'annotation-tag-subm',
        href: '#submucosa',
        title: 'Ir a Submucosa',
        ariaLabel: 'Ir a la descripción de la submucosa'
      },
      {
        label: 'ME',
        className: 'annotation-tag-me',
        href: '#muscular-externa',
        title: 'Ir a Muscular externa',
        ariaLabel: 'Ir a la descripción de la muscular externa'
      }
    ]
  },
  '18': {
    ariaLabel: 'Anotaciones histológicas del colon',
    toggleLabel: 'Alternar etiquetas de las estructuras del colon',
    tags: [
      {
        label: 'Muc',
        className: 'annotation-tag-colon-muc',
        href: '#mucosa',
        title: 'Ir a Mucosa',
        ariaLabel: 'Ir a la descripción de la mucosa'
      },
      {
        label: 'MM',
        className: 'annotation-tag-colon-mm',
        href: '#muscular-mucosa',
        title: 'Ir a Muscular de la mucosa',
        ariaLabel: 'Ir a la descripción de la muscular de la mucosa'
      },
      {
        label: 'SubM',
        className: 'annotation-tag-colon-subm',
        href: '#submucosa',
        title: 'Ir a Submucosa',
        ariaLabel: 'Ir a la descripción de la submucosa'
      },
      {
        label: 'VS',
        className: 'annotation-tag-colon-vs',
        href: '#vasos-sanguineos',
        title: 'Ir a Vasos sanguíneos',
        ariaLabel: 'Ir a la descripción de los vasos sanguíneos de la submucosa izquierda'
      },
      {
        label: 'VS',
        className: 'annotation-tag-colon-vs-center',
        href: '#vasos-sanguineos',
        title: 'Ir a Vasos sanguíneos',
        ariaLabel: 'Ir a la descripción de los vasos sanguíneos de la submucosa central'
      },
      {
        label: 'VS',
        className: 'annotation-tag-colon-vs-right',
        href: '#vasos-sanguineos',
        title: 'Ir a Vasos sanguíneos',
        ariaLabel: 'Ir a la descripción de los vasos sanguíneos de la submucosa derecha'
      },
      {
        label: 'ME',
        className: 'annotation-tag-colon-me',
        href: '#muscular-externa',
        title: 'Ir a Muscular externa',
        ariaLabel: 'Ir a la descripción de la muscular externa'
      }
    ]
  }
};

function renderAnnotationTags(config) {
  if (!annotationLayer) {
    return;
  }

  if (!config) {
    annotationLayer.replaceChildren();
    activeAnnotationConfig = null;
    return;
  }

  const tags = config.tags.map((tag) => {
    const element = tag.href ? document.createElement('a') : document.createElement('span');
    element.className = `annotation-tag ${tag.className}${tag.href ? ' annotation-tag-link' : ''}`;
    element.title = tag.title;
    element.textContent = tag.label;
    if (tag.href) {
      element.href = tag.href;
      if (tag.ariaLabel) {
        element.setAttribute('aria-label', tag.ariaLabel);
      }
    }
    return element;
  });

  annotationLayer.replaceChildren(...tags);
  annotationLayer.setAttribute('aria-label', config.ariaLabel);
  annotationToggle.setAttribute('aria-label', config.toggleLabel);
  activeAnnotationConfig = config;
}

function updateOverlayTogglePlacement() {
  const isFullscreen = document.fullscreenElement === viewerLayout || viewerLayout.classList.contains('is-fullscreen');
  const isCleanView = viewerLayout.classList.contains('is-clean-view');
  (isFullscreen && !isCleanView ? utilityActions : stage).append(overlayToggle);
}

function showCaptionAfterInteraction() {
  window.clearTimeout(overlayInteractionTimeout);
  overlayInteractionTimeout = window.setTimeout(() => {
    image.classList.remove('is-interacting');
  }, 450);
}

function setExtendedInfoOpen(panel, button, isOpen) {
  panel.hidden = !isOpen;
  panel.classList.toggle('is-open', isOpen);
  button.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) {
    const captionRect = image.querySelector('.viewer-overlay').getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    panel.style.top = `${Math.max(8, captionRect.top - stageRect.top - panel.offsetHeight - 10)}px`;
  }
}

function setCaptionDetailsOpen(isOpen) {
  setExtendedInfoOpen(captionDetailsPanel, captionDetailsButton, isOpen);
}

function toggleCap8Info() {
  setCaptionDetailsOpen(!captionDetailsPanel.classList.contains('is-open'));
}

function setCaptionDetailsOpen16(isOpen) {
  setExtendedInfoOpen(captionDetailsPanel16, captionDetailsButton16, isOpen);
}

function toggleCap16Info() {
  setCaptionDetailsOpen16(!captionDetailsPanel16.classList.contains('is-open'));
}

function setCaptionDetailsOpen10(isOpen) {
  setExtendedInfoOpen(captionDetailsPanel10, captionDetailsButton10, isOpen);
}

function toggleCap10Info() {
  setCaptionDetailsOpen10(!captionDetailsPanel10.classList.contains('is-open'));
}

function setCaptionDetailsOpen14(isOpen) {
  setExtendedInfoOpen(captionDetailsPanel14, captionDetailsButton14, isOpen);
}

function toggleCap14Info() {
  setCaptionDetailsOpen14(!captionDetailsPanel14.classList.contains('is-open'));
}

window.toggleCap8Info = toggleCap8Info;
window.toggleCap16Info = toggleCap16Info;
window.toggleCap10Info = toggleCap10Info;
window.toggleCap14Info = toggleCap14Info;

function updateAnnotationLayerBounds() {
  if (!annotationLayer || !imageSource.naturalWidth || !imageSource.naturalHeight) {
    return;
  }

  const imageRect = image.getBoundingClientRect();
  const imagePadding = 8;
  const availableWidth = Math.max(0, imageRect.width - imagePadding * 2);
  const availableHeight = Math.max(0, imageRect.height - imagePadding * 2);
  if (!availableWidth || !availableHeight) {
    return;
  }

  const imageRatio = imageSource.naturalWidth / imageSource.naturalHeight;
  let layerWidth = availableWidth;
  let layerHeight = layerWidth / imageRatio;
  if (layerHeight > availableHeight) {
    layerHeight = availableHeight;
    layerWidth = layerHeight * imageRatio;
  }

  annotationLayer.style.left = `${(imageRect.width - layerWidth) / 2}px`;
  annotationLayer.style.top = `${(imageRect.height - layerHeight) / 2}px`;
  annotationLayer.style.width = `${layerWidth}px`;
  annotationLayer.style.height = `${layerHeight}px`;
}

function renderAnnotationTransform() {
  if (!annotationLayer) {
    return;
  }

  annotationLayer.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
  annotationLayer.style.setProperty('--annotation-tag-scale', String(1 / state.zoom));
}

function updateAnnotationState() {
  const isAnnotatedMagnification = annotationsChapterEnabled && state.magnification === 4;
  annotationToggle.hidden = !isAnnotatedMagnification;

  const isVisible = isAnnotatedMagnification && annotationsActive;
  annotationLayer.classList.toggle('is-visible', isVisible);
  annotationLayer.setAttribute('aria-hidden', String(!isVisible));
  annotationToggle.classList.toggle('is-active', isVisible);
  annotationToggle.setAttribute('aria-pressed', String(isVisible));

  if (isVisible) {
    updateAnnotationLayerBounds();
    renderAnnotationTransform();
  }
}

function toggleYeyunumAnnotations() {
  if (!annotationsChapterEnabled || !activeAnnotationConfig) {
    return;
  }

  annotationsActive = !annotationsActive;
  updateAnnotationState();
}

window.toggleYeyunumAnnotations = toggleYeyunumAnnotations;

const tissues = {
  esofago: {
    title: 'Esófago',
    englishTitle: 'Esophagus',
    description: 'El esófago es un tubo muscular. De alrededor de 25 cm de longitud, situado por detrás de la tráquea, comienza en el límite inferior de la laringofaringe y atraviesa el mediastino por delante de la columna vertebral. Luego pasa a través del diafragma por un orificio denominado hiato esofágico y termina en la porción superior del estómago. El esófago secreta moco y transporta alimentos hacia el estómago, no produce enzimas digestivas y no cumple funciones de absorción. La luz es aplanada e irregular al corte transversal como consecuencia de la contracción tónica de la capa circular interna de la muscular, que forma pliegues longitudinales de la membrana mucosa.',
    structures: [
      {
        title: 'Mucosa: Lámina epitelial',
        description: 'La lámina epitelial se compone de epitelio estratificado plano no cornificado muy grueso (300-500 µm). El epitelio es continuación del epitelio estratificado plano de la faringe, pero de pronto se modifica a simple cilíndrico en la zona de transición a la región del cardias del estómago. La modificación epitelial puede aparecer a una altura variable de la parte inferior del esófago, por lo que los últimos 1-2 cm pueden estar revestidos por epitelio simple cilíndrico. A menudo, las células epiteliales planas del esófago contienen glucógeno, que se tiñe con la técnica de PAS.',
        children: [
          {
            title: 'Su función',
            description: 'Proteger la pared esofágica contra la fricción y la abrasión mecánica producida por el paso de los alimentos. Su glucógeno acumulado actúa como reserva metabólica, y su transición a epitelio cilíndrico en el cardias marca el límite funcional con el estómago.'
          }
        ]
      },
      {
        title: 'Lámina propia',
        description: 'La lámina propia se compone de tejido conectivo laxo, que puede contener escasos folículos linfoides, a menudo localizados alrededor de los conductos excretores de las glándulas.',
        children: [
          {
            title: 'Su función',
            description: 'Soportar estructuralmente al epitelio y proporcionar defensa inmunológica local gracias a la presencia de folículos linfoides.'
          }
        ]
      },
      {
        title: 'Lámina muscular de la mucosa',
        description: 'La lámina muscular de la mucosa está muy desarrollada en el esófago y se compone sólo de fibras musculares de transcurso longitudinal (la muscular de la mucosa siempre está compuesta por músculo liso).',
        children: [
          {
            title: 'Su función',
            description: 'Generar los pliegues longitudinales de la mucosa y permitir su movilidad independiente para facilitar el tránsito del contenido alimentario.'
          }
        ]
      },
      {
        title: 'Submucosa',
        description: 'La submucosa se compone de tejido conectivo de densidad moderada, que permite la dilatación de la luz durante la deglución de alimentos, cuando desaparecen los pliegues longitudinales.',
        children: [
          {
            title: 'Su función',
            description: 'Permitir la distensión y la dilatación de la luz esofágica durante la deglución (momento en el cual desaparecen los pliegues longitudinales), además de servir de soporte para vasos y nervios.'
          }
        ]
      },
      {
        title: 'Muscular',
        description: 'La muscular se dispone en una capa circular interna y otra longitudinal externa. En su tercio superior, el esófago se compone de músculo estriado esquelético, pero en forma gradual aparecen células musculares lisas en cantidad creciente. En condiciones normales, en el tercio inferior sólo hay músculo liso. Entre las capas musculares, se distinguen células ganglionares autónomas dispersas pertenecientes al plexo mientérico (plexo de Auerbach).',
        children: [
          {
            title: 'Su función',
            description: 'Realizar las contracciones peristálticas coordinadas para propulsar el bolo alimenticio desde la faringe hacia el estómago. El plexo mientérico regula esta actividad motora.'
          }
        ]
      },
      {
        title: 'Adventicia y Serosa',
        description: 'La adventicia está formada por tejido conectivo laxo que fija el esófago a las estructuras circundantes. La última porción de esófago, ubicada en el abdomen, está recubierta por serosa (peritoneo).',
        children: [
          {
            title: 'Adventicia (tejido conectivo laxo)',
            description: 'Fijar y unir el esófago a las estructuras anatómicas circundantes en el mediastino.'
          },
          {
            title: 'Serosa / Peritoneo (última porción abdominal)',
            description: 'Revestir y lubricar la porción terminal del esófago ubicada en el abdomen, reduciendo la fricción con los órganos vecinos.'
          }
        ]
      },
      {
        title: 'Glándulas del esófago',
        description: 'En el esófago se encuentran glándulas en la submucosa, que se denominan glándulas submucosas, y en la mucosa, que por lo general se conocen como glándulas esofágicas cardiales.',
        children: [
          {
            title: 'Glándulas submucosas',
            description: 'Las glándulas submucosas se componen de adenómeros mucosos tubuloacinosos ramificados que forman pequeños grupos, cada uno de los cuales tiene un único conducto excretor. El conducto excretor está revestido primero por epitelio simple cúbico a cilíndrico, que pasa a estratificado plano durante el transcurso en la membrana mucosa.',
            children: [
              {
                title: 'Su función',
                description: 'Secretar moco hacia la luz para lubricar el paso de los alimentos y proteger la superficie epitelial.'
              }
            ]
          },
          {
            title: 'Glándulas esofágicas cardiales',
            description: 'Las glándulas esofágicas cardiales están ubicadas en la lámina propia de la membrana mucosa y sólo aparecen en una zona limitada de la porción más inferior del esófago, donde están más o menos relacionadas con las glándulas cardiales del estómago de allí el nombre. Las glándulas también son tubuloacinosas compuestas por células secretoras mucosas. También es posible encontrar glándulas con el mismo aspecto y la misma ubicación en la parte más superior del esófago.',
            children: [
              {
                title: 'Su función',
                description: 'Producir secreción mucosa en las zonas de transición superior e inferior para proteger la mucosa frente al desgaste y al contenido ácido.'
              }
            ]
          }
        ]
      },
      {
        title: 'Células del esófago',
        children: [
          'En la mucosa, tiene células superficiales que pueden exhibir algunos gránulos de queratohialina pero generalmente no se produce la queratinización.',
          'En la submucosa, posee células ganglionares que forman el plexo submucoso interno (plexo de Meissner).',
          'En la muscular, está el plexo mientérico (plexo de Auerbach).'
        ]
      }
    ]
  },
  unionEsofagogastrica: {
    title: 'Unión esofagogástrica',
    englishTitle: 'Esophagogastric Junction',
    description: 'La unión esofagogástrica marca un cambio funcional desde lo que es un simple conducto (esófago) hacia un verdadero órgano digestivo (estómago). El epitelio de la mucosa cambia desde plano estratificado (protección) hasta cilíndrico simple (secreción), que forma las glándulas que secretan mucinógeno, enzimas digestivas y ácido clorhídrico. La lámina propia, muy celular, contiene abundante tejido linfático difuso, lo cual enfatiza la contribución de esta capa al sistema inmunitario.',
    structuresDisplay: 'paragraphs',
    structures: [
      'La transición entre el esófago y el estómago. El esófago y la región cardial del estómago: una región representativa de la mucosa cardial en la que se aprecia una parte de la transición. El esófago tiene un revestimiento interno de epitelio plano estratificado cuya superficie basal está interdigitada por papilas profundas de tejido conjuntivo. Cuando estas se seccionan en sentido oblicuo, aparecen como islotes de tejido conjuntivo dentro del epitelio grueso.',
      'Debajo del epitelio están la lámina propia, a menudo infiltrada por linfocitos, y la muscular de la mucosa. En la transición entre el esófago y el estómago, el epitelio plano estratificado del esófago termina de forma abrupta y comienza el epitelio cilíndrico simple de la superficie del estómago.',
      'La superficie del estómago contiene numerosas depresiones relativamente profundas denominadas criptas gástricas, o fovéolas, que poseen un epitelio similar al de la superficie con el cual se continúa. Las glándulas que desembocan en la base de las criptas son las glándulas cardiales. Toda la mucosa gástrica contiene glándulas. Existen tres tipos de glándula gástrica: cardial, fúndica y pilórica. Las glándulas cardiales se encuentran en las inmediaciones de la abertura del esófago, las glándulas pilóricas se localizan en la porción en forma de embudo (infundibuliforme) del estómago (que conduce al duodeno) y las glándulas fúndicas se encuentran a lo largo del resto del estómago.'
    ]
  },
  estomago: {
    title: 'Estómago',
    englishTitle: 'Stomach',
    description: 'El estómago es la parte más ensanchada del tracto digestivo y conecta el esófago con el intestino delgado. La desembocadura del esófago en el estómago se denomina cardias, mientras que la salida del estómago al duodeno se denomina píloro. El alimento ingerido tiene consistencia semisólida después de la masticación y se acumula cierto tiempo en el estómago, donde es sometido a acciones mecánicas y químicas que lo transforman en un fluido espeso denominado quimo. Desde el estómago, el quimo es liberado en pequeñas porciones en el intestino delgado, donde tienen lugar la digestión y la absorción posteriores.',
    structures: [
      {
        title: 'Regiones Histológicas del Estómago',
        description: ' Desde el punto de vista histológico, el estómago se divide en tres regiones según el tipo de glándula que contiene cada una:',
        children: [
          {
            title: 'La región cardial (cardias)',
            description: 'La parte cercana al orificio esofágico, que contiene las glándulas cardiales.'
          },
          {
            title: 'La región pilórica (píloro)',
            description: 'La parte proximal con respecto al esfínter pilórico, que contiene las glándulas pilóricas.'
          },
          {
            title: 'La región fúndica (fundus)',
            description: 'La parte más grande del estómago que está situada entre el cardias y el píloro y contiene las glándulas gástricas o fúndicas.'
          }
        ]
      },
      {
        title: 'Anatomía macroscópica de la mucosa',
        description: ' El cardias rodea el orificio superior del estómago. La porción redondeada que está por encima y hacia la izquierda del cardias es el fundus. Por debajo del fundus se extiende la porción central del estómago, llamado cuerpo. La región del estómago que conecta con el duodeno es el píloro, que tiene dos partes: el antro pilórico, que conecta con el cuerpo del estómago, y el canal pilórico, que conduce hacia el duodeno. Cuando el estómago está vacío, la mucosa se dispone en grandes pliegues, que pueden reconocerse a simple vista. El píloro comunica con el duodeno a través del esfínter pilórico. El borde interno cóncavo del estómago se llama curvatura menor, y el borde externo convexo es la curvatura mayor.'
      },
      {
        title: 'Superficie de la mucosa',
        description: ' La superficie de la mucosa es una capa de células epiteliales cilíndricas simples llamada células mucosas superficiales. Tres capas yacen debajo de la mucosa. La submucosa del estómago está compuesta por tejido conectivo areolar. La muscular tiene tres capas de músculo liso (en lugar de las dos presentes en el intestino): una capa longitudinal externa, una capa circular media, y una capa oblicua interna. La capa oblicua está limitada casi exclusivamente al cuerpo del estómago. La serosa está compuesta por epitelio pavimentoso simple (mesotelio) y por tejido conectivo areolar; la porción de la serosa que cubre al estómago forma parte del peritoneo visceral. Las células epiteliales se extienden hacia dentro de la lámina propia, donde forman columnas de células secretoras llamadas glándulas gástricas, que limitan con conductos estrechos que reciben el nombre de criptas gástricas. Las secreciones de las glándulas gástricas fluyen dentro de las criptas gástricas y de ahí hacia la luz del estómago.'
      },
      {
        title: 'Células mucosas superficiales (CMS)',
        description: ' Revisten la superficie interna del estómago y las criptas gástricas (fovéolas). Poseen un cáliz mucoso apical que secreta una capa de moco protector. Tienen un tiempo de recambio rápido de entre 3 y 5 días.'
      },
      {
        title: 'Células mucosas del cuello (CMC)',
        description: ' Se localizan en los cuellos de las glándulas fúndicas. Tienen un citoplasma pálido y producen una secreción mucosa diferente a la de las células superficiales.'
      },
      {
        title: 'Células mucosas glandulares (CMG)',
        description: ' Forman las glándulas cardiales ubicadas en la región del cardias. Presentan un núcleo aplanado en la base y un citoplasma pálido.'
      },
      {
        title: 'Células parietales (oxínticas) (CP)',
        description: ' Se encuentran principalmente en las glándulas fúndicas. Se distinguen por su intensa eosinofilia (citoplasma muy rosado/acidófilo) y se encargan de secretar ácido clorhídrico (HCl).'
      },
      {
        title: 'Células principales (CPr)',
        description: ' Se ubican en las glándulas fúndicas. Tienen un núcleo redondo basal, un citoplasma con basofilia pronunciada debido al extenso retículo endoplasmático rugoso, y gránulos apicales que contienen pepsinógeno.'
      },
      {
        title: 'Células enteroendocrinas (células argentafines)',
        description: ' Se encuentran distribuidas en el fondo de las glándulas gástricas. No son visibles fácilmente con técnicas rutinarias de H&E, pero se pueden identificar mediante métodos histoquímicos especiales o tinción argéntica, donde se observan ennegrecidas por la plata.'
      },
      {
        title: 'Pliegues y Superficie',
        description: ' La superficie interna del estómago vacío permite descubrir varios pliegues longitudinales o rugosidades denominados rugae (arrugas gástricas). Los pliegues longitudinales rugosos de la submucosa permiten que el estómago se distienda cuando se llena. Son prominentes en las regiones más estrechas del estómago, pero están poco desarrollados en la porción superior. Al observar la superficie con una lupa, se detecta que regiones más pequeñas están formadas por surcos o hendiduras poco profundas que dividen la mucosa en regiones sobresalientes irregulares denominadas regiones mamiladas o sólo mamilones. Con un mayor aumento, pueden observarse muchos orificios en la superficie de la mucosa: las fositas gástricas o fovéolas.'
      },
      {
        title: 'Epitelio Superficial',
        description: ' Las células mucosas superficiales tapizan la superficie interna del estómago y de las fositas gástricas. Epitelio cilíndrico simple de revestimiento y secretor. Cada célula posee una gran dilatación apical llena de gránulos de mucinógeno, que crean una lámina glandular de células.'
      },
      {
        title: 'Otras Glándulas Gástricas',
        description: ' Glándulas cardiales compuestas por células secretoras de moco. Son tubulares, tortuosas y ramificadas, con un núcleo basal aplanado y citoplasma apical repleto de gránulos de mucinógeno.'
      }
    ]
  },
  glandulasCardiales: {
    title: 'Glándulas cardiales y capas del estómago',
    englishTitle: 'Cardiac Glands and Stomach Layers',
    description: 'Son glándulas tubulares simples o ramificadas y ligeramente tortuosas, localizadas exclusivamente en la cardias, la zona de transición entre el esófago y el estómago (aproximadamente en un anillo de 1 a 3 cm alrededor del orificio cardial). Su función principal es secretar moco neutro y alcalino junto con bicarbonato, lo que forma una barrera protectora en la mucosa para evitar la autodigestión por el reflujo del jugo gástrico ácido proveniente del cuerpo estomacal. También pueden secretar pequeñas cantidades de lisozima.',
    structures: [
      {
        title: 'Mucosa - Epitelio superficial',
        description: 'Epitelio cilíndrico simple mucosecretor que tapiza la superficie y se invagina para formar fositas gástricas (o fovéolas) relativamente cortas y poco profundas.'
      },
      {
        title: 'Glándulas',
        description: 'Las unidades glandulares cardiales desembocan en el fondo de estas fositas. Están compuestas casi en su totalidad por células secretoras de moco, aunque de forma ocasional se pueden encontrar células enteroendocrinas y células parietales aisladas.'
      },
      {
        title: 'Lámina propia',
        description: 'Consiste en un tejido conectivo laxo muy escaso que rodea y sostiene a las glándulas cardiales. Contiene fibroblastos, capilares sanguíneos fenestrados, células del sistema inmunitario (linfocitos, plasmocitos, macrófagos y eosinófilos) y ocasionalmente folículos linfoides.'
      },
      {
        title: 'Muscular de la mucosa',
        description: 'Es una capa delgada de músculo liso (dispuesta típicamente en una capa circular interna y una longitudinal externa) que separa la mucosa de la submucosa subyacente y emite prolongaciones hacia la lámina propia para facilitar el movimiento de las glándulas.'
      },
      {
        title: 'Células secretoras de moco',
        description: 'Células cilíndricas con un núcleo aplanado ubicado en la base. Su citoplasma apical está lleno de gránulos de mucinógeno que se tiñen pálidamente con técnicas de rutina (H&E), pero reaccionan fuertemente con la técnica de PAS (ácido periódico de Schiff) debido a su contenido de glucoproteínas neutras.'
      },
      {
        title: 'Muscular externa',
        description: 'A nivel del estómago, la capa muscular externa es más gruesa y está compuesta por tres capas de músculo liso:',
        children: [
          { title: 'Interna', description: 'Oblicua.' },
          { title: 'Media', description: 'Circular.' },
          { title: 'Externa', description: 'Longitudinal.' },
          'Permite la mezcla mecánica del quimo gástrico y su propulsión hacia el píloro.'
        ]
      },
      {
        title: 'Serosa',
        description: 'Es la capa más externa que recubre al estómago (peritoneo visceral). Está compuesta por un mesotelio (epitelio plano simple) apoyado sobre una capa delgada de tejido conectivo laxo y tejido adiposo.'
      }
    ]
  },
  fundus: {
    title: 'Glándula Fúndica',
    englishTitle: 'Fundic Gland',
    description: 'Las glándulas fúndicas, también llamadas glándulas gástricas, están presentes en toda la mucosa gástrica, excepto en las regiones relativamente pequeñas ocupadas por las glándulas cardiales y pilóricas. Las glándulas fúndicas son glándulas tubulares simples ramificadas que se extienden desde el fondo de las fositas gástricas hasta la muscular de la mucosa.',
    structures: [
      {
        title: 'Mucosa (Epitelio y Glándulas)',
        description: 'Epitelio cilíndrico simple compuesto en su totalidad por células mucosas superficiales. Las glándulas fúndicas (u oxínticas) son glándulas tubulares simples y ramificadas que ocupan casi toda la lámina propia del fondo y del cuerpo del estómago.'
      },
      {
        title: 'Lámina propia',
        description: 'La lámina propia a nivel del fondo y cuerpo gástrico es un tejido conectivo laxo muy escaso y delgado. Esto se debe a que está extremadamente ocupada y densamente empaquetada por las glándulas fúndicas (oxínticas), dejando espacios mínimos entre ellas.'
      },
      {
        title: 'Muscular',
        description: 'Presentes en toda la mucosa gástrica, excepto en las regiones ocupadas por las glándulas cardiales y pilóricas.'
      },
      {
        title: 'Regiones de la glándula fúndica',
        children: [
          {
            title: 'Istmo',
            description: 'Es el nicho de células madre donde estas se replican y diferencian. Normalmente, varias glándulas desembocan en una sola fosita gástrica. Es la sección más corta y superior de la glándula, conectada directamente con el fondo de la cripta gástrica.'
          },
          {
            title: 'Cuello',
            description: 'Es la región intermedia, estrecha y alargada. Predominan las células mucosas del cuello intercaladas con una gran cantidad de células parietales (oxínticas) maduras. Produce moco soluble (distinto al moco viscoso superficial) y comienzo de la secreción ácida activa.'
          },
          {
            title: 'Base o Fondo',
            description: 'Es la porción más profunda, ancha y ramificada de la glándula, ubicada inmediatamente por encima de la capa muscular de la mucosa. Predominan las células principales (zimógenas), acompañadas por algunas células parietales y células enteroendocrinas. Produce enzimas digestivas (pepsinógeno) y secreción de hormonas reguladoras.'
          }
        ]
      },
      {
        title: 'Tipos Celulares de las Glándulas Fúndicas',
        children: [
          {
            title: 'Células mucosas del cuello',
            description: 'Ubicadas en el cuello de la glándula, se entremezclan con las células parietales. Son más cortas que las superficiales, con núcleo esferoidal y secretan un moco soluble.'
          },
          {
            title: 'Células principales (cimógenas)',
            description: 'Ubicadas en la parte profunda de las glándulas. Típicas células secretoras de proteínas; RER abundante en el citoplasma basal (aspecto basófilo) y citoplasma apical eosinófilo debido a los gránulos de cimógeno.'
          },
          {
            title: 'Células parietales (oxínticas)',
            description: 'Poseen un extenso sistema de canalículos intracelulares que se comunican con la luz, con abundantes microvellosidades y un sistema tubulovesicular en el citoplasma. Predominan en el cuello y producen ácido clorhídrico y factor intrínseco. Tienen la vida media más larga (150 a 200 días).'
          },
          {
            title: 'Células enteroendocrinas',
            description: 'Se encuentran en todos los niveles (más prevalentes en la base). Forman parte del Sistema Enteroendocrino (también llamadas células cromafines o argentafines por su afinidad a sales de cromo o plata). Se dividen en:',
            children: [
              {
                title: 'Células "cerradas"',
                description: 'Apoyadas en la lámina basal, no alcanzan la luz. Sus gránulos se secretan hacia el tejido conjuntivo.'
              },
              {
                title: 'Células "abiertas"',
                description: 'Poseen una extensión con microvellosidades expuestas a la luz glandular (actúan como quimiorreceptores).'
              }
            ]
          },
          'Células madre adultas indiferenciadas.'
        ]
      }
    ]
  },
  piloro: {
    title: 'Glándula Pilórica',
    englishTitle: 'Pyloric Gland',
    description: 'Glándulas pilóricas: Tubulares, enrolladas y ramificadas. Sus células son similares a las mucosas superficiales y ayudan a proteger la mucosa pilórica. Las células de las glándulas pilóricas son similares a las células mucosas superficiales y contribuyen a proteger la mucosa pilórica. Las glándulas pilóricas están ubicadas en el antro pilórico (la parte del estómago entre el fundus y el píloro). Son glándulas tubulares, enrolladas y ramificadas. La luz es relativamente amplia y las células secretoras tienen un aspecto similar al de las células mucosas superficiales, lo cual sugiere una secreción bastante viscosa. Las células enteroendocrinas se encuentran intercaladas dentro del epitelio glandular junto con algunas células parietales. Las glándulas se vacían dentro de las criptas gástricas profundas que ocupan cerca de la mitad del espesor de la mucosa.',
    structures: [
      {
        title: 'Lámina propia',
        description: 'Escasa, compuesta por fibras reticulares, células musculares lisas, fibroblastos y células del sistema inmunitario (linfocitos, plasmocitos, macrófagos, eosinófilos).'
      },
      {
        title: 'Muscular de la mucosa (muscularis mucosae)',
        description: 'Compuesta por dos capas delgadas (circular interna y longitudinal externa); en algunas regiones hay una tercera capa circular y finos haces que se extienden hacia la lámina propia.'
      },
      {
        title: 'Submucosa',
        description: 'Tejido conjuntivo denso irregular con tejido adiposo, vasos sanguíneos, linfáticos y el plexo nervioso submucoso de Meissner.'
      },
      {
        title: 'Muscular externa',
        description: 'Compuesta por tres capas de músculo liso: longitudinal externa, circular media y oblicua interna. Entre las capas muscular circular y longitudinal se encuentra el plexo mientérico (de Auerbach).'
      },
      {
        title: 'Serosa',
        description: 'Equivalente al peritoneo visceral; compuesta por una capa de epitelio plano simple (mesotelio) y tejido conjuntivo submesotelial.'
      }
    ]
  },
  yeyuno: {
    title: 'Intestino Delgado: Yeyuno',
    englishTitle: 'Jejunum',
    description: 'El yeyuno es el principal sitio de absorción de sustancias nutritivas en el intestino delgado. Las vellosidades son más digitiformes que foliáceas y están cubiertas, sobre todo, por células epiteliales cilíndricas absortivas (enterocitos), aunque también hay células caliciformes y células enteroendocrinas. Las células madre de las que derivan todas estas células y las células de Paneth, que secretan la enzima antibacteriana lisozima, se encuentran en la base de las glándulas intestinales. Las células en replicación revisten la mitad basal de la glándula.',
    structures: [
      {
        id: 'mucosa',
        title: 'Mucosa',
        description: 'Epitelio cilíndrico simple con vellosidades altas y delgadas, las más desarrolladas del intestino delgado. Criptas de Lieberkühn bien definidas. Enterocitos abundantes con chapa estriada, células caliciformes en número moderado, células de Paneth evidentes y células enteroendocrinas. La lámina propia contiene nódulos linfáticos, pero no forma Placas de Peyer prominentes. Muscular de la mucosa con dos capas delgadas.'
      },
      {
        id: 'submucosa',
        title: 'Submucosa',
        description: 'Tejido conjuntivo denso sin glándulas de Brunner. Pliegues circulares muy desarrollados. Plexo de Meissner presente.'
      },
      {
        id: 'muscular-externa',
        title: 'Muscular externa',
        description: 'Capa circular interna y longitudinal externa con plexo de Auerbach. Motilidad muy activa por ser la región de máxima absorción.'
      },
      {
        id: 'serosa',
        title: 'Serosa',
        description: 'Mesotelio y tejido conjuntivo.'
      }
    ]
  },
  ileon: {
    title: 'Intestino Delgado: Íleon',
    englishTitle: 'Ileum',
    description: 'El íleon es el sitio principal de reabsorción de agua y electrólitos del intestino delgado. En esencia, tiene las mismas características histológicas que el yeyuno, pero con algunas diferencias características. Las vellosidades en el íleon suelen ser foliáceas y el tejido linfático en la lámina propia está organizado en nódulos pequeños y grandes que se encuentran más concentrados en el borde antimesentérico del íleon. Los nódulos se fusionan para formar grandes cúmulos de tejido linfático denominadas placas de Peyer. El epitelio superficial del intestino delgado se renueva cada 5-6 días. Las células madre están restringidas a la base de las glándulas de la mucosa y la zona de replicación celular está limitada a la mitad basal de la glándula. Las células migran hacia las vellosidades y se exfolian desde su extremo. Todas las células epiteliales, absortivas y caliciformes, así como las células enteroendocrinas y las de Paneth, derivan de la misma población de células madre; sin embargo, las enteroendocrinas migran con lentitud y las de Paneth no migran.',
    structures: [
      {
        title: 'Mucosa',
        description: 'Epitelio cilíndrico simple con vellosidades más cortas que en el yeyuno. Criptas de Lieberkühn bien desarrolladas. Enterocitos presentes, pero mayor cantidad de células caliciformes. Células de Paneth en el fondo de las criptas y células enteroendocrinas. La lámina propia contiene nódulos linfáticos en toda la mucosa, pero en el íleon estos nódulos se agrupan formando estructuras grandes y prominentes llamadas Placas de Peyer, que representan el componente linfoide más desarrollado del intestino delgado. Muscular de la mucosa con dos capas delgadas.'
      },
      {
        title: 'Submucosa',
        description: 'Tejido conjuntivo denso. Las Placas de Peyer pueden extenderse desde la mucosa hacia la submucosa. Plexo de Meissner presente. No hay glándulas de Brunner.'
      },
      {
        title: 'Muscular externa',
        description: 'Capa circular interna y longitudinal externa con plexo de Auerbach. Motilidad menos intensa que en el yeyuno.'
      },
      {
        title: 'Serosa',
        description: 'Mesotelio y tejido conjuntivo.'
      }
    ]
  },
  glandulasSalivales: {
    title: 'Glándulas Salivales',
    englishTitle: 'Salivary Glands',
    description: 'Las glándulas salivales liberan en la cavidad bucal una secreción llamada saliva. Se secreta suficiente saliva para humedecer las mucosas de la boca y los dientes. Cuando los alimentos ingresan en la boca, aumenta la secreción de saliva, que lubrica y disuelve los alimentos e inicia su digestión química. La mucosa de la boca y la lengua contiene glándulas salivales que se abren directa o indirectamente, a través de pequeños conductos, en la cavidad bucal. Sin embargo, la mayor parte de la saliva se secreta en las glándulas salivales mayores, que no están contenidas en la mucosa de la boca y cuyos conductos desembocan en la cavidad bucal. Hay tres pares de glándulas salivales mayores: la parótida, la submandibular o submaxilar y la sublingual. Las glándulas parótidas se localizan por debajo y por delante de las orejas, entre la piel y el músculo masetero. Las glándulas submandibulares se hallan sobre el piso de la boca, en posición medial y parcialmente inferior al cuerpo de la mandíbula. Las glándulas sublinguales se encuentran por debajo de la lengua y por encima de las glándulas submandibulares.',
    structures: [
      {
        title: 'Células mioepiteliales (células en cesta)',
        description: 'Son contráctiles y se encuentran en todas las glándulas salivales de la boca. Se localizan entre la lámina basal y las células glandulares de las porciones secretoras o entre la lámina basal y las células de los conductos del sistema de conductos excretores. Son células aplanadas con largas prolongaciones citoplasmáticas ramificadas que rodean la porción secretora a modo de cesta, mientras que las células del sistema de conductos excretores son alargadas en el sentido del conducto. Por lo general, en los cortes histológicos solo se observa el núcleo aplanado.'
      },
      {
        title: 'Células mucosas (citoplasma pálido, núcleo aplanado)',
        description: 'Sintetizan y retienen las vesículas de mucinógeno que forman la secreción mucosa lubricante.'
      },
      {
        title: 'Células serosas (tinción intensa, núcleo redondo)',
        description: 'Sintetizan y empaquetan proteínas enzimáticas activas para la saliva.'
      },
      {
        title: 'Linfocitos y plasmocitos aglomerados',
        description: 'Proporcionan defensa inmunológica local, mediada principalmente por anticuerpos como la IgA secretora, en el tejido conjuntivo glandular.'
      }
    ]
  },
  'intestino-delgado': {
    title: 'Intestino delgado',
    englishTitle: 'Small intestine',
    description: 'El intestino delgado es el componente más largo del tubo digestivo, es el sitio principal para la digestión de alimentos y la absorción de los productos de la digestión. Mide más de 6 m y se divide en tres porciones anatómicas:',
    descriptionItems: [
      {
        title: 'El duodeno',
        description: '(con cerca de 25 cm de longitud) es la primera porción, y la más corta y ancha, del intestino delgado. Comienza a la altura del píloro del estómago y termina en el ángulo duodenoyeyunal.'
      },
      {
        title: 'El yeyuno',
        description: '(de casi 2.5 m de longitud) comienza en el ángulo duodenoyeyunal y constituye las dos quintas partes proximales del intestino delgado. Cambia de forma gradual sus características morfológicas hasta convertirse en el íleon.'
      },
      {
        title: 'El íleon',
        description: '(de aproximadamente 3,5 m de longitud) es la continuación del yeyuno y constituye las tres quintas partes distales del intestino delgado. Termina en la válvula ileocecal, la unión del íleon distal y el ciego.'
      }
    ],
    structures: [
      {
        title: 'Modificaciones de la superficie luminal',
        description: 'La formación de pliegues circulares (válvulas de Kerckring), vellosidades, microvellosidades y criptas de Lieberkühn incrementan el área de superficie de la luz intestinal.',
        children: [
          {
            title: 'Vellosidades',
            description: 'Salientes de la lámina propia. El núcleo de cada vellosidad contiene un conducto quilífero.'
          },
          {
            title: 'Microvellosidades',
            description: 'Recubren las vellosidades intestinales. Las invaginaciones del epitelio en la lámina propia entre las vellosidades forman glándulas intestinales denominadas criptas de Lieberkühn.'
          }
        ]
      },
      {
        title: 'Células del intestino delgado',
        children: [
          {
            title: 'Enterocitos',
            description: 'Células absortivas que transportan nutrientes desde la luz intestinal hacia la sangre. Su borde en cepillo ayuda en la digestión final antes de la absorción.'
          },
          {
            title: 'Células caliciformes',
            description: 'Glándulas unicelulares que producen mucina, formando moco que protege y lubrica el epitelio intestinal.'
          },
          {
            title: 'Células de Paneth',
            description: 'Mantienen la inmunidad innata de la mucosa mediante la secreción de sustancias antimicrobianas como defensinas y lisozima.'
          },
          {
            title: 'Células enteroendocrinas',
            description: 'Producen hormonas endocrinas y paracrinas que regulan la motilidad, la secreción digestiva y la sensación de saciedad.'
          },
          {
            title: 'Células M (micropliegues)',
            description: 'Enterocitos especializados que captan antígenos en la luz intestinal y los entregan a células inmunitarias en los nódulos linfáticos.'
          }
        ]
      },
      {
        title: 'Descripción histológica general',
        children: [
          {
            title: 'Mucosa',
            description: 'La mucosa del intestino delgado está revestida por un epitelio cilíndrico simple que forma vellosidades y criptas de Lieberkühn. Además de las células de la mucosa, la lámina propia posee un vaso quilífero, un tejido conjuntivo laxo con abundantes células inmunitarias (linfocitos, plasmocitos, mastocitos, macrófagos y eosinófilos) y numerosos nódulos linfáticos distribuidos a lo largo del intestino (son más grandes y prominentes en el íleon, y se denominan Placas de Peyer). La muscular de la mucosa está formada por dos capas delgadas de músculo liso: una circular interna y una longitudinal externa.'
          },
          {
            title: 'Submucosa',
            description: 'La submucosa está compuesta por tejido conjuntivo denso y contiene el plexo submucoso de Meissner, y glándulas de Brunner.'
          },
          {
            title: 'Muscular externa',
            description: 'La muscular externa está formada por dos capas de músculo liso: una circular interna y una longitudinal externa. Entre ambas se localiza el plexo mientérico de Auerbach, que coordina el peristaltismo y las contracciones que impulsan el quimo mezclado con los jugos digestivos a lo largo del intestino delgado.'
          },
          {
            title: 'Serosa',
            description: 'El intestino delgado está recubierto externamente por una serosa, con un epitelio peritoneal y una delgada capa de tejido conjuntivo subyacente, que constituye el revestimiento peritoneal.'
          }
        ]
      }
    ]
  },
  duodeno: {
    title: 'Intestino Delgado: Duodeno',
    englishTitle: 'Duodenum',
    description: 'El primer segmento, el duodeno, recibe un bolo alimenticio semidigerido (quimo) desde el estómago, así como secreciones del estómago, el páncreas, el hígado y la vesícula biliar, que contienen enzimas digestivas, precursores de enzimas y otros productos que contribuyen a la digestión y la absorción. El intestino delgado se caracteriza por los pliegues circulares (válvulas conniventes) permanentes, transversales, con un centro de submucosa y vellosidades que son proyecciones digitiformes y foliáceas de la mucosa que se extienden dentro de la luz intestinal. Las microvellosidades, que son múltiples evaginaciones digitiformes de la superficie apical de cada célula epitelial intestinal (enterocito), incrementan la superficie de absorción de metabolitos. Las glándulas mucosas se extienden hacia la lámina propia. Contienen a las células madre y en desarrollo que finalmente migrarán a la superficie de las vellosidades. En el duodeno, las glándulas submucosas (de Brunner) secretan moco alcalino que ayuda a neutralizar el quimo ácido. Los enterocitos no solo absorben metabolitos digeridos en la luz intestinal, sino que también sintetizan enzimas que se insertan en la membrana de las microvellosidades para la digestión terminal de los disacáridos y los dipéptidos.',
    structures: [
      {
        title: 'Mucosa',
        description: 'Epitelio cilíndrico simple con vellosidades anchas y cortas. Criptas de Lieberkühn poco profundas. Enterocitos con chapa estriada, pocas células caliciformes, células de Paneth en el fondo de las criptas y células enteroendocrinas. La lámina propia con tejido conectivo laxo. Muscular de la mucosa con dos capas delgadas de músculo liso.'
      },
      {
        title: 'Submucosa',
        description: 'Tejido conjuntivo denso con glándulas de Brunner, características del duodeno, que secretan moco alcalino para neutralizar el quimo ácido. Presencia del plexo submucoso de Meissner.'
      },
      {
        title: 'Muscular externa',
        description: 'Capa circular interna y longitudinal externa, con el plexo mientérico de Auerbach entre ambas. Responsable del avance del quimo mezclado con secreciones pancreáticas y biliares.'
      },
      {
        title: 'Serosa',
        description: 'Mesotelio y tejido conjuntivo subyacente.'
      }
    ]
  },
  'intestino-grueso': {
    title: 'Intestino Grueso',
    englishTitle: 'Large intestine',
    description: 'El intestino grueso comprende el ciego con su apéndice vermiforme, el colon, el recto y el conducto anal. El colon a su vez se subdivide, según su ubicación anatómica, en colon ascendente, transverso, descendente y sigmoide. Las cuatro capas características del tubo digestivo también aparecen en todo el intestino grueso. Sin embargo, a escala macroscópica se comprueban varios rasgos distintivos:',
    descriptionItems: [
      {
        title: 'Tenias del colon:',
        description: 'Que son tres bandas equidistantes, estrechas y gruesas, formadas por la capa longitudinal externa de la muscular externa. Se observan principalmente en el ciego y el colon, pero están ausentes en el recto, el conducto anal y el apéndice vermiforme.'
      },
      {
        title: 'Haustras colónicas:',
        description: 'Que son saculaciones visibles entre las tenias del colon en las superficies externas del ciego y el colon.'
      },
      {
        title: 'Apéndices omentales:',
        description: 'Que son pequeñas proyecciones adiposas de la serosa que se observan en la capa externa del colon.'
      }
    ],
    structures: [
      {
        title: 'Células absortivas cilíndricas',
        description: 'La función principal de las células absortivas cilíndricas es la reabsorción de agua y electrólitos. La morfología de las células absortivas es, en esencia, idéntica a la de los enterocitos del intestino delgado.'
      },
      {
        title: 'Células caliciformes',
        description: 'Tienen forma de copa o cáliz y funcionan como fábricas de moco lubrificante, vital para que los desechos sólidos puedan deslizarse suavemente sin lastimar las paredes del intestino.'
      }
    ]
  },
  colon: {
    title: 'Intestino grueso: colon',
    englishTitle: 'Large intestine: colon',
    description: [
      'Las funciones principales del colon son la reabsorción de electrólitos y agua, así como la eliminación de alimento no digerido y otros desechos. La mucosa tiene una superficie lisa sin pliegues circulares ni vellosidades. Las abundantes glándulas simples (criptas de Lieberkühn) se extienden a través de todo el espesor de la mucosa. Las glándulas, así como la superficie, están revestidas por un epitelio cilíndrico simple que contiene células caliciformes, absortivas y enteroendocrinas, pero que generalmente no posee células de Paneth. También aquí, las células madre están restringidas al fondo de las glándulas (criptas) y la zona normal de replicación se extiende hasta cerca de una tercera parte de la altura de la cripta.',
      'Si bien la lámina propia del intestino grueso contiene los mismos componentes básicos que el resto del tubo digestivo, muestra unas características estructurales adicionales y también mayor desarrollo. Esto incluye lo siguiente:'
    ],
    descriptionItems: [
      {
        title: 'Meseta de colágeno:',
        description: 'Que es una capa gruesa de colágeno y proteoglucanos que se ubica entre la lámina basal del epitelio y la de los capilares venosos absortivos fenestrados.'
      },
      {
        title: 'Vaina fibroblástica pericríptica:',
        description: 'Que es una población bien desarrollada de fibroblastos cuyas células se replican con regularidad. Los fibroblastos se dividen justo debajo de la base de la glándula intestinal, junto a las células madre del epitelio (tanto en el intestino delgado como en el grueso).'
      },
      {
        title: 'GALT:',
        description: 'Que es continuo con el íleon terminal. En el intestino grueso, el GALT está más desarrollado; algunos nódulos linfáticos grandes distorsionan el espaciado regular de las glándulas intestinales y se extienden hacia la submucosa.'
      }
    ],
    structures: [
      {
        id: 'mucosa',
        title: 'Mucosa',
        description: 'Es una superficie lisa sin vellosidades ni pliegues circulares, contiene:',
        children: [
          'Epitelio cilíndrico simple.',
          'Glándulas intestinales (criptas de Lieberkühn).',
          'Células caliciformes.',
          'Lámina propia con meseta de colágeno, vaina fibroblástica pericríptica y vasos linfáticos.',
          'No presenta células de Paneth.'
        ]
      },
      {
        id: 'muscular-mucosa',
        title: 'Muscular de la mucosa',
        description: 'Es una capa delgada de músculo liso situada entre la mucosa y la submucosa. Está formada por una subcapa circular interna y una longitudinal externa, cuyas contracciones generan movimientos locales que favorecen la expulsión del contenido de las glándulas intestinales y la remodelación de la superficie mucosa.'
      },
      {
        id: 'submucosa',
        title: 'Submucosa',
        children: [
          'Tejido adiposo.',
          {
            id: 'vasos-sanguineos',
            title: 'Vasos sanguíneos',
            description: 'La submucosa contiene una red abundante de arterias y venas de calibre variable que irrigan la mucosa y drenan la sangre hacia la circulación venosa. En los cortes histológicos se reconocen por su pared endotelial y, en las venas, por la presencia de eritrocitos en la luz.'
          },
          'Tejido conectivo denso irregular.',
          'Plexo submucoso de Meissner.'
        ]
      },
      {
        id: 'muscular-externa',
        title: 'Muscular externa',
        children: [
          'Capa circular interna y capa longitudinal externa.',
          'Plexo mientérico de Auerbach.',
          'En la región del ciego y colon tenemos las tenias del colon que forman las haustras del colon.'
        ]
      },
      {
        title: 'Serosa',
        children: [
          'Epitelio plano simple (mesotelio).',
          'Tejido conectivo laxo y células adiposas.'
        ]
      }
    ]
  },
  higado: {
    title: 'Hígado',
    englishTitle: 'Liver',
    description: [
      'El hígado es la masa de tejido glandular más grande del organismo y el órgano interno más voluminoso. Se localiza en el cuadrante superior derecho y en parte del cuadrante superior izquierdo de la cavidad abdominal, protegido por la parrilla costal. El hígado está encerrado en una cápsula de tejido conjuntivo fibroso (cápsula de Glisson); una cubierta serosa (peritoneo visceral) rodea la cápsula, excepto donde el hígado se adhiere directamente al diafragma o los otros órganos. Anatómicamente, el hígado está dividido por surcos profundos en dos grandes lóbulos (derecho e izquierdo) y dos lóbulos pequeños (el lóbulo cuadrado y el caudado).',
      'El hígado realiza un número muy elevado de funciones de muy distinto tipo y es un órgano vital. La función exocrina del hígado comprende la secreción de bilis que llega hasta la luz del duodeno por las vías biliares, pero además, el hígado sintetiza varias sustancias que libera a la sangre, entre ellas, numerosas proteínas sanguíneas.'
    ],
    structures: [
      {
        title: 'Organización estructural del hígado',
        children: [
          {
            title: 'Parénquima',
            description: 'Consiste en cordones bien organizados de hepatocitos, que en el adulto generalmente tienen una sola célula de espesor, separadas por capilares sinusoidales. En los niños de hasta 6 años de edad, los hepatocitos se distribuyen en cordones de dos células de espesor.'
          },
          {
            title: 'Estroma de tejido conjuntivo',
            description: 'Que se continúa con la cápsula fibrosa de Glisson. Los vasos sanguíneos, nervios, vasos linfáticos y conductos biliares discurren dentro del estroma de tejido conjuntivo.'
          },
          {
            title: 'Capilares sinusoidales (sinusoides)',
            description: 'Que conforman el conducto vascular entre los cordones de hepatocitos.'
          },
          {
            title: 'Espacios perisinusoidales (espacios de Disse)',
            description: 'Que se encuentran entre el endotelio sinusoidal y los hepatocitos.'
          }
        ]
      },
      {
        title: 'Características histológicas del hígado',
        children: [
          {
            title: 'Estroma de tejido conectivo',
            description: 'La delgada cápsula de tejido conectivo denso irregular del hígado o cápsula de Glisson está engrosada alrededor de la vena cava inferior y en el hilio hepático, donde el tejido conectivo de la cápsula sigue a los vasos hacia el interior de la glándula.'
          },
          {
            title: 'División del parénquima',
            description: 'Se divide el parénquima hepático en lobulillos (la unidad estructural) y se denomina tejido conectivo periportal, dado que rodea las tríadas portales o de Glisson, es decir, la unidad compuesta por una ramificación de la arteria hepática, una de la vena porta y el sistema de vías biliares.'
          },
          {
            title: 'Abundancia del tejido conectivo',
            description: 'El tejido conectivo periportal es más abundante cerca del hilio, puesto que aquí los tres componentes de la tríada son más grandes que en las porciones terminales, donde son pequeños y sólo están rodeados por escasa cantidad de tejido conectivo laxo. También disminuye el tamaño del espacio interlobulillar.'
          },
          {
            title: 'Red de fibras reticulares',
            description: 'Dentro del lobulillo se observa una red rígida de fibras reticulares que, en la periferia, se continúan con el tejido conectivo periportal interlobulillar. La mayor parte del retículo intralobulillar está formado por las células de Ito, pero también por fibroblastos aislados, cuya presencia se demostró alrededor de los sinusoides.'
          },
          {
            title: 'Conductos interlobulillares',
            description: 'Poseen epitelio cilíndrico simple.'
          }
        ]
      },
      {
        title: 'Lobulillos y Unidades Funcionales',
        children: [
          {
            title: 'Lobulillo hepático clásico',
            description: 'La unidad estructural hepática es el lobulillo hepático, un prisma hexagonal. El lobulillo se cierra contra el espacio periportal mediante una placa continua de hepatocitos, la placa limitante, que sólo posee pequeños orificios para las ramificaciones terminales de la arteria hepática, la vena porta y las vías biliares (los conductos biliares presentan epitelio cúbico simple). Hacia el centro del lobulillo se distingue el espacio central, que contiene la vena central. En consecuencia, el parénquima hepático humano conforma una masa más continua, sin lobulación nítida. Sin embargo, a partir de la localización de las venas centrales y de las tríadas de Glisson, es relativamente sencillo establecer los límites de un lobulillo hepático humano. El lobulillo hepático clásico se considera una unidad estructural anatómica, pero también puede calificarse como una unidad funcional, dado que por ejemplo el depósito de glucosa en los hepatocitos después de una comida se extiende en una zona concéntrica desde la periferia hacia el centro del lobulillo, formando zonas anulares.'
          },
          {
            title: 'Lobulillo portal',
            description: 'Un tercer tipo de subdivisión del parénquima hepático consiste en el lobulillo portal, de aspecto triangular en el corte, cuyos vértices están formados por tres venas centrales distintas y en el centro contiene una tríada de Glisson. El lobulillo portal destaca la función exocrina del hígado, es decir, la secreción de bilis.'
          },
          {
            title: 'Ácino hepático',
            description: 'Una unidad más pequeña, el ácino hepático, representa la mínima unidad funcional. Está compuesta por la cantidad de parénquima hepático que se encuentra entre dos venas centrales e incluye ramificaciones terminales de arteria hepática, vena porta y sistema de vías biliares (un conductillo terminal) como ejes. Es también conocido como ácino de Rappaport (ácino funcional o microcirculatorio).'
          }
        ]
      },
      {
        title: 'Células del hígado',
        children: [
          {
            title: 'Hepatocitos',
            description: 'Están dispuestos en hileras de una célula de espesor como cordones anastomosados de una o dos células de espesor.'
          },
          {
            title: 'Células de Kupffer',
            description: 'Generalmente se reconocen por sus núcleos ovoides y por sobresalir dentro de la luz.'
          },
          {
            title: 'Células endoteliales',
            description: 'Célula plana o escamosa que posee núcleo alargado o adelgazado y más pequeño.'
          },
          'Células sinusoidales.',
          'Células estrelladas hepáticas (Células de Ito o lipocitos).',
          'Células Pit (Linfocitos NK hepáticos).'
        ]
      }
    ]
  },
  vesicula: {
    title: 'Vesícula Biliar',
    englishTitle: 'Gallbladder',
    description: [
      'La vesícula biliar es un órgano hueco con forma de pera ubicado sobre la cara inferior del lóbulo hepático derecho. Se compone de un extremo ciego, el fondo, un cuerpo y un cuello que se continúa en el conducto cístico. La vesícula biliar aumenta de tamaño con facilidad y puede contener hasta 50 ml. En la vesícula biliar vacía contraída, la mucosa está muy pegada. La pared de la vesícula biliar está compuesta por mucosa, una muscular constituida por fibras de músculo liso, y una capa perimuscular de tejido conectivo, recubierta en parte por serosa.',
      'La vesícula biliar puede almacenar la bilis entrante y extraer cerca del 90% del agua que contiene, lo cual incrementa hasta 10 veces la concentración de sales biliares, colesterol y bilirrubina. Las hormonas secretadas por las células enteroendocrinas del intestino delgado, en respuesta a la presencia de grasa en el duodeno proximal, estimulan las contracciones de músculo liso de la vesícula biliar. Estas contracciones ayudan a descargar la bilis concentrada en el colédoco, que la conduce hasta el duodeno.'
    ],
    structures: [
      {
        title: 'La mucosa',
        description: 'Está revestida en su cara luminal por una capa de epitelio cilíndrico simple, los núcleos son ovalados y de ubicación basal, y el citoplasma es eosinófilo claro con abundantes microvellosidades cortas apicales. Además, presenta divertículos profundos de la mucosa llamados senos de Rokitansky-Aschoff.',
        children: [
          {
            title: 'Función del epitelio cilíndrico simple (con microvellosidades cortas apicales y núcleos basales)',
            description: 'Absorber agua y electrólitos del jugo biliar para concentrar la bilis almacenada.'
          },
          {
            title: 'Función de los senos de Rokitansky-Aschoff (divertículos profundos de la mucosa)',
            description: 'Representan invaginaciones profundas de la mucosa que penetran en la capa muscular (asociados en estados de distensión o cambios parietales).'
          }
        ]
      },
      {
        title: 'La lámina propia',
        description: 'Se compone de tejido conectivo laxo y en ella se encuentran glándulas mucosas dispersas, sobre todo en la región del cuello, y capilares fenestrados; esta capa es muy celular y contiene una gran cantidad de linfocitos y plasmocitos. La vesícula biliar carece de muscular de la mucosa y la mucosa limita directamente con una delgada capa de fibras musculares lisas.',
        children: [
          {
            title: 'Función del tejido conectivo laxo',
            description: 'Brindar sostén mecánico al epitelio, albergar capilares fenestrados para el transporte rápido de fluidos reabsorbidos y proporcionar defensa inmunológica local.'
          },
          {
            title: 'Función de las glándulas mucosas (en lámina propia del cuello)',
            description: 'Secretar moco para proteger la mucosa del cuello vesicular frente al roce y la corrosión biliar.'
          },
          {
            title: 'Función de los capilares fenestrados (en la lámina propia)',
            description: 'Facilitar el intercambio rápido y eficiente de agua y solutos reabsorbidos desde la bilis hacia el torrente sanguíneo.'
          }
        ]
      },
      {
        title: 'La capa muscular',
        description: 'Las fibras musculares lisas se disponen en haces separados por tejido conectivo en dirección no uniforme. Está rodeada en su totalidad por una capa de tejido conectivo perimuscular bien desarrollada, la cual es tejido conectivo denso y presenta características de cápsula que se continúa con la cápsula del hígado; posee abundantes fibras colágenas y elásticas.',
        children: [
          {
            title: 'Función de los haces de músculo liso en direcciones no uniformes',
            description: 'Contraerse coordinadamente por estímulo de la colecistocinina para expulsar la bilis concentrada hacia el conducto cístico durante la digestión.'
          },
          {
            title: 'Función del tejido conectivo perimuscular (tejido conectivo denso, fibras elásticas y colágeno)',
            description: 'Dar resistencia estructural, envolver la capa muscular y dar continuidad anatómica con la cápsula hepática.'
          }
        ]
      },
      {
        title: 'La capa serosa de la vesícula biliar (peritoneo)',
        description: 'La capa se transforma en una subserosa más laxa. Las capas de tejido conectivo contienen vasos sanguíneos, nervios, vías linfáticas y tejido adiposo.',
        children: [
          {
            title: 'Función de la serosa',
            description: 'Proteger exteriormente la vesícula, reducir la fricción con órganos vecinos, alojar tejido adiposo y permitir el paso de vasos sanguíneos, linfáticos y nervios.'
          }
        ]
      },
      {
        title: 'Conducto Cístico',
        description: 'La vesícula biliar se vacía a través del conducto cístico, que se une con el conducto hepático común y forma el conducto colédoco. La pared del conducto cístico contiene todas las capas de la vesícula biliar y la mucosa está plegada en una espiral que rodea la luz, formando la válvula espiral (válvula de Heister), la cual posee epitelio cilíndrico simple con microvellosidades cortas.',
        children: [
          {
            title: 'Función de la válvula de Heister',
            description: 'Mantener la luz del conducto cístico abierta y regular el flujo de entrada y salida de bilis, evitando el colapso de la vía durante cambios de presión.'
          }
        ]
      },
      {
        title: 'Células de la vesícula biliar',
        children: [
          {
            title: 'Células epiteliales alargadas (colangiocitos)',
            description: 'Realizar la absorción activa de agua e iones para concentrar la bilis y participar en la modificación de su composición.'
          },
          {
            title: 'Células mucosas',
            description: 'Sintetizar y liberar mucinas que forman una barrera protectora sobre la superficie luminal.'
          },
          {
            title: 'Linfitos y Plasmocitos',
            description: 'Sintetizar anticuerpos y ejercer la vigilancia inmunológica contra agentes patógenos en la pared vesicular.'
          }
        ]
      }
    ]
  },
  pancreas: {
    title: 'Páncreas',
    englishTitle: 'Pancreas',
    description: [
      'El páncreas es una glándula alargada con las siguientes partes: cabeza, cuerpo y cola. La cabeza es la porción amplia que se localiza en la curva, con forma de “C”, del duodeno. Está unida al duodeno por medio de tejido conjuntivo. El cuerpo del páncreas, de ubicación central, atraviesa la línea media del cuerpo humano y la cola se extiende en dirección al hilio del bazo.',
      'El páncreas es una glándula exocrina y endocrina. A diferencia del hígado, en el cual las funciones exocrinas y secretoras (endocrinas) se llevan a cabo en la misma célula, la doble función del páncreas se reparte en dos componentes estructuralmente distintos:'
    ],
    descriptionItems: [
      {
        title: 'El componente exocrino:',
        description: 'Sintetiza y secreta enzimas hacia el duodeno, indispensables para la digestión en el intestino. Se localiza en toda la glándula; dentro del páncreas exocrino se encuentran dispersos grupos celulares bien definidos, denominados islotes de Langerhans, que constituyen el componente endocrino.'
      },
      {
        title: 'El componente endocrino:',
        description: 'Sintetiza las hormonas insulina y glucagón y las secreta en la sangre. Estas hormonas regulan el metabolismo de glucosa, lípidos y proteínas en el organismo.'
      }
    ],
    structures: [
      {
        title: 'Células del páncreas (Islotes de Langerhans)',
        children: [
          {
            title: 'Células B',
            description: 'Constituyen entre el 60 y 70% del total de células insulares en los humanos; por lo general, se localizan en su porción central. Estas células secretan insulina.'
          },
          {
            title: 'Células A',
            description: 'Constituyen entre el 15 y 20% de la población insular en los humanos y, en general, se localizan en la periferia de los islotes. Estas células secretan glucagón.'
          },
          {
            title: 'Células D',
            description: 'Conforman entre el 5 y 10% del tejido pancreático endocrino total y también se localizan en la periferia de los islotes. Las células D secretan somatostatina dentro de sus gránulos de secreción, que son más grandes que los de las células A y B.'
          },
          {
            title: 'Células PP (polipéptido pancreático)',
            description: 'Estimulan las células gástricas principales, inhiben la secreción biliar y la motilidad intestinal, e inhiben la secreción de HCO3 y enzimas pancreáticas.'
          }
        ]
      },
      {
        title: 'Histología',
        children: [
          {
            title: 'Porción Exocrina',
            description: 'Está compuesta principalmente por acinos serosos formados por células acinares, las cuales presentan gránulos de cimógeno eosinófilos en su citoplasma apical. Contiene células centroacinares, que corresponden al inicio de los conductos excretores (conductos de Boll) ubicados dentro de la luz del acino. Sintetiza y secreta enzimas digestivas hacia el duodeno.'
          },
          {
            title: 'Porción Endocrina',
            description: 'Representada por los islotes de Langerhans, que se observan como cúmulos celulares pálidos dispersos entre los acinos exocrinos. En su interior albergan distintos tipos celulares: Células Alfa (A), Células Beta (B), Células Delta (D) y Células PP (polipéptido pancreático).'
          }
        ]
      }
    ]
  },
  epitelio: {
    title: 'Glándula Parótida',
    englishTitle: 'Parotid Gland',
    description: 'Son serosas y de estructura par, y constituyen las glándulas salivales mayores más grandes. El conducto parotídeo se desplaza desde la glándula que se encuentra debajo y delante del oído para ingresar en la cavidad bucal opuesta al segundo diente molar superior. Las unidades secretoras en la parótida son acinos serosos y rodean numerosos conductos intercalados largos y estrechos; los conductos estriados son grandes y suele haber una gran cantidad de tejido adiposo.',
    structures: [
      {
        title: 'Acinos serosos',
        description: 'Sintetizan, almacenan y secretan proteínas y enzimas, como la amilasa salival, hacia la luz glandular para iniciar la digestión de carbohidratos y facilitar la lubricación.'
      },
      {
        title: 'Tejido adiposo blanco',
        description: 'Actúa como reserva energética, brinda soporte estructural y rellena espacios intersticiales; es característico y abundante en la glándula parótida.'
      },
      {
        title: 'Lobulillo; conductos estriados (epitelio cilíndrico simple)',
        description: 'Modifican activamente la composición iónica de la saliva, reabsorbiendo sodio y cloruro y secretando potasio y bicarbonato, para volverla hipotónica.'
      },
      {
        title: 'Conductos intercalados',
        description: 'Transportan la saliva primaria desde los acinos e inician la modificación de su contenido hidroelectrolítico mediante secreción y reabsorción de iones.'
      },
      {
        title: 'Conductos excretores (epitelio estratificado cilíndrico)',
        description: 'Conducen la saliva colectada desde los lobulillos hacia el exterior de la glándula y desembocan en la cavidad bucal.'
      },
      {
        title: 'Tejido conjuntivo',
        description: 'Sostiene, cohesiona y envuelve los lobulillos y las estructuras vasculonerviosas de la glándula.'
      },
      {
        title: 'Células mioepiteliales',
        description: 'Son células contráctiles que rodean los acinos y conductos para facilitar la expulsión de la secreción.'
      }
    ]
  },
  conectivo: {
    title: 'Glándula Submandibular',
    englishTitle: 'Submandibular Gland',
    description: 'Son órganos pares más o menos grandes, están ubicadas debajo de cada lado del piso de la boca, cerca de la mandíbula. De cada glándula parte un conducto, con un trayecto central y hacia adelante, hasta una papila situada en el piso de la boca, lateral al frenillo de la lengua. Entre los acinos serosos predominantes suelen aparecer algunos acinos mucosos coronados por semilunas serosas. Los conductos intercalados son menos abundantes que en la glándula parótida.',
    structures: [
      {
        title: 'Acinos mixtos (acinos mucosos y acinos serosos coronados por semilunas)',
        description: 'Combinan la producción de secreción mucosa y serosa simultáneamente; las semilunas serosas aportan proteínas y enzimas complementarias al moco.'
      },
      {
        title: 'Lobulillo; conductos estriados (epitelio cilíndrico simple)',
        description: 'Modifican activamente la composición iónica de la saliva, reabsorbiendo sodio y cloruro y secretando potasio y bicarbonato, para volverla hipotónica.'
      },
      {
        title: 'Conducto excretor (epitelio estratificado cilíndrico)',
        description: 'Conduce la saliva colectada desde los lobulillos hacia el exterior de la glándula y desemboca en la cavidad bucal.'
      },
      {
        title: 'Arterias y venas',
        description: 'Proveen el flujo sanguíneo continuo necesario para la alta actividad metabólica y la secreción de saliva.'
      },
      {
        title: 'Tejido conjuntivo',
        description: 'Sostiene, cohesiona y envuelve los lobulillos y las estructuras vasculonerviosas de la glándula.'
      },
      {
        title: 'Linfocitos y plasmocitos aglomerados',
        description: 'Proporcionan defensa inmunológica local en el tejido conjuntivo glandular.'
      },
      {
        title: 'Células mucosas',
        description: 'Tienen citoplasma pálido y núcleo aplanado; sintetizan y retienen las vesículas de mucinógeno.'
      },
      {
        title: 'Células serosas',
        description: 'Se tiñen con intensidad y tienen núcleos redondos; sintetizan y empaquetan proteínas enzimáticas.'
      },
      {
        title: 'Células mioepiteliales',
        description: 'Son células contráctiles que facilitan la expulsión de la secreción.'
      }
    ]
  },
  sublingual: {
    title: 'Glándula Sublingual',
    englishTitle: 'Sublingual Gland',
    description: 'Son las más pequeñas de las glándulas salivales mayores pares; se encuentran en el piso de la boca, anteriores con respecto a las glándulas submandibulares. Sus múltiples conductos sublinguales pequeños desembocan en el conducto submandibular y también, de forma independiente, sobre el piso de la boca. Algunos de los acinos mucosos predominantes poseen semilunas serosas, pero es muy raro hallar acinos serosos puros. Los conductos intercalados y estriados son cortos, y a veces inexistentes; las unidades secretoras mucosas pueden ser más tubulares que acinares.',
    structures: [
      {
        title: 'Acinos mucosos',
        description: 'Secretan moco rico en glicoproteínas (mucinas) para lubricar, humedecer y proteger la mucosa bucal y el bolo alimenticio.'
      },
      {
        title: 'Conductos intralobulillares (epitelio cilíndrico simple)',
        description: 'Conducen la saliva colectada desde los lobulillos hacia el exterior de la glándula y desembocan en la cavidad bucal.'
      },
      {
        title: 'Conducto intercalado (epitelio plano o cilíndrico simple)',
        description: 'Transporta la saliva primaria desde los acinos e inicia la modificación de su contenido hidroelectrolítico mediante secreción y reabsorción de iones.'
      },
      {
        title: 'Células mucosas',
        description: 'Sintetizan y retienen las vesículas de mucinógeno; presentan citoplasma pálido y núcleo aplanado.'
      },
      {
        title: 'Semilunas serosas',
        description: 'Aportan secreción serosa y enzimas complementarias a los acinos mucosos.'
      },
      {
        title: 'Células mioepiteliales',
        description: 'Son células contráctiles que facilitan la expulsión de la secreción glandular.'
      }
    ]
  },
  puntaLengua: {
    title: 'Punta de lengua',
    englishTitle: 'Tip of the Tongue',
    description: [
      'La lengua es un órgano muscular que se proyecta dentro de la cavidad bucal desde su superficie inferior. Los músculos de la lengua son tanto extrínsecos, con un punto de inserción fuera de la lengua, como intrínsecos, confinados por completo dentro del órgano, sin inserción externa. El músculo estriado de la lengua está organizado en fascículos que, por lo general, se disponen en tres planos más o menos perpendiculares entre sí. Esta distribución de las fibras musculares permite una enorme flexibilidad y precisión en los movimientos de la lengua, que son esenciales para el habla humana, así como para su función en la digestión y en la deglución. Esta forma de organización muscular es exclusiva de la lengua. Entre los grupos de fibras musculares hay cantidades variables de tejido adiposo.',
      'El sentido del gusto está localizado en la lengua, en particular en la parte posterior. La lengua incluye una porción móvil, el cuerpo de la lengua, y una porción fija, la raíz de la lengua. La superficie dorsal o dorso de la lengua está dividida por un surco con forma de V, el surco terminal, en dos tercios anteriores, orientados hacia la cavidad bucal, y un tercio posterior, orientado hacia la orofaringe; la punta de la V se dirige hacia atrás y termina en una pequeña cavidad.'
    ],
    structures: [
      {
        title: 'Mucosa',
        description: 'La punta de la lengua presenta principalmente papilas filiformes y fungiformes. Las filiformes son proyecciones cónicas y curvadas del epitelio dirigidas posteriormente, no poseen corpúsculos gustativos y están revestidas por un epitelio plano estratificado muy cornificado. Las fungiformes se distribuyen entre las filiformes y aparecen como estructuras redondeadas en forma de hongo, emergentes y aisladas, revestidas por un epitelio plano estratificado no queratinizado; solo las fungiformes contienen corpúsculos gustativos, comprendidos por células neuroepiteliales, de sostén y basales.'
      },
      {
        title: 'Lámina propia',
        description: 'Bajo el epitelio se observa la lámina propia de tejido conjuntivo laxo, que sostiene las papilas y alberga vasos y nervios; más profundo se identifica tejido conjuntivo denso irregular formando tabiques y soporte estructural.'
      },
      {
        title: 'Muscular',
        description: 'En la región profunda se observa músculo estriado esquelético intrínseco y extrínseco.'
      },
      {
        title: 'Adventicia',
        description: 'Tejido conectivo.'
      }
    ]
  },
  baseLengua: {
    title: 'Base de lengua',
    englishTitle: 'Base of the Tongue',
    description: [],
    structures: [
      {
        title: 'Mucosa',
        description: 'La base de la lengua presenta principalmente papilas caliciformes y foliadas. Las caliciformes son estructuras grandes en forma de cúpula que se encuentran en la mucosa, justo por delante del surco terminal, mientras que las foliadas consisten en crestas bajas y paralelas, separadas en hendiduras profundas de la mucosa alineadas en ángulo recto con respecto al eje longitudinal de la lengua. Ambas están revestidas por un epitelio plano estratificado no queratinizado y contienen corpúsculos gustativos, conformados por células neuroepiteliales, de sostén y basales.'
      },
      {
        title: 'Lámina propia',
        description: 'Bajo el epitelio se observa la lámina propia formada por tejido conjuntivo laxo, que sostiene las papilas y contiene vasos y nervios; más profundo aparece tejido conjuntivo denso irregular formando tabiques y soporte estructural.'
      },
      {
        title: 'Muscular',
        description: 'En la región profunda se identifican fascículos de músculo estriado esquelético intrínseco y extrínseco.'
      },
      {
        title: 'Adventicia',
        description: 'Tejido conectivo.'
      }
    ]
  },
  'paladar-duro': {
    title: 'Paladar duro',
    englishTitle: 'Hard palate',
    description: 'La mucosa oral del paladar duro está recubierta por epitelio estratificado queratinizado, resistente a la fricción. Las rugas y la submucosa fibrosa sostienen la superficie masticatoria.',
    structures: ['Epitelio plano estratificado queratinizado.', 'Rugas palatinas y crestas epiteliales.', 'Lámina propia con tejido conectivo denso.', 'Submucosa fibrosa con glándulas menores.', 'Relación entre estructura y función masticatoria.']
  }
};

const chapterImageSets = {
  1: {
    label: 'Glándulas Salivales',
    imageDescription: 'las glándulas salivales',
    images: {
      4: 'image/Glandulas Salivales.jpg'
    }
  },
  2: {
    label: 'Glándula Parótida',
    imageDescription: 'la glándula parótida',
    images: {
      4: 'image/parotida 4x.jpg',
      10: 'image/parotida 10x.jpg',
      40: 'image/parotida 40x.jpg'
    }
  },
  3: {
    label: 'Glándula Submandibular',
    imageDescription: 'la glándula submandibular',
    images: {
      4: 'image/submandibular 4x.jpg',
      10: 'image/submandibular 10x.jpg',
      40: 'image/submandibular 40x.jpg'
    }
  },
  4: {
    label: 'Glándula Sublingual',
    imageDescription: 'la glándula sublingual',
    images: {
      4: 'image/sublingual 4x.jpg',
      10: 'image/sublingual 10x.jpg',
      40: 'image/sublingual 40x.jpg',
      '40-second': 'image/sublingual 40.2x.jpg'
    }
  },
  5: {
    label: 'Punta de lengua',
    imageDescription: 'la punta de la lengua',
    images: {
      4: 'image/puntadelengua 4x.jpg',
      10: 'image/puntadelengua 10x.jpg',
      '10-second': 'image/puntadelengua 10.2x.jpg',
      40: 'image/puntadelengua 40x.jpg'
    }
  },
  6: {
    label: 'Base de lengua',
    imageDescription: 'la base de la lengua',
    images: {
      4: 'image/basedelengua 4x.jpg',
      10: 'image/basedelengua 10x.jpg',
      40: 'image/basedelengua 40x.jpg',
      '40-second': 'image/basedelengua 40.2x.jpg'
    }
  },
  7: {
    label: 'Esófago',
    imageDescription: 'esófago',
    images: {
      4: 'image/esofago 4x.jpg',
      10: 'image/esofago 10x.jpg',
      40: 'image/esofago 40x.jpg',
      '40-second': 'image/esofago 40.2x.jpg'
    }
  },
  8: {
    label: 'Unión esofagogástrica',
    imageDescription: 'la unión esofagogástrica',
    images: {
      4: 'image/union esofagogastrica4x.jpeg',
      10: 'image/union esofagogastrica10x.jpeg'
    }
  },
  9: {
    label: 'Estómago',
    imageDescription: 'el estómago',
    images: {
      4: 'image/estomago.jpeg'
    }
  },
  10: {
    label: 'Estómago - Cardias',
    imageDescription: 'el cardias gástrico',
    images: {
      10: 'image/estomago cardias 10x.jpeg',
      40: 'image/estomago cardias 40x.jpeg'
    }
  },
  11: {
    label: 'Glándula Fúndica',
    imageDescription: 'el fundus gástrico',
    images: {
      4: 'image/fundus 4x.jpg',
      10: 'image/fundus 10x.jpg',
      '10-second': 'image/fundus 10.2x.jpg',
      40: 'image/fundus 40x.jpg',
      '40-second': 'image/fundus 40.2x.jpg'
    }
  },
  12: {
    label: 'Glándula Pilórica',
    imageDescription: 'el píloro',
    images: {
      4: 'image/piloro 4x.jpg',
      10: 'image/piloro 10x.jpg',
      40: 'image/piloro 40x.jpg'
    }
  },
  13: {
    label: 'Intestino Delgado',
    imageDescription: 'el intestino delgado',
    images: {
      4: 'image/intestino delgado.jpeg'
    }
  },
  14: {
    label: 'Intestino Delgado: Duodeno',
    imageDescription: 'el duodeno',
    images: {
      4: 'image/intestino delgado duodeno 4x.jpeg',
      10: 'image/intestino delgado duodeno 10x.jpeg'
    }
  },
  15: {
    label: 'Yeyuno',
    imageDescription: 'el yeyuno',
    images: {
      4: 'image/yeyuno 4x.jpg',
      10: 'image/yeyuno 10x.jpg',
      40: 'image/yeyuno 40x.jpg'
    }
  },
  16: {
    label: 'Íleon',
    imageDescription: 'el íleon',
    images: {
      4: 'image/ileon 4x.jpeg',
      10: 'image/ileon 10x.jpeg',
      '10-second': 'image/ileon 10.2x.jpeg',
      40: 'image/ileon 40x.jpeg'
    }
  },
  17: {
    label: 'Intestino Grueso',
    imageDescription: 'el intestino grueso',
    images: {
      4: 'image/Generalidades del Colon.jpeg'
    }
  },
  18: {
    label: 'Colon',
    imageDescription: 'el colon',
    images: {
      4: 'image/colon 4x.jpg',
      10: 'image/colon 10x.jpg',
      40: 'image/colon 40x.jpg',
      '40-second': 'image/colon 40.2x.jpg'
    }
  },
  19: {
    label: 'Hígado',
    imageDescription: 'el hígado',
    variantLabels: {
      '4-second': '4.2x',
      '10-second': '10.2x',
      '40-second': '40.2x'
    },
    images: {
      4: 'image/higado 4x.jpg',
      '4-second': 'image/higado4.2x.jpg',
      10: 'image/higado 10x.jpg',
      '10-second': 'image/higado 10.2x.jpg',
      40: 'image/higado 40x.jpg',
      '40-second': 'image/higado 40.2x.jpg'
    }
  },
  20: {
    label: 'Vesícula Biliar',
    imageDescription: 'la vesícula biliar',
    images: {
      4: 'image/vesicula 4x.jpg',
      10: 'image/vesicula 10x.jpg',
      40: 'image/vesicula 40x.jpg'
    }
  },
  21: {
    label: 'Páncreas',
    imageDescription: 'el páncreas',
    images: {
      4: 'image/pancreas 4x.jpg',
      10: 'image/pancreas 10x.jpg',
      40: 'image/pancreas 40x.jpg'
    }
  }
};

let activeImageLabel = chapterImageSets[2].label;
let activeImageDescription = chapterImageSets[2].imageDescription;

const state = {
  zoom: 1,
  minZoom: 1,
  maxZoom: 4,
  magnification: 4,
  imagePath: chapterImageSets[2].images[4],
  panX: 0,
  panY: 0,
  dragging: false,
  startX: 0,
  startY: 0,
  startPanX: 0,
  startPanY: 0,
  pinchStartDistance: 0,
  pinchStartZoom: 1,
  isPinching: false
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getTouchDistance(touchA, touchB) {
  const dx = touchA.clientX - touchB.clientX;
  const dy = touchA.clientY - touchB.clientY;
  return Math.hypot(dx, dy);
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
  magnificationReadout.textContent = `Objetivo ${state.magnification}x`;
  presetButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.image === state.imagePath));
  });
}

function renderImage() {
  imageSource.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
  viewerLayout.classList.toggle('is-zoomed', state.zoom > state.minZoom || state.isPinching);
  renderAnnotationTransform();
  updateZoomUI();
}

function setZoom(nextZoom) {
  state.zoom = clamp(nextZoom, state.minZoom, state.maxZoom);
  limitPan();
  renderImage();
}

function setMagnification(button) {
  state.magnification = Number(button.dataset.displayMagnification || button.dataset.magnification);
  state.imagePath = button.dataset.image;
  imageSource.src = state.imagePath;
  image.setAttribute('aria-label', `Microfotografía de ${activeImageDescription} a ${state.magnification}×`);
  document.getElementById('viewerImageTitle').textContent = `${activeImageLabel} · ${state.magnification}×`;
  document.getElementById('viewerImageCaption').textContent = `MICROFOTOGRAFÍA · ${activeImageLabel.toUpperCase()}`;
  state.panX = 0;
  state.panY = 0;
  setZoom(state.minZoom);
  updateAnnotationState();
}

function resetView() {
  state.panX = 0;
  state.panY = 0;
  setZoom(1);
  if (!state.imagePath) {
    magnificationReadout.textContent = 'Sin aumento';
    return;
  }

  const defaultPreset = Array.from(presetButtons).find((button) => !button.hidden && button.dataset.magnification === '4')
    || Array.from(presetButtons).find((button) => !button.hidden);
  if (defaultPreset) {
    setMagnification(defaultPreset);
  }
}

function setInfoOpen(isOpen) {
  infoPanel.classList.toggle('is-open', isOpen);
  infoToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('info-drawer-open', isOpen);
}

function loadTissue() {
  const searchParams = new URLSearchParams(window.location.search);
  const requestedChapter = searchParams.get('chapter');
  const requestedOrgan = searchParams.get('organ');
  const chapterTissue = {
    1: tissues.glandulasSalivales,
    2: tissues.epitelio,
    3: tissues.conectivo,
    4: tissues.sublingual,
    5: tissues.puntaLengua,
    6: tissues.baseLengua,
    7: tissues.esofago,
    8: tissues.unionEsofagogastrica,
    9: tissues.estomago,
    10: tissues.glandulasCardiales,
    11: tissues.fundus,
    12: tissues.piloro,
    13: tissues['intestino-delgado'],
    14: tissues.duodeno,
    15: tissues.yeyuno,
    16: tissues.ileon,
    17: tissues['intestino-grueso'],
    18: tissues.colon,
    19: tissues.higado,
    20: tissues.vesicula,
    21: tissues.pancreas
  }[requestedChapter];
  const tissue = chapterTissue || (requestedOrgan ? tissues[requestedOrgan] : tissues['paladar-duro']);

  if (!tissue) {
    viewerStatus.textContent = 'No se reconoció ese preparado. Se muestra la lámina de referencia.';
    return;
  }

  document.getElementById('tissue-title').textContent = `${tissue.title} / ${tissue.englishTitle}`;
  const descriptionTitle = document.getElementById('tissueDescriptionTitle');
  const structuresTitle = document.getElementById('structuresTitle');
  const isSalivaryGlandsChapter = requestedChapter === '1';
  const isParotidChapter = requestedChapter === '2';
  const isSubmandibularChapter = requestedChapter === '3';
  const isSublingualChapter = requestedChapter === '4';
  const isTongueTipChapter = requestedChapter === '5';
  const isEsophagusChapter = requestedChapter === '7';
  const isEsophagogastricChapter = requestedChapter === '8';
  const isStomachChapter = requestedChapter === '9';
  const isCardiacGlandsChapter = requestedChapter === '10';
  const isFundusChapter = requestedChapter === '11';
  const isPylorusChapter = requestedChapter === '12';
  const isSmallIntestineChapter = requestedChapter === '13';
  const isDuodenumChapter = requestedChapter === '14';
  const isJejunumChapter = requestedChapter === '15';
  const isIleumChapter = requestedChapter === '16';
  const isLargeIntestineChapter = requestedChapter === '17';
  const isColonChapter = requestedChapter === '18';
  const isLiverChapter = requestedChapter === '19';
  const isGallbladderChapter = requestedChapter === '20';
  const isPancreasChapter = requestedChapter === '21';
  structuresTitle.hidden = isEsophagogastricChapter;
  descriptionTitle.hidden = !isSalivaryGlandsChapter
    && !isParotidChapter
    && !isSubmandibularChapter
    && !isSublingualChapter
    && !isTongueTipChapter
    && !isEsophagusChapter
    && !isEsophagogastricChapter
    && !isStomachChapter
    && !isCardiacGlandsChapter
    && !isFundusChapter
    && !isPylorusChapter
    && !isSmallIntestineChapter
    && !isDuodenumChapter
    && !isJejunumChapter
    && !isIleumChapter
    && !isLargeIntestineChapter
    && !isColonChapter
    && !isLiverChapter
    && !isGallbladderChapter
    && !isPancreasChapter;
  descriptionTitle.textContent = isSalivaryGlandsChapter
    ? 'Generalidades de las glándulas salivales'
    : isParotidChapter
      ? 'Las glándulas parótidas'
      : isSubmandibularChapter
        ? 'Las glándulas submandibulares'
        : isSublingualChapter
          ? 'Las glándulas sublinguales'
          : isTongueTipChapter
            ? 'Generalidades de la lengua'
            : isEsophagusChapter
              ? 'Esófago generalidades:'
              : isEsophagogastricChapter
                ? 'La Unión Esofagogástrica:'
                : isStomachChapter
                  ? 'Estómago - Generalidades:'
                  : isCardiacGlandsChapter
                    ? 'Glándulas cardiales:'
                    : isFundusChapter
                      ? 'Glándulas Fúndicas de la Mucosa Gástrica - Generalidades y Función:'
                      : isPylorusChapter
                        ? 'Glándulas pilóricas - Generalidades:'
                        : isSmallIntestineChapter
                          ? 'Intestino Delgado - Generalidades:'
                          : isDuodenumChapter
                            ? 'Duodeno - Porciones y Descripción:'
                            : isJejunumChapter
                              ? 'Yeyuno - Generalidades:'
                              : isIleumChapter
                                ? 'Íleon - Generalidades:'
                                : isLargeIntestineChapter
                                  ? 'Intestino Grueso - Generalidades:'
                                  : isColonChapter
                                    ? 'Colon - Generalidades:'
                                    : isLiverChapter
                                      ? 'Generalidades del hígado:'
                                      : isGallbladderChapter
                                        ? 'Generalidades de la vesícula biliar:'
                                        : isPancreasChapter ? 'Páncreas - Generalidades:' : '';
  structuresTitle.textContent = isSalivaryGlandsChapter
    ? 'Células de las glándulas salivales mayores'
    : isColonChapter
      ? 'Descripción histológica por capas:'
      : isLiverChapter
        ? 'Características histológicas del hígado:'
        : isGallbladderChapter
          ? 'Características histológicas de la vesícula biliar:'
          : isPancreasChapter ? 'Histología:' : 'Características histológicas';
  const descriptionContainer = document.getElementById('tissueDescription');
  const descriptionParagraphs = Array.isArray(tissue.description) ? tissue.description : [tissue.description];
  descriptionContainer.replaceChildren(...descriptionParagraphs.map((description) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = description;
    return paragraph;
  }));
  if (tissue.descriptionItems?.length) {
    const descriptionList = document.createElement('ul');
    descriptionList.append(...tissue.descriptionItems.map((item) => {
      const listItem = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = `${item.title} `;
      listItem.append(title, document.createTextNode(item.description));
      return listItem;
    }));
    descriptionContainer.append(descriptionList);
  }
  const chapterImageSet = chapterImageSets[requestedChapter];
  if (chapterImageSet) {
    const chapterTitles = {
      1: 'GLÁNDULAS SALIVALES',
      2: 'GLÁNDULA PARÓTIDA',
      3: 'GLÁNDULA SUBMANDIBULAR',
      4: 'SUBLINGUAL',
      5: 'PUNTA DE LENGUA',
      6: 'BASE DE LENGUA',
      7: 'ESÓFAGO',
      8: 'UNIÓN ESOFAGOGÁSTRICA',
      9: 'ESTÓMAGO',
      10: 'GLÁNDULAS CARDIALES Y CAPAS DEL ESTÓMAGO',
      11: 'GLÁNDULA FÚNDICA',
      12: 'GLÁNDULA PILÓRICA',
      13: 'INTESTINO DELGADO',
      14: 'INTESTINO DELGADO: DUODENO',
      15: 'INTESTINO DELGADO: YEYUNO',
      16: 'INTESTINO DELGADO: ÍLEON',
      17: 'INTESTINO GRUESO',
      18: 'INTESTINO GRUESO: COLON',
      19: 'HÍGADO',
      20: 'VESÍCULA BILIAR',
      21: 'PÁNCREAS'
    };
    const chapterTitle = chapterTitles[requestedChapter];
    activeImageLabel = chapterImageSet.label;
    activeImageDescription = chapterImageSet.imageDescription;
    document.getElementById('viewerChapter').textContent = `CAPÍTULO ${requestedChapter} · ${chapterTitle}`;
    presetButtons.forEach((button) => {
      const imageKey = button.dataset.imageKey || button.dataset.magnification;
      const imagePath = chapterImageSet.images[imageKey];
      button.hidden = !imagePath;
      if (imagePath) {
        button.dataset.image = imagePath;
        const variantLabel = chapterImageSet.variantLabels?.[imageKey];
        button.textContent = variantLabel || `${button.dataset.magnification}x`;
        button.setAttribute('aria-label', variantLabel || (button.dataset.imageKey
          ? `${button.dataset.magnification}x, segunda imagen`
          : `${button.dataset.magnification}x`));
        if (variantLabel) {
          button.dataset.displayMagnification = variantLabel.slice(0, -1);
        } else {
          delete button.dataset.displayMagnification;
        }
      }
    });
    const defaultImageKey = chapterImageSet.images[4] ? 4 : chapterImageSet.images[10] ? 10 : 40;
    const defaultImage = chapterImageSet.images[defaultImageKey];
    const defaultMagnification = Number(defaultImageKey);
    const referenceImage = document.getElementById('referenceImage');
    referenceImage.src = defaultImage;
    referenceImage.hidden = false;
    state.imagePath = defaultImage;
    state.magnification = defaultMagnification;
    imageSource.src = defaultImage;
    image.setAttribute('aria-label', `Microfotografía de ${activeImageDescription} a ${defaultMagnification}×`);
    document.getElementById('viewerImageTitle').textContent = `${activeImageLabel} · ${defaultMagnification}×`;
    document.getElementById('viewerImageCaption').textContent = `MICROFOTOGRAFÍA · ${activeImageLabel.toUpperCase()}`;
    captionDetailsButton.hidden = !isEsophagogastricChapter;
    captionDetailsButton16.hidden = !isIleumChapter;
    captionDetailsButton10.hidden = !isCardiacGlandsChapter;
    captionDetailsButton14.hidden = !isDuodenumChapter;
    image.classList.toggle('has-caption-details', isEsophagogastricChapter || isIleumChapter || isCardiacGlandsChapter || isDuodenumChapter);
    setCaptionDetailsOpen(false);
    setCaptionDetailsOpen16(false);
    setCaptionDetailsOpen10(false);
    setCaptionDetailsOpen14(false);
    activeAnnotationConfig = null;
    renderAnnotationTags(annotationChapters[requestedChapter] || null);
    annotationsChapterEnabled = Boolean(activeAnnotationConfig);
    if (annotationsChapterEnabled) {
      annotationsActive = true;
    }
    updateAnnotationState();
  }

  const structureList = document.getElementById('tissueStructures');
  if (tissue.structuresDisplay === 'paragraphs') {
    structureList.replaceChildren(...tissue.structures.map((text) => {
      const paragraph = document.createElement('p');
      paragraph.className = 'structure-paragraph';
      if (typeof text === 'string') {
        paragraph.textContent = text;
      } else {
        const title = document.createElement('strong');
        title.textContent = text.title;
        paragraph.append(title);
        if (text.description) {
          paragraph.append(document.createTextNode(text.description));
        }
      }
      return paragraph;
    }));
    return;
  }

  const createStructureItem = (structure) => {
    const item = document.createElement('li');
    if (typeof structure === 'string') {
      item.textContent = structure;
    } else {
      if (structure.id) {
        item.id = structure.id;
        item.tabIndex = -1;
        item.classList.add('structure-anchor');
      }
      const title = document.createElement('strong');
      title.textContent = `${structure.title}: `;
      item.append(title);
      if (structure.description) {
        item.append(document.createTextNode(structure.description));
      }
      if (structure.children?.length) {
        const children = document.createElement('ul');
        children.append(...structure.children.map(createStructureItem));
        item.append(children);
      }
    }
    return item;
  };
  const list = document.createElement('ul');
  list.append(...tissue.structures.map(createStructureItem));
  structureList.replaceChildren(list);
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
      updateOverlayTogglePlacement();
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
      updateOverlayTogglePlacement();
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
  updateOverlayTogglePlacement();
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
  updateOverlayTogglePlacement();
  updateFullscreenButton();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !document.fullscreenElement && viewerLayout.classList.contains('is-fullscreen')) {
    viewerLayout.classList.remove('is-fullscreen');
    updateOverlayTogglePlacement();
    viewerStatus.textContent = '';
    updateFullscreenButton();
  }
});

infoToggle.addEventListener('click', () => setInfoOpen(!infoPanel.classList.contains('is-open')));
document.getElementById('closeInfo').addEventListener('click', () => setInfoOpen(false));
infoBackdrop.addEventListener('click', () => setInfoOpen(false));
document.querySelectorAll('#toggleCaptionDetails, #captionDetailsPanel .viewer-caption-close, #captionDetailsPanel .extended-info-close').forEach((button) => {
  button.addEventListener('click', toggleCap8Info);
});

document.querySelectorAll('#toggleCaptionDetails16, #captionDetailsPanel16 .viewer-caption-close, #captionDetailsPanel16 .extended-info-close').forEach((button) => {
  button.addEventListener('click', toggleCap16Info);
});

document.querySelectorAll('#toggleCaptionDetails10, #captionDetailsPanel10 .viewer-caption-close, #captionDetailsPanel10 .extended-info-close').forEach((button) => {
  button.addEventListener('click', toggleCap10Info);
});

document.querySelectorAll('#toggleCaptionDetails14, #captionDetailsPanel14 .viewer-caption-close, #captionDetailsPanel14 .extended-info-close').forEach((button) => {
  button.addEventListener('click', toggleCap14Info);
});

annotationToggle.addEventListener('click', toggleYeyunumAnnotations);

const structureHighlightTimers = new WeakMap();

annotationLayer.addEventListener('click', (event) => {
  const link = event.target.closest('.annotation-tag-link');
  if (!link) {
    return;
  }

  const targetId = link.getAttribute('href')?.replace(/^#/, '');
  const target = targetId ? document.getElementById(targetId) : null;
  if (!target) {
    return;
  }

  event.preventDefault();

  if (window.matchMedia('(max-width: 900px)').matches) {
    setInfoOpen(true);
  }

  target.focus({ preventScroll: true });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });

  const activeTimer = structureHighlightTimers.get(target);
  if (activeTimer) {
    window.clearTimeout(activeTimer);
  }
  target.classList.add('highlight-target');
  const highlightTimer = window.setTimeout(() => {
    target.classList.remove('highlight-target');
    structureHighlightTimers.delete(target);
  }, 1800);
  structureHighlightTimers.set(target, highlightTimer);
});

stage.addEventListener('wheel', (event) => {
  event.preventDefault();
  const delta = event.deltaY < 0 ? 0.12 : -0.12;
  setZoom(state.zoom * (1 + delta));
}, { passive: false });

stage.addEventListener('touchstart', (event) => {
  if (event.target.closest('button, a')) {
    return;
  }

  if (event.touches.length === 2) {
    event.preventDefault();
    state.dragging = false;
    state.isPinching = true;
    renderImage();
    state.pinchStartDistance = getTouchDistance(event.touches[0], event.touches[1]);
    state.pinchStartZoom = state.zoom;
    stage.classList.remove('is-dragging');
    return;
  }

  if (event.touches.length === 1) {
    const touch = event.touches[0];
    if (state.zoom <= state.minZoom) {
      return;
    }

    state.dragging = true;
    state.startX = touch.clientX;
    state.startY = touch.clientY;
    state.startPanX = state.panX;
    state.startPanY = state.panY;
    stage.classList.add('is-dragging');
  }
}, { passive: false });

stage.addEventListener('touchmove', (event) => {
  if (event.target.closest('button, a')) {
    return;
  }

  if (event.touches.length === 2) {
    event.preventDefault();
    const distance = getTouchDistance(event.touches[0], event.touches[1]);
    if (!state.pinchStartDistance) {
      state.pinchStartDistance = distance;
      state.pinchStartZoom = state.zoom;
      return;
    }

    const nextZoom = state.pinchStartZoom * (distance / state.pinchStartDistance);
    setZoom(nextZoom);
    return;
  }

  if (event.touches.length === 1 && state.dragging) {
    event.preventDefault();
    const touch = event.touches[0];
    state.panX = state.startPanX + (touch.clientX - state.startX);
    state.panY = state.startPanY + (touch.clientY - state.startY);
    limitPan();
    renderImage();
  }
}, { passive: false });

stage.addEventListener('touchend', (event) => {
  if (event.touches.length === 0) {
    state.dragging = false;
    state.isPinching = false;
    state.pinchStartDistance = 0;
    renderImage();
    stage.classList.remove('is-dragging');
    return;
  }

  if (event.touches.length === 1) {
    state.isPinching = false;
    const touch = event.touches[0];
    state.dragging = true;
    state.startX = touch.clientX;
    state.startY = touch.clientY;
    state.startPanX = state.panX;
    state.startPanY = state.panY;
    state.pinchStartDistance = 0;
    renderImage();
    stage.classList.add('is-dragging');
  }
}, { passive: false });

stage.addEventListener('touchcancel', () => {
  state.dragging = false;
  state.isPinching = false;
  state.pinchStartDistance = 0;
  stage.classList.remove('is-dragging');
  renderImage();
});

stage.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch') {
    return;
  }

  if (event.pointerType !== 'mouse' && !event.target.closest('button, a')) {
    window.clearTimeout(overlayInteractionTimeout);
    image.classList.add('is-interacting');
    overlayPointerIds.add(event.pointerId);
  }

  if (event.target.closest('button, a')) {
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
  if (event.pointerType === 'touch' || !state.dragging) {
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
stage.addEventListener('lostpointercapture', (event) => {
  stopDragging();
  finishOverlayInteraction(event);
});

function finishOverlayInteraction(event) {
  overlayPointerIds.delete(event.pointerId);
  if (overlayPointerIds.size === 0 && image.classList.contains('is-interacting')) {
    showCaptionAfterInteraction();
  }
}

document.addEventListener('pointerup', finishOverlayInteraction);
document.addEventListener('pointercancel', finishOverlayInteraction);
window.addEventListener('resize', () => {
  limitPan();
  renderImage();
  updateAnnotationLayerBounds();
  if (!captionDetailsPanel.hidden) {
    setCaptionDetailsOpen(true);
  }
  if (!captionDetailsPanel16.hidden) {
    setCaptionDetailsOpen16(true);
  }
  if (!captionDetailsPanel10.hidden) {
    setCaptionDetailsOpen10(true);
  }
  if (!captionDetailsPanel14.hidden) {
    setCaptionDetailsOpen14(true);
  }
});

loadTissue();
resetView();
