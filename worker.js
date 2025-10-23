const goods = [
  { basePrice: 10, price: 10, sales: 0, supply: 100 }, // хлеб
  { basePrice: 20, price: 20, sales: 0, supply: 60 },  // мясо
];

const alpha = 0.15;

// Фоновый тик — каждые 5 минут (для теста можно уменьшить!)
setInterval(() => {
  // Эмулируем NPC покупки
  goods.forEach(good => {
    let npcBuys = Math.floor(Math.random() * 5);
    good.sales += npcBuys;
    good.supply = Math.max(0, good.supply - npcBuys);
  });

  // Динамическое ценообразование
  let totalSales = goods.reduce((sum, g) => sum + g.sales, 0);
  goods.forEach((good, idx) => {
    let cross = goods[(idx + 1) % goods.length];
    let delta = good.sales - cross.sales;
    good.price = good.basePrice * (1 - alpha * (good.sales / good.basePrice));
    if (delta < 0) good.price *= (1 + Math.abs(delta) * 0.1);
    good.price = Math.max(1, good.price);
  });

  postMessage(goods.map(({ price, supply }) => ({ price, supply })));
  goods.forEach(g => g.sales = 0);
}, 5 * 60 * 1000);

// Для тестов — сделать тик сразу при запуске (чтобы не ждать 5 минут)
setTimeout(() => {
  postMessage(goods.map(({ price, supply }) => ({ price, supply })));
}, 1200);
