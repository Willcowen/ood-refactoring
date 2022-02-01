/* 
### Uncommunicative Names
### Inconsistent Names
### Duplicated Code
### Long Method
### Large Class
### Complex Conditional
### Comments
### Magic Numbers 
*/

const maxCapacity = 100;
const cleaningTimeMins = 20;

//string errors
const exceededMaxCapacity = "Exceeded max capacity";
const screenAlreadyExists = "Screen already exists";
const filmAlreadyExists = "Film already exists";
const invalidRating = "Invalid rating";
const invalidDuration = "Invalid duration";
const invalidStartTime = "Invalid start time";
const invalidFilm = "Invalid film";
const invalidScreen = "Invalid screen";
const invalidEndTime = "Invalid end time";
const timeUnavailable = "Time unavailable";

class Cinema {
  //### Large Class

  constructor() {
    this.films = [];
    this.screens = [];
  }

  addNewScreen(screenName, capacity) {
    if (capacity > maxCapacity) {
      return exceededMaxCapacity;
    }

    //Check the screen doesn't already exist
    let screen = null;
    for (let i = 0; i < this.screens.length; i++) {
      if (this.screens[i].name === screenName) {
        screen = this.screens[i];
      }
    }

    if (screen != null) {
      return screenAlreadyExists;
    }

    this.screens.push({
      name: screenName,
      capacity: capacity,
      showings: [],
    });
  }

  checkRating(rating) {
    if (
      rating != "U" &&
      rating != "PG" &&
      rating != "12" &&
      rating != "15" &&
      rating != "18"
    ) {
      //### Complex Conditional
      return true;
    }
  }

  checkMovieExists(movieName){
    let movie = null
    for (let i = 0; i < this.films.length; i++) {
      if (this.films[i].name == movieName) {
        movie = this.films[i];
      }
    }
    return movie
  }

  addNewMovie(movieName, rating, duration) {
    //Check the film doesn't already exist ### Duplicated Code
    let movie = this.checkMovieExists(movieName)
    if (movie != null) {
      return filmAlreadyExists;
    }

    //Check the rating is valid
    if (this.checkRating(rating)) {
      return invalidRating;
    }

    //Check duration
    const result = /^(\d?\d):(\d\d)$/.exec(duration);
    if (result == null) {
      return invalidDuration;
    }

    const hours = parseInt(result[1]);
    const mins = parseInt(result[2]);
    if (hours <= 0 || mins > 60) {
      return invalidDuration;
    }

    this.films.push({ name: movieName, rating: rating, duration: duration });
  }

  //Add a showing for a specific film to a screen at the provided start time
  addNewShowing(movieName, screenName, startTime) {
    let result = /^(\d?\d):(\d\d)$/.exec(startTime);
    if (result == null) {
      return invalidStartTime;
    }

    const intendedStartTimeHours = parseInt(result[1]);
    const intendedStartTimeMinutes = parseInt(result[2]);
    if (intendedStartTimeHours <= 0 || intendedStartTimeMinutes > 60) {
      return invalidStartTime;
    }

    let film = this.checkMovieExists(movieName)
    // Find the film by name 

    if (film === null) {
      return invalidFilm;
    }

    //From duration, work out intended end time
    //if end time is over midnight, it's an error
    //Check duration
    result = /^(\d?\d):(\d\d)$/.exec(film.duration);
    if (result == null) {
      return invalidDuration;
    }

    const durationHours = parseInt(result[1]);
    const durationMins = parseInt(result[2]);

    //Add the running time to the duration
    let intendedEndTimeHours = intendedStartTimeHours + durationHours;

    //It takes 20 minutes to clean the screen so add on 20 minutes to the duration
    //when working out the end time
    let intendedEndTimeMinutes =
      intendedStartTimeMinutes + durationMins + cleaningTimeMins;
    if (intendedEndTimeMinutes >= 60) {
      intendedEndTimeHours += Math.floor(intendedEndTimeMinutes / 60);
      intendedEndTimeMinutes = intendedEndTimeMinutes % 60;
    }

    if (intendedEndTimeHours >= 24) {
      return invalidStartTime;
    }

    //Find the screen by name
    let theatre = null;
    for (let i = 0; i < this.screens.length; i++) {
      if (this.screens[i].name == screenName) {
        theatre = this.screens[i];
      }
    }

    if (theatre === null) {
      return invalidScreen;
    }

    //Go through all existing showings for this film and make
    //sure the start time does not overlap  ### Long Method - Perhaps refactor a new method using startTimes.
    let error = false;
    for (let i = 0; i < theatre.showings.length; i++) {
      //Get the start time in hours and minutes
      const startTime = theatre.showings[i].startTime;
      result = /^(\d?\d):(\d\d)$/.exec(startTime);
      if (result == null) {
        return invalidStartTime;
      }

      const startTimeHours = parseInt(result[1]);
      const startTimeMins = parseInt(result[2]);
      if (startTimeHours <= 0 || startTimeMins > 60) {
        return invalidStartTime;
      }

      //Get the end time in hours and minutes
      const endTime = theatre.showings[i].endTime;
      result = /^(\d?\d):(\d\d)$/.exec(endTime);
      if (result == null) {
        return invalidEndTime;
      }

      const endTimeHours = parseInt(result[1]);
      const endTimeMins = parseInt(result[2]);
      if (endTimeHours <= 0 || endTimeMins > 60) {
        return invalidEndTime;
      }

      //if intended start time is between start and end
      const dateOne = new Date();
      dateOne.setMilliseconds(0);
      dateOne.setSeconds(0);
      dateOne.setMinutes(intendedStartTimeMinutes);
      dateOne.setHours(intendedStartTimeHours);

      const dateTwo = new Date();
      dateTwo.setMilliseconds(0);
      dateTwo.setSeconds(0);
      dateTwo.setMinutes(intendedEndTimeMinutes);
      dateTwo.setHours(intendedEndTimeHours);

      const dateThree = new Date();
      dateThree.setMilliseconds(0);
      dateThree.setSeconds(0);
      dateThree.setMinutes(startTimeMins);
      dateThree.setHours(startTimeHours);

      const dateFour = new Date();
      dateFour.setMilliseconds(0);
      dateFour.setSeconds(0);
      dateFour.setMinutes(endTimeMins);
      dateFour.setHours(endTimeHours);

      if (
        (dateOne > dateThree && dateOne < dateFour) ||
        (dateTwo > dateThree && dateTwo < dateFour) ||
        (dateOne < dateThree && dateTwo > dateFour)
      ) {
        error = true;
        break;
      }
    }

    if (error) {
      return timeUnavailable;
    }

    //Add the new start time and end time to the showing
    theatre.showings.push({
      film: film,
      startTime: startTime,
      endTime: intendedEndTimeHours + ":" + intendedEndTimeMinutes,
    });
  }

  allMovieShowings() {
    let showings = {};
    for (let i = 0; i < this.screens.length; i++) {
      const screen = this.screens[i];
      for (let j = 0; j < screen.showings.length; j++) {
        const showing = screen.showings[j];
        if (!showings[showing.film.name]) {
          showings[showing.film.name] = [];
        }
        showings[showing.film.name].push(
          `${screen.name} ${showing.film.name} (${showing.film.rating}) ${showing.startTime} - ${showing.endTime}`
        );
      }
    }

    return showings;
  }
}

module.exports = Cinema;
