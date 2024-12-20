const express = require("express");
const Timetable = require("./database");
const GetDiaryEvents = require("./GetDiaryEvents");

const dateFn = require("date-fns");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello to  Animax Webscaper!");
});

//Endpoint that stores the relevant timetable info in a mongoose database
//Collects start and end date from the query parameters
app.get("/timetable", async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  try {
    let diaryEvents = await GetDiaryEvents(startDate, endDate);
    let diaryEventInserted = 0;
    let diaryEventUpdated = 0;
    let diaryEventErrored = 0;

    //Inserting the data into the database
    diaryEvents.forEach(async (element) => {
      //Check if the innateId already exists in the database
      try {
        let existingEvent = await Timetable.findOne({
          innateId: element.innateId,
        });
        if (existingEvent) {
          await UpdateEvent(element);
          diaryEventUpdated++;
        } else {
          await InsertEvent(element);
          diaryEventInserted++;
        }
      } catch (err) {
        console.log(err);
        diaryEventErrored++;
      }
    });

    const finalResult = `Events added to DB: Inserted: ${diaryEventInserted}, Updated: ${diaryEventUpdated}, Errored: ${diaryEventErrored}`;

    console.log(finalResult);

    res.json({
      message: finalResult,
      events: diaryEvents,
    });
  } catch (err) {
    res.send(err);
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

const InsertEvent = async (element) => {
  try {
    let newEvent = new Timetable(PreProcessDiaryElement(element));
    await newEvent.save();
  } catch (err) {
    throw err;
  }
};

const UpdateEvent = async (element) => {
  try {
    await Timetable.updateOne(
      { innateId: element.innateId },
      PreProcessDiaryElement(element)
    );
  } catch (err) {
    throw err;
  }
};

const PreProcessDiaryElement = (element) => {
  const startDateTime = element.startDate;
  //"2024/12/16 10:15:00 AM"
  const parsedDateTime = dateFn.parse(
    startDateTime,
    "yyyy/MM/dd hh:mm:ss a",
    new Date()
  );

  const startDate = parsedDateTime;
  const startTime = parsedDateTime.getTime();

  return {
    innateId: element.id,
    title: element.title,
    startDate: startDate,
    startTime: startTime,
    CourseCode: element.CourseCode,
    FacultyName: element.FacultyName,
    Room: element.RoomNo,
    AttndColor: element.AttndColor,
  };
};
