import axios from 'axios';

// The server answers in English; the app shows Thai. Longer messages are matched by prefix.
const messages: [string, string][] = [
  ['code not found', 'ไม่พบโค้ดนี้ ตรวจตัวอักษรอีกครั้ง'],
  ['this code has already been used', 'โค้ดนี้ถูกใช้ไปแล้ว'],
  ['this code has expired', 'โค้ดหมดอายุแล้ว ขอโค้ดใหม่จากพนักงาน'],
  ['not enough points', 'แต้มไม่พอสำหรับของรางวัลนี้'],
  ['incorrect email or password', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'],
  ['email already registered', 'อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบแทน'],
  ['invalid request: email and password', 'กรอกอีเมลและรหัสผ่านอย่างน้อย 8 ตัวอักษร'],
  ['voucher not found', 'ไม่พบคูปองนี้'],
  ['this voucher has already been used', 'คูปองนี้ถูกใช้ไปแล้ว'],
  ['too many requests', 'ลองถี่เกินไป รอสักครู่แล้วลองใหม่'],
  ['bill is too small', 'ยอดบิลน้อยเกินไปที่จะได้แต้ม'],
  ['conversation must end', 'ข้อความสั้นกว่านี้หน่อย (ไม่เกิน 500 ตัวอักษร)'],
  ['admin only', 'เฉพาะพนักงานร้านเท่านั้น'],
];

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบว่า backend เปิดอยู่';
    }
    const serverText = (error.response.data as { error?: unknown } | undefined)?.error;
    if (typeof serverText === 'string') {
      const hit = messages.find(([prefix]) => serverText.startsWith(prefix));
      if (hit) return hit[1];
    }
    if (error.response.status >= 500) return 'ระบบขัดข้อง ลองใหม่อีกครั้ง';
  }
  return 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง';
}
