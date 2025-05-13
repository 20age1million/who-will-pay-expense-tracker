const COLOR_PALETTE = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FFCD56",
    "#C9CBCF",
    "#4D5360",
    "#F7464A",
    "#46BFBD",
    "#FDB45C",
  ];

// ----- Data Display Page Functions ----- //
export function loadDataDisplay() {
  // change page content
  const content = document.getElementById("content");
  const template = document.getElementById("dataDisplay");
  if (template) {
    content.innerHTML = template.innerHTML;
  } else {
    content.innerHTML = "<p>Error, no page found.</p>";
  }

  let numberChart = document.getElementById("DDNumberChart");
  let numberC = numberChart.getContext("2d");

  let amountChart = document.getElementById("DDAmountChart");
  let amountC = amountChart.getContext("2d");

  let dataValues = document.getElementById("dataValues");

  fetch(`/api/WWP/getDisplayData?ts=${Date.now()}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Data received:", data);
      let labels = Object.keys(data);
      let amount = Object.values(data).map((info) => info[0]);
      let number = Object.values(data).map((info) => info[1]);

      let colors = labels.map(
        (_, index) => COLOR_PALETTE[index % COLOR_PALETTE.length]
      );

      let chartNumber = {
        labels: labels,
        datasets: [
          {
            data: number,
            backgroundColor: colors,
          },
        ],
      };

      let chartAmount = {
        labels: labels,
        datasets: [
          {
            data: amount,
            backgroundColor: colors,
          },
        ],
      };

      let options = {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
          datalabels: {
            color: "#000",
            font: {
              size: 14,
              weight: "bold",
            },
            formatter: (value, ctx) => {
              return ctx.chart.data.labels[ctx.dataIndex] + ": " + value;
            },
          },
        },
      };

      new Chart(amountC, {
        type: "pie",
        data: chartAmount,
        options: options,
        plugins: [ChartDataLabels],
      });

      new Chart(numberC, {
        type: "pie",
        data: chartNumber,
        options: options,
        plugins: [ChartDataLabels],
      });

      let sum_amount = amount.reduce((sum, val) => sum + val, 0).toFixed(2);
      let sum_number = number.reduce((sum, val) => sum + val, 0);
      let average = sum_number > 0 ? (sum_amount / sum_number).toFixed(2) : 0;

      dataValues.innerHTML = `
            <p><strong>Total Amount:</strong> ${sum_amount}</p>
            <p><strong>Total Number:</strong> ${sum_number}</p>
            <p><strong>Average Amount:</strong> ${average}</p>
            `;
    })
    .catch((error) => {
      console.error("Fetch Error:", error);
    });
}