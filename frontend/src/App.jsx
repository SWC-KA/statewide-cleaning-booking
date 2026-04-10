import React, { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";
import logo from "./assets/statewide-logo.png";

const services = [
  {
    id: "carpet-room",
    title: "Carpet Cleaning (Residential Rooms)",
    category: "Residential",
    description:
      "Best for residential rooms priced by room size. Includes pre-treatment, hot water extraction, and professional spot treatment.",
    pricingLabel:
    "Bedroom $100/$135/$195 · Living Room $100/$175/$260 · Dining Room $65/$85/$110 · Hallway $25/$45/$100 · $250 minimum service charge",
    pricingType: "roomSize",
    minCharge: 250,
    info: [
      "Truckmount or portable extraction depending on access",
      "Kid- and pet-friendly cleaning products",
      "Dry time typically 4–6 hours",
      "Heavy staining or specialty fibers may require additional treatment",
    ],
  },
  {
    id: "carpet-sqft",
    title: "Carpet Cleaning (Residential by Square Foot)",
    category: "Residential",
    description:
      "Ideal for larger residential projects priced by total carpeted square footage.",
    pricingLabel: "$0.60 per sq. ft. · $250 minimum service charge",
    pricingType: "sqft",
    unitLabel: "Square feet",
    unitPrice: 0.60,
    minCharge: 250,
    info: [
      "Good for larger homes, basements, and open layouts",
      "Hot water extraction cleaning method",
      "Final price may vary based on layout and access",
      "Good option when room-by-room pricing is not the best fit",
    ],
  },
  {
  id: "stairs",
  title: "Stair Cleaning",
  category: "Residential",
  description: "Stair cleaning priced per step with optional landing cleaning.",
  pricingLabel: "$7 per step · Landing add-on available",
  pricingType: "stairsOnly",
  minCharge: 0,
  info: [
    "Priced at $7 per step",
    "Optional landing cleaning available",
    "Hot water extraction cleaning",
    "Dry time typically 8–10 hours",
  ],
},
  {
  id: "commercial-hwe",
  title: "Commercial Carpet Cleaning (Hot Water Extraction)",
  category: "Commercial",
  description:
    "For offices, hallways, common areas, and larger commercial spaces requiring deep extraction cleaning.",
  pricingLabel: "$0.50 per sq. ft.",
  pricingType: "sqftRange",
  unitLabel: "Square feet",
  unitPrice: 0.50,
  minCharge: 250,
  info: [
    "Recommended for deeper restorative cleaning",
    "Good for offices and high-traffic carpet",
    "Pricing depends on size, condition, and access",
    "After-hours scheduling may be available",
  ],
},
  {
    id: "commercial-encap",
    title: "Commercial Carpet Cleaning (Encap / Low Moisture)",
    category: "Commercial",
    description:
      "Low-moisture encapsulation cleaning with faster dry times and lower-end pricing for appropriate commercial carpet.",
    pricingLabel: "$0.40 per sq. ft. starting price",
    pricingType: "sqft",
    unitLabel: "Square feet",
    unitPrice: 0.40,
    minCharge: 250,
    info: [
      "Fast dry time, often around 20 minutes to 1 hour",
      "Lower moisture and lower noise than extraction",
      "Great for routine maintenance",
      "Best for commercial glue-down carpet",
    ],
  },
  {
    id: "upholstery-sofa",
    title: "Upholstery Cleaning",
    category: "Residential / Commercial",
    description:
      "Deep cleaning for sofas, sectionals, chairs, cushions, and fabric seating with fabric-safe methods.",
    pricingLabel:
      "Armchair $90 · Loveseat $175 · Standard Sofa $225 · Large Sofa $275 · Sectional $450 · Large Sectional $525",
    pricingType: "pieces",
    minCharge: 250,
    info: [
      "Fabric tested before treatment",
      "Pre-treatment for daily use soil and body oils",
      "Dry time usually 4–8 hours",
      "Some stains and wear may not come out completely",
    ],
  },
  {
  id: "rugs-home",
  title: "Area Rug Cleaning (In Home)",
  category: "Residential",
  description:
    "On-site area rug cleaning for rugs that can be cleaned safely in place.",
  pricingLabel: "$1.50 per sq. ft. · $250 minimum service charge",
  pricingType: "sqft",
  unitLabel: "Square feet",
  unitPrice: 1.5,
  minCharge: 250,
  info: [
    "For rugs cleaned at your home",
    "Works well when pickup is not needed",
    "Final recommendation depends on rug type and condition",
    "Some specialty rugs may be better off-site",
  ],
},
  {
    id: "rugs-shop",
    title: "Area Rug Cleaning (Pickup & Delivery)",
    category: "Specialty Cleaning",
    description:
      "Off-site rug cleaning with pickup and delivery included for deeper cleaning and specialty care.",
    pricingLabel: "$5.00 per sq. ft. starting price",
    pricingType: "sqft",
    unitLabel: "Square feet",
    unitPrice: 5,
    minCharge: 0,
    info: [
      "Pickup and delivery included",
      "Typical turnaround 2–3 weeks",
      "Recommended for delicate or heavily soiled rugs",
      "Great option for odor and pet issues",
    ],
  },
  {
    id: "tile-grout",
    title: "Tile & Grout Cleaning",
    category: "Residential / Commercial",
    description:
      "Choose by square footage or by room type for kitchens and bathrooms.",
    pricingLabel: "$1.50 per sq. ft. · Bathrooms/Kitchens by size available",
    pricingType: "tileCombo",
    unitLabel: "Square feet",
    unitPrice: 1.5,
    minCharge: 250,
    info: [
      "Bathrooms and kitchens can be selected by size",
      "Square-foot pricing available for larger areas",
      "Cleaning only — re-grouting not included",
      "Heavily stained grout may not fully restore",
    ],
  },
  {
    id: "strip-wax",
    title: "Floor Stripping & Waxing",
    category: "Commercial / Specialty",
    description:
      "Removal of old finish, floor preparation, and application of new finish for resilient floors.",
    pricingLabel: "$1.50 per sq. ft. · $500 minimum service charge",
    pricingType: "sqft",
    unitLabel: "Square feet",
    unitPrice: 1.5,
    minCharge: 500,
    info: [
      "Old finish is stripped and floor is neutralized",
      "Recommended for VCT and similar floors",
      "Pricing depends on size and buildup",
      "Best quoted after reviewing floor condition",
    ],
  },
];

const roomSizeOptions = ["Small", "Medium", "Large"];

const carpetRoomPrices = {
  Bedroom: { Small: 75, Medium: 100, Large: 150 },
  "Living Room": { Small: 100, Medium: 175, Large: 260 },
  "Dining Room": { Small: 65, Medium: 85, Large: 110 },
  Hallway: { Small: 25, Medium: 45, Large: 100 },
};

const roomTypeOptions = ["Bedroom", "Living Room", "Dining Room", "Hallway"];

const tileRoomTypeOptions = [
  { label: "Bathroom", prices: { Small: 95, Medium: 125, Large: 150 } },
  { label: "Kitchen", prices: { Small: 125, Medium: 175, Large: 250 } },
];

const tileRoomSizeOptions = ["Small", "Medium", "Large"];

const landingSizePrices = {
  Small: 50,
  Medium: 75,
  Large: 100,
};

const rugSizeOptions = [
  { label: "3x5", value: 15 },
  { label: "7x5", value: 35 },
  { label: "8x10", value: 80 },
  { label: "9x5", value: 45 },
  { label: "9x12", value: 108 },
  { label: "Runner 3x15", value: 45 },
];

const pieceOptions = [
  { label: "Armchair / Recliner", value: 90 },
  { label: "Loveseat", value: 175 },
  { label: "Standard Sofa", value: 225 },
  { label: "Large Sofa", value: 275 },
  { label: "Sectional", value: 450 },
  { label: "Large Sectional", value: 525 },
  { label: "Dining Chair", value: 50 },
  { label: "Ottoman", value: 40 },
];

const timeWindows = [
  "8:00 AM – 10:00 AM",
  "10:00 AM – 12:00 PM",
  "12:00 PM – 2:00 PM",
  "2:00 PM – 4:00 PM",
  "Flexible / Best available",
];

function formatDateLabel(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function getUpcomingDates(daysAhead = 14) {
  const dates = [];

  const now = new Date();
  const easternNow = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const hour = easternNow.getHours();

  // Before 8 PM ET: start from tomorrow
  // After 8 PM ET: start from day after tomorrow
  const startOffset = hour >= 20 ? 2 : 1;

  for (let i = startOffset; i < startOffset + daysAhead; i++) {
  const d = new Date(easternNow);
  d.setDate(easternNow.getDate() + i);

  // ❌ Skip Sundays (0 = Sunday)
  if (d.getDay() === 0) continue;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const value = `${year}-${month}-${day}`;

  dates.push({
    label: formatDateLabel(value),
    value,
  });
}

  return dates;
}

const dateOptions = getUpcomingDates(14);

const API_BASE = import.meta.env.VITE_API_BASE_URL 

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 10 ? 2 : 0,
  }).format(value || 0);
}

