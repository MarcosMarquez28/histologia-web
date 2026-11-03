const stage = document.getElementById('viewerStage');
const image = document.getElementById('viewerImage');
const imageSource = document.getElementById('viewerImageSource');
imageSource.addEventListener('dragstart', (event) => event.preventDefault());
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
    description: 'La unión esofagogástrica es la zona de transición entre el epitelio plano estratificado no queratinizado del esófago y el epitelio cilíndrico simple secretor de la mucosa gástrica.',
    structures: ['Transición abrupta entre el epitelio esofágico y el gástrico.', 'Epitelio plano estratificado no queratinizado del esófago.', 'Epitelio cilíndrico simple de la mucosa gástrica.', 'Lámina propia y muscular de la mucosa a ambos lados de la unión.', 'Fositas y glándulas gástricas en el lado del estómago.']
  },
  estomago: {
    title: 'Estómago',
    englishTitle: 'Stomach',
    description: 'La mucosa gástrica forma fositas que continúan en glándulas tubulares. Su epitelio cilíndrico simple y las células especializadas participan en la secreción de moco, ácido y enzimas digestivas.',
    structures: ['Mucosa con fositas y glándulas gástricas.', 'Células mucosas superficiales y del cuello.', 'Células parietales productoras de ácido.', 'Células principales productoras de pepsinógeno.', 'Muscular externa con tres capas características.']
  },
  fundus: {
    title: 'Fundus',
    englishTitle: 'Gastric Fundus',
    description: 'El fundus gástrico presenta mucosa con glándulas fúndicas tubulares. En ellas se distinguen células mucosas del cuello, parietales y principales, relacionadas con la secreción gástrica.',
    structures: ['Fositas gástricas que continúan en glándulas fúndicas.', 'Células parietales acidófilas.', 'Células principales basófilas.', 'Células mucosas del cuello.', 'Lámina propia entre glándulas tubulares.']
  },
  piloro: {
    title: 'Píloro',
    englishTitle: 'Pylorus',
    description: 'El píloro presenta fositas gástricas profundas que desembocan en glándulas mucosas ramificadas. La capa circular de la muscular externa se engrosa para formar el esfínter pilórico.',
    structures: ['Fositas gástricas profundas.', 'Glándulas pilóricas predominantemente mucosas.', 'Lámina propia entre las glándulas.', 'Muscular de la mucosa.', 'Engrosamiento de la capa circular en el esfínter pilórico.']
  },
  yeyuno: {
    title: 'Yeyuno',
    englishTitle: 'Jejunum',
    description: 'El yeyuno presenta pliegues circulares y vellosidades que amplían la superficie de absorción. Su mucosa contiene criptas de Lieberkühn, y la submucosa carece de las glándulas de Brunner características del duodeno.',
    structures: ['Pliegues circulares con vellosidades.', 'Epitelio cilíndrico simple con enterocitos.', 'Células caliciformes entre los enterocitos.', 'Criptas de Lieberkühn en la mucosa.', 'Submucosa sin glándulas de Brunner ni placas de Peyer prominentes.']
  },
  ileon: {
    title: 'Íleon',
    englishTitle: 'Ileum',
    description: 'El íleon es el segmento distal del intestino delgado. Su mucosa presenta vellosidades y criptas, con abundantes células caliciformes y agregados linfoides que forman las placas de Peyer.',
    structures: ['Vellosidades intestinales más cortas que las del yeyuno.', 'Epitelio cilíndrico simple con enterocitos y células caliciformes.', 'Criptas de Lieberkühn en la mucosa.', 'Placas de Peyer como agregados linfoides en la mucosa y submucosa.', 'Células de Paneth en la base de las criptas.']
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
    description: 'La superficie de absorción se amplía mediante pliegues, vellosidades y microvellosidades. Las criptas contienen células madre, enteroendocrinas y células de Paneth, especialmente evidentes en el íleon.',
    structures: ['Mucosa con vellosidades y criptas de Lieberkühn.', 'Enterocitos con borde en cepillo.', 'Células caliciformes secretoras de moco.', 'Células de Paneth en la base de las criptas.', 'Submucosa con glándulas de Brunner en duodeno o placas de Peyer en íleon.']
  },
  'intestino-grueso': {
    title: 'Intestino grueso: colon',
    englishTitle: 'Large intestine: colon',
    description: 'El colon presenta mucosa sin vellosidades y criptas rectas, numerosas y ricas en células caliciformes. La absorción de agua y la secreción de moco caracterizan su función.',
    structures: ['Mucosa lisa sin vellosidades.', 'Criptas de Lieberkühn largas y paralelas.', 'Abundantes células caliciformes.', 'Muscular de la mucosa y submucosa bien delimitadas.', 'Muscular externa; tenias del colon en la capa longitudinal.']
  },
  higado: {
    title: 'Hígado',
    englishTitle: 'Liver',
    description: 'El parénquima se organiza en lobulillos y cordones de hepatocitos separados por sinusoides. La sangre fluye hacia la vena central mientras la bilis avanza en dirección opuesta hacia los conductos biliares.',
    structures: ['Lobulillos hepáticos y vena central.', 'Cordones de hepatocitos.', 'Sinusoides con células endoteliales y de Kupffer.', 'Espacios porta con rama de vena porta y arteria hepática.', 'Canalículos biliares entre hepatocitos.']
  },
  vesicula: {
    title: 'Vesícula Biliar',
    englishTitle: 'Gallbladder',
    description: 'La vesícula biliar concentra y almacena la bilis. Su mucosa forma pliegues revestidos por epitelio cilíndrico simple y carece de muscular de la mucosa y submucosa bien definidas.',
    structures: ['Mucosa muy plegada revestida por epitelio cilíndrico simple.', 'Lámina propia de tejido conectivo laxo.', 'Capa muscular irregular de músculo liso.', 'Tejido perimuscular conectivo y vasos sanguíneos.', 'Serosa en la superficie libre y adventicia en la superficie hepática.']
  },
  pancreas: {
    title: 'Páncreas',
    englishTitle: 'Pancreas',
    description: 'Glándula mixta lobulada: los acinos serosos producen secreción digestiva y los islotes de Langerhans forman el componente endocrino. Los conductos intercalares comienzan dentro del acino.',
    structures: ['Acinos serosos con gránulos de zimógeno.', 'Células centroacinares en el inicio de los conductos.', 'Conductos intercalares e intralobulillares.', 'Islotes de Langerhans más pálidos que el acino.', 'Tabiques de tejido conectivo entre lobulillos.']
  },
  epitelio: {
    title: 'El Epitelio',
    englishTitle: 'Epithelium',
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
    title: 'Tejido Conectivo',
    englishTitle: 'Connective Tissue',
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
    label: 'Parótida',
    imageDescription: 'la glándula parótida',
    images: {
      4: 'image/parotida 4x.jpg',
      10: 'image/parotida 10x.jpg',
      40: 'image/parotida 40x.jpg'
    }
  },
  3: {
    label: 'Submandibular',
    imageDescription: 'la glándula submandibular',
    images: {
      4: 'image/submandibular 4x.jpg',
      10: 'image/submandibular 10x.jpg',
      40: 'image/submandibular 40x.jpg'
    }
  },
  4: {
    label: 'Sublingual',
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
  11: {
    label: 'Fundus',
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
    label: 'Píloro',
    imageDescription: 'el píloro',
    images: {
      4: 'image/piloro 4x.jpg',
      10: 'image/piloro 10x.jpg',
      40: 'image/piloro 40x.jpg'
    }
  },
  14: {
    label: 'Yeyuno',
    imageDescription: 'el yeyuno',
    images: {
      4: 'image/yeyuno 4x.jpg',
      10: 'image/yeyuno 10x.jpg',
      40: 'image/yeyuno 40x.jpg'
    }
  },
  15: {
    label: 'Íleon',
    imageDescription: 'el íleon',
    images: {
      4: 'image/ileon 4x.jpeg',
      10: 'image/ileon 10x.jpeg',
      '10-second': 'image/ileon 10.2x.jpeg',
      40: 'image/ileon 40x.jpeg'
    }
  },
  16: {
    label: 'Colon',
    imageDescription: 'el colon',
    images: {
      4: 'image/colon 4x.jpg',
      10: 'image/colon 10x.jpg',
      40: 'image/colon 40x.jpg',
      '40-second': 'image/colon 40.2x.jpg'
    }
  },
  17: {
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
  18: {
    label: 'Vesícula Biliar',
    imageDescription: 'la vesícula biliar',
    images: {
      4: 'image/vesicula 4x.jpg',
      10: 'image/vesicula 10x.jpg',
      40: 'image/vesicula 40x.jpg'
    }
  },
  19: {
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
  magnificationReadout.textContent = `Objetivo ${state.magnification}x`;
  presetButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.image === state.imagePath));
  });
}

