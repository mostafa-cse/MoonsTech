const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting crawler...");
    const browser = await puppeteer.launch({
        headless: "new"
    });
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1440, height: 900 });

    const visited = new Set();
    const queue = ['http://localhost:3001'];
    const errors = [];
    
    // Catch console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push({ type: 'Console Error', text: msg.text(), location: msg.location()?.url });
        }
    });

    page.on('pageerror', err => {
        errors.push({ type: 'Page Error', text: err.toString() });
    });

    page.on('requestfailed', request => {
        errors.push({ type: 'Request Failed', url: request.url(), errorText: request.failure()?.errorText });
    });

    page.on('response', response => {
        if (response.status() >= 400) {
            errors.push({ type: 'Bad Response', url: response.url(), status: response.status() });
        }
    });

    while (queue.length > 0) {
        const url = queue.shift();
        if (visited.has(url)) continue;
        visited.add(url);
        
        console.log(`Crawling: ${url}`);
        
        try {
            const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
            
            if (response && response.status() >= 400) {
                errors.push({ type: 'HTTP Error', url, status: response.status() });
            }

            // Extract all internal links
            const links = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a'));
                return anchors.map(a => a.href).filter(href => href.startsWith('http://localhost:3001') && !href.includes('#'));
            });

            for (const link of links) {
                if (!visited.has(link) && !queue.includes(link)) {
                    queue.push(link);
                }
            }
            
            // Limit to 200 pages max for a deeper test
            if (visited.size >= 200) break;
            
        } catch (e) {
            errors.push({ type: 'Navigation Error', url, error: e.message });
        }
    }

    console.log("\n--- Crawl Results ---");
    console.log(`Pages Visited: ${visited.size}`);
    console.log("Errors Found:");
    console.dir(errors, { depth: null });
    
    await browser.close();
})();
