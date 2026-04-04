const credentialsPath = path.join(process.cwd(), "credentials.json");

if (process.env.GOOGLE_CREDENTIALS) {
  fs.writeFileSync(credentialsPath, process.env.GOOGLE_CREDENTIALS);
}

const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const https = require("https");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const BUSINESS_NAME = process.env.BUSINESS_NAME || "Statewide Cleaning";
const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || "cmejia@statewidecleaning.com";
const WEBSITE_URL = process.env.WEBSITE_URL || "https://statewidecleaning.com";


function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10;
}

function isValidZip(zip) {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function getDistanceMiles(lat1, lng1, lat2, lng2) {
  const earthRadiusMiles = 3958.8;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
}

function extractCoordinatesFromDescription(description = "") {
  const match = description.match(/Coordinates:\s*([-\d.]+)\s*,\s*([-\d.]+)/i);

  if (!match) {
    return null;
  }

  return {
    lat: parseFloat(match[1]),
    lng: parseFloat(match[2]),
  };
}

async function updateEventDescriptionWithCoordinates(calendar, event, coords) {
  try {
    const currentDescription = event.description || "";
    const coordinatesBlock = `Coordinates:\n${coords.lat}, ${coords.lng}`;

    let updatedDescription = currentDescription.trim();

    if (/Coordinates:\s*[-\d.]+\s*,\s*[-\d.]+/i.test(updatedDescription)) {
      updatedDescription = updatedDescription.replace(
        /Coordinates:\s*[-\d.]+\s*,\s*[-\d.]+/i,
        coordinatesBlock
      );
    } else if (updatedDescription) {
      updatedDescription = `${updatedDescription}\n\n${coordinatesBlock}`;
    } else {
      updatedDescription = coordinatesBlock;
    }

    await calendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: event.id,
      requestBody: {
        description: updatedDescription,
      },
    });

    console.log("Saved coordinates to calendar event:", event.summary || event.id);
  } catch (error) {
    console.error(
      "Failed to save coordinates back to calendar event:",
      event.summary || event.id,
      error.message
    );
  }
}

async function getEventCoordinates(calendar, event) {
  const fromDescription = extractCoordinatesFromDescription(event.description || "");
  if (fromDescription) {
    return fromDescription;
  }

  const location = (event.location || "").trim();
  if (!location) {
    return null;
  }

  try {
    const geo = await geocodeAddress(location);

    const coords = {
      lat: geo.lat,
      lng: geo.lng,
    };

    await updateEventDescriptionWithCoordinates(calendar, event, coords);

    return coords;
  } catch (error) {
    console.error("Failed to geocode event location:", location, error.message);
    return null;
  }
}

function getTimeLabel(dateTimeString) {
  if (!dateTimeString) return "Flexible / Best available";

  const date = new Date(dateTimeString);
  const hour = date.getHours();

  if (hour === 8) return "8:00 AM – 10:00 AM";
  if (hour === 10) return "10:00 AM – 12:00 PM";
  if (hour === 12) return "12:00 PM – 2:00 PM";
  if (hour === 14) return "2:00 PM – 4:00 PM";

  return "Flexible / Best available";
}

const SCHEDULE_TIME_WINDOWS = [
  "8:00 AM – 10:00 AM",
  "10:00 AM – 12:00 PM",
  "12:00 PM – 2:00 PM",
  "2:00 PM – 4:00 PM",
];

function getNeighborSlots(windowLabel) {
  const index = SCHEDULE_TIME_WINDOWS.indexOf(windowLabel);

  if (index === -1) return [];

  const neighbors = [];

  if (index > 0) {
    neighbors.push(SCHEDULE_TIME_WINDOWS[index - 1]);
  }

  if (index < SCHEDULE_TIME_WINDOWS.length - 1) {
    neighbors.push(SCHEDULE_TIME_WINDOWS[index + 1]);
  }

  return neighbors;
}

function getDateStringFromDateTime(dateTimeString) {
  if (!dateTimeString) return "";
  return dateTimeString.slice(0, 10);
}

const MAX_JOBS_PER_SLOT = 2;
const SAME_SLOT_MIN_DISTANCE_MILES = 5;

