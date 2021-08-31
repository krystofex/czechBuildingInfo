const puppeteer = require("puppeteer");
require("dotenv").config();
var fs = require("fs");
var SelectNumber = require("./src/selectNumber.js");
var BuildingInfo = require("./src/buildingInfo.js");

var outputData = [];
fs.appendFile(process.env.OUTPUT ?? "output.json", "", function (err) {
  if (err) throw err;
});

const cities = JSON.parse(fs.readFileSync("cities.json", "utf8"));

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
        outputData.push(await BuildingInfo(house, page));

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
