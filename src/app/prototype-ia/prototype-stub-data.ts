// PROTOTYPE (decision ticket 04, throwaway): in-memory stub data for the IA
// variants. Shapes loosely follow the map's locked decisions (ticket 01):
// GameTemplate = content only, Game = { templateId, players, ... }.

export interface StubQuestion {
  readonly price: number;
  readonly text: string;
  readonly answer: string;
  /** Placeholder marker — real media blobs are out of prototype scope. */
  readonly media: 'image' | 'audio' | null;
}

export interface StubTopic {
  readonly name: string;
  readonly questions: readonly StubQuestion[];
}

export interface StubRound {
  readonly name: string;
  readonly topics: readonly StubTopic[];
}

export interface StubTemplate {
  readonly id: string;
  readonly name: string;
  readonly author: string;
  readonly rounds: readonly StubRound[];
  readonly superRound: StubRound | null;
}

export interface StubPlayer {
  readonly name: string;
  readonly score: number;
}

export interface StubGame {
  readonly id: string;
  readonly templateId: string;
  readonly name: string;
  readonly players: readonly StubPlayer[];
  /** Preformatted for display — no pipes in the prototype. */
  readonly created: string;
}

const MOVIE_ROUND_1: StubRound = {
  name: 'Раунд 1',
  topics: [
    {
      name: 'Российское кино',
      questions: [
        { price: 100, text: 'Режиссёр «Брата» и «Брата 2».', answer: 'Алексей Балабанов', media: null },
        { price: 200, text: 'Фильм, где герой произносит: «В чём сила, брат?»', answer: '«Брат 2»', media: 'image' },
        { price: 300, text: 'Комедия Гайдая о переправе через Кавказские горы.', answer: '«Кавказская пленница»', media: null },
      ],
    },
    {
      name: 'Зарубежное кино',
      questions: [
        { price: 100, text: 'Кто сыграл Джека в «Титанике»?', answer: 'Леонардо Ди Каприо', media: null },
        { price: 200, text: 'Знаменитая реплика из «Терминатора»: «…»', answer: 'I\'ll be back', media: 'audio' },
        { price: 300, text: 'Режиссёр трилогии «Властелин колец».', answer: 'Питер Джексон', media: null },
      ],
    },
    {
      name: 'Мультфильмы',
      questions: [
        { price: 100, text: 'Кот, который жил у дяди Фёдора.', answer: 'Матроскин', media: null },
        { price: 200, text: 'Город, куда ездил Незнайка с друзьями.', answer: 'Солнечный город', media: 'image' },
        { price: 300, text: 'Волк и заяц — герои какого мультфильма?', answer: '«Ну, погоди!»', media: null },
      ],
    },
  ],
};

const MOVIE_ROUND_2: StubRound = {
  name: 'Раунд 2',
  topics: [
    {
      name: 'Режиссёры',
      questions: [
        { price: 200, text: 'Снял «Список Шиндлера» и «Парка Юрского периода».', answer: 'Стивен Спилберг', media: null },
        { price: 400, text: 'Автор «Криминального чтива».', answer: 'Квентин Тарантино', media: null },
        { price: 600, text: 'Японский режиссёр, «Семь самураев».', answer: 'Акира Куросава', media: null },
      ],
    },
    {
      name: 'Саундтреки',
      questions: [
        { price: 200, text: 'Композитор музыки к «Звёздным войнам».', answer: 'Джон Уильямс', media: 'audio' },
        { price: 400, text: 'Песня из «Титаника» в исполнении Селин Дион.', answer: 'My Heart Will Go On', media: null },
        { price: 600, text: 'Группа, записавшая «You\'ll Never Walk Alone»…', answer: 'Gerry and the Pacemakers (гимн «Ливерпуля»)', media: null },
      ],
    },
    {
      name: 'Цитаты',
      questions: [
        { price: 200, text: '«Я твой отец» — из какого фильма?', answer: '«Звёздные войны»', media: null },
        { price: 400, text: '«Май форс бе виз ю» — перевод реплики.', answer: '«Да пребудет с тобой сила»', media: null },
        { price: 600, text: 'Фраза Дороти из «Волшебника Изумрудного города».', answer: '«Нет места лучше дома»', media: null },
      ],
    },
  ],
};

