var orgName = ""; //the name of the organization -- e.g. Milton Academy
var orgAccountName = ""; //the name of the account used to sign in -- e.g. Milton Google
var groupName = ""; //the name of the organizational group running this application -- e.g. TutorMilton
var appName = ""; //the name of the application -- e.g. TutorMilton Scheduler
var calendarId = ""; //the id of the Google Calendar to store the tutoring appointments
var secretKey = ""; //a random secret key to verify user emails on each request. Without it, users can impersonate other users.
var scriptId = ""; //the id of the script -- used to generate the runtime url (everything between the "/d/" and "/edit?" in the RUNTIME url")
var domain = "milton.edu"; //the Google Apps domain name e.g. school.edu
var sheetId = ""; //the google drive sheet id acting as database
var accentColor = ""; //accent color to go against the black background

var baseAppUrl = "https://script.google.com/a/macros/" + domain + "/s/" + scriptId + "/exec";
var signInLink = "https://accounts.google.com/AccountChooser?service=wise&passive=1209600&continue=https%3A%2F%2Fscript.google.com%2Fmacros%2Fs%2F" + scriptId + "%2Fexec&followup=https%3A%2F%2Fscript.google.com%2Fmacros%2Fs%2F" + scriptId + "%2Fexec#identifier";

function getFirstName(userEmail) {
    //returns the user's first name, given their email address
}

function getLastName(userEmail) {
    //returns the user's last name, given their email address
}

function isTeacher(userEmail) {
    //determine whether the user is an administrator, given their email address
    //return true if the user is a teacher, otherwise return false.
}

var schedule = {
    //key format is dMMDDYY
    // MM is the 2 digit month code (01 through 12)
    // DD is the 2 digit day code (01 through 31)
    // YY is the 2 digit year code (00 through 99)
    //value format is "DAY" where
    // DAY is the 3 letter day abbreviation for the schedule to use on this calendar day (either "SUN", "MON", "TUE", "WED", "THU", "FRI", or "SAT")
    //examples:
    //d091115: "FRI", //this means, on 9/11/15, use the Friday schedule
    //d101315: "MON", //this means, on 10/13/15 (following Columbus day), use the Tuesday, even though it's actually a calendar Monday.
};

var timeOfPeriods = {
    //replace examples below with actual period names and start/end times
    p1: {
        name: "Period 1: 8:20AM - 9:10AM",
        title: "Period 1",
        startTime: "8:20",
        endTime: "9:10",
        schedule: "semester"
    },
    p2: {
        name: "Period 2: 9:15AM - 10:00AM",
        title: "Period 2",
        startTime: "9:15",
        endTime: "10:00",
        schedule: "semester"
    },
    p3: {
        name: "Period 3: 10:15AM - 11:00AM",
        title: "Period 3",
        startTime: "10:15",
        endTime: "11:00",
        schedule: "semester"
    },
    pA: {
        name: "After School A: 3:30PM - 4:15PM",
        title: "After School A",
        startTime: "15:30",
        endTime: "16:15",
        schedule: "season"
    },
    pB: {
        name: "After School B: 4:15PM - 5:00PM",
        title: "After School B",
        startTime: "16:15",
        endTime: "17:00",
        schedule: "season"
    },
    pS: {
        name: "Study Hall: 7:00PM - 8:00PM",
        title: "Study Hall",
        startTime: "19:00",
        endTime: "20:00",
        schedule: "semester"
    }
};
function getStartDate(duration) { //note that these dates are inclusive
    //replace examples below with actual dates
    switch(duration) {
        case "FALL":
            return new Date("September 10, 2015"); //start of the fall season
        case "WINTER":
            return new Date("November 17, 2015");
        case "SPRING":
            return new Date("March 1, 2016");
        case "SEM1":
            return new Date("September 10, 2015");
        case "SEM2":
            return new Date("February 1, 2016");
        case "FULL":
            return new Date("September 10, 2015");
    }
}
function getEndDate(duration) { //note that these dates are inclusive
    //replace examples below with actual dates
    switch(duration) {
        case "FALL":
            return new Date("November 14, 2015");
        case "WINTER":
            return new Date("February 29, 2016");
        case "SPRING":
            return new Date("June 8, 2016");
        case "SEM1":
            return new Date("January  31, 2016");
        case "SEM2":
            return new Date("June 8, 2016");
        case "FULL":
            return new Date("June 8, 2016");
    }
}