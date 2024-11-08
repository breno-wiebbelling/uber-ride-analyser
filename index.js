const puppeteer = require('puppeteer');
const fs = require('fs');

const RIDE_CONTAINER = '._css-cjIpnP';
const RIDE_DETAILS_CONTAINER = '._css-gLUFWd';
const RIDE_DATE_SEPARATOR = "•";
const ROUTE_DETAILS = '._css-uWqLr';
const ROUTE_DETAIL = '._css-dTqljZ';
const MORE_BUTTON = '._css-hvdvaj';
const CANCELLED_RIDE = '._css-hEBnkv';
const HOME_PAGE_DATES_TITLE = '._css-gpJWqY';

const ADDRESS_TO_AVOID = 'Industrial Belgraf';

const KM_PRESET = 'Quilômetros';
const PRICE_PRESET = 'R$';
const RIDE_DETAILS_URL_PRESET = `https://riders.uber.com/trips/`;

const DISTANCE_KEY = 'distance';
const PRICE_KEY = 'price';
const FILE_NAME = 'results'

const baseConfig = {
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  userDataDir: "C:\\Users\\breno\\AppData\\Local\\Google\\Chrome\\User Data",
  headless: !false
};

let formatedRides = [];
let shouldRepeat = true;

let fileContent = fs.readFileSync(FILE_NAME, 'utf-8');

let lines = fileContent.split('\n');
let latestRecord = JSON.parse(lines[0]);
let oldestRecord = JSON.parse(lines[lines.length-2]);

(
  async () => {
    console.clear();

    const browser = await puppeteer.launch(baseConfig);
    const homePage = await browser.newPage();

    try {

      await checkAndFillLatestResults(homePage, browser);
      await processOldRides(homePage, browser);
     
    } catch (err) {
      console.log(err)
    }

    // await homePage.close();
    // await browser.close();
    return;
  }
)()

const goToHomePage = async (page) => {
  let shouldRetry = true;
  let tryCount = 0;

  while(tryCount < 3 && shouldRetry){
    try{
      await page.goto("https://riders.uber.com/trips?uclick_id=18a4f50b-04a8-4b2e-a724-ad82ec47616b", {timeout: 4000})

      tryCount++;
      shouldRetry = false;
    }
    catch(err){
      console.log('Error while loading home page.');
    }
  }
}

const checkAndFillLatestResults = async (homePage, browser) => {
  await goToHomePage(homePage);
  
  let pageDates = await getHomePageDates(homePage);
  latestRecord['date'] = getDateFromRideDate(latestRecord['date'])
  
  let ridesToBeSaved;
  while(pageDates[0] >= latestRecord['date'] || pageDates[1] >= latestRecord['date']){
    console.log(`Processing results for: ${pageDates[0].toLocaleDateString()} - ${pageDates[1].toLocaleDateString()}`);
    ridesToBeSaved = await getRidesFromHomePage(homePage, browser);
    // fs.appendFileSync(FILE_NAME, )+"\n")

    await homePage.click(MORE_BUTTON);
    pageDates = await getHomePageDates(homePage);
  }
}

const processOldRides = async (homePage, browser) => {
  await goToHomePage(homePage);
  
  let pageDates = await getHomePageDates(homePage);
  latestRecord['date'] = getDateFromRideDate(latestRecord['date'])
  
  let ridesToBeSaved;
  while(pageDates[0] >= latestRecord['date'] || pageDates[1] >= latestRecord['date']){
    console.log(`Processing results for: ${pageDates[0].toLocaleDateString()} - ${pageDates[1].toLocaleDateString()}`);
    ridesToBeSaved = await getRidesFromHomePage(homePage, browser);
    // fs.appendFileSync(FILE_NAME, )+"\n")

    await homePage.click(MORE_BUTTON);
    pageDates = await getHomePageDates(homePage);
  }
}


