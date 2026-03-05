import { env } from "@/env.mjs";

const FPAYMENT_API_URL = "https://app.fpayment.net/api";

export interface CreateInvoiceParams {
  name: string;
  description: string;
  amount: number;
  requestId: string;
  callbackUrl: string;
  successUrl: string;
  cancelUrl: string;
}

export interface InvoiceResponse {
  status: string;
  msg: string;
  data?: {
    trans_id: string;
    amount: string;
    status: string;
    url_payment: string;
  };
}

export interface InvoiceStatusResponse {
  status: string;
  msg: string;
  data?: {
    trans_id: string;
    request_id: string;
    amount: string;
    received: string;
    status: string; // waiting, completed, expired
    from_address: string | null;
    transaction_id: string | null;
    create_gettime: string;
    update_gettime: string;
  };
}

export async function createInvoice(
  params: CreateInvoiceParams,
): Promise<InvoiceResponse> {
  if (!env.FPAYMENT_MERCHANT_ID || !env.FPAYMENT_API_KEY) {
    throw new Error("FPayment configuration is missing");
  }

  const formData = new FormData();
  formData.append("merchant_id", env.FPAYMENT_MERCHANT_ID);
  formData.append("api_key", env.FPAYMENT_API_KEY);
  formData.append("name", params.name);
  formData.append("description", params.description);
  formData.append("amount", params.amount.toString());
  formData.append("request_id", params.requestId);
  formData.append("callback_url", params.callbackUrl);
  formData.append("success_url", params.successUrl);
  formData.append("cancel_url", params.cancelUrl);

  try {
    const response = await fetch(`${FPAYMENT_API_URL}/AddInvoice`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
}

export async function getInvoiceStatus(
  transId: string,
): Promise<InvoiceStatusResponse> {
  if (!env.FPAYMENT_MERCHANT_ID || !env.FPAYMENT_API_KEY) {
    throw new Error("FPayment configuration is missing");
  }

  const formData = new FormData();
  formData.append("merchant_id", env.FPAYMENT_MERCHANT_ID);
  formData.append("api_key", env.FPAYMENT_API_KEY);
  formData.append("trans_id", transId);

  try {
    const response = await fetch(`${FPAYMENT_API_URL}/GetInvoiceStatus`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting invoice status:", error);
    throw error;
  }
}
