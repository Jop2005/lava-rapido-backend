// src/shared/utils/string-helper.util.ts (actualizado)

export class StringHelper {
  static capitalize(text: string): string {
    if (!text) return '';
    return text.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  static generateCode(prefix: string, number: number): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequential = String(number).padStart(5, '0');
    return `${prefix}-${year}-${month}-${sequential}`;
  }

  static sanitize(text: string): string {
    if (!text) return '';
    return text.replace(/[<>]/g, '');
  }

  static truncate(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  static generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
}