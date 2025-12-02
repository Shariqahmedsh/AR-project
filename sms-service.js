import request from 'request';

const MESSAGECENTRAL_CONFIG = {
  baseUrl: 'https://cpaas.messagecentral.com/verification/v3/send',
  customerId: process.env.MESSAGECENTRAL_CUSTOMER_ID || 'C-F9DBF9664CE5487',
  senderId: process.env.MESSAGECENTRAL_SENDER_ID || 'UTOMOB',
  authToken: process.env.MESSAGECENTRAL_AUTH_TOKEN || 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLUY5REJGOTY2NENFNTQ4NyIsImlhdCI6MTc2MDg3MTg4OCwiZXhwIjoxOTE4NTUxODg4fQ.NmZPs5nBesV61UjmA8GG_8bCIfNVWScXYCgRyKLGYqcizZpxOEIXTs-AFckR0kP0LuSA5XD1q0IKKO1l6-mx-g',
  countryCode: process.env.MESSAGECENTRAL_COUNTRY_CODE || '91',
  flowType: process.env.MESSAGECENTRAL_FLOW_TYPE || 'SMS', // Use SMS as per API docs
  type: process.env.MESSAGECENTRAL_TYPE || 'OTP', // Use OTP for VerifyNow
  // MessageCentral VerifyNow uses predefined templates and sender IDs
};

function resolveOtpLength() {
  const raw = process.env.MESSAGECENTRAL_OTP_LENGTH;
  if (!raw) return undefined;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return undefined;
  if (parsed < 4 || parsed > 8) return undefined;
  return String(parsed);
}

function normalizePhoneNumber(rawPhone, countryCode = '91') {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  // Strip leading country code if present
  if (digits.startsWith(countryCode)) {
    return digits.slice(countryCode.length);
  }
  // If starts with 0 and length > 10, trim leading zeros
  return digits.replace(/^0+/, '');
}

// VerifyNow handles OTP content and sender; no local message templating needed

