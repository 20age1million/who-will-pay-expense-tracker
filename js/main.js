import { loadDataDisplay } from "./dataDisplay.js";
import { loadNextPayment } from "./nextPayment.js";
import { loadWriteNewPayment } from "./writeNewPayment.js";
import { loadLoginPage } from "./login.js";
import { submitPayment } from "./writeNewPayment.js";

window.showPage = showPage;
window.goBack = goBack;
window.submitPayment = submitPayment;

// initialize page when first loaded
window.onload = function () {
  showPage("dataDisplay");
};

// Function for the "Back" button
function goBack() {
  window.location.href = "../../";
}

// Function to switch pages
function showPage(pageID) {
  if (pageID === "dataDisplay") {
    loadDataDisplay();
  } else if (pageID === "nextPayment") {
    loadNextPayment();
  } else if (pageID === "writeNewPayment") {
    loadLoginPage(() => {
      loadWriteNewPayment();
    });
  } else {
    document.getElementById("content").innerHTML =
      "<p>Error, no page found.</p>";
  }
}
