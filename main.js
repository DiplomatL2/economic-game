// Загрузка состояния из localStorage или начальные значения
const savedData = localStorage.getItem("economicGameData");
const goods = savedData 
  ? JSON.parse(savedData) 
  : [
      { name: "Хлеб", basePrice: 10, price: 10, sales: 0, supply: 100 },
      { name: "Мясо", basePrice: 20, price: 20, sales: 0, supply: 60 }
    ];

function renderMarket() {
  const marketDiv = document.getElementById("market");
  marketDiv.innerHTML = "";
  goods.forEach((good, i) => {
    marketDiv.innerHTML += `
      <div class="good">
        <b>${good.name}</b> | Цена: <span id="price-${i}">${good.price.toFixed(2)}</span> | Остаток: <span id="supply-${i}">${good.supply}</span>
        <button onclick="buyGood(${i})" ${good.supply === 0 ? 'disabled' : ''}>Купить</button>
      </div>
    `;
  });
}

// Сохранение состояния в localStorage
function saveGameState() {
  localStorage.setItem("economicGameData", JSON.stringify(goods));
}

// Покупка товара игроком
window.buyGood = function(i) {
  if (goods[i].supply > 0) {
    goods[i].sales++;
    goods[i].supply--;
    saveGameState();
    renderMarket();
  }
};

// Сброс прогресса и обновление страницы
window.resetGame = function() {
  localStorage.removeItem("economicGameData");
  location.reload();
};

// Статус‑панель
function showStatus(text) {
  document.getElementById("status").textContent = text;
}

// Воркеры работают!
let worker = new Worker("worker.js");
worker.onmessage = function(e) {
  const updates = e.data;
  updates.forEach((update, i) => {
    goods[i].price = update.price;
    goods[i].supply = update.supply;
    goods[i].sales = 0;
  });
  saveGameState();
  renderMarket();
  showStatus(`Обновление рынка: ${new Date().toLocaleTimeString()}`);
};

// Первая отрисовка после загрузки
renderMarket();
showStatus("Экономика стартовала… ожидание первого тика");
