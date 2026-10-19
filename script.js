const searchInput = document.getElementById('moduleSearch');
const moduleCards = Array.from(document.querySelectorAll('.module-card'));
const emptyMessage = document.getElementById('searchEmpty');
const themeToggleButtons = document.querySelectorAll('[data-theme-toggle]');
const themeMeta = document.querySelector('meta[name="theme-color"]');

const setTheme = (isLight, persist = true) => {
  document.documentElement.classList.toggle('light-mode', isLight);
  document.body.classList.toggle('light-mode', isLight);
  themeToggleButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(isLight));
    button.setAttribute('aria-label', isLight ? 'Activar modo oscuro' : 'Activar modo claro');
    button.querySelector('.theme-toggle-icon').textContent = isLight ? '☾' : '☼';
  });
  if (themeMeta) {
    themeMeta.content = isLight ? '#fdf7fa' : '#0d0d15';
  }
  if (persist) {
    localStorage.setItem('histologia-theme', isLight ? 'light' : 'dark');
  }
};

setTheme(document.documentElement.classList.contains('light-mode'), false);
themeToggleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setTheme(!document.body.classList.contains('light-mode'));
  });
});

const menuToggle = document.querySelector('[data-menu-toggle]');
const siteNavigation = document.getElementById('siteNavigation');

if (menuToggle && siteNavigation) {
  const setMenuOpen = (isOpen) => {
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    menuToggle.querySelector('span').textContent = isOpen ? '×' : '☰';
    siteNavigation.classList.toggle('is-open', isOpen);
  };

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  siteNavigation.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('click', (event) => {
    if (menuToggle.getAttribute('aria-expanded') === 'true'
      && event.target instanceof Node
      && !menuToggle.contains(event.target)
      && !siteNavigation.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      setMenuOpen(false);
    }
  });
}

if (searchInput && emptyMessage) {
  const normalizeText = (text) => text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');

  searchInput.addEventListener('input', () => {
    const query = normalizeText(searchInput.value.trim());
    let visibleCards = 0;

    moduleCards.forEach((card) => {
      const searchableText = normalizeText(`${card.dataset.search || ''} ${card.textContent || ''}`);
      const isMatch = searchableText.includes(query);
      card.hidden = !isMatch;
      visibleCards += Number(isMatch);
    });

    emptyMessage.hidden = visibleCards !== 0;
  });

}

const quizSearch = document.getElementById('quizSearch');
const quizCards = Array.from(document.querySelectorAll('.quiz-card'));
const quizSearchEmpty = document.getElementById('quizSearchEmpty');
const quizSelection = document.getElementById('quizSelection');
const activeQuiz = document.getElementById('quizActive');
const quizForm = document.getElementById('digestiveQuiz');
const quizQuestions = document.getElementById('quizQuestions');
const quizResult = document.getElementById('quizResult');

