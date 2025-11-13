### Runbook — запуск и проверка

Требуется установленный Node.js LTS, Yarn/NPM, .NET 8 SDK, MySQL 8.

1) База данных
- Создать БД и пользователя MySQL.
- Для Node-сервиса задать `DATABASE_URL` в `.env` (пример: `mysql://user:pass@host:3306/jetqor`).
- Для .NET `KaspiApi` настроить `DefaultConnection` в `appsettings.json`.

2) Node сервис `service`
```bash
cd service
npm i
cp .env.example .env # если есть; иначе создать .env с PORT, JWT_SECRET, DATABASE_URL, JWT_LIFETIME
npx prisma migrate deploy
npm start
```

3) Kaspi интеграционный сервис `kaspi`
```bash
cd kaspi
npm i
npm start
```

4) .NET `KaspiApi`
- Открыть решение в IDE или запустить:
```bash
cd KaspiApi/"Jetqor kaspi api"
dotnet restore && dotnet run
```

5) Smoke-проверка HTTP
- Авторизация: `POST /auth/login` → токен
- Товары: `GET /product/my` с `Authorization: Bearer <token>`
- Накладные: `POST /invoice/create` и затем `POST /invoice/approve`
- Заказы: `POST /order/create`, `POST /order/approve`, `POST /order/packed`

6) Переменные окружения (минимум)
- `PORT`, `JWT_SECRET`, `JWT_LIFETIME`, `DATABASE_URL`

7) Роли и доступ
- `administrator` — полный доступ ко всем роутам
- `manager` — склад/накладные/заказы своего склада
- `client` — свои товары, свои накладные, свои остатки


