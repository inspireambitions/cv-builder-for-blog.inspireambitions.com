export function validateEmail(email: string): { valid: boolean; warning?: string } {
  if (!email) return { valid: false };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, warning: "Please enter a valid email address" };
  }
  // Warn about unprofessional emails
  const unprofessional = /\d{4,}|sexy|hot|cool|babe|420|69/i;
  if (unprofessional.test(email.split("@")[0])) {
    return {
      valid: true,
      warning:
        "HR tip: This email may appear unprofessional to recruiters. Consider using firstname.lastname@provider.com",
    };
  }
  return { valid: true };
}

export function validateLinkedIn(url: string): { valid: boolean; warning?: string } {
  if (!url) return { valid: true }; // Optional field
  const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
  if (!linkedinRegex.test(url)) {
    return {
      valid: false,
      warning: "LinkedIn URL should look like: https://linkedin.com/in/your-name",
    };
  }
  return { valid: true };
}

export function validatePhone(phone: string): { valid: boolean; warning?: string } {
  if (!phone) return { valid: false };
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) {
    return { valid: false, warning: "Please enter a valid phone number" };
  }
  if (!phone.startsWith("+")) {
    return {
      valid: true,
      warning: "HR tip: Include your country code (e.g. +971, +44, +1) for international applications",
    };
  }
  return { valid: true };
}

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: "File must be under 5MB" };
  }
  const validTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: "Please upload a PDF, Word (.docx), or text file" };
  }
  return { valid: true };
}

export function validateImageUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: "Image must be under 5MB" };
  }
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Please upload a JPEG or PNG image" };
  }
  return { valid: true };
}
