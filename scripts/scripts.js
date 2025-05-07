     function openModal(img) {
      const modal = document.getElementById("imageModal");
      const modalImg = document.getElementById("modalImage");
      const modalCaption = document.getElementById("modalCaption");
      modalImg.src = img.src;
      modalCaption.textContent = img.dataset.caption || ""; // fallback to empty if no caption
      modal.style.display = "flex";
    }

    function closeModal() {
      document.getElementById("imageModal").style.display = "none";
    }



      const sections = document.querySelectorAll('.country-divider');
      const tabs = document.querySelectorAll('.hover-tab');

      function getCurrentSection() {
        let index = sections.length - 1;
        for (let i = 0; i < sections.length; i++) {
          const rect = sections[i].getBoundingClientRect();
          if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
            index = i;
            break;
          }
        }
        return sections[index].id;
      }

      function updateActiveTab() {
        const current = getCurrentSection();

        tabs.forEach(tab => {
          if (tab.dataset.section === current) {
            tab.classList.add('active');
          } else {
            tab.classList.remove('active');
          }
        });
      }

      window.addEventListener('scroll', updateActiveTab);
      window.addEventListener('load', updateActiveTab);


document.addEventListener("DOMContentLoaded", () => {
            const sections = document.querySelectorAll('.country-divider');
            const tabs = document.querySelectorAll('.hover-tab');

            function getCurrentSection() {
              let current = null;

              sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= window.innerHeight / 2) {
                  current = section.id;
                }
              });

              return current;
            }
            function updateActiveTab() {
              const current = getCurrentSection();

              tabs.forEach(tab => {
                if (tab.dataset.section === current) {
                  tab.classList.add('active');
                } else {
                  tab.classList.remove('active');
                }
              });
            }

            window.addEventListener('scroll', updateActiveTab);
            updateActiveTab(); // call once on load
          });
