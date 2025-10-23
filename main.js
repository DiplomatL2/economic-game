// ---- НАСТРОЙКИ — перечень биомов и их ресурсы ----

// Возможные виды ресурсов для добычи в каждом биоме
const BIOMES = [
  {
    name: "Лес",
    emoji: "🌲",
    resources: ["ветки", "грибы", "ягода"]
  },
  {
    name: "Луг",
    emoji: "🌾",
    resources: ["ягода", "грибы"]
  },
  {
    name: "Пруд",
    emoji: "🌊",
    resources: ["рыба"]
  },
  {
    name: "Песчаный пляж",
    emoji: "🏖️",
    resources: ["песок", "земля"]
  }
];

// Размеры карты
const MAP_SIZE = 5;

// ---- СОЗДАНИЕ КАРТЫ (массив объектов клеток) ----

let map = [];
for (let y = 0; y < MAP_SIZE; y++) {
  let row = [];
  for (let x = 0; x < MAP_SIZE; x++) {
    // Выбор случайного биома для простоты (можно в будущем задавать вручную)
    const biomeIndex = Math.floor(Math.random() * BIOMES.length);
    const biome = BIOMES[biomeIndex];

    // Случайно выбираем ресурс из доступных в биоме
    const resource = biome.resources[Math.floor(Math.random() * biome.resources.length)];
    row.push({
      x, y,
      biomeIndex,
      resource,
      amount: Math.floor(Math.random() * 4) + 2, // Стартовое количество (от 2 до 5)
      regenTime: 30, // Время восстановления (сек) после иссякания
      isDepleted: false // Флаг: исчерпан ли ресурс?
    });
  }
  map.push(row);
}

// ---- ИНВЕНТАРЬ (рюкзак, максимум 10 видов вещей) ----

let inventory = {}; // структура: { имя_ресурса: количество }

// ---- ОТРИСОВКА КАРТЫ ----

function renderMap() {
  const mapDiv = document.getElementById('map');
  mapDiv.innerHTML = ''; // очистить перед отрисовкой

  // Создаём сетку как HTML-таблицу для удобства
  const table = document.createElement('table');
  for (let y = 0; y < MAP_SIZE; y++) {
    const tr = document.createElement('tr');
    for (let x = 0; x < MAP_SIZE; x++) {
      const cell = map[y][x];
      const td = document.createElement('td');
      td.className = 'cell';
      td.title = `${BIOMES[cell.biomeIndex].name}\nРесурс: ${cell.resource}\nОстаток: ${cell.amount}`;
      td.innerHTML = BIOMES[cell.biomeIndex].emoji + "<br>" + (cell.isDepleted ? "Нет" : cell.resource);
      td.style.opacity = cell.isDepleted ? 0.3 : 1;
      td.style.cursor = cell.isDepleted ? "not-allowed" : "pointer";

      // клик по клетке – попытка собрать ресурс
      td.onclick = () => tryCollect(cell);

      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  mapDiv.appendChild(table);
}

// ---- ФУНКЦИЯ: ПОПЫТКА СОБРАТЬ РЕСУРС ----

function tryCollect(cell) {
  if (cell.isDepleted || cell.amount === 0) {
    alert("Здесь сейчас нет ресурсов!");
    return;
  }
  // Проверяем лимит: максимум 10 разных видов в рюкзаке
  let uniqueItems = Object.keys(inventory).length;
  let hasResource = cell.resource in inventory;
  if (!hasResource && uniqueItems >= 10) {
    alert("Рюкзак забит по видам! Освободи место.");
    return;
  }
  // Собираем 1 штуку ресурса
  inventory[cell.resource] = (inventory[cell.resource] || 0) + 1;
  cell.amount -= 1;
  // Если ресурс закончился, ставим флаг иссякания и запускаем восстановление
  if (cell.amount === 0) {
    cell.isDepleted = true;
    setTimeout(() => {
      cell.amount = Math.floor(Math.random() * 4) + 2; // Новый запас (2-5)
      cell.isDepleted = false;
      renderMap();
    }, cell.regenTime * 1000);
  }
  renderMap();
  renderInventory();
}

// ---- ОТРИСОВКА ИНВЕНТАРЯ ----

function renderInventory() {
  const invDiv = document.getElementById('inventory');
  if (Object.keys(inventory).length === 0) {
    invDiv.textContent = "Пусто";
    return;
  }
  // Выводим список ресурсов и их количества
  invDiv.innerHTML = Object.entries(inventory).map(
    ([name, count]) => `<b>${name}</b>: ${count}`
  ).join("<br>");
}

// ---- ПЕРВАЯ ОТРИСОВКА ----

renderMap();
renderInventory();
//  Пояснения:
 // - Карта 5x5, на каждой клетке — биом и стартовый ресурс.
//  - Клик по клетке пробует добыть 1 ресурс: если в рюкзаке 10 видов, больше нельзя.
 // - Если ресурс иссякает — клетка становится неактивной, через regenTime (30 сек) восстанавливается.
//  - Инвентарь показывает только занятые ячейки.
//  - Все действия снабжены максимально подробными комментариями для изучения.


