class RegisterationFormValidation {
  constructor(element, api_link) {
    this.usernames = [];
    this.emails = [];
    this.api_link = api_link;

    // Initialize DOM elements

    this.username = element.querySelector("#username");
    this.email = element.querySelector("#email");
    this.password = element.querySelector("#password");
    this.submit = element.querySelector("#registerbtn");

    //Warning boxes
    this.usernamewarningbox = element.querySelector("#usernamewarningbox");
    this.usernamewarningbox.style.display = "none";
    this.emailwarningbox = element.querySelector("#emailwarningbox");
    this.emailwarningbox.style.display = " none";
    this.passwordwarningbox = element.querySelector("#passwordwarningbox");
    this.passwordwarningbox.style.display = " none";

    // Hide submit button initially
    this.submit.style.display = "none";

    // Fetch user data and add event listeners
    this.getUserdata();
    this.username.addEventListener("keyup", this.showSubmitButton.bind(this));
    this.email.addEventListener("keyup", this.showSubmitButton.bind(this));
    this.password.addEventListener("keyup", this.showSubmitButton.bind(this));
  }

  validUsername() {
    const username_input = this.username.value.trim().toLowerCase();
    const isNotValid = this.usernames.filter(
      (currentUsername) => currentUsername.toLowerCase() === username_input
    );
    if (isNotValid.length) {
      this.usernamewarningbox.style.display = "block";
      this.usernamewarningbox.textContent =
        "Username already exists. Please choose another one.";
      return false;
    } else if (username_input.length === 0) {
      this.usernamewarningbox.textContent = "Username cannot be empty.";
      return false;
    } else {
      // this.usernamewarningbox.textContent = "";
      this.usernamewarningbox.style.display = "none";
      return true;
    }
  }

  validEmail() {
    const email_input = this.email.value.trim().toLowerCase();
    const isNotValid = this.emails.filter(
      (currentEmail) => currentEmail.toLowerCase() === email_input
    );
    console.log(isNotValid, "after filtering");
    console.log(email_input, "User input");
    if (isNotValid.length) {
      this.emailwarningbox.style.display = "block";
      this.emailwarningbox.textContent =
        "Email already registered. Please use another email.";
      return false;
    } else if (email_input.length === 0) {
      this.emailwarningbox.style.display = "block";
      this.emailwarningbox.textContent = "Email cannot be empty.";
      return false;
    } else if (!this.isValidEmailFormat(email_input)) {
      this.emailwarningbox.style.display = "block";
      this.emailwarningbox.textContent = "Invalid email format.";
      return false;
    } else {
      this.emailwarningbox.style.display = "none";
      return true;
    }
  }

  validPassword() {
    const password_input = this.password.value.trim();
    if (password_input.length < 6) {
      this.passwordwarningbox.style.display = "block";
      this.passwordwarningbox.textContent =
        "Password must be at least 6 characters long.";
      return false;
    } else if (!/[A-Z]/.test(password_input)) {
      this.passwordwarningbox.style.display = "block";
      this.passwordwarningbox.textContent =
        "Password must contain at least one uppercase letter.";
      return false;
    } else if (!/[a-z]/.test(password_input)) {
      this.passwordwarningbox.style.display = "block";
      this.passwordwarningbox.textContent =
        "Password must contain at least one lowercase letter.";
      return false;
    } else if (!/\d/.test(password_input)) {
      this.passwordwarningbox.style.display = "block";
      this.passwordwarningbox.textContent =
        "Password must contain at least one number.";
      return false;
    } else if (!/[@$!%*?&]/.test(password_input)) {
      this.passwordwarningbox.style.display = "block";
      this.passwordwarningbox.textContent =
        "Password must contain at least one special character (@, $, !, %, *, ?, &).";
      return false;
    } else {
      this.passwordwarningbox.style.display = "none";
      return true;
    }
  }

  isValidEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showSubmitButton() {
    const isFormValid =
      this.validUsername() && this.validEmail() && this.validPassword();
    if (isFormValid) {
      console.log("show the submit button");
    }
    this.submit.style.display = isFormValid ? "block" : "none";
  }

  async fetchUserData(api_link) {
    try {
      const response = await fetch(api_link);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      return await response.json(); // Return parsed JSON data
    } catch (error) {
      console.error("Error fetching user data:", error);
      this.warningBox.textContent = "There was an error fetching the data.";
    }
  }

  async getUserdata() {
    const userData = await this.fetchUserData(this.api_link);
    if (userData) {
      userData.forEach((current_user) => {
        this.usernames.push(current_user.username);
        this.emails.push(current_user.email);
      });
      console.log("Usernames:", this.usernames);
      console.log("Emails:", this.emails);
    }
  }
}

// Initialize the registration form validation
const registrationForm = new RegisterationFormValidation(
  document.querySelector("#registrationForm"),
  "/get_json_data_user"
);
