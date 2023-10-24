import * as puppeteer from "puppeteer";
import fs from 'fs';

const BASE_URL = `https://unicode.org/emoji/charts/full-emoji-list.html`;
let version = '1.0.0';

async function main(args = ['json']) {
    if (!['json', 'array', 'jsonarray'].includes(args[0].toLocaleLowerCase())) {
        console.log(
            '[USAGE]: node scrapper.js [json]|array|jsonarray'
        );
        return;
    }
    const outputType = args[0];
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(BASE_URL, {
        waitUntil: 'load',
        timeout: 0,
    });
    const {results, emojis} = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const table = document.querySelector('table');
        const rows = table.querySelectorAll('tr');
        let currentType = '';
        let currentSubType = '';
        version = ((h1.textContent || '').split(',')[1] || '').trim();
        const emojis = {
            __version__: version,
        };
        const results = [];
        rows.forEach(row => {
            const type = row.querySelector('th.bighead > a');
            const subtype = row.querySelector('th.mediumhead > a');
            if (type) {
                currentType = type.innerText;
                emojis[currentType] = {};
            }
            if (subtype) {
                currentSubType = subtype.innerText;
                emojis[currentType][currentSubType] = [];
            }
            const code = row.querySelector('td.code > a');
            const name = row.querySelector('td.name');
            const emoji = row.querySelector('td.chars');
            if (code && name && emoji) {
                const codes = code.innerText.split(' ');
                const data = {
                    unicode: codes.length > 1 ? codes : codes[0],
                    multicode: codes.length > 1,
                    name: name.innerText,
                    emoji: emoji.innerText,
                };
                emojis[currentType][currentSubType].push(data);
                results.push(data);
            }
        });
        return {emojis, results};
    });
    switch (outputType) {
        case 'json':
            fs.writeFileSync(`emoji${version}.json`, JSON.stringify(emojis, null, 2));
            break;
        case 'array':
            fs.writeFileSync(`emoji-array${version}.json`, JSON.stringify(results, null, 2));
            break;
        case 'jsonarray':
            fs.writeFileSync(
                `emoji-array${version}.json`,
                JSON.stringify(results, null, 2)
            );
            fs.writeFileSync(
                `emoji${version}.json`,
                JSON.stringify(emojis, null, 2)
            );
            break;
        default:
            throw new Error('type not handled');
    }
    await browser.close();
}

main(process.argv.slice(2));
