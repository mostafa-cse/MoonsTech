const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to login...");
    await page.goto('http://localhost:3001/login');
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('response', response => {
      if (response.url().includes('/auth/login')) {
        console.log('Login Response status:', response.status());
        response.json().then(data => console.log('Login Response body:', data)).catch(e => {});
      }
    });

    // Login as admin
    await page.type('input[type="email"]', 'admin@admin.com');
    await page.type('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    console.log("Waiting for navigation to admin dashboard...");
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(e => console.log("Navigation timeout"));
    
    await page.screenshot({ path: 'login_result.png' });
    
    console.log("Current URL after login:", page.url());
    
    if (page.url().includes('/admin')) {
      console.log("Successfully logged in as Admin.");
    } else {
      console.log("Failed to login as admin or didn't redirect to admin dashboard.");
      console.log("Checking if there are any error toasts...");
      const adminLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href^="/admin"]'));
      return links.map(l => l.href);
    });
    
    const uniqueLinks = [...new Set(adminLinks)];
    console.log("Links on dashboard:");
    uniqueLinks.forEach(l => console.log(l));
    
    console.log("\nCrawling admin pages...");
    let hasErrors = false;
    for (const link of uniqueLinks) {
        console.log(`\nVisiting: ${link}`);
        await page.goto(link, { waitUntil: 'networkidle0', timeout: 5000 }).catch(e => {});
        const apiErrors = await page.evaluate(() => {
            return window.performance.getEntriesByType('resource')
                .filter(r => r.name.includes('/api/'))
                .map(r => r.name);
        });
        console.log(`API Calls on ${link}:`, apiErrors.length);
        
        // Wait a sec for any toast to appear
        await new Promise(r => setTimeout(r, 1000));
        const toasts = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('[data-sonner-toast]')).map(t => t.textContent);
        });
        if (toasts.length > 0) {
            console.log(`Toasts found on ${link}:`, toasts);
        }
    }
    
    console.log("Done checking admin pages.");
    await browser.close();
    }
  } catch (err) {
    console.error("Error during admin test:", err);
  } finally {
    await browser.close();
  }
})();
