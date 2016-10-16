//a function to find the top three tutors based on these student-provided parameters
function MatcherFind_(sSubject,sClass,sLevel,sCourseName,sTeacher,availablePeriods,duration,contactedTutors) {
    //first get the tutorList. produce a list that subtracts out occupiedSlots from availableSlots
    var spreadsheet = SpreadsheetApp.openById(sheetId);
    var tutorList = spreadsheet.getSheetByName("TutorList");
    var tutorRange = tutorList.getDataRange();
    var tutorRangeArray = tutorRange.getValues();
    var tutorAvailabilities = {};

    function getObjSize(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    }
    tutorRangeArray.shift();//remove the title row

    tutorRangeArray.forEach(function(tutor){
        var availability, occupied;
        try {
            availability= JSON.parse(tutor[2]);
        }
        catch(e) {
            availability = {};

        }
        try {
            occupied = JSON.parse(tutor[3]);
        }
        catch(e) {
            occupied = {};
        }

        if (!availability.hasOwnProperty(duration) || getObjSize(availability[duration]) < 1 || contactedTutors.indexOf(tutor[0]) !== -1) { //this tutor isn't available during the duration the student specified, or the tutor has already been contacted

            return;
        }
        if (occupied.hasOwnProperty(duration)) {
            for (var period in occupied[duration]) {
                if (occupied[duration].hasOwnProperty(period)) {
                    delete availability[duration][period];
                }
            }
        }

        if (getObjSize(availability[duration]) > 0) {
            tutorAvailabilities[tutor[0]] = availability[duration];
        }
    });
    if (getObjSize(tutorAvailabilities) < 1) {
        return {
            success: false,
            message: "No tutors are available during the specified periods for the specified duration. Please try again by increasing your availability or changing the duration."
        };
    }

    //delete all tutors (From the temp copy) where available periods don't align. A period aligns only if both have keys set
    for (var tutor in tutorAvailabilities) {
        if (tutorAvailabilities.hasOwnProperty(tutor)) {
            var tutorAvailability = tutorAvailabilities[tutor];
            var foundAMatchingPeriod = false;
            for (var period in tutorAvailability) {

                if (tutorAvailability.hasOwnProperty(period)) {
                    if (availablePeriods.hasOwnProperty(period)) {
                        if (availablePeriods[period] == "offCampus") {
                            tutorAvailability[period] = "offCampus"; //force the location to be off campus if the student isn't on campus. If the student is on campus, then keep the tutor's availability as is
                        }
                    }
                    else {
                        delete tutorAvailability[period];
                    }
                }
            }

            if (getObjSize(tutorAvailability) < 1) {
                delete tutorAvailabilities[tutor];
            }
        }
    }

    //if (count < 1) { return an error}
    if (getObjSize(tutorAvailabilities) < 1) {
        return {
            success: false,
            message: "No tutors are available during the specified periods for the specified duration. Please try again by increasing your availability or changing the duration."
        };
    }

    //get the tutorClassHistory
    var tutorClassHistorySheet = spreadsheet.getSheetByName("TutorClassHistory");
    var tutorClassHistoryRange = tutorClassHistorySheet.getDataRange();
    var tutorClassHistoryArray = tutorClassHistoryRange.getValues();

    tutorClassHistoryArray.shift(); //remove the first (title) row


    //convert tutorClassHistory from array to object
    var tutorClassHistoryObject = {};

    tutorClassHistoryArray.forEach(function(tutorClassHistoryRow){
        if (tutorClassHistoryRow[8] === true) { //make sure that the teacher approved the student for this course
            var tutorEmail = tutorClassHistoryRow[0];
            if (!tutorClassHistoryObject.hasOwnProperty(tutorEmail)) {
                tutorClassHistoryObject[tutorEmail] = {};
            }
            var tchoT = tutorClassHistoryObject[tutorEmail];

            var tsubject = tutorClassHistoryRow[1];
            if (!tchoT.hasOwnProperty(tsubject)) {
                tchoT[tsubject] = {};
            }
            var tchoTS = tchoT[tsubject];

            var tclass = tutorClassHistoryRow[2];
            if (!tchoTS.hasOwnProperty(tclass)) {
                tchoTS[tclass] = {};
            }
            var tchoTSC = tchoTS[tclass];

            var tlevel = tutorClassHistoryRow[3];
            if (!tchoTSC.hasOwnProperty(tlevel)) {
                tchoTSC[tlevel] = {};
            }
            var tchoTSCL = tchoTSC[tlevel];

            var tcourse = tutorClassHistoryRow[4];


            tchoTSCL[tcourse] = {
                teacher: tutorClassHistoryRow[5],
                completionYear: tutorClassHistoryRow[6]
            }
        }
    });

    //delete all tutors (from the temp copy) where
    //not on the tempTutorList, OR
    //subjects are different, OR
    //classes are different, OR
    //level is less than studentRequestedLevel (the level param)

    for (var tutorEmail in tutorAvailabilities) {
        if (tutorAvailabilities.hasOwnProperty(tutorEmail)) {
            //see if the tutor is in tutorClassHistoryObject
            if (!tutorClassHistoryObject.hasOwnProperty(tutorEmail) || !tutorClassHistoryObject[tutorEmail].hasOwnProperty(sSubject) || !tutorClassHistoryObject[tutorEmail][sSubject].hasOwnProperty(sClass) ) {
                delete tutorAvailabilities[tutorEmail];
                continue;
            }
            //ok if we made it this far then the the tutor has taken a class in that subject. Now let's check levels
            var qualified = false;
            for (var level in tutorClassHistoryObject[tutorEmail][sSubject][sClass]) {
                if (level >= sLevel) {
                    qualified = true;
                    break;
                }
            }
            if (!qualified) {
                delete  tutorAvailabilities[tutorEmail];
            }
        }
    }

    //if (count < 1) {return an error}
    if (getObjSize(tutorAvailabilities) < 1) {
        return {
            success: false,
            message: "No qualified tutors are available during the specified periods for the specified duration. Please try again by increasing your availability or changing the duration."
        };
    }

    //ok, all tutors left in tutorAvailabilities at this point are qualified to tutor. Now select the "best" tutor. Simply sort the list by the first available
    var sortedTutorList = [];
    var d = new Date();
    var today = d.getDay();
    var tomorrow = (today + 1) % 7;
    /*if (d.getHours() < 8) { //if we're between midnight and 8 am, consider
     tomorrow = today;
     }*/
    for (var tutorEmail in tutorAvailabilities) {
        if (tutorAvailabilities.hasOwnProperty(tutorEmail)) {
            sortedTutorList.push({
                tutorEmail: tutorEmail,
                periods: tutorAvailabilities[tutorEmail]
            });
        }
    }

    sortedTutorList.forEach(function(atutor) {
        var adays = [];
        for (var period in atutor.periods) {
            if (atutor.periods.hasOwnProperty(period)) {

                var pday = period.substring(0,3);
                switch(pday) {
                    case "SUN":
                        adays.push({wait: modu((0 - tomorrow), 7), period: period, location: atutor.periods[period]});
                        break;
                    case "MON":
                        adays.push({wait: modu((1 - tomorrow), 7), period: period, location: atutor.periods[period]});
                        break;
                    case "TUE":
                        adays.push({wait: modu((2 - tomorrow), 7), period: period, location: atutor.periods[period]});
                        break;
                    case "WED":
                        adays.push({wait: modu((3 - tomorrow), 7), period: period, location: atutor.periods[period]});
                        break;
                    case "THU":
                        adays.push({wait: modu((4 - tomorrow), 7), period: period, location: atutor.periods[period]});
                        break;
                    case "FRI":
                        adays.push({wait: modu((5 - tomorrow), 7), period: period, location: atutor.periods[period]});
                        break;
                    case "SAT":
                        adays.push({wait: modu((6 - tomorrow), 7), period: period, location: atutor.periods[period]});
                }
            }
        }
        delete atutor.periods;
        adays.sort(function(c,d) {
            return c.wait - d.wait;
        });
        atutor.sortedPeriods = adays;

    });

    sortedTutorList.sort(function(a,b){
        return a.sortedPeriods[0].wait - b.sortedPeriods[0].wait; //periods are already sorted by who's available first. we want the smallest number first (tutor who can tutor the soonest). For example, if a is 0 and b is 1, then 0-1 = -1, which means that a would come first (according to mdn)
    });
    //qualified tutors are sorted by who's available first. That's good enough for now. Need to have a meeting to figure out what method would be best.

    return {
        success: true,
        tutors: sortedTutorList
    };
}
function MatcherFindTest() {
    Logger.log(MatcherFind_("Math","HS Math",2.1,"Math 2: Geometry (Honors)","test_teacher@milton.edu",{"WEDp7":"onCampus","WEDp8":"onCampus","THUp1":"onCampus","THUp8":"onCampus","FRIp8":"onCampus"},"SEM2",[]));
}