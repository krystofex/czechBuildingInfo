module.exports = BuildingInfo = async (house, page) => {
  await page.evaluate((house) => {
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
};
