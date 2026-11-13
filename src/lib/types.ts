export type InquiryStatus = "new" | "checked" | "enrolled" | "closed";
export type InquirySource = "website" | "admin";

export type Inquiry = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  source: InquirySource;
  status: InquiryStatus;
  notes: string;
  emailSent: boolean;
  emailError: string;
  lastReplyAt?: string;
  lastReplyError?: string;
};

export const statusLabels: Record<InquiryStatus, string> = {
  new: "New",
  checked: "Checked",
  enrolled: "Enrolled",
  closed: "Closed",
};
