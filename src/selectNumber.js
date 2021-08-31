module.exports = SelectNumber = async (houseNumber, page) => {
  await page.evaluate((houseNumber) => {
    document.querySelector("#ctl00_bodyPlaceHolder_txtBudova").value =
      houseNumber;
    document.querySelector("#ctl00_bodyPlaceHolder_btnVyhledat").click();
  }, houseNumber);
};
