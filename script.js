// ===== Reveal on scroll =====
const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: unobserve after reveal for performance
        // revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  }
);

reveals.forEach((el) => revealObserver.observe(el));

// ===== FAQ Accordion =====
document.querySelectorAll('.faq-q').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isActive = item.classList.contains('active');

    // Close all
    document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('active'));

    // Open clicked if it was closed
    if (!isActive) {
      item.classList.add('active');
    }
  });
});

// ===== Smooth nav highlight (optional polish) =====
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach((section) => {
    const top = section.offsetTop - 120;
    if (scrollY >= top) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    link.style.color = '';
    if (link.getAttribute('href') === `#${current}`) {
      link.style.color = 'var(--text)';
    }
  });
});