function renderImage() {
  imageSource.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
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
}

function resetView() {
  state.panX = 0;
  state.panY = 0;
  setZoom(1);
  if (!state.imagePath) {
    magnificationReadout.textContent = 'Sin aumento';
    return;
  }

  const defaultPreset = Array.from(presetButtons).find((button) => !button.hidden && button.dataset.magnification === '4');
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
  if (requestedChapter === '10') {
    document.getElementById('viewerChapter').textContent = `CAPÍTULO ${requestedChapter} · EN PREPARACIÓN`;
    document.getElementById('tissue-title').textContent = 'En preparación';
    document.getElementById('tissueDescription').textContent = 'Este capítulo estará disponible próximamente.';
    document.getElementById('tissueStructures').replaceChildren();
    document.getElementById('viewerImageTitle').textContent = 'En preparación';
    document.getElementById('viewerImageCaption').textContent = 'CAPÍTULO EN PREPARACIÓN';
    imageSource.removeAttribute('src');
    image.setAttribute('aria-label', `Capítulo ${requestedChapter} en preparación`);
    document.querySelector('.info-thumb').hidden = true;
    presetButtons.forEach((button) => {
      button.hidden = true;
    });
    state.imagePath = '';
    viewerStatus.textContent = 'El contenido de este capítulo se añadirá próximamente.';
    return;
  }

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
    11: tissues.fundus,
    12: tissues.piloro,
    14: tissues.yeyuno,
    15: tissues.ileon,
    16: tissues['intestino-grueso'],
    17: tissues.higado,
    18: tissues.vesicula,
    19: tissues.pancreas
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
  descriptionTitle.hidden = !isSalivaryGlandsChapter
    && !isParotidChapter
    && !isSubmandibularChapter
    && !isSublingualChapter
    && !isTongueTipChapter
    && !isEsophagusChapter;
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
            : isEsophagusChapter ? 'Esófago generalidades:' : '';
  structuresTitle.textContent = isSalivaryGlandsChapter
    ? 'Células de las glándulas salivales mayores'
    : 'Características histológicas';
  const descriptionContainer = document.getElementById('tissueDescription');
  const descriptionParagraphs = Array.isArray(tissue.description) ? tissue.description : [tissue.description];
  descriptionContainer.replaceChildren(...descriptionParagraphs.map((description) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = description;
    return paragraph;
  }));
  const chapterImageSet = chapterImageSets[requestedChapter];
  if (chapterImageSet) {
    const chapterTitles = {
      1: 'GLÁNDULAS SALIVALES',
      2: 'EL EPITELIO',
      3: 'TEJIDO CONECTIVO',
      4: 'SUBLINGUAL',
      5: 'PUNTA DE LENGUA',
      6: 'BASE DE LENGUA',
      7: 'ESÓFAGO',
      8: 'UNIÓN ESOFAGOGÁSTRICA',
      9: 'ESTÓMAGO',
      11: 'FUNDUS',
      12: 'PÍLORO',
      14: 'YEYUNO',
      15: 'ÍLEON',
      16: 'INTESTINO GRUESO: COLON',
      17: 'HÍGADO',
      18: 'VESÍCULA BILIAR',
      19: 'PÁNCREAS'
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
    const referenceImage = document.getElementById('referenceImage');
    referenceImage.src = chapterImageSet.images[4];
    referenceImage.hidden = false;
    state.imagePath = chapterImageSet.images[4];
    imageSource.src = chapterImageSet.images[4];
    image.setAttribute('aria-label', `Microfotografía de ${activeImageDescription} a 4×`);
    document.getElementById('viewerImageTitle').textContent = `${activeImageLabel} · 4×`;
    document.getElementById('viewerImageCaption').textContent = `MICROFOTOGRAFÍA · ${activeImageLabel.toUpperCase()}`;
  }

  const structureList = document.getElementById('tissueStructures');
  const createStructureItem = (structure) => {
    const item = document.createElement('li');
    if (typeof structure === 'string') {
      item.textContent = structure;
    } else {
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
  structureList.replaceChildren(...tissue.structures.map(createStructureItem));
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