function getSlotTimes(date, windowLabel) {
  const slotMap = {
    "8:00 AM – 10:00 AM": {
      start: new Date(`${date}T08:00:00-04:00`).getTime(),
      end: new Date(`${date}T10:00:00-04:00`).getTime(),
    },
    "10:00 AM – 12:00 PM": {
      start: new Date(`${date}T10:00:00-04:00`).getTime(),
      end: new Date(`${date}T12:00:00-04:00`).getTime(),
    },
    "12:00 PM – 2:00 PM": {
      start: new Date(`${date}T12:00:00-04:00`).getTime(),
      end: new Date(`${date}T14:00:00-04:00`).getTime(),
    },
    "2:00 PM – 4:00 PM": {
      start: new Date(`${date}T14:00:00-04:00`).getTime(),
      end: new Date(`${date}T16:00:00-04:00`).getTime(),
    },
  };

  return slotMap[windowLabel] || null;
}

async function getSlotBookingInfo(
  calendar,
  events,
  date,
  windowLabel,
  customerGeo = null
) {
  const slot = getSlotTimes(date, windowLabel);

  if (!slot) {
    return {
      bookingsCount: 0,
      isAvailable: false,
      isTooClose: false,
      nearestDistanceMiles: null,
    };
  }

  let bookingsCount = 0;
  let isTooClose = false;
  let nearestDistanceMiles = null;

  for (const event of events) {
    const eventStart = new Date(event.start?.dateTime || event.start?.date).getTime();
    const eventEnd = new Date(event.end?.dateTime || event.end?.date).getTime();

    const overlaps = slot.start < eventEnd && slot.end > eventStart;

    if (!overlaps) continue;

    bookingsCount += 1;

    if (customerGeo) {
      const coords = await getEventCoordinates(calendar, event);

      if (coords) {
        const distance = getDistanceMiles(
          customerGeo.lat,
          customerGeo.lng,
          coords.lat,
          coords.lng
        );

        if (nearestDistanceMiles === null || distance < nearestDistanceMiles) {
          nearestDistanceMiles = distance;
        }

        if (distance < SAME_SLOT_MIN_DISTANCE_MILES) {
          isTooClose = true;
        }
      }
    }
  }

  const isAvailable =
    bookingsCount < MAX_JOBS_PER_SLOT &&
    !(bookingsCount >= 1 && isTooClose);

  return {
    bookingsCount,
    isAvailable,
    isTooClose,
    nearestDistanceMiles:
      nearestDistanceMiles === null
        ? null
        : Number(nearestDistanceMiles.toFixed(2)),
  };
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

async function geocodeAddress(address, city = "", zip = "") {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is missing from .env");
  }

  const parts = [address, city, zip]
    .map((part) => (part || "").trim())
    .filter(Boolean);

  const fullAddress = encodeURIComponent(parts.join(", "));
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${fullAddress}&key=${apiKey}`;

  const result = await fetchJson(url);

  if (!result.results || result.results.length === 0) {
    throw new Error("Unable to geocode address.");
  }

  const location = result.results[0].geometry.location;

  return {
    lat: location.lat,
    lng: location.lng,
    formattedAddress: result.results[0].formatted_address,
  };
}

function formatServices(services = []) {
  if (!Array.isArray(services) || services.length === 0) {
    return "No services selected.";
  }

  return services
    .map((service, index) => {
      const stairsText = service.stairs ? ` | Stairs: ${service.stairs}` : "";
      const addOnsText = service.addOns ? ` | Add-ons: ${service.addOns}` : "";
      return `${index + 1}. ${service.service}\n   Details: ${service.details}\n   Price: ${service.lineTotal}${stairsText}${addOnsText}`;
    })
    .join("\n\n");
}


const auth = new google.auth.GoogleAuth({
  keyFile: credentialsPath,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/calendar",
  ],
});
app.post("/api/best-fit", async (req, res) => {
  try {
    const { address, city, zip } = req.body;

    if (!address || !city || !zip) {
      return res.status(400).json({
        success: false,
        message: "Address, city, and zip are required.",
      });
    }

    const client = await auth.getClient();
    const calendar = google.calendar({ version: "v3", auth: client });

    const customerGeo = await geocodeAddress(address, city, zip);

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 10);

    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: today.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];
    const suggestions = [];
    const seenSuggestions = new Set();

    for (const event of events) {
      const eventStart = event.start?.dateTime || event.start?.date;
      const coords = await getEventCoordinates(calendar, event);

      if (!eventStart || !coords) {
        continue;
      }

      const distance = getDistanceMiles(
        customerGeo.lat,
        customerGeo.lng,
        coords.lat,
        coords.lng
      );

      const eventDate = getDateStringFromDateTime(eventStart);
      const eventWindow = getTimeLabel(eventStart);

      if (!eventDate || !eventWindow) {
        continue;
      }

      // If nearby, prefer neighbor slots instead of the same slot
      if (distance <= 5) {
        const neighborSlots = getNeighborSlots(eventWindow);

        for (const neighborWindow of neighborSlots) {
          const slotInfo = await getSlotBookingInfo(
            calendar,
            events,
            eventDate,
            neighborWindow,
            customerGeo
          );

          if (!slotInfo.isAvailable) {
            continue;
          }

          const key = `${eventDate}|${neighborWindow}`;
          if (seenSuggestions.has(key)) {
            continue;
          }

          seenSuggestions.add(key);

          suggestions.push({
            date: eventDate,
            time: neighborWindow,
            label: distance <= 3 ? "Best fit" : "Good fit",
            discount: distance <= 3 ? 25 : 0,
            priority: distance <= 3 ? 1 : distance <= 5 ? 2 : 3,
            distanceMiles: Number(distance.toFixed(2)),
            reason:
              distance <= 3
                ? `Close to another scheduled job. Best nearby opening is ${neighborWindow}.`
                : `Near another scheduled job. A nearby opening is ${neighborWindow}.`,
            summary: event.summary || "",
          });
        }

        continue;
      }

      // If farther away, allow same slot when capacity rules permit it
      const sameSlotInfo = await getSlotBookingInfo(
        calendar,
        events,
        eventDate,
        eventWindow,
        customerGeo
      );

      if (sameSlotInfo.isAvailable) {
        const key = `${eventDate}|${eventWindow}`;
        if (!seenSuggestions.has(key)) {
          seenSuggestions.add(key);

          suggestions.push({
            date: eventDate,
            time: eventWindow,
            label: "Available",
            discount: 0,
            priority: 3,
            distanceMiles: Number(distance.toFixed(2)),
            reason: `This slot works because it is far enough from another scheduled job.`,
            summary: event.summary || "",
          });
        }
      }
    }

    suggestions.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
    
      if (a.distanceMiles !== b.distanceMiles) {
        return a.distanceMiles - b.distanceMiles;
      }
    
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
    
      return SCHEDULE_TIME_WINDOWS.indexOf(a.time) - SCHEDULE_TIME_WINDOWS.indexOf(b.time);
    });

    return res.json({
      success: true,
      customerAddress: customerGeo.formattedAddress,
      suggestions: suggestions.slice(0, 5),
    });
  } catch (error) {
    console.error("Best fit error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error finding best-fit times.",
    });
  }
});

async function appendBookingToSheet(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const row = [
    new Date().toLocaleString(),
    data.firstName,
    data.lastName,
    data.phone,
    data.email,
    data.address,
    data.city,
    data.zip,
    data.propertyType,
    data.preferredDate,
    data.preferredTime,
    data.estimate,
    data.estimatedHours,
    data.services
  .map(
    (service, index) =>
      `${index + 1}. ${service.service} | ${service.details} | ${service.lineTotal}${
        service.stairs ? ` | ${service.stairs}` : ""
      }${service.addOns ? ` | Add-ons: ${service.addOns}` : ""}`
  )
  .join(" || "),
    data.notes || "None",
    data.formattedAddress || "",
    data.lat || "",
    data.lng || "",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Bookings",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });
}

async function createCalendarEvent(data) {
  const client = await auth.getClient();
  const calendar = google.calendar({ version: "v3", auth: client });

  const {
    firstName,
    lastName,
    phone,
    email,
    address,
    city,
    zip,
    propertyType,
    preferredDate,
    preferredTime,
    estimate,
    estimatedHours,
    services,
    notes,
    formattedAddress,
    lat,
    lng,
  } = data;

  const fullAddress = formattedAddress || `${address}, ${city}, ${zip}`;

 const servicesText = services
  .map((service, index) => {
    const stairsText = service.stairs
      ? `\n   Stairs: ${service.stairs}${service.stairsPrice ? ` (${service.stairsPrice})` : ""}`
      : "";

    const addOnsText = service.addOns ? `\n   Add-ons: ${service.addOns}` : "";

    return `${index + 1}. ${service.service}
   Details: ${service.details}
   Price: ${service.lineTotal}${stairsText}${addOnsText}`;
  })
  .join("\n\n");

  console.log("CALENDAR SERVICES TEXT:", servicesText);

  const startTimeMap = {
    "8:00 AM – 10:00 AM": { start: "08:00:00", end: "10:00:00" },
    "10:00 AM – 12:00 PM": { start: "10:00:00", end: "12:00:00" },
    "12:00 PM – 2:00 PM": { start: "12:00:00", end: "14:00:00" },
    "2:00 PM – 4:00 PM": { start: "14:00:00", end: "16:00:00" },
    "Flexible / Best available": { start: "09:00:00", end: "11:00:00" },
  };

  const eventDate = preferredDate;
  const timeSlot = startTimeMap[preferredTime];

  if (!eventDate || !timeSlot) {
    throw new Error("Invalid preferred date or time for calendar event.");
  }

  const event = {
    summary: `SWC - ${firstName} ${lastName}`,
    location: fullAddress,
    description: `
Customer: ${firstName} ${lastName}
Phone: ${phone}
Email: ${email}
Property Type: ${propertyType}

Estimate: ${estimate}
Estimated Hours: ${estimatedHours}

Services:
${servicesText}

Notes:
${notes || "None"}
Coordinates:
${lat}, ${lng}
    `.trim(),
    start: {
      dateTime: `${eventDate}T${timeSlot.start}-04:00`,
      timeZone: "America/New_York",
    },
    end: {
      dateTime: `${eventDate}T${timeSlot.end}-04:00`,
      timeZone: "America/New_York",
    },
  };

  const existingEvents = await calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    timeMin: new Date(event.start.dateTime).toISOString(),
    timeMax: new Date(event.end.dateTime).toISOString(),
    singleEvents: true,
  });

  const alreadyExists = (existingEvents.data.items || []).some(
    (existing) =>
      existing.summary === event.summary &&
      existing.location === event.location
  );

  if (alreadyExists) {
    console.log("Calendar event already exists, skipping duplicate.");
    return;
  }

  const createdEvent = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: event,
  });

  console.log("Calendar event created:", createdEvent.data.htmlLink);
}

app.get("/", (req, res) => {
  res.send("Booking API is running.");
});

async function sendEmailsSMTP(bookingData) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const businessEmail = process.env.BUSINESS_EMAIL;
  const businessName = process.env.BUSINESS_NAME || "Statewide Cleaning, Inc.";

  const customerName = `${bookingData.firstName || ""} ${bookingData.lastName || ""}`.trim();

  const servicesText =
    bookingData.servicesText ||
    bookingData.customerServiceSummary ||
    "No services selected.";

  const businessSubject = `New Booking Request - ${customerName}`;
  const businessBody = `New booking request received

Customer:
${customerName}
Phone: ${bookingData.phone || ""}
Email: ${bookingData.email || ""}

Address:
${bookingData.address || ""}
${bookingData.city || ""}, ${bookingData.zip || ""}

Property Type: ${bookingData.propertyType || ""}
Preferred Date: ${bookingData.preferredDate || ""}
Preferred Time: ${bookingData.preferredTime || ""}

Estimated Total: ${bookingData.estimate || ""}
Estimated Hours: ${bookingData.estimatedHours || ""}

Services:
${servicesText}

Notes:
${bookingData.notes || ""}
`;

  const customerSubject = `Your booking request - ${businessName}`;
  const customerBody = `Hello ${bookingData.firstName || ""},

Thank you for your booking request with ${businessName}. We received your request and will review it shortly.

Requested date: ${bookingData.preferredDate || ""}
Requested time: ${bookingData.preferredTime || ""}
Estimated starting total: ${bookingData.estimate || ""}
Estimated job time: ${bookingData.estimatedHours || ""} hour(s)

Service summary:
${bookingData.customerServiceSummary || servicesText}

Service address:
${bookingData.address || ""}
${bookingData.city || ""}, ${bookingData.zip || ""}

If anything needs to be updated, please reply to this email.

Thank you,
${businessName}
${businessEmail}
`;

  await transporter.sendMail({
    from: `"${businessName}" <${businessEmail}>`,
    to: businessEmail,
    replyTo: bookingData.email || businessEmail,
    subject: businessSubject,
    text: businessBody,
  });

  if (bookingData.email) {
    await transporter.sendMail({
      from: `"${businessName}" <${businessEmail}>`,
      to: bookingData.email,
      replyTo: businessEmail,
      subject: customerSubject,
      text: customerBody,
    });
  }
}

app.post("/api/book", async (req, res) => {
  try {
    console.log("Incoming booking request received");
    console.log("BODY:", req.body);

    const {
  firstName,
  lastName,
  phone,
  email,
  address,
  city,
  zip,
  propertyType,
  notes,
  preferredDate,
  preferredTime,
  estimate,
  estimatedHours,
  services,
  customerServiceSummary,
} = req.body;

    console.log("Fields check:", {
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      zip,
      preferredDate,
      preferredTime,
      services,
      servicesIsArray: Array.isArray(services),
      servicesLength: Array.isArray(services) ? services.length : "not array",
    });

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !email ||
      !address ||
      !city ||
      !zip ||
      !preferredDate ||
      !preferredTime ||
      !services ||
      !Array.isArray(services) ||
      services.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required booking information.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number.",
      });
    }

    if (!isValidZip(zip)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ZIP code.",
      });
    }

    const servicesText = formatServices(services);

    console.log("SERVICES ARRAY FULL:", JSON.stringify(services, null, 2));
    console.log("SERVICES TEXT FULL:", servicesText);

    console.log("Passed validation, building email objects...");
    console.log("About to geocode address...");

    let geo = {
      lat: "",
      lng: "",
      formattedAddress: `${address}, ${city}, ${zip}`,
    };

    try {
      geo = await geocodeAddress(address, city, zip);
      console.log("Geocoded address:", geo);
    } catch (geoError) {
      console.error("Geocoding failed:", geoError.message);
    }

    const bookingData = {
  firstName,
  lastName,
  phone,
  email,
  address,
  city,
  zip,
  propertyType,
  preferredDate,
  preferredTime,
  estimate,
  estimatedHours,
  services,
  notes,
  formattedAddress: geo.formattedAddress,
  lat: geo.lat,
  lng: geo.lng,
};

setImmediate(async () => {
  try {
    console.log("Starting background booking tasks...");

    const results = await Promise.allSettled([
await sendEmailsSMTP({
  firstName,
  lastName,
  phone,
  email,
  address,
  city,
  zip,
  propertyType,
  notes,
  preferredDate,
  preferredTime,
  estimate,
  estimatedHours,
  servicesText,
  customerServiceSummary,
}),
  appendBookingToSheet(bookingData),
  createCalendarEvent(bookingData),
]);

   const taskNames = [
  "apps script emails",
  "append to sheet",
  "create calendar event",
];

results.forEach((result, index) => {
  if (result.status === "rejected") {
    console.error(`${taskNames[index]} failed:`, result.reason);
  } else {
    console.log(`${taskNames[index]} succeeded.`);
  }
});

    console.log("Background booking tasks finished.");
  } catch (backgroundError) {
    console.error("Background booking tasks failed:", backgroundError);
  }
});

return res.json({
  success: true,
  message: "Booking request submitted successfully.",
});
    

   
  } catch (error) {
    console.error("Booking error full object:", error);
    console.error("Booking error message:", error?.message);
    console.error("Booking error code:", error?.code);
    console.error("Booking error response:", error?.response);

    return res.status(500).json({
      success: false,
      message: error?.message || "Server error while submitting booking.",
    });
  }
});

const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});