function getTileRoomPrice(roomType, roomSize) {
  const match = tileRoomTypeOptions.find((x) => x.label === roomType);
  return match?.prices?.[roomSize] || 0;
}

function getCarpetRoomPrice(roomType, roomSize) {
  return carpetRoomPrices?.[roomType]?.[roomSize] || 0;
}

function createServiceItem(serviceId = "carpet-room") {
return {
  serviceId,
  quantity: 0,
  roomType: "Bedroom",
  roomSize: "Medium",
  pieceType: pieceOptions[2].label,
  pieceCount: 0,
  addStairs: false,
  stairCount: 0,

  addLanding: false,
  landingSize: "Medium",

  rugPricingMode: "preset",
  rugSizePreset: "8x10",

  addPetTreatment: false,
  addProtection: false,

  tileMode: "room",
  tileRoomType: "Bathroom",
  tileRoomSize: "Medium",
};
}

function estimateDurationHours(total) {
  if (total <= 0) return 0;
  if (total <= 500) return 2;
  if (total <= 750) return 3;
  return Math.max(4, Math.ceil(total / 250));
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function InfoRow({ title, text }) {
  return (
    <div className="info-row">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function getTodayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSpecificDateLabel(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function App() {
  const [starterSelectedIds, setStarterSelectedIds] = useState(
    new Set(["carpet-room"])
  );
  const [selectedServices, setSelectedServices] = useState([
    createServiceItem("carpet-room"),
  ]);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0].value);
  const [selectedTime, setSelectedTime] = useState(timeWindows[0]);
  const [availableTimeWindows, setAvailableTimeWindows] = useState(timeWindows);
  const [bestFitOptions, setBestFitOptions] = useState([]);
  const [bestFitLoading, setBestFitLoading] = useState(false);
  const [bestFitError, setBestFitError] = useState("");
  const [slotStatus, setSlotStatus] = useState([]);
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    propertyType: "Residential",
    serviceNotes: "",
  });

  const serviceMap = useMemo(
    () => Object.fromEntries(services.map((s) => [s.id, s])),
    []
  );

  const [useSpecificDateRequest, setUseSpecificDateRequest] = useState(false);
const [specificDate, setSpecificDate] = useState("");
const [specificTimePreference, setSpecificTimePreference] = useState("Flexible");

  function toggleStarterService(serviceId) {
    setStarterSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });

    setSelectedServices((current) => {
      const exists = current.some((item) => item.serviceId === serviceId);
      if (exists) return current.filter((item) => item.serviceId !== serviceId);
      return [...current, createServiceItem(serviceId)];
    });
  }

  function addServiceToBooking() {
    setSelectedServices((current) => [...current, createServiceItem()]);
  }

  function removeServiceFromBooking(index) {
    setSelectedServices((current) => current.filter((_, i) => i !== index));
  }

  function updateService(index, patch) {
    setSelectedServices((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

function getLineEstimate(item) {
  const service = serviceMap[item.serviceId];
  if (!service) return 0;

  let baseServiceTotal = 0;
  let stairsTotal = 0;

  if (service.pricingType === "pieces") {
    const matchedPiece = pieceOptions.find((p) => p.label === item.pieceType);
    baseServiceTotal = (matchedPiece?.value || 0) * Number(item.pieceCount || 0);
  } else if (service.pricingType === "roomSize") {
    baseServiceTotal =
      getCarpetRoomPrice(item.roomType, item.roomSize) *
      Number(item.quantity || 0);
  } else if (service.pricingType === "tileCombo") {
    baseServiceTotal =
      item.tileMode === "room"
        ? getTileRoomPrice(item.tileRoomType, item.tileRoomSize) *
          Number(item.quantity || 0)
        : Number(item.quantity || 0) * (service.unitPrice || 0);
  } else if (service.pricingType === "landingSize") {
    baseServiceTotal = landingSizePrices[item.landingSize] || 0;
  } else if (service.id === "rugs-home" || service.id === "rugs-shop") {
  if (item.rugPricingMode === "sqft") {
    baseServiceTotal = Number(item.quantity || 0) * (service.unitPrice || 0);
  } else {
    const matchedRug = rugSizeOptions.find((r) => r.label === item.rugSizePreset);
    const rugSqft = matchedRug?.value || 0;
    baseServiceTotal = rugSqft * (service.unitPrice || 0);
  }
    } else if (service.pricingType === "stairsOnly") {
  baseServiceTotal = Number(item.stairCount || 0) * 7;

  if (item.addLanding) {
    baseServiceTotal += landingSizePrices[item.landingSize] || 0;
  }
} else {
    baseServiceTotal = Number(item.quantity || 0) * (service.unitPrice || 0);
    
  }

  if (
    item.addStairs &&
    (service.id === "carpet-room" || service.id === "carpet-sqft")
  ) {
    stairsTotal = Number(item.stairCount || 0) * 7;
  }

  let addOnsTotal = 0;

  if (item.addPetTreatment) {
    addOnsTotal += baseServiceTotal * 0.2;
  }

  if (item.addProtection) {
    addOnsTotal += baseServiceTotal * 0.2;
  }

  return baseServiceTotal + stairsTotal + addOnsTotal;
}
  
function getServiceLabel(item, service) {
  if (!service) return "";

  if (service.pricingType === "pieces") {
    return `${item.pieceType} × ${item.pieceCount}`;
  }

  if (service.pricingType === "roomSize") {
    return `${item.quantity} ${item.roomType} (${item.roomSize})`;
  }

  if (service.pricingType === "tileCombo") {
    if (item.tileMode === "room") {
      return `${item.quantity} ${item.tileRoomType} (${item.tileRoomSize})`;
    }
    return `${item.quantity} sq ft`;
  }

  if (service.pricingType === "stairsOnly") {
  let label = `${item.stairCount} steps`;

  if (item.addLanding) {
    label += ` + ${item.landingSize} landing`;
  }

  return label;
}

if (service.id === "rugs-home" || service.id === "rugs-shop") {
  return item.rugPricingMode === "sqft"
    ? `${item.quantity} sq ft`
    : item.rugSizePreset;
}

  return `${item.quantity} ${service.unitLabel || ""}`;
}
  function getSelectedAddOnsLabel(item) {
  return [
    item.addPetTreatment ? "Pet accident treatment" : null,
    item.addProtection ? "Fiber protection" : null,
  ]
    .filter(Boolean)
    .join(", ");
}

 const subtotal = useMemo(() => {
  if (!selectedServices.length) return 0;
  return selectedServices.reduce((sum, item) => sum + getLineEstimate(item), 0);
}, [selectedServices]);

const minimumServiceCharge = useMemo(() => {
  if (!selectedServices.length) return 0;

  const hasMinimumService = selectedServices.some((item) => {
    const service = serviceMap[item.serviceId];
    return (service?.minCharge || 0) >= 250;
  });

  return hasMinimumService ? 250 : 0;
}, [selectedServices, serviceMap]);

const estimate = useMemo(() => {
  if (!selectedServices.length) return 0;
  return Math.max(subtotal, minimumServiceCharge);
}, [subtotal, minimumServiceCharge, selectedServices]);

  const estimatedHours = useMemo(
    () => estimateDurationHours(estimate),
    [estimate]
  );
  const [loading, setLoading] = useState(false);
const [showReview, setShowReview] = useState(false);
const [submitSuccess, setSubmitSuccess] = useState(false);

const reviewRef = useRef(null);

function handleReviewClick() {
  if (!canSubmit || loading) return;
  setShowReview(true);
}

async function handleSubmit() {
  if (loading || !canSubmit) return;

  setLoading(true);

  try {
    const validSelectedServices = selectedServices.filter((item) => {
      const service = serviceMap[item.serviceId];
      if (!service) return false;

      if (service.pricingType === "pieces") {
        return Number(item.pieceCount || 0) > 0;
      }

      if (service.pricingType === "stairsOnly") {
        return Number(item.stairCount || 0) > 0 || item.addLanding;
      }

      if (service.id === "rugs-home" || service.id === "rugs-shop") {
        return item.rugPricingMode === "sqft"
          ? Number(item.quantity || 0) > 0
          : Boolean(item.rugSizePreset);
      }

      return Number(item.quantity || 0) > 0;
    });

    if (validSelectedServices.length === 0) {
      alert("Please select at least one service.");
      setLoading(false);
      return;
    }

    const serviceSummary = validSelectedServices.map((item) => {
      const service = serviceMap[item.serviceId];

      let stairsPrice = 0;
      if (
        item.addStairs &&
        (item.serviceId === "carpet-room" || item.serviceId === "carpet-sqft")
      ) {
        stairsPrice = Number(item.stairCount || 0) * 7;
      }

      const lineTotal = getLineEstimate(item);

      const addOns = [];
      if (item.addPetTreatment) addOns.push("Pet accident treatment");
      if (item.addProtection) addOns.push("Fiber protection");

      return {
        service: service?.title || "",
        details: getServiceLabel(item, service),
        stairs: item.addStairs ? `${item.stairCount} steps` : "",
        stairsPrice: stairsPrice ? currency(stairsPrice) : "",
        addOns: addOns.join(", "),
        lineTotal: currency(lineTotal),
      };
    });

    const customerServiceSummary = serviceSummary
      .map((service, index) => {
        const stairsText = service.stairs ? `\nStairs: ${service.stairs}` : "";
        const addOnsText = service.addOns ? `\nAdd-ons: ${service.addOns}` : "";

        return `${index + 1}. ${service.service}
Details: ${service.details}
Price: ${service.lineTotal}${stairsText}${addOnsText}`;
      })
      .join("\n\n");

    const payload = {
  firstName: customer.firstName,
  lastName: customer.lastName,
  phone: customer.phone,
  email: customer.email,
  address: customer.address,
  city: customer.city,
  zip: customer.zip,
  propertyType: customer.propertyType,
  notes: customer.serviceNotes,
  estimate: currency(estimate),
  estimatedHours,
  services: serviceSummary,
  customerServiceSummary,

  useSpecificDateRequest,
  preferredDate: useSpecificDateRequest ? specificDate : selectedDate,
  preferredTime: useSpecificDateRequest
    ? `Requested specific date (${specificTimePreference})`
    : selectedTime,
  specificTimePreference: useSpecificDateRequest ? specificTimePreference : "",
};

    const response = await fetch(`${API_BASE}/api/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setShowReview(false);
      setSubmitSuccess(true);
      return;
    }

    const errorData = await response.json().catch(() => ({}));
if (response.status === 409 && !useSpecificDateRequest) {
  alert(errorData.message || "That time slot is no longer available.");

  await fetchSlotStatus(selectedDate);
  setSelectedTime("Flexible / Best available");
} else if (!response.ok) {
  alert(errorData.message || "Something went wrong sending the request.");
}
  } catch (error) {
    console.error(error);
    alert("Something went wrong sending the request.");
  } finally {
    setLoading(false);
  }
}
async function fetchBestFitOptions() {
  if (!addressValid) {
    setBestFitOptions([]);
    setBestFitError("");
    return;
  }

  try {
    setBestFitLoading(true);
    setBestFitError("");

    const response = await fetch(`${API_BASE}/api/best-fit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: customer.address,
        city: customer.city,
        zip: customer.zip,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch best-fit options.");
    }

    const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
    setBestFitOptions(suggestions);
  } catch (error) {
    console.error("Best fit fetch error:", error);
    setBestFitError(error.message || "Unable to load best-fit times.");
    setBestFitOptions([]);
  } finally {
    setBestFitLoading(false);
  }
}

async function fetchSlotStatus(chosenDate = selectedDate) {
  if (!addressValid || !chosenDate) {
    setSlotStatus([]);
    setAvailableTimeWindows(timeWindows);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/slot-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: customer.address,
        city: customer.city,
        zip: customer.zip,
        selectedDate: chosenDate,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch slot availability.");
    }

    const status = Array.isArray(data.slotStatus) ? data.slotStatus : [];
    setSlotStatus(status);

    const available = status
      .filter((slot) => slot.isAvailable)
      .map((slot) => slot.window);

    const nextAvailable = available.length
      ? [...available, "Flexible / Best available"]
      : ["Flexible / Best available"];

    setAvailableTimeWindows(nextAvailable);

    if (
      selectedTime !== "Flexible / Best available" &&
      !available.includes(selectedTime)
    ) {
      setSelectedTime("Flexible / Best available");
    }
  } catch (error) {
    console.error("Slot status fetch error:", error);
    setSlotStatus([]);
    setAvailableTimeWindows(timeWindows);
  }
}
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
  
  function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10;
  }
  
  function isValidAddress(address, city, zip) {
    const streetOk = address.trim().length >= 6;
    const cityOk = city.trim().length >= 2;
    const zipOk = /^\d{5}(-\d{4})?$/.test(zip.trim());
  
    return streetOk && cityOk && zipOk;
  }
  
  const emailValid = isValidEmail(customer.email);
const phoneValid = isValidPhone(customer.phone);
const addressValid = isValidAddress(
  customer.address,
  customer.city,
  customer.zip
);

const hasRequiredCustomerInfo =
  customer.firstName.trim() &&
  customer.lastName.trim() &&
  customer.phone.trim() &&
  customer.email.trim() &&
  customer.address.trim() &&
  customer.city.trim() &&
  customer.zip.trim();

const hasAtLeastOneService = selectedServices.length > 0;

const canSubmit =
  customer.firstName.trim() &&
  customer.lastName.trim() &&
  customer.phone.trim() &&
  customer.email.trim() &&
  customer.address.trim() &&
  customer.city.trim() &&
  customer.zip.trim() &&
  (
    useSpecificDateRequest
      ? specificDate.trim()
      : selectedDate && selectedTime
  );

  function getAvailableTimeWindows(slotStatus = []) {
    const available = slotStatus
      .filter((slot) => slot.isAvailable)
      .map((slot) => slot.window);
  
    if (!available.includes("Flexible / Best available")) {
      available.push("Flexible / Best available");
    }
  
    return available;
  }
  
useEffect(() => {
  if (!addressValid || !selectedDate) {
    setSlotStatus([]);
    setAvailableTimeWindows(timeWindows);
    return;
  }

  fetchSlotStatus(selectedDate);
}, [selectedDate]);

 useEffect(() => {
  if (!addressValid) {
    setBestFitOptions([]);
    setBestFitError("");
    setAvailableTimeWindows(timeWindows);
    return;
  }

  const timeout = setTimeout(() => {
    fetchBestFitOptions(selectedDate);
  }, 700);

  return () => clearTimeout(timeout);
}, [customer.address, customer.city, customer.zip]);

function getSlotLabel(window) {
  if (window === "Flexible / Best available") {
    return window;
  }

  const match = slotStatus.find((slot) => slot.window === window);

  if (!match) return window;
  if (match.isAvailable) return window;

  return `${window} — Unavailable`;
}
  

  return ( 
    <div className="page">
      {submitSuccess ? (
  <div className="success-page">
    <div className="success-card">
      <h1>Booking request received</h1>
      <p>
        Thank you. Your request has been submitted successfully and the Statewide Cleaning team will review it shortly.
      </p>

      <div className="success-details">
        <p><strong>Name:</strong> {customer.firstName} {customer.lastName}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Requested Date:</strong> {selectedDate}</p>
        <p><strong>Requested Time:</strong> {selectedTime}</p>
        <p><strong>Estimated Total:</strong> {currency(estimate)}</p>
        <div className="success-services-list">
  {selectedServices.map((item, index) => {
    const service = serviceMap[item.serviceId];

    return (
      <div key={index} className="success-service-item">
        <strong>{service?.title}</strong>
        <div>{getServiceLabel(item, service)}</div>

        {item.addStairs && <div>+ {item.stairCount} steps</div>}

        {getSelectedAddOnsLabel(item) && (
          <div>Includes: {getSelectedAddOnsLabel(item)}</div>
        )}
      </div>
    );
  })}
</div>
      </div>

      <div className="success-actions">
        <button
  className="btn"
  onClick={() => {
    setSubmitSuccess(false);
    setShowReview(false);
    setLoading(false);
  }}
>
  Back to booking form
</button>
      </div>

      <p className="muted" style={{ marginTop: "16px" }}>
        If you need immediate assistance, email cmejia@statewidecleaning.com or visit statewidecleaning.com.
      </p>
    </div>
  </div>
) : (
  <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="badge">Statewide Cleaning</div>
    <div
  className="hero-brand"
  style={{
  background: "#ffffff",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ddd"
}}
>
  <img src={logo} alt="Statewide Cleaning logo" className="hero-logo" />
</div>
            <h1>Request carpet, upholstery, rug, tile, and floor cleaning online.</h1>
            <p className="hero-copy">
              Built for Statewide Cleaning. Customers can choose services, review pricing, request a date, and send a detailed booking request online.
            </p>
            <p className="hero-contact">statewidecleaning.com · cmejia@statewidecleaning.com</p>
          </div>

          <div className="summary-card">
  <h2>Quick booking summary</h2>
  <p>
    Service cards are just the starting point. Customers can still
    manage services inside the booking section below.
  </p>

  <div className="summary-box">
    <div>Booking summary</div>
    <strong>
      {selectedServices.length} service
      {selectedServices.length !== 1 ? "s" : ""} in booking
    </strong>
  </div>

  <div className="summary-total">
  <div>Estimated starting total</div>
  <strong>{currency(estimate)}</strong>
  {estimate === 250 && subtotal < 250 && (
    <p>$250 minimum service charge applies.</p>
  )}
  <p>
    Estimated job time: about {estimatedHours} hour
    {estimatedHours === 1 ? "" : "s"} based on pricing.
  </p>
</div>

  <div className="summary-breakdown">
  <h3>Service breakdown</h3>

  {selectedServices.map((item, index) => {
    const service = serviceMap[item.serviceId];
    const lineTotal = getLineEstimate(item);

    return (
      <div key={index} className="summary-line">
        <div>
          <strong>{service?.title}</strong>
          <div className="summary-sub">
            {getServiceLabel(item, service)}
            {item.addStairs && <div>+ {item.stairCount} steps</div>}
            {item.addPetTreatment || item.addProtection ? (
        <div className="summary-sub">
           Add-ons:{" "}
           {[
            item.addPetTreatment ? "Pet accident treatment" : null,
            item.addProtection ? "Fiber protection" : null,
            ]
          .filter(Boolean)
          .join(", ")}
        </div>
         ) : null}
          </div>
        </div>

        <span>{currency(lineTotal)}</span>
      </div>
    );
  })}
</div>
  
</div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Choose a service</h2>
          <p className="section-copy">
            Click a service card to create the starting selection. The booking
            section below still lets the client add more services or remove them later.
          </p>

          <div className="services-grid">
            {services.map((service) => {
              const selected = starterSelectedIds.has(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  className={`service-card ${selected ? "selected" : ""}`}
                  onClick={() => toggleStarterService(service.id)}
                >
                  <div className="service-top">
                    <span className="pill">{service.category}</span>
                    <span className={`status ${selected ? "on" : ""}`}>
                      {selected ? "Selected" : "Select"}
                    </span>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container two-col">
          <div className="panel">
            <div className="panel-header">
              <h2>Schedule your service</h2>
              <p>
                Service cards create the initial selection, but this booking section
                is fully editable.
              </p>
            </div>

            <div className="notice">
              Starter selection and booking management now work together.
            </div>

<div className="booking-list">
  {selectedServices.map((item, index) => {
    const service = serviceMap[item.serviceId];
    const lineEstimate = getLineEstimate(item);
  return (
    <div className="booking-item" key={`${item.serviceId}-${index}`}>
      <div className="booking-head">
      <div className="booking-title-wrap">
      <div className="small-label">Selected service</div>
        <select
          className="input"
          value={item.serviceId}
          onChange={(e) =>
          updateService(index, {
          ...createServiceItem(e.target.value),
          })
          }
          >
          {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
          ))}
          </select>
      </div>
      <button
        className="btn btn-small"
        onClick={() => removeServiceFromBooking(index)}
        >
        Remove
      </button>
</div>

                    <div className="form-grid">
  {service?.pricingType === "pieces" ? (
    <>
      <Field label="Furniture type" className="upholstery-type-field">
        <select
          className="input"
          value={item.pieceType}
          onChange={(e) =>
            updateService(index, { pieceType: e.target.value })
          }
        >
          {pieceOptions.map((option) => (
            <option key={option.label} value={option.label}>
              {option.label} — {currency(option.value)}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Quantity" className="upholstery-qty-field">
        <input
          className="input"
          type="number"
          min={0}
          value={item.pieceCount}
          onChange={(e) =>
            updateService(index, {
              pieceCount: e.target.value === "" ? "" : Number(e.target.value),
            })
          }
        />
      </Field>
    </>
  ) : service?.pricingType === "roomSize" ? (
    <>
      <Field label="Room type">
        <select
          className="input"
          value={item.roomType}
          onChange={(e) =>
            updateService(index, { roomType: e.target.value })
          }
        >
          {roomTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Room size">
        <select
          className="input"
          value={item.roomSize}
          onChange={(e) =>
            updateService(index, { roomSize: e.target.value })
          }
        >
          {roomSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} — {currency(getCarpetRoomPrice(item.roomType, size))}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Number of rooms">
        <input
          className="input"
          type="number"
          min={0}
          inputMode="numeric"
          value={item.quantity}
          onChange={(e) =>
            updateService(index, {
              quantity: e.target.value === "" ? "" : Number(e.target.value),
            })
          }
        />
      </Field>
    </>
  ) : service?.pricingType === "tileCombo" ? (
    <>
      <Field label="Pricing method">
        <select
          className="input"
          value={item.tileMode}
          onChange={(e) =>
            updateService(index, {
              tileMode: e.target.value,
              quantity: 1,
            })
          }
        >
          <option value="room">Bathroom / Kitchen by Size</option>
          <option value="sqft">By Square Foot</option>
        </select>
      </Field>

      {item.tileMode === "room" ? (
        <>
          <Field label="Room type">
            <select
              className="input"
              value={item.tileRoomType}
              onChange={(e) =>
                updateService(index, {
                  tileRoomType: e.target.value,
                })
              }
            >
              {tileRoomTypeOptions.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Room size">
            <select
              className="input"
              value={item.tileRoomSize}
              onChange={(e) =>
                updateService(index, {
                  tileRoomSize: e.target.value,
                })
              }
            >
              {tileRoomSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} — {currency(getTileRoomPrice(item.tileRoomType, size))}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Number of rooms">
            <input
              className="input"
              type="number"
              min={0}
              inputMode="numeric"
              value={item.quantity}
              onChange={(e) =>
                updateService(index, {
                  quantity: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
          </Field>
        </>
      ) : (
        <Field label="Square feet">
          <input
            className="input"
            type="number"
            min={0}
            inputMode="numeric"
            value={item.quantity}
            onChange={(e) =>
              updateService(index, {
                quantity: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
        </Field>
      )}
    </>
  ) : service?.pricingType === "stairsOnly" ? (
  <>
    <Field label="Number of steps">
      <input
        className="input"
        type="number"
        min={0}
        inputMode="numeric"
        value={item.stairCount}
        onChange={(e) =>
          updateService(index, {
            stairCount: e.target.value === "" ? "" : Number(e.target.value),
          })
        }
      />
    </Field>

    <Field label="Add landing?">
      <select
        className="input"
        value={item.addLanding ? "yes" : "no"}
        onChange={(e) =>
          updateService(index, {
            addLanding: e.target.value === "yes",
          })
        }
      >
        <option value="no">No</option>
        <option value="yes">Yes</option>
      </select>
    </Field>

    {item.addLanding && (
      <Field label="Landing Size">
        <select
          className="input"
          value={item.landingSize}
          onChange={(e) =>
            updateService(index, { landingSize: e.target.value })
          }
        >
          {roomSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} — {currency(landingSizePrices[size])}
            </option>
          ))}
        </select>
      </Field>
    )}
  </>
) : item.serviceId === "rugs-home" || item.serviceId === "rugs-shop" ? (
  <>
    <Field label="Pricing method">
      <select
        className="input"
        value={item.rugPricingMode}
        onChange={(e) =>
          updateService(index, {
            rugPricingMode: e.target.value,
            quantity: e.target.value === "sqft" ? item.quantity || 0 : 0,
          })
        }
      >
        <option value="preset">Standard rug sizes</option>
        <option value="sqft">By square foot</option>
      </select>
    </Field>

    {item.rugPricingMode === "preset" ? (
      <Field label="Rug Size">
        <select
          className="input"
          value={item.rugSizePreset}
          onChange={(e) =>
            updateService(index, { rugSizePreset: e.target.value })
          }
        >
          {rugSizeOptions.map((rug) => (
            <option key={rug.label} value={rug.label}>
              {rug.label} — {currency(rug.value * (service.unitPrice || 0))}
            </option>
          ))}
        </select>
      </Field>
    ) : (
      <Field label="Square feet">
        <input
          className="input"
          type="number"
          min={0}
          inputMode="numeric"
          value={item.quantity}
          onChange={(e) =>
            updateService(index, {
              quantity: e.target.value === "" ? "" : Number(e.target.value),
            })
          }
        />
      </Field>
    )}
  </>
  ) : (
    <Field label={service?.unitLabel || "Quantity"}>
      <input
        className="input"
        type="number"
        min={0}
        inputMode="numeric"
        value={item.quantity}
        onChange={(e) =>
          updateService(index, {
            quantity: e.target.value === "" ? "" : Number(e.target.value),
          })
        }
      />
    </Field>
  )}

 {/* Add-ons for carpet and upholstery */}
{(service?.id === "carpet-room" ||
  service?.id === "carpet-sqft" ||
  service?.pricingType === "pieces") && (
  <div className="stairs-box">
    <div>
      <strong>Optional add-ons</strong>
      <p>Enhance your cleaning with additional treatments.</p>
    </div>

    <label className="checkbox-line">
      <input
        type="checkbox"
        checked={item.addPetTreatment}
        onChange={(e) =>
          updateService(index, {
            addPetTreatment: e.target.checked,
          })
        }
      />
      Pet accident treatment
    </label>

    <label className="checkbox-line">
      <input
        type="checkbox"
        checked={item.addProtection}
        onChange={(e) =>
          updateService(index, {
            addProtection: e.target.checked,
          })
        }
      />
      Fiber protection with Green Guard
    </label>
  </div>
)}

{/* Stairs only for carpet */}
{(service?.id === "carpet-room" || service?.id === "carpet-sqft") && (
  <div className="stairs-box">
    <div>
      <strong>Add stair cleaning</strong>
      <p>
        $7 per step. Good for customers booking carpet cleaning and stairs together.
      </p>
    </div>

    <label className="checkbox-line">
      <input
        type="checkbox"
        checked={item.addStairs}
        onChange={(e) =>
          updateService(index, {
            addStairs: e.target.checked,
          })
        }
      />
      Include stairs
    </label>

    {item.addStairs && (
      <div className="stairs-count">
       <Field label="Number of steps">
  <input
    className="input"
    type="number"
    min={0}
    inputMode="numeric"
    value={item.stairCount}
    onChange={(e) =>
      updateService(index, {
        stairCount: e.target.value === "" ? "" : Number(e.target.value),
      })
    }
  />
</Field>
      </div>
    )}
  </div>
)}
</div>

<div className="line-total">
  <div>
    <span>Estimated starting price for this service</span>

    {getSelectedAddOnsLabel(item) && (
      <div className="selected-addons-note">
        Includes: {getSelectedAddOnsLabel(item)}
      </div>
    )}

    {item.addStairs && (
      <div className="selected-addons-note">
        Includes: {item.stairCount} stair steps
      </div>
    )}
  </div>

  <strong>{currency(lineEstimate)}</strong>
</div>
                    {index === selectedServices.length - 1 && (
  <>
    <div className="floating-estimate">
      <div className="small-label">Current estimate</div>
      <strong>{currency(estimate)}</strong>
      {estimate === 250 && subtotal < 250 && (
        <div className="muted">$250 minimum service charge applies</div>
      )}
    </div>

    <div className="inline-add-service">
      <div>
        <strong>Add more services in booking</strong>
        <p>You can keep building the request here without scrolling back up.</p>
      </div>
      <button
        type="button"
        className="btn btn-outline"
        onClick={addServiceToBooking}
      >
        Add another service
      </button>
    </div>
  </>
)}
                  </div>
                );
              })}
            </div>

            <div className="customer-grid">
  <Field label="First name">
    <input
      className="input"
      value={customer.firstName}
      onChange={(e) =>
        setCustomer({ ...customer, firstName: e.target.value })
      }
    />
  </Field>

  <Field label="Last name">
    <input
      className="input"
      value={customer.lastName}
      onChange={(e) =>
        setCustomer({ ...customer, lastName: e.target.value })
      }
    />
  </Field>

  <Field label="Phone">
  <>
    <input
      className="input"
      value={customer.phone}
      onChange={(e) =>
        setCustomer({ ...customer, phone: e.target.value })
      }
    />
    {customer.phone && !phoneValid && (
      <small style={{ color: "#dc2626", marginTop: "6px", display: "block" }}>
        Please enter a valid 10-digit phone number.
      </small>
    )}
  </>
</Field>

<Field label="Email">
  <>
    <input
      className="input"
      value={customer.email}
      onChange={(e) =>
        setCustomer({ ...customer, email: e.target.value })
      }
    />
    {customer.email && !emailValid && (
      <small style={{ color: "#dc2626", marginTop: "6px", display: "block" }}>
        Please enter a valid email address.
      </small>
    )}
  </>
</Field>

  <Field label="Property type">
    <select
      className="input"
      value={customer.propertyType}
      onChange={(e) =>
        setCustomer({ ...customer, propertyType: e.target.value })
      }
    >
      <option>Residential</option>
      <option>Commercial</option>
      <option>Apartment / Condo</option>
      <option>Office / Building</option>
    </select>
  </Field>

<Field label="Street address" className="span-2">
  <>
    <input
      className="input"
      value={customer.address}
      onChange={(e) =>
        setCustomer({ ...customer, address: e.target.value })
      }
    />
    {customer.address && customer.address.trim().length < 6 && (
      <small style={{ color: "#dc2626", marginTop: "6px", display: "block" }}>
        Please enter a more complete street address.
      </small>
    )}
  </>
</Field>

<Field label="City">
  <>
    <input
      className="input"
      value={customer.city}
      onChange={(e) =>
        setCustomer({ ...customer, city: e.target.value })
      }
    />
    {customer.city && customer.city.trim().length < 2 && (
      <small style={{ color: "#dc2626", marginTop: "6px", display: "block" }}>
        Please enter a valid city.
      </small>
    )}
  </>
</Field>

<Field label="ZIP code">
  <>
    <input
      className="input"
      value={customer.zip}
      onChange={(e) =>
        setCustomer({ ...customer, zip: e.target.value })
      }
    />
    {customer.zip && !/^\d{5}(-\d{4})?$/.test(customer.zip.trim()) && (
      <small style={{ color: "#dc2626", marginTop: "6px", display: "block" }}>
        Please enter a valid ZIP code.
      </small>
    )}
  </>
</Field>

<div className="span-2" style={{ marginTop: "8px" }}>
  <h3 style={{ marginBottom: "10px" }}>Recommended appointment times</h3>

  {!addressValid && (
    <p className="muted">
      Enter a valid address, city, and ZIP code to see the best route-fit times.
    </p>
  )}

  {bestFitLoading && (
    <p className="muted">Checking best-fit times...</p>
  )}

  {bestFitError && (
    <p className="muted">{bestFitError}</p>
  )}

  {bestFitOptions.length > 0 && (
    <div style={{ display: "grid", gap: "12px" }}>
 {bestFitOptions.map((option, index) => {
  const isSelected =
    selectedDate === option.date && selectedTime === option.time;

  const isRecommended = index === 0;

  return (
    <button
      key={`${option.date}-${option.time}-${index}`}
      type="button"
      className={`time-option ${isRecommended ? "recommended" : ""} ${isSelected ? "active" : ""}`}
      onClick={() => {
        setSelectedDate(option.date);
        setSelectedTime(option.time);
      }}
    >
      <div className="time-option-top">
        <div className="time-option-title">
          {isRecommended ? "⭐ Recommended" : option.label}
        </div>
        {isSelected && <span className="time-option-selected-badge">Selected</span>}
      </div>

      <div>{formatDateLabel(option.date)}</div>
      <div>{option.time}</div>
      <div className="time-option-reason">{option.reason}</div>

      {option.discount > 0 && (
        <div className="time-option-discount">
          May qualify for a grouped scheduling discount
        </div>
      )}
    </button>
  );
})}
    </div>
  )}
</div>
<div className="request-specific-date-box">
  <label className="checkbox-row">
    <input
      type="checkbox"
      checked={useSpecificDateRequest}
      onChange={(e) => {
        const checked = e.target.checked;
        setUseSpecificDateRequest(checked);

        if (!checked) {
          setSpecificDate("");
          setSpecificTimePreference("Flexible");
        }
      }}
    />
    <span>Request a specific date instead</span>
  </label>

  <small className="helper-text">
    Don’t see a date that works? Send us your preferred date and we’ll review availability before confirming.
  </small>
</div>

{!useSpecificDateRequest ? (
  <>
    <Field label="Preferred date">
      <select
        className="input"
        value={selectedDate}
        onChange={(e) => {
          const nextDate = e.target.value;
          setSelectedDate(nextDate);
          setSelectedTime("Flexible / Best available");
        }}
      >
        {dateOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>

    <Field label="Preferred arrival window">
      <select
        className="input"
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
      >
        {timeWindows.map((window) => {
          const isFlexible = window === "Flexible / Best available";
          const match = slotStatus.find((slot) => slot.window === window);
          const isAvailable = isFlexible ? true : match ? match.isAvailable : true;

          return (
            <option
              key={window}
              value={window}
              disabled={!isAvailable}
            >
              {isAvailable || isFlexible ? window : `${window} — Unavailable`}
            </option>
          );
        })}
      </select>

      {slotStatus.some((slot) => !slot.isAvailable) && (
        <small className="helper-text">
          Some time windows are full and shown as unavailable.
        </small>
      )}
    </Field>
  </>
) : (
  <>
    <Field label="Requested specific date">
      <input
        className="input"
        type="date"
        min={getTodayLocalDateString()}
        value={specificDate}
        onChange={(e) => setSpecificDate(e.target.value)}
      />
    </Field>

    <Field label="Preferred time for requested date">
      <select
        className="input"
        value={specificTimePreference}
        onChange={(e) => setSpecificTimePreference(e.target.value)}
      >
        <option value="Morning">Morning</option>
        <option value="Midday">Midday</option>
        <option value="Afternoon">Afternoon</option>
        <option value="Flexible">Flexible</option>
      </select>
    </Field>

    <small className="helper-text">
      This will be reviewed manually before confirmation.
    </small>
  </>
)}

<Field label="Notes for the technician" className="span-2">
  <textarea
    className="input textarea"
    value={customer.serviceNotes}
    onChange={(e) =>
      setCustomer({ ...customer, serviceNotes: e.target.value })
    }
  />
</Field>
</div>
<div className="review-action-wrap">
  <button
    type="button"
    className="btn btn-primary btn-review"
    onClick={handleReviewClick}
    disabled={!canSubmit || loading}
  >
    {loading ? "Sending..." : "Review Booking Request"}
  </button>

  {!canSubmit && (
    <p className="form-help">
      Please complete all required fields and enter a valid email, phone number, and address before submitting.
    </p>
  )}
</div>
          </div>

          <div className="side-stack">
          <div className="panel">
  <h3>What customers should know</h3>
  <div className="info-list">
    <InfoRow
      title="Safe cleaning products"
      text="We use professional kid- and pet-friendly cleaning products suitable for normal residential and commercial cleaning."
    />
    <InfoRow
      title="Dry times"
      text="Carpet and stairs usually dry in about 8–10 hours. Upholstery may take about 4–8 hours. Commercial encap cleaning may dry much faster."
    />
    <InfoRow
      title="Spot and stain expectations"
      text="Cleaning improves appearance significantly, but some stains, wear patterns, discoloration, and pre-existing damage may remain."
    />
    <InfoRow
      title="Area rug turnaround"
      text="Pickup and delivery rug cleaning typically takes about 2–3 weeks depending on the rug and cleaning needs."
    />
  </div>
</div>
{showReview && (
  <div className="modal-overlay">
    <div className="modal-card" ref={reviewRef}>
      <h2>Review your booking request</h2>
      <p className="muted">
        Please review your information before submitting.
      </p>

      <div className="review-section">
        <h3>Customer information</h3>
        <p><strong>Name:</strong> {customer.firstName} {customer.lastName}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Address:</strong> {customer.address}, {customer.city}, {customer.zip}</p>
        <p><strong>Property Type:</strong> {customer.propertyType}</p>
      </div>

      <div className="review-section">
        <h3>Requested services</h3>
        {selectedServices.map((item, index) => {
          const service = serviceMap[item.serviceId];
          const lineTotal = getLineEstimate(item);

          return (
            <div key={index} className="summary-line">
              <div>
                <strong>{service?.title}</strong>
               <div className="summary-sub">
  {getServiceLabel(item, service)}

  {item.addStairs && (
    <div>+ {item.stairCount} steps</div>
  )}

  {getSelectedAddOnsLabel(item) && (
    <div>Includes: {getSelectedAddOnsLabel(item)}</div>
  )}
</div>
              </div>
              <span>{currency(lineTotal)}</span>
            </div>
          );
        })}
      </div>

      <div className="review-section">
  <h4>Requested time</h4>

  {!useSpecificDateRequest ? (
    <>
      <p><strong>Date:</strong> {selectedDate}</p>
      <p><strong>Arrival Window:</strong> {selectedTime}</p>
    </>
  ) : (
    <>
      <p><strong>Requested specific date:</strong> {formatSpecificDateLabel(specificDate)}</p>
      <p><strong>Preferred time:</strong> {specificTimePreference}</p>
      <p><strong>Status:</strong> Pending availability confirmation</p>
    </>
  )}

  <p><strong>Estimated Total:</strong> {currency(estimate)}</p>
  <p><strong>Estimated Time:</strong> {estimatedHours} hours</p>
  <p><strong>Notes:</strong> {customer.serviceNotes || "None"}</p>
</div>

<div className="modal-actions">
  <button
    type="button"
    className="btn btn-secondary"
    onClick={() => {
      if (loading) return;
      setShowReview(false);
    }}
    disabled={loading}
  >
    Cancel
  </button>

  <button
    type="button"
    className="btn btn-primary"
    onClick={async () => {
      if (loading) return;
      await handleSubmit();
    }}
    disabled={loading}
  >
    {loading ? "Submitting..." : "Confirm and Submit"}
  </button>
</div>
    </div>
  </div>
)}
          </div>
        </div>
        </section>
      </>
    )}
  </div>
);
}