/**
 * Send SMS verification code via MessageCentral
 * @param {string} phoneNumber - Phone number (without country code)
 * @param {string} code - Verification code
 * @param {string} countryCode - Country code (default: 91 for India)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendSmsVerificationCode(phoneNumber, code, countryCode = MESSAGECENTRAL_CONFIG.countryCode) {
  try {
    const normalized = normalizePhoneNumber(phoneNumber, countryCode);

    console.log(`📱 Sending SMS verification code ${code} to +${countryCode}${normalized}`);

    const sendOnce = (flowTypeValue) => {
      const params = new URLSearchParams({
        countryCode: String(countryCode),
        flowType: flowTypeValue,
        mobileNumber: normalized
      });
      const otpLength = resolveOtpLength();
      if (otpLength) params.set('otpLength', otpLength);
      const options = {
        method: 'POST',
        url: `${MESSAGECENTRAL_CONFIG.baseUrl}?${params.toString()}`,
        headers: {
          'authToken': MESSAGECENTRAL_CONFIG.authToken,
          'Content-Type': 'application/json'
        }
      };
      return new Promise((resolve) => {
        request(options, function (error, response) {
          if (error) {
            return resolve({ rawResponse: null, response, error });
          }
          let body = null;
          try { body = JSON.parse(response.body); } catch {}
          resolve({ rawResponse: body, response, error: null });
        });
      });
    };

    // First try with configured flowType; on Invalid FlowType, retry with 'SMS'
    const first = await sendOnce(MESSAGECENTRAL_CONFIG.flowType);
    console.log('📱 MessageCentral SMS Response:', first.rawResponse || first.response?.statusCode);
    const resp = first.rawResponse;
    const invalidFlow = resp && (resp.message === 'Invalid FlowType selected' || /invalid flowtype/i.test(String(resp.message)));
    if (invalidFlow) {
      console.warn('📱 FlowType invalid, retrying with flowType=SMS');
      const retry = await sendOnce('SMS');
      console.log('📱 MessageCentral SMS Retry Response:', retry.rawResponse || retry.response?.statusCode);
      return translateMessageCentralResponse(retry.response, retry.rawResponse);
    }
    return translateMessageCentralResponse(first.response, first.rawResponse);

  } catch (error) {
    console.error('📱 MessageCentral SMS Service Error:', error);
    return {
      success: false,
      error: error.message || 'SMS service unavailable'
    };
  }
}

/**
 * Send password reset SMS via MessageCentral
 * @param {string} phoneNumber - Phone number (without country code)
 * @param {string} code - Reset code
 * @param {string} countryCode - Country code (default: 91 for India)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendPasswordResetSms(phoneNumber, countryCode = MESSAGECENTRAL_CONFIG.countryCode) {
  try {
    const normalized = normalizePhoneNumber(phoneNumber, countryCode);

    console.log(`📱 Sending password reset SMS to +${countryCode}${normalized}`);

    const sendOnce = (flowTypeValue) => {
      const params = new URLSearchParams({
        countryCode: String(countryCode),
        flowType: flowTypeValue,
        mobileNumber: normalized
      });
      const otpLength = resolveOtpLength();
      if (otpLength) params.set('otpLength', otpLength);
      const options = {
        method: 'POST',
        url: `${MESSAGECENTRAL_CONFIG.baseUrl}?${params.toString()}`,
        headers: {
          'authToken': MESSAGECENTRAL_CONFIG.authToken,
          'Content-Type': 'application/json'
        }
      };
      return new Promise((resolve) => {
        request(options, function (error, response) {
          if (error) {
            return resolve({ rawResponse: null, response, error });
          }
          let body = null;
          try { body = JSON.parse(response.body); } catch {}
          resolve({ rawResponse: body, response, error: null });
        });
      });
    };

    const first = await sendOnce(MESSAGECENTRAL_CONFIG.flowType);
    console.log('📱 MessageCentral Password Reset SMS Response:', first.rawResponse || first.response?.statusCode);
    const resp = first.rawResponse;
    const invalidFlow = resp && (resp.message === 'Invalid FlowType selected' || /invalid flowtype/i.test(String(resp.message)));
    if (invalidFlow) {
      console.warn('📱 FlowType invalid, retrying password reset with flowType=SMS');
      const retry = await sendOnce('SMS');
      console.log('📱 MessageCentral Password Reset Retry Response:', retry.rawResponse || retry.response?.statusCode);
      return translateMessageCentralResponse(retry.response, retry.rawResponse);
    }
    return translateMessageCentralResponse(first.response, first.rawResponse);

  } catch (error) {
    console.error('📱 MessageCentral Password Reset SMS Service Error:', error);
    return {
      success: false,
      error: error.message || 'SMS service unavailable'
    };
  }
}

export default {
  sendSmsVerificationCode,
  sendPasswordResetSms,
  validateOtp
};

function translateMessageCentralResponse(response, responseBody) {
  if (!response) {
    return { success: false, error: 'No response from SMS service' };
  }
  try {
    const topLevelOk = (response.statusCode >= 200 && response.statusCode < 300);
    const bodyOk = responseBody && (responseBody.message === 'SUCCESS' || responseBody.status === 'success' || responseBody.responseCode === 200 || responseBody.responseCode === '200');
    const dataOk = responseBody && responseBody.data && (responseBody.data.responseCode === '200' || responseBody.data.status === 'success');
    if (topLevelOk && (bodyOk || dataOk)) {
      const verificationId = responseBody?.data?.verificationId || responseBody?.verificationId;
      const messageId = responseBody?.messageId || responseBody?.id || verificationId || 'unknown';
      return { success: true, messageId, verificationId, provider: 'MessageCentral' };
    }
    return { success: false, error: responseBody?.message || responseBody?.error || responseBody?.data?.message || `HTTP ${response.statusCode}` };
  } catch {
    return { success: false, error: 'Invalid response from SMS service' };
  }
}

/**
 * Validate OTP with MessageCentral Verify Now API
 * GET /verification/v3/validateOtp?verificationId=..&code=..&langId=..
 */
export async function validateOtp({ verificationId, code, langId = 'en' }) {
  const params = new URLSearchParams({
    verificationId: String(verificationId),
    code: String(code),
    langId: String(langId)
  });
  const options = {
    method: 'GET',
    url: `https://cpaas.messagecentral.com/verification/v3/validateOtp?${params.toString()}`,
    headers: { 'authToken': MESSAGECENTRAL_CONFIG.authToken }
  };
  return new Promise((resolve) => {
    request(options, function (error, response) {
      if (error) {
        console.error('📱 MessageCentral Validate OTP Error:', error);
        return resolve({ success: false, error: error.message || 'Failed to validate OTP' });
      }
      let body = null;
      try { body = JSON.parse(response.body); } catch {}
      console.log('📱 MessageCentral Validate OTP Response:', body || response.statusCode);
      const ok = response.statusCode >= 200 && response.statusCode < 300;
      const success = ok && body && body.message === 'SUCCESS' && (body.data?.verificationStatus === 'VERIFICATION_COMPLETED' || body.data?.responseCode === '200');
      if (success) {
        return resolve({ success: true });
      }
      return resolve({ success: false, error: body?.data?.errorMessage || body?.message || `HTTP ${response.statusCode}` });
    });
  });
}
