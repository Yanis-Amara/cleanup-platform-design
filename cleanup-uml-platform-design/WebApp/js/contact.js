// Form validation and submission
function handleSubmit(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const subject = document.getElementById('subject');
    const message = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    
    let isValid = true;
  
    // Reset errors
    document.querySelectorAll('.input, .textarea, .select').forEach(input => {
      input.classList.remove('error');
    });
  
    // Validate fields
    if (firstName.value.trim().length < 2) {
      firstName.classList.add('error');
      isValid = false;
    }
    
    if (lastName.value.trim().length < 2) {
      lastName.classList.add('error');
      isValid = false;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      email.classList.add('error');
      isValid = false;
    }
  
    if (!subject.value) {
      subject.classList.add('error');
      isValid = false;
    }
  
    if (message.value.trim().length < 10) {
      message.classList.add('error');
      isValid = false;
    }
  
    if (isValid) {
      // Disable button and show loading
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
  
      // Simulate API call
      setTimeout(() => {
        // Show success message
        successMessage.classList.add('show');
        
        // Reset form
        document.getElementById('contactForm').reset();
        
        // Reset button
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
  
        // Hide success message after 5 seconds
        setTimeout(() => {
          successMessage.classList.remove('show');
        }, 5000);
  
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 1500);
    }
  }
  
  // Remove error on input
  document.querySelectorAll('.input, .textarea, .select').forEach(input => {
    input.addEventListener('input', function() {
      this.classList.remove('error');
    });
  });
  
  // FAQ toggle
  function toggleFaq(element) {
    const isActive = element.classList.contains('active');
    
    // Close all FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
      item.classList.remove('active');
    });
  
    // Open clicked FAQ if it wasn't active
    if (!isActive) {
      element.classList.add('active');
    }
  }
  
  // Live chat simulation
  function openLiveChat() {
    alert('Live chat would open here. (This is a demo)\n\nIn production, this would connect to your chat service like Intercom, Drift, or Zendesk.');
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if(target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  