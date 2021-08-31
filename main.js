const puppeteer = require("puppeteer");
require("dotenv").config();
var fs = require("fs");

var outputData = [];
fs.appendFile(process.env.OUTPUT ?? "output.json", "", function (err) {
  if (err) throw err;
});

const cities = JSON.parse(fs.readFileSync("cities.json", "utf8"));

const SelectNumber = async (houseNumber, page) => {
  await page.evaluate((houseNumber) => {
    document.querySelector("#ctl00_bodyPlaceHolder_txtBudova").value =
      houseNumber;
    document.querySelector("#ctl00_bodyPlaceHolder_btnVyhledat").click();
  }, houseNumber);
};

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
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
      await page.waitForTimeout(2000);

      let house = { city, houseNumber };

      // select house
      await SelectNumber(houseNumber, page);

      await page.waitForTimeout(2000);
      process.stdout.write(`houseNumber: ${houseNumber}`);

      if (
        (await page.url()) !=
        "https://nahlizenidokn.cuzk.cz/VyberBudovu/Stavba/InformaceO"
      ) {
        house = await page.evaluate((house) => {
          const building =
            document.querySelector("#content > h1").innerText ===
            "Informace o stavbě";

          if (building)
            house = {
              ...house,
              building,
              buildingNumber: document.querySelector(
                "#content > div.vysledek--mapa > table > tbody > tr:nth-child(1) > td:nth-child(2) > strong"
              ).innerText,
              cityUrl: document.querySelector(
                "#content > div.vysledek--mapa > table > tbody > tr:nth-child(2) > td:nth-child(2) > a"
              ).href,
              numberLV: document.querySelector(
                "#content > div.vysledek--mapa > table > tbody > tr:nth-child(2) > td:nth-child(2) > a"
              ).innerText,
              parcelNumber: document.querySelector(
                "#content > div.vysledek--mapa > table > tbody > tr:nth-child(6) > td:nth-child(2)"
              ).innerText,
              buildingType: document.querySelector(
                "#content > div.vysledek--mapa > table > tbody > tr:nth-child(7) > td:nth-child(2)"
              ).innerText,
              buildingUsage: document.querySelector(
                "#content > div.vysledek--mapa > table > tbody > tr:nth-child(8) > td:nth-child(2)"
              ).innerText,
              buildingProtection: (
                document.querySelector(
                  "#content > table:nth-child(10) > tbody > tr > td"
                ) ??
                document.querySelector("#content > table > tbody > tr > td") ??
                document.querySelector("#content > div.nenalezenydata")
              ).innerText,
            };
          else
            house = {
              ...house,
              building,
              parcelNumber: document.querySelector(
                "#content > div.vysledek--mapa > table > tbody > tr:nth-child(1) > td:nth-child(2) > a"
              ).innerText,
              cityUrl: document.querySelector(
                "#content > div.vysledek--mapa > table > tbody > tr:nth-child(2) > td:nth-child(2) > a"
              ).href,
              numberLV: document.querySelector(
                "#content > div.vysledek--mapa > table > tbody > tr:nth-child(4) > td:nth-child(2) > a"
              ).innerText,
              parcelSize: document.querySelector(
                "#content > div.vysledek--mapa > table > tbody > tr:nth-child(5) > td:nth-child(2)"
              ).innerText,
              parcelType: document.querySelector(
                "#content > div.vysledek--mapa > table > tbody > tr:nth-child(6) > td:nth-child(2)"
              ).innerText,
              mapList: document.querySelector(
                "#content > div.vysledek--mapa > table > tbody > tr:nth-child(7) > td:nth-child(2) > a"
              ).innerText,
              sizeType: document.querySelector(
                "#content > div.vysledek--mapa > table > tbody > tr:nth-child(8) > td:nth-child(2)"
              ).innerText,
              parcelType: document.querySelector(
                "#content > div.vysledek--mapa > table > tbody > tr:nth-child(9) > td:nth-child(2)"
              ).innerText,
              street: document.querySelector(
                "#content > table.atributy.stinuj > tbody > tr:nth-child(4) > td:nth-child(2) > a"
              ).innerText,
              address: document.querySelector(
                "#content > table.atributy.stinuj > tbody > tr:nth-child(5) > td:nth-child(2) > a"
              ).innerText,
              buildingProtection: (
                document.querySelector(
                  "#content > table.zarovnat.stinuj > tbody > tr > td"
                ) ?? document.querySelector("#content > div:nth-child(11)")
              ).innerText,
            };

          return house;
        }, house);

        outputData.push(house);

        fs.writeFile(
          process.env.OUTPUT ?? "output.json",
          JSON.stringify(outputData, null, 1),
          function (err) {
            if (err) throw err;
          }
        );

        await page.goBack();

        console.log(" -\033[32m DONE\033[0m");
      } else console.log(" -\033[31m Failed\033[0m");
    }
  }
})();
