(function(){
  const params = new URLSearchParams(window.location.search);
  const form = document.getElementById('leadForm');
  if (form){
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(k=>{
      const el = form.querySelector(`input[name="${k}"]`);
      if (el && params.get(k)) el.value = params.get(k);
    });
    form.addEventListener('submit', (e)=>{
      const phone = form.querySelector('input[name="phone"]');
      const email = form.querySelector('input[name="email"]');
      const consent = form.querySelector('input[name="consent"]');
      let ok = true;
      if (phone && phone.value.replace(/\D/g,'').length < 10){ ok=false; alert('Please enter a valid phone number.'); }
      if (email && !/.+@.+\..+/.test(email.value)){ ok=false; alert('Please enter a valid email.'); }
      if (consent && !consent.checked){ ok=false; alert('Please consent to be contacted.'); }
      if (!ok) e.preventDefault();
    });
  }
  const year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear();
})();