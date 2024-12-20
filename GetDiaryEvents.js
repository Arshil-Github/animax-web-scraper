const puppeteer = require("puppeteer");
require("dotenv").config();

async function GetDiaryEvents(startDate, endDate) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://s.amizone.net/");

  // Fill in the form fields
  await page.type('input[name="_UserName"]', `${process.env.AMIZONE_USERNAME}`);
  await page.type('input[name="_Password"]', `${process.env.AMIZONE_PASSWORD}`);

  // Submit the form
  await page.click(".login100-form-btn"); // Replace with the actual button ID

  // Wait for navigation or response
  await page.waitForNavigation();

  const cookies = await browser.cookies();

  const diaryEvent = await fetchDiaryEvents(
    CookieToString(cookies),
    startDate,
    endDate
  );

  await browser.close();

  return AmizoneDataPreprocessor(diaryEvent);
}

function CookieToString(cookies) {
  const cookieString = cookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  return cookieString;
}

async function fetchDiaryEvents(cookieString, startDate, endDate) {
  const url = `https://s.amizone.net/Calendar/home/GetDiaryEvents?start=${startDate}&end=${endDate}`;

  const headers = {
    Accept: "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Referer: "https://s.amizone.net/Home",
    "Sec-CH-UA": '"Brave";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    "Sec-CH-UA-Mobile": "?0",
    "Sec-CH-UA-Platform": '"Windows"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "Sec-GPC": "1",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
    Cookie: cookieString,
  };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching diary events", error);
    return error;
  }
}

async function AmizoneDataPreprocessor(data) {
  //Get only sType = "C" events
  const filteredData = data.filter((event) => event.sType === "C");

  //Get only title, startDateTime, endDate,  CourseCode, FacultyName, Room, AttndColor
  const processedData = filteredData.map((event) => {
    return {
      innateId: event.id,
      title: event.title,
      startDate: event.start,
      endDate: event.end,
      CourseCode: event.CourseCode,
      FacultyName: event.FacultyName,
      Room: event.RoomNo,
      AttndColor: event.AttndColor,
    };
  });

  return processedData;
}

module.exports = GetDiaryEvents;
