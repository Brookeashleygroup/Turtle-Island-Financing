// Year in footer
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Capture UTM params into hidden fields
(function () {
  const params = new URLSearchParams(window.location.search);
  const utms = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"];
  utms.forEach(key => {
    const el = document.querySelector(`input[name="${key}"]`);
    if (el && params.get(key)) el.value = params.get(key);
  });
})();
