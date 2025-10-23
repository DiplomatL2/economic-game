// ---- НАСТРОЙКИ — перечень биомов и их ресурсы ----

// ВНИМАНИЕ: Дорога должна быть всегда по индексу 0!
const BIOMES = [
  {
    name: "Дорога",
    emoji: "🛣️",
    resources: []
  },
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

const MAP_SIZE = 10;

// ---- СОЗДАНИЕ КАРТЫ (массив объектов клеток) ----
let map = [];
for (let y = 0; y < MAP_SIZE; y++) {
  let row = [];
  for (let x = 0; x < MAP_SIZE; x++) {
    let biomeIndex;
    // Дорога "змейкой": слева в чётных, справа в нечётных строках
    if ((y % 2 === 0 && x === 0) || (y % 2 === 1 && x === MAP_SIZE - 1)) {
      biomeIndex = 0;
    } else {
      // случайный НЕ-дорога (биомы с индексом >=1)
      biomeIndex = Math.floor(Math.random() * (BIOMES.length - 1)) + 1;
    }

    let resource = "";
    let amount = 0;
    if (biomeIndex !== 0) {
      const biome = BIOMES[biomeIndex];
      resource = biome.resources[Math.floor(Math.random() * biome.resources.length)];
      amount = Math.floor(Math.random() * 4) + 2;
    }
    row.push({
      x, y,
      biomeIndex,
      resource,
      amount,
      regenTime: 30,
      isDepleted: false
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

  // Создаем HTML-таблицу
  const table = document.createElement('table');
  for (let y = 0; y < MAP_SIZE; y++) {
    const tr = document.createElement('tr');
    for (let x = 0; x < MAP_SIZE; x++) {
      const cell = map[y][x];
      const td = document.createElement('td');

      // Ячейка дороги
      if (cell.biomeIndex === 0) {
        td.className = 'cell road';
        td.innerHTML = BIOMES[0].emoji + "<br>" + "<small>Дорога</small>";
        td.style.background = "#a0522d";
        td.style.color = "#fff";
        td.style.cursor = "default";
        td.onclick = null; // Не кликабельна
      } else {
        td.className = 'cell';
        td.title = `${BIOMES[cell.biomeIndex].name}\nРесурс: ${cell.resource}\nОстаток: ${cell.amount}`;
        td.innerHTML = BIOMES[cell.biomeIndex].emoji + "<br>" + (cell.isDepleted ? "Нет" : cell.resource);
        td.style.opacity = cell.isDepleted ? 0.3 : 1;
        td.style.cursor = cell.isDepleted ? "not-allowed" : "pointer";
        td.onclick = () => tryCollect(cell);
      }

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
  let uniqueItems = Object.keys(inventory).length;
  let hasResource = cell.resource in inventory;
  if (!hasResource && uniqueItems >= 10) {
    alert("Рюкзак забит по видам! Освободи место.");
    return;
  }
  inventory[cell.resource] = (inventory[cell.resource] || 0) + 1;
  cell.amount -= 1;
  if (cell.amount === 0) {
    cell.isDepleted = true;
    setTimeout(() => {
      cell.amount = Math.floor(Math.random() * 4) + 2;
      cell.isDepleted = false;
      renderMap();
    }, cell.regenTime * 1000);
  }
  renderMap();
  renderInventory();
  saveGame();
}

// ---- ОТРИСОВКА ИНВЕНТАРЯ ----
function renderInventory() {
  const invDiv = document.getElementById('inventory');
  if (Object.keys(inventory).length === 0) {
    invDiv.textContent = "Пусто";
    return;
  }
  invDiv.innerHTML = Object.entries(inventory).map(
    ([name, count]) => `<b>${name}</b>: ${count}`
  ).join("<br>");
}

// ----- Сохранение и загрузка -----
function saveGame() {
  localStorage.setItem('sg_map', JSON.stringify(map));
  localStorage.setItem('sg_inventory', JSON.stringify(inventory));
}

function loadGame() {
  const savedMap = localStorage.getItem('sg_map');
  const savedInventory = localStorage.getItem('sg_inventory');
  if (savedMap && savedInventory) {
    try {
      map = JSON.parse(savedMap);
      inventory = JSON.parse(savedInventory);
    } catch (e) {
      localStorage.removeItem('sg_map');
      localStorage.removeItem('sg_inventory');
    }
  }
}

// ---- ПЕРВАЯ ОТРИСОВКА ----
loadGame();
renderMap();
renderInventory();






