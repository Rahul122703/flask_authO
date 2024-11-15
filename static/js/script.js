const userMenuButton = document.getElementById("user-menu-button");
const userMenu = document.querySelector('[aria-labelledby="user-menu-button"]');

if (userMenuButton) {
  userMenuButton.addEventListener("click", () => {
    userMenu.classList.toggle("hidden");
  });
  const mobileMenuButton = document.querySelector(
    '[aria-controls="mobile-menu"]'
  );
  const mobileMenu = document.getElementById("mobile-menu");

  mobileMenuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

// Open the modal
openModalBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

// Close the modal
closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

const modal2 = document.getElementById("modal2");
const openModalBtn2 = document.getElementById("openModalBtn2");
const closeModalBtn2 = document.getElementById("closeModalBtn2");

// Open the modal
openModalBtn2.addEventListener("click", () => {
  modal2.classList.remove("hidden");
});

// Close the modal
closeModalBtn2.addEventListener("click", () => {
  modal2.classList.add("hidden");
});

// Close the modal if clicking outside of it
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
});
