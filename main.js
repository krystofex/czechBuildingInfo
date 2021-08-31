const puppeteer = require("puppeteer");
var fs = require("fs");

var outputData = [];
fs.appendFile("output.json", "", function (err) {
  if (err) throw err;
});

const cities = ["Pardubice"];

(async () => {
  const browser = await puppeteer.launch({ headless: 0 });
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
    for (let houseNumber = 12; houseNumber < 10000; houseNumber++) {
      await page.waitForTimeout(2000);

      let house = { city, houseNumber };
      // select house
      await page.evaluate((houseNumber) => {
        document.querySelector("#ctl00_bodyPlaceHolder_txtBudova").value =
          houseNumber;
        document.querySelector("#ctl00_bodyPlaceHolder_btnVyhledat").click();
      }, houseNumber);

      await page.waitForTimeout(2000);
      process.stdout.write(`houseNumber: ${houseNumber}`);

      if (
        (await page.url()) !=
        "https://nahlizenidokn.cuzk.cz/VyberBudovu/Stavba/InformaceO"
      ) {
        house = await page.evaluate((house) => {
          const detachedHouse =
            document.querySelector("#content > h2:nth-child(5)").innerText !==
            "Vymezené jednotky";

          house = {
            ...house,
            detachedHouse,
            parcelUrl: detachedHouse
              ? document.querySelector(
                  "#content > div.vysledek--mapa > table > tbody > tr:nth-child(1) > td:nth-child(2) > a"
                ).href
              : null,
            parcelNumber: detachedHouse
              ? document.querySelector(
                  "#content > div.vysledek--mapa > table > tbody > tr:nth-child(1) > td:nth-child(2) > a"
                ).innerText
              : null,

            cityUrl: document.querySelector(
              "#content > div.vysledek--mapa > table > tbody > tr:nth-child(2) > td:nth-child(2) > a"
            ).href,

            numberLV: detachedHouse
              ? document.querySelector(
                  "#content > div.vysledek--mapa > table > tbody > tr:nth-child(4) > td:nth-child(2) > a"
                ).innerText
              : document.querySelector(
                  "#content > div.vysledek--mapa > table > tbody > tr:nth-child(5) > td:nth-child(2) > a"
                ).innerText,
            numberLVUrl: detachedHouse
              ? document.querySelector(
                  "#content > div.vysledek--mapa > table > tbody > tr:nth-child(4) > td:nth-child(2) > a"
                ).href
              : document.querySelector(
                  "#content > div.vysledek--mapa > table > tbody > tr:nth-child(5) > td:nth-child(2) > a"
                ).href,

            acreage: detachedHouse
              ? document.querySelector(
                  "#content > div.vysledek--mapa > table > tbody > tr:nth-child(5) > td:nth-child(2)"
                ).innerText
              : null,

            parcelType: detachedHouse
              ? document.querySelector(
                  "#content > div.vysledek--mapa > table > tbody > tr:nth-child(6) > td:nth-child(2)"
                ).innerText
              : null,
            landType: detachedHouse
              ? document.querySelector(
                  "#content > div.vysledek--mapa > table > tbody > tr:nth-child(9) > td:nth-child(2)"
                ).innerText
              : null,
            mapList: detachedHouse
              ? document.querySelector(
                  "#content > div.vysledek--mapa > table > tbody > tr:nth-child(7) > td:nth-child(2) > a"
                ).innerText
              : null,
            acreageType: detachedHouse
              ? document.querySelector(
                  "#content > div.vysledek--mapa > table > tbody > tr:nth-child(8) > td:nth-child(2)"
                ).innerText
              : null,

            buildingDetailInfo: detachedHouse
              ? document.querySelector(
                  "#content > table.atributy.stinuj > tbody > tr:nth-child(1) > td:nth-child(2)"
                ).innerText
              : null,
            street: detachedHouse
              ? document.querySelector(
                  "#content > table.atributy.stinuj > tbody > tr:nth-child(4) > td:nth-child(2)"
                ).innerText
              : null,
            neighborParcelsUrl: detachedHouse
              ? document.querySelector("#content > div.noPrint > a").href
              : null,

            buildingProtection: (
              document.querySelector(
                "#content > table.zarovnat.stinuj > tbody > tr > td"
              ) ?? document.querySelector("#content > div:nth-child(9)")
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
        console.log(" -\033[32m DONE\033[0m");
      } else console.log(" -\033[31m Failed\033[0m");
    }
  }
})();
