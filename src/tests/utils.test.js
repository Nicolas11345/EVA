import { isEmpty, formatDate, isValidEmail } from '../utils'

test('testing isEmpty function', () => {
    expect(isEmpty([])).toBeTruthy();
    expect(isEmpty([1,2,3])).not.toBeTruthy();
    expect(isEmpty({})).toBeTruthy();
    expect(isEmpty({ property : "property" })).not.toBeTruthy();
});

test('testing formatDate function', () => {
    expect(formatDate(new Date(2020, 0, 15))).toEqual("15/01/2020");
});

test('testing isValidEmail function', () => {
    expect(isValidEmail("")).not.toBeTruthy();
    expect(isValidEmail("test")).not.toBeTruthy();
    expect(isValidEmail("test@")).not.toBeTruthy();
    expect(isValidEmail("test.com")).not.toBeTruthy();
    expect(isValidEmail("test@gmail.com")).toBeTruthy();
});