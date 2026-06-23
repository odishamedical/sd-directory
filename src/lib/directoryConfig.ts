export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'object_array' | 'string_array';
  placeholder?: string;
  options?: string[]; // For select type
  arrayFields?: { key: string; label: string; type: string }[]; // For object_array type
  mandatory?: boolean;
  hiddenIf?: { field: string; in: string[] }; // Hide this field if the target field's value is in the array
}

export interface TabConfig {
  id: string;
  label: string;
  fields: FieldConfig[];
}

export interface CategoryConfig {
  name: string;
  tabs: TabConfig[];
}

export const directoryConfig: Record<string, CategoryConfig> = {
  Doctor: {
    name: "Doctor",
    tabs: [
      {
        id: "professional",
        label: "Professional & Services",
        fields: [
          {
            key: "qualificationsList",
            label: "Qualifications & Education",
            type: "object_array",
            mandatory: true,
            arrayFields: [
              { key: "degree", label: "Degree (e.g., MBBS, MD)", type: "text" },
              { key: "institution", label: "Institution / University", type: "text" },
              { key: "year", label: "Passing Year", type: "text" }
            ]
          },
          {
            key: "primarySpecialty",
            label: "Primary Specialty",
            type: "text",
            mandatory: true,
            placeholder: "e.g., Cardiologist"
          },
          {
            key: "videoFee",
            label: "Video Consultation Fee (₹)",
            type: "number",
            mandatory: true,
            placeholder: "e.g., 500"
          },
          {
            key: "inClinicFee",
            label: "In-Clinic Consultation Fee (₹)",
            type: "number",
            mandatory: true,
            placeholder: "e.g., 800"
          },
          {
            key: "clinicTimings",
            label: "Clinic Timings (Supports Split Shifts)",
            type: "object_array",
            mandatory: true,
            arrayFields: [
              { key: "day", label: "Day (e.g., Monday)", type: "text" },
              { key: "morningShift", label: "Morning Shift (e.g., 9AM-1PM)", type: "text" },
              { key: "eveningShift", label: "Evening Shift (e.g., 5PM-9PM)", type: "text" }
            ]
          },
          {
            key: "experiences",
            label: "Professional Experience",
            type: "object_array",
            arrayFields: [
              { key: "role", label: "Role / Position", type: "text" },
              { key: "hospital", label: "Hospital / Institution", type: "text" },
              { key: "duration", label: "Duration (e.g. 2010 - Present)", type: "text" },
              { key: "description", label: "Description", type: "textarea" }
            ]
          },
          {
            key: "research",
            label: "Research & Publications",
            type: "object_array",
            arrayFields: [
              { key: "title", label: "Title of Paper/Research", type: "text" },
              { key: "journal", label: "Journal / Publication", type: "text" },
              { key: "year", label: "Year", type: "text" },
              { key: "link", label: "Link (Optional)", type: "text" }
            ]
          },
          {
            key: "awards",
            label: "Awards & Recognitions",
            type: "object_array",
            arrayFields: [
              { key: "title", label: "Award Title", type: "text" },
              { key: "organization", label: "Issuing Organization", type: "text" },
              { key: "year", label: "Year", type: "text" }
            ]
          }
        ]
      },
      {
        id: "consultation_setup",
        label: "Consultation Setup",
        fields: [
          { key: "offersPhysical", label: "Offers Physical In-Clinic Consultations", type: "boolean", mandatory: true },
          { key: "offersDigital", label: "Offers Digital/Video Consultations", type: "boolean", mandatory: true },
          { key: "videoMeetingLink", label: "Default Video Meeting Link (e.g. Zoom/Meet)", type: "text", placeholder: "https://zoom.us/j/123456" }
        ]
      },
      {
        id: "bank_details",
        label: "Bank Details & Payouts",
        fields: [
          { key: "accountName", label: "Account Holder Name", type: "text", mandatory: true },
          { key: "bankName", label: "Bank Name", type: "text", mandatory: true },
          { key: "accountNumber", label: "Account Number", type: "text", mandatory: true },
          { key: "ifscCode", label: "IFSC Code", type: "text", mandatory: true },
          { key: "upiId", label: "UPI ID (Optional)", type: "text" }
        ]
      }
    ]
  },
  Hospital: {
    name: "Hospital",
    tabs: [
      {
        id: "professional",
        label: "Professional & Services",
        fields: [
          {
            key: "departments",
            label: "Departments & Centers of Excellence",
            type: "object_array",
            arrayFields: [
              { key: "name", label: "Department Name (e.g. Cardiology)", type: "text" },
              { key: "head", label: "Head of Department", type: "text" },
              { key: "description", label: "Description", type: "textarea" }
            ]
          },
          {
            key: "healthPackages",
            label: "Health Packages & Preventive Care",
            type: "object_array",
            arrayFields: [
              { key: "name", label: "Package Name", type: "text" },
              { key: "price", label: "Price (₹)", type: "text" },
              { key: "features", label: "Features (Comma separated)", type: "textarea" }
            ]
          }
        ]
      },
      {
        id: "basic",
        label: "Basic Info",
        fields: [
          { key: "facilityType", label: "Facility Type", type: "select", mandatory: true, options: ["Clinic", "Poly-Clinic", "Nursing Home", "Corporate Hospital"] },
          { key: "totalBeds", label: "Total Beds", type: "text", mandatory: true, placeholder: "e.g. 500", hiddenIf: { field: "facilityType", in: ["Clinic", "Poly-Clinic"] } },
          { key: "icuCapacity", label: "ICU Capacity", type: "text", mandatory: true, placeholder: "e.g. 50", hiddenIf: { field: "facilityType", in: ["Clinic", "Poly-Clinic"] } },
          { key: "emergencyServices", label: "Emergency Services", type: "text", mandatory: true, placeholder: "e.g. 24/7 Available" }
        ]
      }
    ]
  },
  Pharmacy: {
    name: "Pharmacy",
    tabs: [
      {
        id: "professional",
        label: "Professional & Services",
        fields: [
          { key: "businessType", label: "Business Type", type: "select", mandatory: true, options: ["Retail Pharmacy", "Wholesaler / Distributor", "Pharma Manufacturer"] },
          { key: "gstin", label: "GSTIN Number", type: "text", mandatory: true },
          { key: "retailLicense", label: "Retail Drug License No.", type: "text", mandatory: true },
          { key: "wholesaleLicense", label: "Wholesale Drug License No.", type: "text" },
          { key: "manufacturingLicense", label: "Manufacturing License No.", type: "text" },
          { key: "homeDeliveryRadius", label: "Home Delivery Radius", type: "text", placeholder: "e.g. 5 KM" },
          { key: "is247", label: "Open 24/7", type: "boolean" },
          { key: "timings", label: "Timings", type: "text", placeholder: "e.g. Mon-Sat 8AM - 9PM" }
        ]
      }
    ]
  },
  Lab: {
    name: "Lab",
    tabs: [
      {
        id: "professional",
        label: "Professional & Services",
        fields: [
          { key: "labType", label: "Lab Type", type: "select", mandatory: true, options: ["Pathology", "Radiology", "Blood Bank"] },
          { key: "accreditations", label: "Accreditations (e.g. NABL)", type: "string_array", placeholder: "Add accreditation" },
          { key: "homeCollection", label: "Home Sample Collection", type: "boolean", mandatory: true },
          { key: "is247", label: "Open 24/7", type: "boolean" },
          { key: "timings", label: "Timings", type: "text", mandatory: true, placeholder: "e.g. Mon-Sat 8AM - 9PM" }
        ]
      }
    ]
  },
  Ambulance: {
    name: "Ambulance",
    tabs: [
      {
        id: "professional",
        label: "Professional & Services",
        fields: [
          { key: "ambulanceType", label: "Ambulance Type", type: "select", mandatory: true, options: ["Basic Life Support (BLS)", "Advanced Life Support (ALS)", "Patient Transport Vehicle"] },
          { key: "fleetSize", label: "Fleet Size", type: "number", mandatory: true, placeholder: "e.g. 5" },
          { key: "oxygenAvailable", label: "Oxygen Available", type: "boolean" },
          { key: "ventilatorAvailable", label: "Ventilator Available", type: "boolean" },
          { key: "is247", label: "Available 24/7", type: "boolean" },
          { key: "baseLocation", label: "Base Location / Station", type: "text", mandatory: true }
        ]
      }
    ]
  }
};
