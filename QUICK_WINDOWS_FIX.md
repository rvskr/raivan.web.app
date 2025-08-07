# ⚡ Быстрое решение для Windows

Видим ошибку: `"NODE_ENV" не является внутренней или внешней командой`

## 🎯 Мгновенное решение

Выполните одну из команд:

### Вариант 1 (Самый простой):
```bash
npx cross-env NODE_ENV=development tsx server/index.ts
```

### Вариант 2 (Альтернативный):
```bash
npx tsx server/index.ts
```

### Вариант 3 (Batch файл):
```bash
start-windows.bat
```

## 📋 Полная последовательность для первого запуска:

```bash
# 1. Убедитесь что находитесь в папке проекта
cd C:\GitHub\FurnishArt

# 2. Установите зависимости (если не установлены)
npm install

# 3. Создайте .env файл с Firebase ключами:
echo VITE_FIREBASE_API_KEY=ваш_ключ > .env
echo VITE_FIREBASE_PROJECT_ID=ваш_проект >> .env
echo VITE_FIREBASE_APP_ID=ваш_app_id >> .env

# 4. Запустите сервер
npx cross-env NODE_ENV=development tsx server/index.ts
```

## 🌐 После запуска:

1. Откройте браузер: http://localhost:5000
2. Войдите как админ: admin@example.com / admin123
3. Попробуйте редактировать контент!

## ❗ Если Firebase не настроен:

Сайт будет работать с демо-данными. Для полной функциональности следуйте инструкции в FIREBASE_SETUP.md

---

**Проект должен запуститься на порту 5000 ✅**