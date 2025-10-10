export function loadWriteNewPayment() {
  // change page content
  const content = document.getElementById("content");
  const template = document.getElementById("writeNewPayment");
  if (template) {
    content.innerHTML = template.innerHTML;
  } else {
    content.innerHTML = "<p>Error, no page found.</p>";
  }

  // set default date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("payDate").value = today;

  // fetch names and fill into select person
  fetch("/api/WWP/getDisplayData")
  // fetch(`https://20age1million.com/api/WWP/getDisplayData`)
    .then((res) => res.json())
    .then((nameDict) => {
      let nameList = Object.keys(nameDict);
      let select = document.getElementById("payer");
      nameList.forEach((name) => {
        let option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
      });
    })
    .catch((error) => console.error("failed to get name list"));
}

export function submitPayment() {
  const name = document.getElementById("payer").value;
  const amount = parseFloat(document.getElementById("payAmount").value);
  const date = document.getElementById("payDate").value;

  if (!name || !amount || !date) {
    alert("Please enter full info.");
    return;
  }
  if (amount <= 0) {
    alert("Please enter valid amount");
    return;
  }

  const data = { name: name, amount: amount, time: date };

  fetch("https://20age1million.com/api/WWP/writeNewPayment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Server response was not ok");
      }
      return res.json();
    })
    .then((response) => {
      console.log("submit succeed, return:", response);

      document.getElementById("payAmount").value = "";
      document.getElementById("payDate").value = new Date()
        .toISOString()
        .split("T")[0];

      alert("submit succeed!");
    })
    .catch((error) => {
      console.error("submit failed", error);
      alert("Submit falied", error);
    });
}