const MOVIE_SUPER_ROUND: StubRound = {
  name: 'Супер-раунд',
  topics: [
    {
      name: 'Аукцион',
      questions: [
        { price: 500, text: 'Самый кассовый фильм всех времён.', answer: '«Аватар»', media: null },
        { price: 1000, text: 'Первый фильм в цвете, получивший «Оскар» за лучший фильм.', answer: '«Унесённые ветром»', media: null },
        { price: 1500, text: 'Страна-рекордсмен по числу поданных заявок на «Оскар».', answer: 'Франция', media: null },
      ],
    },
    {
      name: 'Кот в мешке',
      questions: [
        { price: 500, text: 'Фильм-сюрприз: тема выбирается случайно.', answer: 'Вопрос «кот в мешке» передаётся сопернику', media: null },
        { price: 1000, text: 'Кино-термин: «нарезка» лучших кадров.', answer: 'Трейлер', media: null },
        { price: 1500, text: 'Кто озвучивает Шрека в русской версии?', answer: 'Виктор Павлович… нет: Алексей Колган? Верный ответ: Вигго? — заглушка', media: null },
      ],
    },
  ],
};

export const STUB_TEMPLATES: readonly StubTemplate[] = [
  {
    id: 'tpl-movies',
    name: 'Кино и сериалы',
    author: 'Иван Петров',
    rounds: [MOVIE_ROUND_1, MOVIE_ROUND_2],
    superRound: MOVIE_SUPER_ROUND,
  },
  {
    id: 'tpl-erudition',
    name: 'Общая эрудиция',
    author: 'Мария Смирнова',
    rounds: [
      {
        name: 'Раунд 1',
        topics: [
          {
            name: 'История',
            questions: [
              { price: 100, text: 'Год окончания Второй мировой войны.', answer: '1945', media: null },
              { price: 200, text: 'Первый человек в космосе.', answer: 'Юрий Гагарин', media: 'image' },
              { price: 300, text: 'Древнеримский бог войны.', answer: 'Марс', media: null },
            ],
          },
          {
            name: 'География',
            questions: [
              { price: 100, text: 'Столица Австралии.', answer: 'Канберра', media: null },
              { price: 200, text: 'Самое глубокое озеро мира.', answer: 'Байкал', media: null },
              { price: 300, text: 'Единственная река, вытекающая из Байкала.', answer: 'Ангара', media: null },
            ],
          },
          {
            name: 'Наука',
            questions: [
              { price: 100, text: 'Химический символ золота.', answer: 'Au', media: null },
              { price: 200, text: 'Планета Солнечной системы с самой плотной атмосферой.', answer: 'Венера', media: 'audio' },
              { price: 300, text: 'Учёный, сформулировавший три закона движения.', answer: 'Исаак Ньютон', media: null },
            ],
          },
        ],
      },
    ],
    superRound: null,
  },
];

export const STUB_GAMES: readonly StubGame[] = [
  {
    id: 'game-friday',
    templateId: 'tpl-movies',
    name: 'Вечер пятницы',
    players: [
      { name: 'Аня', score: 1200 },
      { name: 'Боря', score: 800 },
    ],
    created: 'создана 18.11',
  },
  {
    id: 'game-family',
    templateId: 'tpl-movies',
    name: 'Семейный турнир',
    players: [
      { name: 'Вика', score: 400 },
      { name: 'Гриша', score: 2400 },
    ],
    created: 'создана 19.11',
  },
  {
    id: 'game-duel',
    templateId: 'tpl-erudition',
    name: 'Дуэль',
    players: [
      { name: 'Дима', score: 900 },
      { name: 'Ева', score: 900 },
    ],
    created: 'создана 19.11',
  },
];