const quizzes = {
  esofago: {
    title: 'Quiz: Esófago',
    description: 'Epitelio de revestimiento, glándulas submucosas y capas de la pared esofágica.',
    questions: [
      {
        prompt: '¿Qué tipo de epitelio reviste normalmente la mucosa del esófago?',
        options: ['Cilíndrico simple', 'Plano estratificado no queratinizado', 'De transición'],
        answer: 1,
        explanation: 'El epitelio plano estratificado no queratinizado protege al esófago de la fricción del bolo alimenticio.'
      },
      {
        prompt: '¿Dónde se localizan las glándulas esofágicas propias?',
        options: ['En la submucosa', 'En la serosa', 'En el epitelio superficial'],
        answer: 0,
        explanation: 'Las glándulas esofágicas propias se encuentran en la submucosa y secretan moco para lubricar el conducto.'
      },
      {
        prompt: '¿Qué cambio caracteriza a la muscular externa a lo largo del esófago?',
        options: ['Es músculo liso en toda su longitud', 'Es músculo esquelético en toda su longitud', 'Pasa de músculo esquelético a mixto y luego a liso'],
        answer: 2,
        explanation: 'El tercio superior es principalmente esquelético, el medio es mixto y el inferior es músculo liso.'
      }
    ]
  },
  estomago: {
    title: 'Quiz: Estómago y glándulas gástricas',
    description: 'Células parietales y principales, fositas, glándulas y organización de la mucosa.',
    questions: [
      {
        prompt: '¿Qué secretan las células parietales gástricas?',
        options: ['Ácido clorhídrico y factor intrínseco', 'Pepsinógeno y lipasa', 'Moco y bicarbonato exclusivamente'],
        answer: 0,
        explanation: 'Las células parietales secretan ácido clorhídrico y factor intrínseco, necesario para la absorción de vitamina B12.'
      },
      {
        prompt: '¿Cuál es el producto precursor secretado por las células principales?',
        options: ['Gastrina', 'Pepsinógeno', 'Factor intrínseco'],
        answer: 1,
        explanation: 'Las células principales secretan pepsinógeno, que se activa a pepsina en el medio ácido gástrico.'
      },
      {
        prompt: '¿Qué estructura conecta la superficie gástrica con las glándulas de la mucosa?',
        options: ['Vellosidad intestinal', 'Cripta de Lieberkühn', 'Fosita gástrica'],
        answer: 2,
        explanation: 'Las fositas gástricas son invaginaciones del epitelio superficial que continúan con las glándulas gástricas.'
      }
    ]
  },
  'intestino-delgado': {
    title: 'Quiz: Intestino delgado',
    description: 'Vellosidades, criptas de Lieberkühn, enterocitos y células de Paneth.',
    questions: [
      {
        prompt: '¿Dónde se encuentran las células de Paneth?',
        options: ['En las puntas de las vellosidades', 'En la base de las criptas de Lieberkühn', 'En la submucosa'],
        answer: 1,
        explanation: 'Las células de Paneth se localizan en la base de las criptas y participan en la defensa antimicrobiana.'
      },
      {
        prompt: '¿Cuál es una función principal de las vellosidades intestinales?',
        options: ['Aumentar la superficie de absorción', 'Producir ácido clorhídrico', 'Impulsar el contenido mediante músculo esquelético'],
        answer: 0,
        explanation: 'Las vellosidades y microvellosidades amplían la superficie disponible para la absorción de nutrientes.'
      },
      {
        prompt: '¿Qué estructura central se encuentra en una vellosidad intestinal?',
        options: ['Un conducto biliar', 'Una arteria central', 'Un vaso quilífero linfático'],
        answer: 2,
        explanation: 'El vaso quilífero central recoge lípidos absorbidos y forma parte de la red linfática de la vellosidad.'
      }
    ]
  },
  'intestino-grueso': {
    title: 'Quiz: Intestino grueso',
    description: 'Rasgos distintivos del colon, criptas rectas y células caliciformes.',
    questions: [
      {
        prompt: '¿Qué rasgo distingue a la mucosa del colon de la del intestino delgado?',
        options: ['Vellosidades altas', 'Ausencia de vellosidades y criptas rectas', 'Epitelio plano estratificado'],
        answer: 1,
        explanation: 'La mucosa del colon carece de vellosidades y presenta criptas rectas tubulares.'
      },
      {
        prompt: '¿Qué tipo celular es especialmente abundante en las criptas del colon?',
        options: ['Células caliciformes', 'Células parietales', 'Células de Paneth en toda la cripta'],
        answer: 0,
        explanation: 'Las células caliciformes abundantes producen moco que facilita el tránsito del contenido intestinal.'
      },
      {
        prompt: '¿Cuál es una función importante del moco producido en el colon?',
        options: ['Iniciar la digestión de proteínas', 'Absorber hierro', 'Lubricar y proteger la superficie epitelial'],
        answer: 2,
        explanation: 'El moco lubrica el contenido y protege el epitelio frente al roce y la actividad microbiana.'
      }
    ]
  },
  higado: {
    title: 'Quiz: Hígado',
    description: 'Lobulillo hepático, sinusoides, hepatocitos y espacios porta.',
    questions: [
      {
        prompt: 'En el lobulillo hepático clásico, ¿hacia dónde fluye la sangre sinusoidal?',
        options: ['Hacia los conductos biliares', 'Hacia la vena central', 'Desde la vena central hacia los espacios porta'],
        answer: 1,
        explanation: 'La sangre procedente de ramas de la vena porta y la arteria hepática fluye por los sinusoides hacia la vena central.'
      },
      {
        prompt: '¿En qué dirección fluye la bilis respecto a la sangre sinusoidal?',
        options: ['En dirección opuesta, hacia los conductos biliares del espacio porta', 'En la misma dirección, hacia la vena central', 'Directamente hacia los sinusoides'],
        answer: 0,
        explanation: 'La bilis fluye por canalículos entre hepatocitos hacia los conductos biliares, en dirección opuesta a la sangre.'
      },
      {
        prompt: '¿Qué célula residente hepática participa en la fagocitosis dentro de los sinusoides?',
        options: ['Célula de Paneth', 'Célula parietal', 'Célula de Kupffer'],
        answer: 2,
        explanation: 'Las células de Kupffer son macrófagos residentes asociados al revestimiento de los sinusoides hepáticos.'
      }
    ]
  },
  pancreas: {
    title: 'Quiz: Páncreas',
    description: 'Porción exocrina, acinos serosos y función endocrina de los islotes.',
    questions: [
      {
        prompt: '¿Qué estructura constituye la porción exocrina predominante del páncreas?',
        options: ['Acinos serosos', 'Folículos tiroideos', 'Glándulas mucosas'],
        answer: 0,
        explanation: 'Los acinos serosos pancreáticos producen enzimas digestivas que se conducen al duodeno.'
      },
      {
        prompt: '¿Qué función cumplen los islotes de Langerhans?',
        options: ['Secretar moco hacia los conductos', 'Liberar hormonas a la sangre', 'Producir bilis'],
        answer: 1,
        explanation: 'Los islotes son agrupaciones endocrinas que liberan hormonas, como insulina y glucagón, a la circulación.'
      },
      {
        prompt: '¿Qué tipo celular se encuentra típicamente al inicio de los conductos intercalares pancreáticos?',
        options: ['Célula caliciforme', 'Célula parietal', 'Célula centroacinar'],
        answer: 2,
        explanation: 'Las células centroacinares son características del páncreas y continúan con el epitelio de los conductos intercalares.'
      }
    ]
  }
};

