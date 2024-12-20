const { parse, format } = require("date-fns");

const timeString = "2024/12/16 10:15:00 AM";
const parsedDate = parse(timeString, "yyyy/MM/dd hh:mm:ss a", new Date());

console.log(format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss"));
// Output: 2024-12-16T10:15:00+00:00
