import { DES, enc } from 'crypto-js';

function getRandomNumberInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateNickname() {
  let name = '';
  for (let i = 0; i < 10; i++) {
    name += String.fromCharCode(getRandomNumberInRange(65, 90));
  }
  return name;
}

export function encrypt(string: string) {
  const parsedPassword = enc.Utf8.parse(string);
  const key = enc.Utf8.parse(process.env.SETTINGS_TOKEN_HASH_SALT!);
  const iv = enc.Hex.parse(process.env.SETTINGS_TOKEN_IV!);
  return DES.encrypt(parsedPassword, key, { iv }).toString();
}

export function decrypt(string: string) {
  const key = enc.Utf8.parse(process.env.SETTINGS_TOKEN_HASH_SALT!);
  const iv = enc.Hex.parse(process.env.SETTINGS_TOKEN_IV!);
  return DES.decrypt(string, key, { iv }).toString(enc.Utf8);
}

export function generateRandomPassword() {
  const getRandomNumberInRange = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  let pass = '';
  for (let i = 0; i < 15; i++) {
    pass += String.fromCharCode(getRandomNumberInRange(65, 90))[
      i % 2 === 0 ? 'toLowerCase' : 'toUpperCase'
    ]();
  }
  return pass;
}
