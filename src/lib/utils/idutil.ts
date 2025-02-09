
import { nanoid, customAlphabet } from 'nanoid';


export function generateUserId(): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const idLength = 10; 
  return customAlphabet(alphabet, idLength)();
}
