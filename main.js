const puppeteer = require("puppeteer");

const cities = ["Pardubice"];

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  for (let cityIndex = 0; cityIndex < cities.length; cityIndex++) {
    const city = cities[cityIndex];

    await page.goto(
      "https://nahlizenidokn.cuzk.cz/VyberBudovu/Stavba/InformaceO",
      {
        waitUntil: "networkidle2",
      }
    );

    // select city
    await page.evaluate((city) => {
      document.querySelector("#ctl00_bodyPlaceHolder_vyberObec_txtObec").value =
        city;
      document
        .querySelector("#ctl00_bodyPlaceHolder_vyberObec_btnObec")
        .click();
    }, city);
  }
})();
