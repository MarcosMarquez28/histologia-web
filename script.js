const searchInput = document.getElementById('moduleSearch');
const moduleCards = Array.from(document.querySelectorAll('.module-card'));
const emptyMessage = document.getElementById('searchEmpty');
const modulePagination = document.getElementById('modulePagination');
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

if (searchInput && emptyMessage && modulePagination) {
  const normalizeText = (text) => text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');

  const cardsPerPage = 6;
  let currentPage = 1;
  let matchingCards = moduleCards;

  const renderModulePage = () => {
    const pageCount = Math.ceil(matchingCards.length / cardsPerPage);
    currentPage = Math.min(Math.max(currentPage, 1), Math.max(pageCount, 1));
    const start = (currentPage - 1) * cardsPerPage;
    const visibleCards = new Set(matchingCards.slice(start, start + cardsPerPage));

    moduleCards.forEach((card) => {
      card.hidden = !visibleCards.has(card);
    });

    modulePagination.replaceChildren();
    modulePagination.hidden = pageCount <= 1;
    if (pageCount <= 1) {
      return;
    }

    for (let page = 1; page <= pageCount; page += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'module-page-button';
      button.textContent = String(page);
      button.setAttribute('aria-label', `Página ${page} de capítulos`);
      if (page === currentPage) {
        button.setAttribute('aria-current', 'page');
      }
      modulePagination.append(button);
    }
  };

  renderModulePage();

  modulePagination.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const button = event.target.closest('.module-page-button');
    if (!button) {
      return;
    }
    currentPage = Number(button.textContent);
    renderModulePage();
    document.getElementById('moduleGrid').scrollIntoView({block: 'start', behavior: 'smooth'});
  });

  searchInput.addEventListener('input', () => {
    const query = normalizeText(searchInput.value.trim());
    matchingCards = moduleCards.filter((card) => {
      const searchableText = normalizeText(`${card.dataset.search || ''} ${card.textContent || ''}`);
      return searchableText.includes(query);
    });
    currentPage = 1;
    emptyMessage.hidden = matchingCards.length !== 0;
    renderModulePage();
  });
}

const quizSearch = document.getElementById('quizSearch');
const quizGrid = document.getElementById('quizGrid');
const quizPagination = document.getElementById('quizPagination');
const quizSearchEmpty = document.getElementById('quizSearchEmpty');
const quizSelection = document.getElementById('quizSelection');
const activeQuiz = document.getElementById('quizActive');
const quizForm = document.getElementById('digestiveQuiz');
const quizQuestions = document.getElementById('quizQuestions');
const quizResult = document.getElementById('quizResult');
const quizzes = window.digestiveQuizzes;
const quizzesByTopic = new Map(Array.isArray(quizzes) ? quizzes.map((quiz) => [`capitulo-${quiz.chapter}`, quiz]) : []);
const legacyQuizTopics = {
  esofago: 'capitulo-7',
  estomago: 'capitulo-9',
  'intestino-delgado': 'capitulo-13',
  'intestino-grueso': 'capitulo-18',
  higado: 'capitulo-19',
  pancreas: 'capitulo-21'
};

const activeQuizTitle = document.getElementById('activeQuizTitle');
const activeQuizDescription = document.getElementById('activeQuizDescription');
const activeQuizQuestionCount = document.getElementById('activeQuizQuestionCount');

const normalizeQuizText = (text) => text
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('es');

const renderQuizCards = () => {
  quizGrid.replaceChildren(...quizzes.map((quiz) => {
    const card = document.createElement('article');
    card.className = 'quiz-card';
    card.dataset.topic = `capitulo-${quiz.chapter}`;
    card.dataset.search = normalizeQuizText(`${quiz.title} ${quiz.category} ${quiz.description} ${quiz.questions.map((question) => question.prompt).join(' ')}`);

    const top = document.createElement('div');
    top.className = 'quiz-card-top';
    const icon = document.createElement('span');
    icon.className = 'quiz-topic-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '◉';
    const label = document.createElement('span');
    label.className = 'quiz-topic-label';
    label.textContent = `CAPÍTULO ${String(quiz.chapter).padStart(2, '0')}`;
    top.append(icon, label);

    const category = document.createElement('p');
    category.className = 'quiz-card-eyebrow';
    category.textContent = quiz.category;
    const title = document.createElement('h3');
    title.textContent = `Quiz: ${quiz.title}`;
    const description = document.createElement('p');
    description.className = 'quiz-card-description';
    description.textContent = quiz.description;

    const badges = document.createElement('div');
    badges.className = 'quiz-card-badges';
    const count = document.createElement('span');
    count.textContent = `${quiz.questions.length} preguntas`;
    const format = document.createElement('span');
    format.textContent = 'Selección múltiple';
    badges.append(count, format);

    const startButton = document.createElement('button');
    startButton.className = 'quiz-card-action';
    startButton.type = 'button';
    startButton.dataset.startQuiz = card.dataset.topic;
    startButton.append(document.createTextNode('Comenzar Quiz '));
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    startButton.append(arrow);
    card.append(top, category, title, description, badges, startButton);
    return card;
  }));
};

