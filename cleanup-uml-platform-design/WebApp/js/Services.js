document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.service-card');
  const filterButtons = document.querySelectorAll('.filter-btn');

  // Filter functionality
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category || 'all';

      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter cards
      cards.forEach(card => {
        const cardCategory = card.dataset.category;
        if (category === 'all' || cardCategory === category) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Smooth scroll for anchor links (ex: bouton du hero vers #services)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Plus de gestion JS pour .btn-book / .btn-learn :
  // - les boutons "Book Now" sont des <a href="../html/Home.html#bookingForm">
  //   donc le navigateur redirige directement vers la page Home.
});
