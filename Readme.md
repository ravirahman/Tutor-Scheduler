# Tutor Scheduler

This app automatically pairs students with tutors.
It runs on the Google Apps Script platform,
and uses a Google Sheet for a database.

I originally designed it for the [Milton Academy](http://www.milton.edu) tutoring program, TutorMilton.

## How it works
1. Tutors are added to the TutorList in the database
1. Tutors request approval in a subject from their teachers
1. Tutors submit when they are available
1. Students submit a request for tutoring, specifying when they are available
    1. The system will contact all available and qualified (approved) tutors
    1. The first tutor to accept is paired with that student.
        1. The system will then exchange contact information and create Google Calendar events.

## Setup
- Create a new Google Apps Script (GAS) Project
    - Make sure to enable Calendar as an Advanced Google Service
- Create a Google Calendar to store all tutoring appointments
- Upload `Database-Template.xlsx` as a Google Sheet
- For each `.js` and `.html` file in this project, create a file in the GAS project with the same name
    - Copy and paste the content from this project to the newly created file
- In the GAS project, Modify `Config.js`to configure your installation
- Deploy the GAS project as a web app
- Configure a time-based trigger to run the MatcherCron function daily

_Questions? [Contact me](ravi@ravirahman.com), and we can discuss a custom quote for setup and maintenance._

## License
MIT