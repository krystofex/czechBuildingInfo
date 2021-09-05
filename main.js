const puppeteer = require("puppeteer");
require("dotenv").config();
var fs = require("fs");
var SelectNumber = require("./src/selectNumber.js");
var BuildingInfo = require("./src/buildingInfo.js");

var outputData = [];
fs.appendFile(process.env.OUTPUT ?? "./output/output.json", "", function (err) {
  if (err) throw err;
});

const cities = JSON.parse(fs.readFileSync("./input/CzechCities.json", "utf8"));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  for (const city of cities) {
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
      process.stdout.write(`${city} | houseNumber: ${houseNumber} - `);

      if (
        (await page.url()) !=
        "https://nahlizenidokn.cuzk.cz/VyberBudovu/Stavba/InformaceO"
      ) {
        house = await BuildingInfo(house, page);

        /*
        await page.evaluate(() => {
          document
            .querySelector("#ctl00_bodyPlaceHolder_linkCAPTCHAInfoPanel")
            .click();
        });
        */
        // https://nahlizenidokn.cuzk.cz/Telerik.Web.UI.WebResourceCache.axd?type=rca&isc=true&guid=877d6b52-3275-4386-b2c1-0655a12ad726

        await page.waitForTimeout(2000);

        outputData.push(house);

        fs.writeFile(
          process.env.OUTPUT ?? "./output/output.json",
          JSON.stringify(outputData, null, 1),
          function (err) {
            if (err) throw err;
          }
        );

        await page.goBack();

        console.log("\033[32m DONE\033[0m");
      } else console.log("\033[31m FAILED\033[0m");
    }
  }
})();
