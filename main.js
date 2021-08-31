const puppeteer = require("puppeteer");
var fs = require("fs");

var outputData = [];
fs.appendFile("output.json", "", function (err) {
  if (err) throw err;
});

const cities = ["Pardubice"];

(async () => {
  const browser = await puppeteer.launch({ headless: 1 });
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

    // for every house
    for (let houseNumber = 1; houseNumber < 10000; houseNumber++) {
      await page.waitForTimeout(1000);

      let house = { city, houseNumber };
      // select house
      await page.evaluate((houseNumber) => {
        document.querySelector("#ctl00_bodyPlaceHolder_txtBudova").value =
          houseNumber;
        document.querySelector("#ctl00_bodyPlaceHolder_btnVyhledat").click();
      }, houseNumber);

      await page.waitForTimeout(1000);

      house = await page.evaluate((house) => {
        house = {
          ...house,
          parcelUrl: document.querySelector(
            "#content > div.vysledek--mapa > table > tbody > tr:nth-child(1) > td:nth-child(2) > a"
          ).href,
          parcelNumber: document.querySelector(
            "#content > div.vysledek--mapa > table > tbody > tr:nth-child(1) > td:nth-child(2) > a"
          ).innerText,
          cityUrl: document.querySelector(
            "#content > div.vysledek--mapa > table > tbody > tr:nth-child(2) > td:nth-child(2) > a"
          ).href,
          numberLV: document.querySelector(
            "#content > div.vysledek--mapa > table > tbody > tr:nth-child(4) > td:nth-child(2) > a"
          ).innerText,
          acreage: document.querySelector(
            "#content > div.vysledek--mapa > table > tbody > tr:nth-child(5) > td:nth-child(2)"
          ).innerText,
          parcelType: document.querySelector(
            "#content > div.vysledek--mapa > table > tbody > tr:nth-child(6) > td:nth-child(2)"
          ).innerText,
          landType: document.querySelector(
            "#content > div.vysledek--mapa > table > tbody > tr:nth-child(9) > td:nth-child(2)"
          ).innerText,
          mapList: document.querySelector(
            "#content > div.vysledek--mapa > table > tbody > tr:nth-child(7) > td:nth-child(2) > a"
          ).innerText,
          acreageType: document.querySelector(
            "#content > div.vysledek--mapa > table > tbody > tr:nth-child(8) > td:nth-child(2)"
          ).innerText,
          buildingDetailInfo: document.querySelector(
            "#content > table.atributy.stinuj > tbody > tr:nth-child(1) > td:nth-child(2)"
          ).innerText,
          street: document.querySelector(
            "#content > table.atributy.stinuj > tbody > tr:nth-child(4) > td:nth-child(2)"
          ).innerText,
          neighborParcelsUrl: document.querySelector(
            "#content > div.noPrint > a"
          ).href,
          buildingProtection: document.querySelector(
            "#content > table.zarovnat.stinuj > tbody > tr > td"
          ).innerText,
        };
        return house;
      }, house);

      house = { ...house, url: await page.url() };

      outputData.push(house);

      fs.writeFile("output.json", JSON.stringify(outputData), function (err) {
        if (err) throw err;
      });

      await page.goBack();
    }
  }
})();
