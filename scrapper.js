import * as puppeteer from "puppeteer";
import fs from 'fs';

const BASE_URL = `https://unicode.org/emoji/charts/full-emoji-list.html`;

async function main() {
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(BASE_URL, {
        waitUntil: 'load',
        timeout: 0,
    });
    const results = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const table = document.querySelector('table');
        const rows = table.querySelectorAll('tr');
        let currentType = '';
        let currentSubType = '';
        const emojis = {
            __version__: ((h1.textContent || '').split(',')[1] || '').trim(),
        };
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
                emojis[currentType][currentSubType].push({
                    unicode: codes.length > 1 ? codes : codes[0],
                    multicode: codes.length > 1,
                    name: name.innerText,
                    emoji: emoji.innerText,
                });
            }
        });
        return emojis;
    });
    console.log(results);
    fs.writeFileSync('emoji.json', JSON.stringify(results, null, 2));
    await browser.close();
}

main();
