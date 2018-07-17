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
$("#jumboClock").text(`${moment().format('HH:mm:ss')}`)
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
  $("#jumboClock").text(`${moment().format('HH:mm:ss')}`)
  database.ref('trainSchedule').once("value", (ss) => {
    ss.forEach((x) => {
      if ('name' in x.val() || x.val().minutesAway < 0) {
        database.ref("trainSchedule/"+x.key+"/minutesAway").set(moment(x.val().nextArrivalFormatted, 'HH:mm:ss').diff(moment(), 'm') + 1)
      } else {
        database.ref('trainSchedule/'+x.key).set(null);
      }
    })
  })
}, 1000)

database.ref('trainSchedule').on('value', (ss) => {
  if ($('.modal.show').length > 0) {
    $('.modal.show').removeClass('fade').modal('hide');
  }
  $("#tableBody").empty();
  let i = 0;
  ss.forEach((x) => {
    i++;
    $("#tableBody").prepend(`
      <tr>
        <td scope="row">${x.val().name}</td>
        <td>${x.val().destination}</td>
        <td>${x.val().frequency}</td>
        <td id="fbArr${i}">${x.val().nextArrivalFormatted} <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#fbArr${i}Modal"></td>
        <td class="minsAway">${x.val().minutesAway}</td>
      </tr>
    `)
    $(`#fbArr${i}`).append(`
      <div class="modal fade" id="fbArr${i}Modal" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <p class="modal-title" id="fbArr${i}ModalLabel"><strong>${x.val().name}</strong> to <strong>${x.val().destination}</strong> Full Schedule</p>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            ${x.val().trainTimes.join("<br>")}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
      `)
    if (x.val().nextArrivalFormatted == moment().format('HH:mm')+':00') {
      database.ref('trainSchedule').child(x.key).set(null);
    }
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
        if (nextArrival.format('HH:mm:ss') == "00:00:00") {
          nextArrival = moment('23:59:59', "HH:mm:ss")
        }
        minutesAway = nextArrival.diff(m, 'm')
      }
    })
    nextArrivalFormatted = nextArrival.format('HH:mm:ss')
    trainTimesArr.forEach((x, i, tarr) => {
      tarr[i] = x.format('HH:mm:ss');
      if (tarr[i] == nextArrivalFormatted) {
        tarr[i] = `<strong>${nextArrivalFormatted}</strong> -- Next arrival`
      }
    })
    return {names, trainTimesArr, trainFrequency, nextArrival, nextArrivalFormatted, minutesAway}
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
    minutesAway: nt.minutesAway + 1,
    trainTimes: nt.trainTimesArr
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
