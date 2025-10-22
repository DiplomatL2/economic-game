const goods = [
  { name: "Хлеб", basePrice: 10, price: 10, sales: 0, supply: 100 },
  { name: "Мясо", basePrice: 20, price: 20, sales: 0, supply: 60 },
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

window.buyGood = function(i) {
  if (goods[i].supply > 0) {
    goods[i].sales++;
    goods[i].supply--;
    renderMarket();
  }
};

function showStatus(text) {
  document.getElementById("status").textContent = text;
}

// Инициализация воркера
let worker = new Worker("worker.js");
worker.onmessage = function(e) {
  const updates = e.data;
  updates.forEach((update, i) => {
    goods[i].price = update.price;
    goods[i].supply = update.supply;
    goods[i].sales = 0; // сброс продаж на тик
  });
  renderMarket();
  showStatus(`Обновление рынка: ${new Date().toLocaleTimeString()}`);
};

renderMarket();
showStatus("Экономика стартовала… ожидание первого тика");