export type CustomerSummary = {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  productCount: number;
  segment: string;
  createdAt?: string;
  lastOrderAt?: string;
};

export function buildCustomerDirectory(users: any[], orders: any[]) {
  const rows = new Map<string, CustomerSummary & Record<string, any>>();

  users.forEach((user) => {
    const email = normalizeEmail(user.email);
    const phone = normalizePhone(user.phone);
    const key = customerKey({ userId: user._id || user.id, email, phone });

    rows.set(key, {
      ...toPublicCustomer(user),
      _id: String(user._id || user.id || key),
      id: String(user._id || user.id || key),
      name: user.name || email || phone || "Customer",
      email,
      phone,
      orders: 0,
      spent: 0,
      productCount: 0,
      segment: "New",
      createdAt: user.createdAt
    });
  });

  orders.forEach((order) => {
    const email = normalizeEmail(order.customer?.email);
    const phone = normalizePhone(order.customer?.phone);
    const linkedKey = customerKey({ userId: order.user, email, phone });
    const existingKey = findExistingCustomerKey(rows, order.user, email, phone) || linkedKey;
    const current =
      rows.get(existingKey) ||
      {
        _id: existingKey,
        id: existingKey,
        name: String(order.customer?.name || email || phone || "Customer"),
        email,
        phone,
        createdAt: order.createdAt,
        orders: 0,
        spent: 0,
        productCount: 0,
        segment: "New",
        lastOrderAt: order.createdAt
      };

    current.name = current.name || order.customer?.name || "Customer";
    current.email = current.email || email;
    current.phone = current.phone || phone;
    current.createdAt = current.createdAt || order.createdAt;
    current.lastOrderAt = latestDate(current.lastOrderAt, order.createdAt);
    current.orders = Number(current.orders || 0) + 1;
    current.spent = Number(current.spent || 0) + Number(order.total || 0);
    current.productCount = Number(current.productCount || 0) + orderItemCount(order);
    current.segment = customerSegment(current.orders, current.spent);
    rows.set(existingKey, current);
  });

  return [...rows.values()].sort((left, right) =>
    String(right.lastOrderAt || right.createdAt || "").localeCompare(String(left.lastOrderAt || left.createdAt || ""))
  );
}

export function addCustomerSummariesToOrders<T extends Record<string, any>>(orders: T[]) {
  const customers = buildCustomerDirectory([], orders);

  return orders.map((order) => {
    const customerSummary = findCustomerForOrder(customers, order);
    return {
      ...toPlainObject(order),
      customerSummary
    };
  });
}

export function findCustomerForOrder(customers: CustomerSummary[], order: any) {
  const email = normalizeEmail(order.customer?.email);
  const phone = normalizePhone(order.customer?.phone);
  return (
    customers.find((customer) => order.user && customer.id === String(order.user)) ||
    customers.find((customer) => email && normalizeEmail(customer.email) === email) ||
    customers.find((customer) => phone && normalizePhone(customer.phone) === phone) ||
    {
      _id: "",
      id: "",
      name: String(order.customer?.name || email || phone || "Customer"),
      email,
      phone,
      orders: 1,
      spent: Number(order.total || 0),
      productCount: orderItemCount(order),
      segment: "New Customer",
      createdAt: order.createdAt,
      lastOrderAt: order.createdAt
    }
  );
}

function customerSegment(orders: number, spent: number) {
  if (orders >= 5 || spent >= 5000) return "VIP";
  if (orders >= 2) return "Old Customer";
  if (orders === 1) return "New Customer";
  return "New";
}

function findExistingCustomerKey(rows: Map<string, any>, userId: unknown, email: string, phone: string) {
  const candidates = [
    userId ? `user:${String(userId)}` : "",
    email ? `email:${email}` : "",
    phone ? `phone:${phone}` : ""
  ].filter(Boolean);

  const directMatch = candidates.find((key) => rows.has(key));
  if (directMatch) return directMatch;

  for (const [key, customer] of rows.entries()) {
    const customerEmail = normalizeEmail(customer.email);
    const customerPhone = normalizePhone(customer.phone);
    if (email && customerEmail === email) return key;
    if (phone && customerPhone === phone) return key;
  }

  return undefined;
}

function customerKey({ userId, email, phone }: { userId?: unknown; email?: string; phone?: string }) {
  if (userId) return `user:${String(userId)}`;
  if (email) return `email:${email}`;
  if (phone) return `phone:${phone}`;
  return `customer:${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value: unknown) {
  return String(value || "").replace(/\D/g, "");
}

function orderItemCount(order: any) {
  return (order.items || []).reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);
}

function latestDate(left?: string, right?: string) {
  if (!left) return right;
  if (!right) return left;
  return Date.parse(right) > Date.parse(left) ? right : left;
}

function toPlainObject(value: any) {
  return JSON.parse(JSON.stringify(value || {}));
}

function toPublicCustomer(user: any) {
  const output = toPlainObject(user);
  delete output.password;
  delete output.refreshTokenHash;
  delete output.passwordResetTokenHash;
  return output;
}
