"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeString = exports.GenerateString = void 0;
const lorem_ipsum_1 = require("lorem-ipsum");
function GenerateString(approximate_string_length) {
    let lorem_ipsum = new lorem_ipsum_1.LoremIpsum({
        sentencesPerParagraph: {
            max: 10,
            min: 3
        },
        wordsPerSentence: {
            max: 12,
            min: 5
        }
    });
    let number_of_paragraphs = Math.max(1, approximate_string_length / (5 * 9 * 6));
    let result;
    do {
        number_of_paragraphs *= 1.2;
        number_of_paragraphs = (number_of_paragraphs >> 0);
        result = lorem_ipsum.generateParagraphs(number_of_paragraphs);
    } while (result.length < approximate_string_length);
    return result;
}
exports.GenerateString = GenerateString;
function ChangeString(original_string, change_percent) {
    if (change_percent < 0 || change_percent > 1) {
        throw new Error(`change_percent must be in range [0,1], but it is: ${change_percent}`);
    }
    const addable_chars = "abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.,!?";
    let result = "";
    let probability;
    let i = 0;
    while (i < original_string.length) {
        probability = Math.random();
        if (probability > change_percent) { // character remains unchanged
            result += original_string[i];
            ++i;
        }
        else {
            probability = Math.random();
            if (probability > 0.5) { // character gets deleted
                ++i;
            }
            else { // a character gets added
                probability = Math.random();
                probability = (probability * addable_chars.length) >> 0;
                result += addable_chars[probability];
            }
        }
    }
    return result;
}
exports.ChangeString = ChangeString;
