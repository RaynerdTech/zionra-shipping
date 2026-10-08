/**
 * Responsibility:
 * Reads and updates authenticated customer profile details and saved addresses.
 */

import { prisma } from "../../lib/prisma.js";
import { HTTP_STATUS, HttpError } from "../../lib/httpError.js";
import type {
  CustomerAddressInput,
  UpdateCustomerProfileInput,
} from "../../validators/customerAuth.validators.js";
import { toPublicCustomer } from "./customerAuth.shared.js";

function notFound(message: string) {
  return new HttpError(HTTP_STATUS.NOT_FOUND, message);
}

export async function getCustomerProfile(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      addresses: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!customer) {
    throw new HttpError(
      HTTP_STATUS.UNAUTHORIZED,
      "Customer account no longer exists.",
    );
  }

  return {
    customer: toPublicCustomer(customer),
    addresses: customer.addresses,
    totalShipments: 0,
  };
}

export async function updateCustomerProfile(
  customerId: string,
  input: UpdateCustomerProfileInput,
) {
  const customer = await prisma.customer.update({
    where: { id: customerId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      dateOfBirth: input.dateOfBirth,
      nationality: input.nationality,
      phoneCountryCode: input.phoneCountryCode,
      phoneNumber: input.phoneNumber,
      countryOfResidence: input.countryOfResidence,
    },
  });

  return {
    message: "Profile updated successfully.",
    customer: toPublicCustomer(customer),
  };
}

export async function createCustomerAddress(
  customerId: string,
  input: CustomerAddressInput,
) {
  const count = await prisma.customerAddress.count({ where: { customerId } });
  const shouldBeDefault = input.isDefault || count === 0;

  const address = await prisma.$transaction(async (transaction) => {
    if (shouldBeDefault) {
      await transaction.customerAddress.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return transaction.customerAddress.create({
      data: {
        customerId,
        ...input,
        isDefault: shouldBeDefault,
      },
    });
  });

  return { message: "Address saved.", address };
}

export async function updateCustomerAddress(
  customerId: string,
  addressId: string,
  input: CustomerAddressInput,
) {
  const existing = await prisma.customerAddress.findFirst({
    where: { id: addressId, customerId },
  });

  if (!existing) throw notFound("Saved address not found.");

  const address = await prisma.$transaction(async (transaction) => {
    if (input.isDefault) {
      await transaction.customerAddress.updateMany({
        where: { customerId, isDefault: true, NOT: { id: addressId } },
        data: { isDefault: false },
      });
    }

    return transaction.customerAddress.update({
      where: { id: addressId },
      data: input,
    });
  });

  return { message: "Address updated.", address };
}

export async function deleteCustomerAddress(
  customerId: string,
  addressId: string,
) {
  const existing = await prisma.customerAddress.findFirst({
    where: { id: addressId, customerId },
  });

  if (!existing) throw notFound("Saved address not found.");

  await prisma.$transaction(async (transaction) => {
    await transaction.customerAddress.delete({ where: { id: addressId } });

    if (existing.isDefault) {
      const next = await transaction.customerAddress.findFirst({
        where: { customerId },
        orderBy: { createdAt: "asc" },
      });

      if (next) {
        await transaction.customerAddress.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
  });

  return { message: "Address removed." };
}
