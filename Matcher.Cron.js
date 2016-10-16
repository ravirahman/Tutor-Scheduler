function MatcherCron() {
    var scriptProperties = PropertiesService.getScriptProperties();
    var today =new Date().toLocaleDateString();
    var lastRun = scriptProperties.getProperty("LAST_CRON");
    if (lastRun != today) {
        scriptProperties.setProperty("LAST_CRON",today);
        //first we need to load the tutor's schedule
        var tutorSheet = SpreadsheetApp.openById(sheetId);
        var pairingAssignments = tutorSheet.getSheetByName("PairingAssignments");
        var assignments = pairingAssignments.getDataRange();
        var values = assignments.getValues();
        values.shift();
        var errors = []; //list of pair ids that have a problem
        values.forEach(function(row,index){
            if ((row[10] != currentSeason && row[10] != currentSemester) && row[16] !== false) {
                var ending = row[10] == currentSeason ? "season" : "semester";
                //mark it as false
                //cancel it
                var reason = "The " + getDurationName(row[10]) + " has ended. Because academic schedules and extracurricular commitments change with the new " + ending + ","
                    + " we have canceled this tutoring commitment.";
                MatcherCancelCommitment_(row[0],reason,"TutorMilton",false);
            }
            else if ((row[13] == false || row[13] == "") && row[16] !== false) {
                var tutorFindResults = MatcherFind_(row[4],row[5],parseInt(row[6]),row[7],row[8],(function(){try{return JSON.parse(row[9]);}catch(e){return {}}})(),row[10],[]);
                if (tutorFindResults.success == false) {
                    return errors.push(row[0]);
                }

                //go ahead and update row[12]
                pairingAssignments.getRange(index + 2, 13, 1, 1).setValue(JSON.stringify(tutorFindResults.tutors));

                tutorFindResults.tutors.forEach(function(tutor) {
                    MatcherContactTutor_(row[0],tutor.tutorEmail);
                });

            }
        });
        //send an email to tutorMilton with the errors
        return errors;
    }
    else {
        Logger.log("already ran today");
        return "Already ran today";
    }
}
