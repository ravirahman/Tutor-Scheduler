function getPeriodStartTime(period) {
  return timeOfPeriods[period].startTime;
}
function getPeriodEndTime(period) {
  return timeOfPeriods[period].endTime;
}
var currentSeason = (function() {
  var today = new Date().getTime();
  var fallEnd = getEndDate("FALL").getTime();
  var winterEnd = getEndDate("WINTER").getTime();
  if (today > winterEnd) {
    return "SPRING";
  }
  if (today > fallEnd) {
    return "WINTER";
  }
  return "FALL";
})();
  
var currentSemester = (function() {
  var today = new Date().getTime();
  var sem1End = getEndDate("SEM1").getTime();
  if (today > sem1End) {
    return "SEM2";
  }
  return "SEM1";
})();

function getDurationName(duration) {
  switch(duration) {
    case "FULL":
      return "Whole School Year";
      break;
    case "SEM1":
      return "First Semester";
      break;
    case "SEM2":
      return "Second Semester";
      break;
    case "FALL":
    case "WINTER":
    case "SPRING":
      return duration.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) + " Season";
      break;
  }
}

function getPeriodName(period) {
  return timeOfPeriods[period].name;
}