import type { Order, OrderItem, OrderStatus } from '../entities/order.entity.js';
import type { OrderRepository } from '../repositories/order.repository.js';

export type CreateOrderInput = {
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  phone: string;
  shippingAddress: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  promoCode?: string;
};

export type UpdateOrderInput = Partial<
  Pick<Order, 'status' | 'trackingNumber' | 'carrier' | 'notes'>
>;

async function generateOrderId(repository: OrderRepository): Promise<string> {
  const all = await repository.findAll();
  let max = 1000;
  for (const order of all) {
    const match = order.id.match(/^ORD-(\d+)$/i);
    if (match) {
      max = Math.max(max, Number.parseInt(match[1]!, 10));
    }
  }
  return `ORD-${max + 1}`;
}

export function createOrderService(repository: OrderRepository) {
  return {
    list(): Promise<Order[]> {
      return repository.findAll();
    },

    getById(id: string): Promise<Order | null> {
      return repository.findById(id);
    },

    getByCustomerEmail(email: string): Promise<Order[]> {
      return repository.findByCustomerEmail(email);
    },

    track(email: string, orderId: string): Promise<Order | null> {
      return repository.findByIdAndEmail(orderId, email);
    },

    async create(input: CreateOrderInput): Promise<Order> {
      const now = new Date().toISOString();
      const id = await generateOrderId(repository);
      const order: Order = {
        id,
        customerName: input.customerName.trim(),
        customerEmail: input.customerEmail.trim().toLowerCase(),
        phone: input.phone.trim(),
        shippingAddress: input.shippingAddress.trim(),
        status: 'pending',
        items: input.items,
        subtotal: input.subtotal,
        shipping: input.shipping,
        tax: input.tax,
        total: input.total,
        notes: input.promoCode ? [`Promo code applied: ${input.promoCode.trim().toUpperCase()}`] : [],
        createdAt: now,
        updatedAt: now,
      };
      return repository.create(order);
    },

    updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
      return repository.updateStatus(id, status);
    },

    update(id: string, updates: UpdateOrderInput): Promise<Order | null> {
      return repository.update(id, updates);
    },

    appendNote(id: string, note: string): Promise<Order | null> {
      return repository.appendNote(id, note.trim());
    },
  };
}

export type OrderService = ReturnType<typeof createOrderService>;
