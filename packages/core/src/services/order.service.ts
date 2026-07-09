import type { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from '../entities/order.entity.js';
import type { OrderRepository } from '../repositories/order.repository.js';
import type { CheckoutTotals } from './checkout.service.js';

export type CreateOrderInput = {
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  phone: string;
  shippingAddress: string;
  totals: CheckoutTotals;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string;
  giftWrap?: boolean;
  giftMessage?: string;
};

export type UpdateOrderInput = Partial<
  Pick<Order, 'status' | 'trackingNumber' | 'carrier' | 'notes' | 'paymentStatus'>
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

function buildOrderNotes(input: CreateOrderInput): string[] {
  const notes: string[] = [];
  if (input.totals.promoCode) {
    notes.push(`Promo code applied: ${input.totals.promoCode}`);
  }
  if (input.giftWrap && input.giftMessage?.trim()) {
    notes.push(`Gift message: ${input.giftMessage.trim()}`);
  }
  if (input.paymentMethod === 'paypal') {
    notes.push('PayPal payment pending — follow up with customer if unpaid.');
  }
  return notes;
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
        subtotal: input.totals.subtotal,
        shipping: input.totals.shipping,
        tax: input.totals.tax,
        total: input.totals.total,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentStatus,
        stripePaymentIntentId: input.stripePaymentIntentId,
        promoCode: input.totals.promoCode,
        discountAmount: input.totals.discountAmount,
        giftWrap: Boolean(input.giftWrap),
        giftWrapAmount: input.totals.giftWrapAmount,
        codFee: input.totals.codFee,
        giftMessage: input.giftMessage?.trim() || undefined,
        notes: buildOrderNotes(input),
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
