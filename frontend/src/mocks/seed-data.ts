import type { Category, Match, User, Wish } from "@/types";

export const mock_current_user: User = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "demo@wishmatch.app",
  name: "Алекс Морозов",
  avatar_url: null,
  bio: "Люблю спонтанные поездки, настольные игры и хороший кофе. Ищу компанию для приключений.",
  city: "Москва",
  location: { latitude: 55.751244, longitude: 37.618423 },
  telegram: "@alex_demo",
  instagram: "alex.demo",
  is_active: true,
  created_at: "2026-01-12T10:00:00Z",
};

export const seed_categories: Category[] = [
  { id: "c1", name: "Путешествия", slug: "travel" },
  { id: "c2", name: "Спорт", slug: "sport" },
  { id: "c3", name: "Музыка", slug: "music" },
  { id: "c4", name: "Еда и напитки", slug: "food" },
  { id: "c5", name: "Образование", slug: "education" },
  { id: "c6", name: "Творчество", slug: "art" },
  { id: "c7", name: "Игры", slug: "games" },
  { id: "c8", name: "Волонтёрство", slug: "volunteering" },
];

function category_by_slug(slug: string): Category {
  const found = seed_categories.find((item) => item.slug === slug);
  if (!found) {
    throw new Error(`Unknown seed category: ${slug}`);
  }
  return found;
}

export const seed_wishes: Wish[] = [
  {
    id: "w1",
    title: "Поход выходного дня по Подмосковью",
    description:
      "Хочу собрать небольшую группу для несложного двухдневного похода с палатками. Опыт не обязателен, главное — хорошее настроение.",
    category: category_by_slug("travel"),
    owner: {
      id: "u2",
      name: "Мария Соколова",
      avatar_url: null,
      city: "Москва",
    },
    location: {
      latitude: 55.802,
      longitude: 37.412,
      location_name: "Парк «Покровское-Стрешнево»",
      city: "Москва",
    },
    status: "active",
    max_participants: 5,
    expires_at: "2026-08-01T00:00:00Z",
    created_at: "2026-06-20T09:30:00Z",
    distance_km: null,
  },
  {
    id: "w2",
    title: "Партнёр для утренних пробежек",
    description:
      "Бегаю 3 раза в неделю в районе Воробьёвых гор. Ищу того, с кем веселее держать темп.",
    category: category_by_slug("sport"),
    owner: {
      id: "u3",
      name: "Дмитрий Кравцов",
      avatar_url: null,
      city: "Москва",
    },
    location: {
      latitude: 55.7103,
      longitude: 37.5536,
      location_name: "Воробьёвы горы",
      city: "Москва",
    },
    status: "active",
    max_participants: 2,
    expires_at: null,
    created_at: "2026-06-24T06:15:00Z",
    distance_km: null,
  },
  {
    id: "w3",
    title: "Джем-сейшн для любителей джаза",
    description:
      "Играю на саксофоне, ищу клавишника и барабанщика для еженедельных репетиций в центре.",
    category: category_by_slug("music"),
    owner: {
      id: "u4",
      name: "Ника Орлова",
      avatar_url: null,
      city: "Москва",
    },
    location: {
      latitude: 55.7601,
      longitude: 37.6186,
      location_name: "Студия на Тверской",
      city: "Москва",
    },
    status: "active",
    max_participants: 3,
    expires_at: "2026-07-15T00:00:00Z",
    created_at: "2026-06-26T18:45:00Z",
    distance_km: null,
  },
  {
    id: "w4",
    title: "Дегустация авторского кофе",
    description:
      "Собираю компанию обойти три новые кофейни за один вечер и выбрать лучший фильтр.",
    category: category_by_slug("food"),
    owner: {
      id: "u5",
      name: "Илья Воронов",
      avatar_url: null,
      city: "Москва",
    },
    location: {
      latitude: 55.7423,
      longitude: 37.655,
      location_name: "Чистые пруды",
      city: "Москва",
    },
    status: "active",
    max_participants: 4,
    expires_at: null,
    created_at: "2026-06-27T12:00:00Z",
    distance_km: null,
  },
  {
    id: "w5",
    title: "Напарник для изучения испанского",
    description:
      "Уровень A2, хочу разговорную практику два раза в неделю онлайн или в кафе.",
    category: category_by_slug("education"),
    owner: {
      id: "u6",
      name: "Полина Жукова",
      avatar_url: null,
      city: "Москва",
    },
    location: {
      latitude: 55.7335,
      longitude: 37.5874,
      location_name: "Парк Горького",
      city: "Москва",
    },
    status: "active",
    max_participants: 2,
    expires_at: "2026-09-01T00:00:00Z",
    created_at: "2026-06-28T08:20:00Z",
    distance_km: null,
  },
  {
    id: "w6",
    title: "Вечер настольных игр",
    description:
      "Есть «Каркассон», «Каттан» и «Манчкин». Ищу 2–4 человек на регулярные встречи.",
    category: category_by_slug("games"),
    owner: {
      id: "u7",
      name: "Артём Белов",
      avatar_url: null,
      city: "Москва",
    },
    location: {
      latitude: 55.7045,
      longitude: 37.6325,
      location_name: "Антикафе на Павелецкой",
      city: "Москва",
    },
    status: "active",
    max_participants: 4,
    expires_at: null,
    created_at: "2026-06-25T20:10:00Z",
    distance_km: null,
  },
  {
    id: "w7",
    title: "Пленэр для начинающих художников",
    description:
      "Рисую акварелью, хочу выбраться на природу и порисовать вместе. Возьму запасные краски.",
    category: category_by_slug("art"),
    owner: {
      id: "u8",
      name: "Вера Лебедева",
      avatar_url: null,
      city: "Москва",
    },
    location: {
      latitude: 55.7281,
      longitude: 37.7036,
      location_name: "Коломенское",
      city: "Москва",
    },
    status: "active",
    max_participants: 6,
    expires_at: "2026-07-30T00:00:00Z",
    created_at: "2026-06-23T15:35:00Z",
    distance_km: null,
  },
  {
    id: "w8",
    title: "Помощь приюту для животных",
    description:
      "Раз в месяц езжу помогать в приют. Нужны руки на выходных — выгул собак и уборка.",
    category: category_by_slug("volunteering"),
    owner: {
      id: "u9",
      name: "Сергей Тихонов",
      avatar_url: null,
      city: "Москва",
    },
    location: {
      latitude: 55.6789,
      longitude: 37.5012,
      location_name: "Приют «Дружок»",
      city: "Москва",
    },
    status: "active",
    max_participants: 8,
    expires_at: null,
    created_at: "2026-06-22T11:05:00Z",
    distance_km: null,
  },
];

export const seed_matches: Match[] = [
  {
    id: "m1",
    wish: seed_wishes[5],
    partner: {
      id: "u7",
      name: "Артём Белов",
      avatar_url: null,
      telegram: "@artem_games",
      instagram: "artem.tabletop",
    },
    is_seen: false,
    created_at: "2026-06-28T19:00:00Z",
  },
  {
    id: "m2",
    wish: seed_wishes[3],
    partner: {
      id: "u5",
      name: "Илья Воронов",
      avatar_url: null,
      telegram: "@ilya_coffee",
      instagram: null,
    },
    is_seen: true,
    created_at: "2026-06-27T14:30:00Z",
  },
];
