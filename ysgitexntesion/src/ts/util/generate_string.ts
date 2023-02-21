import { LoremIpsum } from 'lorem-ipsum'

export function GenerateString(approximate_string_length: number) : string {
    let lorem_ipsum: LoremIpsum = new LoremIpsum({
        sentencesPerParagraph: {
           max: 10,
           min: 3
        },
        wordsPerSentence: {
            max: 12,
            min: 5
        }
    });

    let number_of_paragraphs: number = Math.max(1,approximate_string_length/(5*9*6));
    let result: string;
    do {
        number_of_paragraphs *= 1.2;
        number_of_paragraphs = (number_of_paragraphs >> 0);
        result = lorem_ipsum.generateParagraphs(number_of_paragraphs);
    } while(result.length < approximate_string_length);
    return result;
}

export function ChangeString(original_string: string, change_percent: number) : string {
    if(change_percent < 0 || change_percent > 1) {
        throw new Error(`change_percent must be in range [0,1], but it is: ${change_percent}`);
    }

    const addable_chars : string = "abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.,!?"

    let result: string = "";
    let probability: number;
    let i: number = 0;
    while(i < original_string.length) {
        probability = Math.random();
        if(probability > change_percent) { // character remains unchanged
            result += original_string[i];
            ++i;
        } else {
            probability = Math.random();
            if(probability > 0.5) { // character gets deleted
                ++i;
            } else { // a character gets added
                probability = Math.random();
                probability = (probability*addable_chars.length) >> 0;
                result += addable_chars[probability];
            }
        }
    }

    return result;
}