if (quizSearch && quizSearchEmpty && quizSelection && activeQuiz && quizForm && quizQuestions && quizResult) {
  const activeQuizTitle = document.getElementById('activeQuizTitle');
  const activeQuizDescription = document.getElementById('activeQuizDescription');
  const activeQuizQuestionCount = document.getElementById('activeQuizQuestionCount');

  const normalizeQuizText = (text) => text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');

  const renderQuestions = (quiz) => {
    quizQuestions.replaceChildren();
    quiz.questions.forEach((question, questionIndex) => {
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'quiz-question';
      fieldset.dataset.answer = String(question.answer);
      fieldset.dataset.explanation = question.explanation;

      const legend = document.createElement('legend');
      const number = document.createElement('span');
      number.className = 'quiz-question-number';
      number.textContent = String(questionIndex + 1).padStart(2, '0');
      legend.append(number, document.createTextNode(` ${question.prompt}`));
      fieldset.append(legend);

      question.options.forEach((option, optionIndex) => {
        const label = document.createElement('label');
        label.className = 'quiz-option';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `q${questionIndex + 1}`;
        input.value = String(optionIndex);
        input.required = optionIndex === 0;
        const text = document.createElement('span');
        text.textContent = option;
        label.append(input, text);
        fieldset.append(label);
      });

      const feedback = document.createElement('p');
      feedback.className = 'quiz-feedback';
      feedback.setAttribute('aria-live', 'polite');
      fieldset.append(feedback);
      quizQuestions.append(fieldset);
    });
  };

  const showQuiz = (topic, updateHistory = true) => {
    const quiz = quizzes[topic];
    if (!quiz) {
      quizSelection.hidden = false;
      activeQuiz.hidden = true;
      return;
    }

    activeQuizTitle.textContent = quiz.title;
    activeQuizDescription.textContent = quiz.description;
    activeQuizQuestionCount.textContent = `${quiz.questions.length} preguntas`;
    renderQuestions(quiz);
    quizResult.hidden = true;
    quizResult.textContent = '';
    quizSelection.hidden = true;
    activeQuiz.hidden = false;

    if (updateHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('tema', topic);
      window.history.pushState({ tema: topic }, '', url);
    }

    activeQuizTitle.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showSelection = (updateHistory = true) => {
    activeQuiz.hidden = true;
    quizSelection.hidden = false;
    if (updateHistory) {
      const url = new URL(window.location.href);
      url.searchParams.delete('tema');
      window.history.pushState({}, '', url);
    }
    document.getElementById('quiz-selection-title').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  quizSearch.addEventListener('input', () => {
    const query = normalizeQuizText(quizSearch.value.trim());
    let visibleCards = 0;

    quizCards.forEach((card) => {
      const searchableText = normalizeQuizText(`${card.dataset.search || ''} ${card.textContent || ''}`);
      const isMatch = searchableText.includes(query);
      card.hidden = !isMatch;
      visibleCards += Number(isMatch);
    });
    quizSearchEmpty.hidden = visibleCards !== 0;
  });

  quizCards.forEach((card) => {
    card.querySelector('[data-start-quiz]').addEventListener('click', () => {
      showQuiz(card.dataset.topic);
    });
  });

  document.getElementById('backToQuizSelection').addEventListener('click', () => showSelection());

  quizForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const questions = Array.from(quizForm.querySelectorAll('.quiz-question'));
    let score = 0;

    questions.forEach((question) => {
      const selected = question.querySelector('input:checked');
      const isCorrect = selected?.value === question.dataset.answer;
      const feedback = question.querySelector('.quiz-feedback');
      question.classList.toggle('is-correct', Boolean(isCorrect));
      question.classList.toggle('is-incorrect', !isCorrect);
      feedback.textContent = `${isCorrect ? 'Correcto.' : 'Repasa este punto.'} ${question.dataset.explanation}`;
      score += Number(Boolean(isCorrect));
    });

    quizResult.textContent = `Resultado: ${score} de ${questions.length}. ${score === questions.length ? '¡Excelente trabajo!' : 'Revisa las explicaciones y vuelve a intentarlo.'}`;
    quizResult.hidden = false;
    quizResult.focus();
  });

  quizForm.addEventListener('reset', () => {
    window.setTimeout(() => {
      quizForm.querySelectorAll('.quiz-question').forEach((question) => {
        question.classList.remove('is-correct', 'is-incorrect');
        question.querySelector('.quiz-feedback').textContent = '';
      });
      quizResult.hidden = true;
      quizResult.textContent = '';
    });
  });

  window.addEventListener('popstate', () => {
    const topic = new URL(window.location.href).searchParams.get('tema');
    if (topic && quizzes[topic]) {
      showQuiz(topic, false);
    } else {
      showSelection(false);
    }
  });

  const initialTopic = new URL(window.location.href).searchParams.get('tema');
  if (initialTopic && quizzes[initialTopic]) {
    showQuiz(initialTopic, false);
  }
}

document.addEventListener('keydown', (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement
    && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
  const activeSearch = quizSearch && quizSelection && !quizSelection.hidden
    ? quizSearch
    : searchInput;

  if (activeSearch && event.key === '/' && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    activeSearch.focus();
  }
});
