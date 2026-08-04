import { HttpError } from "../http/errors.js";
import type { Order } from "./orders.types.js";
import type { OrdersRepositoryContract } from "./orders.repository.js";

export type OrdersServiceContract = {
  placeOrder(userId: string): Promise<Order>;
  getOrderById(userId: string, orderId: string): Promise<Order>;
};

export class OrdersService implements OrdersServiceContract {
  constructor(private readonly repository: OrdersRepositoryContract) {}

  async placeOrder(userId: string): Promise<Order> {
    return this.repository.placeOrder(userId);
  }

  async getOrderById(userId: string, orderId: string): Promise<Order> {
    const order = await this.repository.getOrderById(userId, orderId);

    if (!order) {
      throw new HttpError(404, "Order not found.");
    }

    return order;
  }
}
