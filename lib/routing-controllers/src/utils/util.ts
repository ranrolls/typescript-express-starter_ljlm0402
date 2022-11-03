/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
import buffer from 'buffer'
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (typeof value === 'undefined' || value === undefined) {
    return true;
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true;
  } else {
    return false;
  }
};
export const universalBtoa = str => {
  try {
      return btoa(str);
  } catch (err) {
      return Buffer.from(str).toString('base64');
  }
};
export const universalAtob = b64Encoded => {
  try {
      return atob(b64Encoded);
  } catch (err) {
      return Buffer.from(b64Encoded, 'base64').toString();
  }
};
