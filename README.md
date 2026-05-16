# Competency Map

Карта компетенций дизайнеров: ревью, оценки и профили. Next.js 14 + Supabase.

## Требования

- Node.js 20+
- Аккаунт [Supabase](https://supabase.com)
- Аккаунт [Vercel](https://vercel.com) (для деплоя)

## Клонирование и запуск локально

```bash
git clone https://github.com/AnnGolub/competency-map.git
cd competency-map
npm install
cp .env.example .env.local
```

Заполните `.env.local` (см. [Переменные окружения](#переменные-окружения)), затем:

```bash
npm run dev
```

Приложение: [http://localhost:3000](http://localhost:3000)

## Настройка Supabase

### 1. Проект и миграции

1. Создайте проект в [Supabase Dashboard](https://supabase.com/dashboard).
2. В **SQL Editor** выполните файлы по порядку:
   - `supabase/migrations/20240515000000_initial_schema.sql`
   - `supabase/migrations/20240515100000_users_select_own.sql`
3. Либо через CLI: `npx supabase link` → `npx supabase db push`.

### 2. Authentication (magic link)

1. **Authentication → Providers → Email** — включите Email, при необходимости отключите «Confirm email» для dev.
2. **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` (локально) или URL Vercel (прод).
   - **Redirect URLs**:
     - `http://localhost:3000/auth/callback`
     - `https://your-app.vercel.app/auth/callback`

### 3. Первый пользователь

1. Зарегистрируйтесь через `/login` (magic link на почту).
2. В **Authentication → Users** скопируйте UUID пользователя.
3. В **SQL Editor** добавьте запись с ролью `admin` или `lead`:

```sql
INSERT INTO public.users (id, email, role)
VALUES ('<uuid-from-auth>', 'you@example.com', 'admin');
```

Без строки в `public.users` или с другой ролью пользователь увидит страницу «Нет доступа».

### 4. Ключи API

**Project Settings → API** — скопируйте в `.env.local`:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (только сервер, не публикуйте в клиенте)

## Переменные окружения

| Переменная | Где используется | Описание |
|------------|------------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Клиент и сервер | URL проекта Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Клиент и сервер | Публичный anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Только сервер | Service role (админ-скрипты, обход RLS) |

Файл-шаблон: `.env.example`.

## Деплой на Vercel

1. Импортируйте репозиторий: [vercel.com/new](https://vercel.com/new) → GitHub → `competency-map`.
2. **Environment Variables** — добавьте все три переменные из таблицы выше.
3. Deploy.
4. В Supabase **URL Configuration** добавьте:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URL**: `https://your-app.vercel.app/auth/callback`

Конфигурация Next.js: `next.config.mjs` (аналог `next.config.js`).

## Маршруты

| Путь | Описание |
|------|----------|
| `/login` | Вход по magic link |
| `/no-access` | Нет роли lead/admin |
| `/designers` | Список дизайнеров |
| `/designers/[id]` | Профиль |
| `/designers/[id]/review` | Форма ревью |

## Скрипты

```bash
npm run dev    # разработка
npm run build  # production-сборка
npm run start  # запуск сборки
npm run lint   # ESLint
```
