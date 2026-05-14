import { createHash } from "crypto";
import { writeFileSync } from "fs";

const apartments = [
  { number: "1001", code: "1234" },
  { number: "1002", code: "1234" },
  { number: "1003", code: "1234" },
  { number: "1004", code: "1234" }
];

function hash(apartmentNumber, code) {
  return createHash("sha256")
    .update(`${apartmentNumber}:${code}`)
    .digest("hex");
}

const sql = apartments.map((apartment) => {
  return `INSERT OR REPLACE INTO apartments (apartment_number, booking_code_hash)
VALUES ('${apartment.number}', '${hash(apartment.number, apartment.code)}');`;
}).join("\n\n");

writeFileSync("seed.sql", `${sql}\n`);

console.log("Created seed.sql");
console.log("");
console.log("Demo-login:");
for (const apartment of apartments) {
  console.log(`${apartment.number} / ${apartment.code}`);
}