if (quizSearch && quizGrid && quizPagination && quizSearchEmpty && quizSelection && activeQuiz && quizForm && quizQuestions && quizResult) {
  if (!Array.isArray(quizzes) || quizzes.length !== 21 || quizzes.some((quiz) => !Array.isArray(quiz.questions) || quiz.questions.length !== 4)) {
    throw new Error('Las autoevaluaciones deben incluir 21 capítulos con cuatro preguntas cada una.');
  }

  renderQuizCards();
  const quizCards = Array.from(quizGrid.querySelectorAll('.quiz-card'));
  const cardsPerPage = 6;
  let matchingCards = quizCards;
  let currentPage = 1;

  const renderQuizPage = () => {
    const pageCount = Math.ceil(matchingCards.length / cardsPerPage);
    currentPage = Math.min(Math.max(currentPage, 1), Math.max(pageCount, 1));
    const start = (currentPage - 1) * cardsPerPage;
    const visibleCards = new Set(matchingCards.slice(start, start + cardsPerPage));

    quizCards.forEach((card) => {
      card.hidden = !visibleCards.has(card);
    });

    quizPagination.replaceChildren();
    quizPagination.hidden = pageCount <= 1;
    for (let page = 1; page <= pageCount; page += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'module-page-button';
      button.textContent = String(page);
      button.setAttribute('aria-label', `Página ${page} de autoevaluaciones`);
      if (page === currentPage) {
        button.setAttribute('aria-current', 'page');
      }
      quizPagination.append(button);
    }
  };

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

  const resolveQuizTopic = (topic) => legacyQuizTopics[topic] || topic;

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

  const showQuiz = (topic, updateHistory = true) => {
    const resolvedTopic = resolveQuizTopic(topic);
    const quiz = quizzesByTopic.get(resolvedTopic);
    if (!quiz) {
      showSelection(false);
      return;
    }

    activeQuizTitle.textContent = `Quiz: ${quiz.title}`;
    activeQuizDescription.textContent = quiz.description;
    activeQuizQuestionCount.textContent = `${quiz.questions.length} preguntas`;
    renderQuestions(quiz);
    quizResult.hidden = true;
    quizResult.textContent = '';
    quizSelection.hidden = true;
    activeQuiz.hidden = false;

    if (updateHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('tema', resolvedTopic);
      window.history.pushState({ tema: resolvedTopic }, '', url);
    }

    activeQuizTitle.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  renderQuizPage();

  quizSearch.addEventListener('input', () => {
    const query = normalizeQuizText(quizSearch.value.trim());
    matchingCards = quizCards.filter((card) => {
      const searchableText = normalizeQuizText(`${card.dataset.search || ''} ${card.textContent || ''}`);
      return searchableText.includes(query);
    });
    currentPage = 1;
    quizSearchEmpty.hidden = matchingCards.length !== 0;
    renderQuizPage();
  });

  quizPagination.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const button = event.target.closest('.module-page-button');
    if (!button) {
      return;
    }
    currentPage = Number(button.textContent);
    renderQuizPage();
    quizGrid.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });

  quizGrid.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const button = event.target.closest('[data-start-quiz]');
    if (button) {
      showQuiz(button.dataset.startQuiz);
    }
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
    if (topic && quizzesByTopic.has(resolveQuizTopic(topic))) {
      showQuiz(topic, false);
    } else {
      showSelection(false);
    }
  });

  const initialTopic = new URL(window.location.href).searchParams.get('tema');
  if (initialTopic && quizzesByTopic.has(resolveQuizTopic(initialTopic))) {
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
