let firebaseConfig = {
  apiKey: "AIzaSyBZm22gCHksxDr7QAGpiykmTNx6jaAtK3Q",
  authDomain: "testproject-3924d.firebaseapp.com",
  databaseURL: "https://testproject-3924d.firebaseio.com",
  projectId: "testproject-3924d",
  storageBucket: "testproject-3924d.appspot.com",
  messagingSenderId: "338557115530"
};
firebase.initializeApp(firebaseConfig);

let database = firebase.database();

$("#randomTrain").click((e) => {
  e.preventDefault()
  dbSet();
})
$("#removeAllTrains").click((e) => {
  e.preventDefault();
  database.ref('trainSchedule').set(null);
  $("#tableBody").empty();
})

let interval = setInterval(function() {
  database.ref('trainSchedule').once("value", (ss) => {
    ss.forEach((x) => {
      if ('name' in x.val()) {
        database.ref("trainSchedule/"+x.key+"/minutesAway").set(moment(x.val().nextArrivalFormatted, 'HH:mm:ss').diff(moment(), 'm') + 1)
      } else {
        database.ref('trainSchedule/'+x.key).set(null);
      }
    })
  })
}, 1000)

database.ref('trainSchedule').on('value', (ss) => {
  $("#tableBody").empty();
  ss.forEach((x) => {
    if (moment(x.val().nextArrivalFormatted, "HH:mm:ss").isBefore(moment())) {
      database.ref('trainSchedule').child(x.key).set(null) && dbSet();
    }
    $("#tableBody").prepend(`
      <tr>
        <td scope="row">${x.val().name}</td>
        <td>${x.val().destination}</td>
        <td>${x.val().frequency}</td>
        <td>${x.val().nextArrivalFormatted}</td>
        <td>${x.val().minutesAway}</td>
      </tr>
    `)
  })
})

class Train {
  constructor(names = trainNamer(), m = moment(), trainTimesArr = [], timesPerDay, trainFrequency, nextArrival, minutesAway, nextArrivalFormatted) {
    while (true) {
      trainFrequency = (Math.floor(Math.random() * 36) + 1) * 5;
      if ((24 * 60)%trainFrequency === 0) {
        timesPerDay = (24 * 60)/trainFrequency;
        break;
      }
    }
    for (var i = 0; i <= timesPerDay; i++) {
      trainTimesArr.push(moment('00:00', 'HH:mm').minutes(trainFrequency * i))
    }
    trainTimesArr.map((x, i) => {
      if (x.isBefore(m)) {
        nextArrival = trainTimesArr[i+1];
        minutesAway = nextArrival.diff(m, 'm')
      }
    })
    nextArrivalFormatted = nextArrival.format('HH:mm:ss')
    return {names, trainFrequency, nextArrival, nextArrivalFormatted, minutesAway}
  }
}
function dbSet() {
  mdb = database.ref('trainSchedule');
  nt = new Train;
  obj = {
    name: nt.names.name,
    destination: nt.names.destination,
    frequency: nt.trainFrequency,
    nextArrivalFormatted: nt.nextArrivalFormatted,
    minutesAway: nt.minutesAway + 1
  }
  mdb.push(obj)

}

function trainNamer() {
  let trainPossibilities1 = ["Atlanta", "Chicken", "Magic", "Polar", "Falken", "JoCo", "Crazy", "Oregon", "Horse-Drawn", "California", "Trainbot 2000"];
  let trainPossibilities2 = ["Express", "Caravan", "Bus", "Schoolbus", "Train", "Carriage", "Mag-Lev"];
  let t1 = trainPossibilities1[Math.floor(Math.random() * trainPossibilities1.length)], t2 = trainPossibilities2[Math.floor(Math.random() * trainPossibilities2.length)];
  let destinationPossibilities1 = ["Old", "The", "Big", "Greasy", "New", "West", "North", "South", "East", "Prison", "Deep Space Habitat"];
  let destinationPossibilities2 = ["Jersey", "York", "Amsterdam", "Mexico", "Canada", "Zealand", "R'lyeh", "Zion", "Hell", "Austin", "Dog Island", "Atlantis", "Orion"];
  let d1 = destinationPossibilities1[Math.floor(Math.random() * destinationPossibilities1.length)], d2 = destinationPossibilities2[Math.floor(Math.random() * destinationPossibilities2.length)];
  return {name:`${t1} ${t2}`, destination:`${d1} ${d2}`}
}
