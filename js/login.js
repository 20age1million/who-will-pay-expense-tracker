export function loadLoginPage(redirectPageCallback) {
  // change page content
  const content = document.getElementById("content");
  const template = document.getElementById("loginPage");
  if (template) {
    content.innerHTML = template.innerHTML;
  } else {
    content.innerHTML = "<p>Error, no page found.</p>";
  }

  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Login form submitted");
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Replace with real authentication logic
    if (username === "admin" && password === "12345") {
      localStorage.setItem("token", "dummyToken");
      redirectPageCallback();
    } else {
      alert("Invalid login");
    }
  });
}
