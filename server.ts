import express from 'express';
import { createServer as createHttpServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createHttpServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-Memory Data Store with default Cultural Festival items
let menu = [
  {
    id: 'm1',
    name: 'カヌレ・ワッフルセット',
    price: 400,
    is_sold_out: false,
    stock: 50,
    category: 'main',
    description: '外はカリッと中はもちもちのカヌレと、焼きたてサクサクのワッフルセット。',
    image_url: '/src/assets/images/canele_waffle_set_1790578009338.jpg',
    options_enabled: true,
  },
  {
    id: 'm2',
    name: '紅茶',
    price: 100,
    is_sold_out: false,
    stock: 100,
    category: 'drink',
    description: '香り豊かな味わい深いオリジナルホット紅茶。',
    image_url: '/src/assets/images/black_tea_cup_1790578023786.jpg',
    options_enabled: false,
  },
];

let toppings = [
  {
    id: 't1',
    menu_id: 'm1',
    name: '生クリーム',
    price: 0,
    is_sold_out: false,
    stock: 80,
    category: 'cream',
  },
  {
    id: 't2',
    menu_id: 'm1',
    name: 'カラースプレー',
    price: 0,
    is_sold_out: false,
    stock: 80,
    category: 'topping',
  },
];

let orders: any[] = [];

// Global Atomic Ticket Counter for all customers (prevents duplicate tickets)
let ticketCounter = 0;

const sseClients: express.Response[] = [];

const broadcast = (data: any) => {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => client.write(payload));
};

// SSE Stream Endpoint
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  sseClients.push(res);

  // Send initial snapshot
  res.write(`data: ${JSON.stringify({ type: 'INIT', orders, menu, toppings })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// GET state
app.get('/api/state', (req, res) => {
  res.json({ orders, menu, toppings });
});

// POST new order - Guaranteed Atomic Sequential Ticket Generation
app.post('/api/orders', (req, res) => {
  ticketCounter += 1;
  const formattedTicket = `#${String(ticketCounter).padStart(3, '0')}`;
  
  const { table_number, guest_count, items } = req.body;
  const total_price = items.reduce((sum: number, i: any) => sum + i.subtotal, 0);

  const newOrder = {
    id: `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    ticket_number: formattedTicket,
    table_number: Number(table_number) || 1,
    guest_count: Number(guest_count) || 1,
    status: 'unread',
    total_price,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: items.map((i: any, idx: number) => ({
      id: `det_${Date.now()}_${idx}`,
      menu_id: i.menuItem.id,
      menu_name: i.menuItem.name,
      price: i.menuItem.price,
      quantity: i.quantity,
      options: i.options,
      subtotal: i.subtotal,
    })),
    is_paid: false,
  };

  orders.unshift(newOrder);

  // Deduct stock
  items.forEach((item: any) => {
    const target = menu.find((m) => m.id === item.menuItem.id);
    if (target) {
      target.stock = Math.max(0, target.stock - item.quantity);
      if (target.stock === 0) target.is_sold_out = true;
    }
  });

  broadcast({ type: 'NEW_ORDER', order: newOrder, orders, menu });
  res.json({ success: true, order: newOrder });
});

// PATCH update order status or payment
app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status, is_paid, cash_received } = req.body;

  orders = orders.map((o) => {
    if (o.id === id) {
      const updated = { ...o, updated_at: new Date().toISOString() };
      if (status) updated.status = status;
      if (is_paid !== undefined) updated.is_paid = is_paid;
      if (cash_received !== undefined) {
        updated.cash_received = cash_received;
        updated.change_amount = Math.max(0, cash_received - o.total_price);
      }
      return updated;
    }
    return o;
  });

  broadcast({ type: 'UPDATE_ORDER', orders });
  res.json({ success: true, orders });
});

// POST Edit Menu Item details (Name, Description, Price)
app.post('/api/menu/edit', (req, res) => {
  const { id, name, description, price } = req.body;

  menu = menu.map((m) => {
    if (m.id === id) {
      return {
        ...m,
        name: name !== undefined ? name : m.name,
        description: description !== undefined ? description : m.description,
        price: price !== undefined ? Number(price) : m.price,
      };
    }
    return m;
  });

  broadcast({ type: 'UPDATE_INVENTORY', menu, toppings });
  res.json({ success: true, menu });
});

// Toggle Sold Out / Stock
app.post('/api/inventory/toggle', (req, res) => {
  const { type, id, delta } = req.body;

  if (type === 'menu') {
    menu = menu.map((m) => {
      if (m.id === id) {
        if (delta !== undefined) {
          const newStock = Math.max(0, m.stock + delta);
          return { ...m, stock: newStock, is_sold_out: newStock === 0 ? true : m.is_sold_out };
        }
        return { ...m, is_sold_out: !m.is_sold_out };
      }
      return m;
    });
  } else if (type === 'topping') {
    toppings = toppings.map((t) => {
      if (t.id === id) {
        if (delta !== undefined) {
          const newStock = Math.max(0, t.stock + delta);
          return { ...t, stock: newStock, is_sold_out: newStock === 0 ? true : t.is_sold_out };
        }
        return { ...t, is_sold_out: !t.is_sold_out };
      }
      return t;
    });
  }

  broadcast({ type: 'UPDATE_INVENTORY', menu, toppings });
  res.json({ success: true, menu, toppings });
});

// Reset data
app.post('/api/reset', (req, res) => {
  ticketCounter = 0;
  orders = [];
  broadcast({ type: 'RESET', orders, menu, toppings });
  res.json({ success: true });
});

// Setup Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
