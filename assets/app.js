document.querySelectorAll('.save-btn').forEach((button) => {
  button.addEventListener('click', () => {
    button.classList.toggle('saved');
    button.textContent = button.classList.contains('saved') ? '♥' : '♡';
  });
});

document.querySelectorAll('[data-bs-target="#bookingModal"]').forEach((button) => {
  button.addEventListener('click', () => {
    const field = document.getElementById('experienceName');
    if (field) field.value = button.dataset.experience || '';
  });
});

const requestedTabContent = window.location.hash
  ? document.querySelector(window.location.hash)
  : null;
const requestedTabPane = requestedTabContent?.classList.contains('tab-pane')
  ? requestedTabContent
  : requestedTabContent?.closest('.tab-pane');
if (requestedTabPane && window.bootstrap?.Tab) {
  const tabButton = document.querySelector('[data-bs-target="#' + requestedTabPane.id + '"]');
  if (tabButton) window.bootstrap.Tab.getOrCreateInstance(tabButton).show();
}

const basketSummary = document.getElementById('basketSummary');
if (basketSummary && Number.parseInt(basketSummary.querySelector('span').textContent, 10) > 0) {
  basketSummary.classList.add('visible');
}

const sectionLinks = [...document.querySelectorAll('.secondary-nav-wrap a[href^="#"]')];
if ('IntersectionObserver' in window && sectionLinks.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((link) => {
        link.classList.toggle('active', link.hash === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-28% 0px -62% 0px' });
  sectionLinks.forEach((link) => {
    const section = document.querySelector(link.hash);
    if (section) sectionObserver.observe(section);
  });
}