const getHomePageDates = async (homePage) => {
  await waitForRideContainer(homePage);

  let rideDates = await homePage.$eval(HOME_PAGE_DATES_TITLE, (el) => el.innerText);
  rideDates = String(rideDates).split(' - ');

  return [getDateFromRideDate(rideDates[0]), getDateFromRideDate(rideDates[1])]
}

const getDateFromRideDate = (rideDate) => {
  return new Date(rideDate+' 2024');
}

const getRidesFromHomePage = async (homePage, browser) => {
  let processedRides = [];
  let ridePage = await browser.newPage();

  await waitForRideContainer(homePage);
  const rides = await getRawRidesFromHomePage(homePage);

  for (let ride of rides) {
    if (!ride.includes('Canceled') && !ride.includes('Unfulfilled') ) {
      let rideId = getRideIdByRawRide(ride)
      await goToRideDetailsPageById(ridePage, rideId);

      let routeDetails = await getRideRoute(ridePage, rideId);
      if (!String(routeDetails).includes(ADDRESS_TO_AVOID)) {
        let rideDate = getDateFromRawRide(ride);
        let rideDetails = await getRideDetails(ridePage, rideId)

        processedRides.push(JSON.stringify({ ...rideDetails, date: String(rideDate).trim() }));
      } 
    }
  }

  await ridePage.close();
  return processedRides;
}

const waitForRideContainer = async (homePage) => {
  let shouldRetry = true;
  let tryCount = 0;

  while(tryCount < 3 && shouldRetry){
    try{
      await homePage.waitForSelector(RIDE_CONTAINER, { timeout: 7000 });

      tryCount++;
      shouldRetry = false;
    }
    catch(err){
      console.log('Error while loading ride page.');
      homePage.reload();
    }
  }
}

const getRawRidesFromHomePage = (homePage) => {
  return homePage.evaluate(() => {
    const elements = document.querySelectorAll('._css-cjIpnP');
    return Array.from(elements).map(element => element.innerHTML);
  });
}

const getDateFromRawRide = (rawRide) => {
  return rawRide.split(RIDE_DATE_SEPARATOR)[0].split(`class="_css-eqvdEW"><div><div>`)[1];
}

const goToRideDetailsPageById = async (page, rideId) => {
  let shouldRetry = true;
  let tryCount = 0;

  while(tryCount < 3 && shouldRetry){
    try{
      await page.goto(RIDE_DETAILS_URL_PRESET + "" + rideId, {timeout: 2000});

      tryCount++;
      shouldRetry = false;
    }
    catch(err){
      console.log('Error while loading ride page.');
    }
  }
}

const getRideRoute = async (ridePage, rideId) => {
  let shouldRetry = true;
  let tryCount = 0;

  while(tryCount < 3 && shouldRetry){
    try{
      await ridePage.waitForSelector(ROUTE_DETAILS, { timeout: 4000 })

      tryCount++;
      shouldRetry = false;
    }
    catch(err){
      console.log('Error while loading ride route.');
      await ridePage.reload();
      await goToRideDetailsPageById(ridePage, rideId);
    }
  }

  return await ridePage.$eval(ROUTE_DETAILS, element => element.innerHTML);
}

const getRideIdByRawRide = (rawRide) => {
  return rawRide
    .split(RIDE_DETAILS_URL_PRESET)[1]
    .split(`" class="_css-QGAmV">`)[0];
}

const getRideDetails = async (ridePage, rideId) => {
  let details = { id: rideId };

  let rawDetails = new Array(await ridePage
    .evaluate(() => {
      const elements = document.querySelectorAll('._css-dTqljZ');
      return Array.from(elements).map(element => element.innerHTML);
    })
  ).map(detail => String(detail));

  rawDetails.forEach(detail => {
    details[String(DISTANCE_KEY)] = String(detail.split(KM_PRESET)[0]).trim();
    details[String(PRICE_KEY)] = detail.split(PRICE_PRESET)[1]
  })

  return details;
} 