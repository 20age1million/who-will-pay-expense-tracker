import { SpinWheel } from "./SpinWheel.js";

// ----- Next Payment Page Functions ----- //
export function loadNextPayment() {
  // change page content
  const content = document.getElementById("content");
  const template = document.getElementById("nextPayment");
  if (template) {
    content.innerHTML = template.innerHTML;
  } else {
    content.innerHTML = "<p>Error, no page found.</p>";
  }

  fetch(
    `https://api.wwp.20age1million.com/getNextPayment?ts=${Date.now()}`
  )
    .then((response) => response.json())
    .then((data) => {
      // Convert the format of
      // {"Alice": 2,
      //  "Bob": 1,
      //  "Charlie": 4,
      //  "David": 10}
      // to
      // [{ name: "Alice", weight: 2 },
      //  { name: "Bob", weight: 1 },
      //  { name: "Charlie", weight: 4 },
      //  { name: "David", weight: 10 }]

      const persons = Object.entries(data).map(([name, weight]) => ({
        name,
        weight,
      }));
      console.log(persons);

      new SpinWheel("paymentWheel", "spinPaymentButton", persons);
    })
    .catch((error) => console.error("Fetch error:", error));
}
