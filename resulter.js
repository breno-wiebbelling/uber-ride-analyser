// const fs = require('fs')
// const xlsx = require('xlsx');

// let results = fs.readFileSync('results', 'utf-8');

// const getGasolineCost = (rideInfo) => {
//   return (((parseFloat(rideInfo['distance'])/10)*6).toFixed(2))
// };

// results = results.split(`\n`)

// let totalUber = 0;
// let totalCar = 0
// let parse;

// let addresses = '';
// let gasolineCost = 0;

// const ridesByDay = results.reduce((acc, result) => {
//   const parsed = JSON.parse(result);
//   const { date } = parsed;

//   if (!acc[date]) {
//     acc[date] = [];
//   }

//   acc[date].push(parsed);
//   return acc;
// }, {});

// const parkingCosts = {
//   raiaDe: 40,
//   etulio: 50,
//   etulioAlt: 50,
//   ipiranga: 15,
//   independencia: 15
// };

// let rides = []

// results.forEach((result) => {
//   let parsed = JSON.parse(result);
//   let { date, start, destination, price } = parsed;

//   if (!ridesByDay[date]) {
//     ridesByDay[date] = {
//       rides: [],
//       totalUberCost: 0,
//       totalGasolineCost: 0,
//       totalParkingCost: 0
//     };
//   }

//   // Uber cost (raw price)
//   let uberCost = parseFloat(price);

//   // Gasoline cost (assume a mock function getGasolineCost)
//   let gasolineCost = parseFloat(getGasolineCost(parsed));

//   // Parking costs
//   let parkingCost = 0;
//   if (start.includes("raia de") || destination.includes("raia de")) {
//     parkingCost += parkingCosts.raiaDe;
//   }
//   if (start.match(/et[uú]lio/i) || destination.match(/et[uú]lio/i)) {
//     parkingCost += parkingCosts.etulio;
//   }
//   if (start.includes("Ipiranga, 6681") || destination.includes("Ipiranga, 6681")) {
//     parkingCost += parkingCosts.ipiranga;
//   }
//   if (start.includes("Independência, 925") || destination.includes("Independência, 925")) {
//     parkingCost += parkingCosts.independencia;
//   }

//   // Aggregate costs for the day
//   // ridesByDay[date].rides.push(parsed);
  
//   ridesByDay[date].totalUberCost = uberCost;
//   ridesByDay[date].totalGasolineCost = gasolineCost;
//   ridesByDay[date].totalParkingCost = parkingCost;

//   rides.push({
//     day: new Date(parsed['date']),
//     start: parsed['start'],
//     destination: parsed['destination'],
//     distance: parsed['distance'],
//     uberCost: uberCost.toFixed(2),
//     gasolineCost: gasolineCost.toFixed(2),
//     parkingCost: parkingCost.toFixed(2),
//     uberPrice: price
//   });

//   totalCar = totalCar + parkingCost + gasolineCost;
//   totalUber += uberCost;
// });

// totalCar+=parseFloat(1300);
// totalCar+=parseFloat(2000);
// totalCar+=parseFloat(2000);
// totalCar+=parseFloat(1000);


// const worksheetData = rides.map((ride) => ({
//   Day: ride.day,
//   Start: ride.start,
//   Destination: ride.destination,
//   Distance: ride.distance,
//   UberCost: ride.uberCost,
//   GasolineCost: ride.gasolineCost,
//   ParkingCost: ride.parkingCost,
//   UberPrice: ride.uberPrice
// }));

// const worksheet = xlsx.utils.json_to_sheet(worksheetData);
// const workbook = xlsx.utils.book_new();
// xlsx.utils.book_append_sheet(workbook, worksheet, "Rides");

// xlsx.writeFile(workbook, "rides.xlsx");
// console.log("Excel file saved as rides.xlsx");


// console.log(totalUber)
// console.log(totalCar)


const fs = require('fs');
const xlsx = require('xlsx');

// Read data from the file
let results = fs.readFileSync('results', 'utf-8');
results = results.split(`\n`).filter(line => line.trim() !== ''); // Split and remove empty lines

// Parking costs mapping
const parkingCosts = {
  raiaDe: 40,
  etulio: 50,
  ipiranga: 15,
  independencia: 15
};

// Gasoline cost calculation
const getGasolineCost = (rideInfo) => {
  return (((parseFloat(rideInfo['distance']) / 10) * 6).toFixed(2));
};

// Calculate Costs
const calculateCosts = (results) => {
  let rides = [];
  let dailyParkingTracker = {}; // Track parking costs applied for each type per day

  results.forEach((result) => {
    const parsed = JSON.parse(result);
    const { date, start, destination, price, distance } = parsed;

    const uberCost = parseFloat(price);
    const gasolineCost = parseFloat(getGasolineCost(parsed));
    let parkingCost = 0;

    // Initialize daily tracker for the date if not exists
    if (!dailyParkingTracker[date]) {
      dailyParkingTracker[date] = new Set();
    }

    // Check parking costs for specific locations
    if ((start.includes("raia de") || destination.includes("raia de")) && !dailyParkingTracker[date].has('raiaDe')) {
      parkingCost += parkingCosts.raiaDe;
      dailyParkingTracker[date].add('raiaDe');
    }
    if ((start.match(/et[uú]lio/i) || destination.match(/et[uú]lio/i)) && !dailyParkingTracker[date].has('etulio')) {
      parkingCost += parkingCosts.etulio;
      dailyParkingTracker[date].add('etulio');
    }
    if ((start.includes("Ipiranga, 6681") || destination.includes("Ipiranga, 6681")) && !dailyParkingTracker[date].has('ipiranga')) {
      parkingCost += parkingCosts.ipiranga;
      dailyParkingTracker[date].add('ipiranga');
    }
    if ((start.includes("Independência, 925") || destination.includes("Independência, 925")) && !dailyParkingTracker[date].has('independencia')) {
      parkingCost += parkingCosts.independencia;
      dailyParkingTracker[date].add('independencia');
    }

    rides.push({
      day: date,
      start,
      destination,
      distance,
      uberCost: uberCost.toFixed(2),
      gasolineCost: gasolineCost.toFixed(2),
      parkingCost: parkingCost.toFixed(2),
      uberPrice: price
    });
  });

  return rides;
};

// Convert to Excel
const saveToExcel = (rides) => {
  const worksheetData = rides.map((ride) => ({
    Day: new Date(ride.day),
    Start: ride.start,
    Destination: ride.destination,
    Distance: ride.distance,
    UberCost: ride.uberCost,
    GasolineCost: ride.gasolineCost,
    ParkingCost: ride.parkingCost,
    UberPrice: ride.uberPrice
  }));

  const worksheet = xlsx.utils.json_to_sheet(worksheetData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Rides");

  xlsx.writeFile(workbook, "rides.xlsx");
  console.log("Excel file saved as rides.xlsx");
};

// Process and Save
const rides = calculateCosts(results);
saveToExcel(rides);



