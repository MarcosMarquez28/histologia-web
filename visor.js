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
    title: 'Glándulas Fúndicas de la Mucosa Gástrica',
    englishTitle: 'Gastric Fundus',
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
    title: 'Glándulas pilóricas y capas del estómago',
    englishTitle: 'Pylorus',
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
  13: {
    label: 'Intestino Delgado',
    imageDescription: 'el intestino delgado',
    images: {
      4: 'image/intestino delgado.jpeg'
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
  if (requestedChapter === '14' || requestedChapter === '17') {
    document.getElementById('viewerChapter').textContent = `CAPÍTULO ${requestedChapter} · EN PREPARACIÓN`;
    document.getElementById('tissue-title').textContent = 'En preparación';
    document.getElementById('tissueDescriptionTitle').hidden = true;
    document.getElementById('tissueDescription').replaceChildren();
    document.getElementById('structuresTitle').hidden = true;
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
    magnificationReadout.textContent = 'Sin aumento';
    viewerStatus.textContent = 'Este capítulo está reservado para nuevo contenido.';
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
    10: tissues.glandulasCardiales,
    11: tissues.fundus,
    12: tissues.piloro,
    13: tissues['intestino-delgado'],
    15: tissues.yeyuno,
    16: tissues.ileon,
    18: tissues['intestino-grueso'],
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
    && !isSmallIntestineChapter;
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
                        : isSmallIntestineChapter ? 'Intestino Delgado - Generalidades:' : '';
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
      2: 'EL EPITELIO',
      3: 'TEJIDO CONECTIVO',
      4: 'SUBLINGUAL',
      5: 'PUNTA DE LENGUA',
      6: 'BASE DE LENGUA',
      7: 'ESÓFAGO',
      8: 'UNIÓN ESOFAGOGÁSTRICA',
      9: 'ESTÓMAGO',
      10: 'GLÁNDULAS CARDIALES Y CAPAS DEL ESTÓMAGO',
      11: 'GLÁNDULAS FÚNDICAS DE LA MUCOSA GÁSTRICA',
      12: 'GLÁNDULAS PILÓRICAS Y CAPAS DEL ESTÓMAGO',
      13: 'INTESTINO DELGADO',
      15: 'YEYUNO',
      16: 'ÍLEON',
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
    const referenceImage = document.getElementById('referenceImage');
    referenceImage.src = chapterImageSet.images[4];
    referenceImage.hidden = false;
    state.imagePath = chapterImageSet.images[4];
    imageSource.src = chapterImageSet.images[4];
    image.setAttribute('aria-label', `Microfotografía de ${activeImageDescription} a 4×`);
    document.getElementById('viewerImageTitle').textContent = `${activeImageLabel} · 4×`;
    document.getElementById('viewerImageCaption').textContent = `MICROFOTOGRAFÍA · ${activeImageLabel.toUpperCase()}`;
  } else if (isCardiacGlandsChapter) {
    document.getElementById('viewerChapter').textContent = 'CAPÍTULO 10 · GLÁNDULAS CARDIALES Y CAPAS DEL ESTÓMAGO';
    document.getElementById('viewerImageTitle').textContent = 'Microfotografía no disponible';
    document.getElementById('viewerImageCaption').textContent = 'CAPÍTULO SIN MICROFOTOGRAFÍA';
    imageSource.removeAttribute('src');
    image.setAttribute('aria-label', 'Capítulo 10 sin microfotografía');
    document.querySelector('.info-thumb').hidden = true;
    presetButtons.forEach((button) => {
      button.hidden = true;
    });
    state.imagePath = '';
    viewerStatus.textContent = 'El contenido histológico está disponible; no hay una microfotografía asignada a este capítulo.';
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
