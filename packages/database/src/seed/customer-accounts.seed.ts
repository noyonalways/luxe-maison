import type { Customer } from '@luxe-maison/core';

/** Pre-hashed demo password: customer123 */
export const CUSTOMER_DEMO_ACCOUNT: Pick<Customer, 'id' | 'name' | 'email' | 'passwordHash'> = {
  id: 'cust-demo',
  name: 'Jane Doe',
  email: 'customer@maison.com',
  passwordHash: '$2b$10$GP3yqBV0QeC3/bfmJ9qAseQT1SN/ykiacd.8OYuummFDHshwO1Hay',
};
