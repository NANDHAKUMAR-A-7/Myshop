import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ELEMENTS

const emailForm = document.getElementById("emailRegisterForm");

const phoneForm = document.getElementById("phoneRegisterForm");

const emailTab = document.getElementById("emailTab");

const phoneTab = document.getElementById("phoneTab");

const message = document.getElementById("registerMessage");

const registerBtn = document.getElementById("registerBtn");

const googleBtn = document.getElementById("googleRegisterBtn");


// MESSAGE FUNCTION

function showMessage(text, type = "error") {

    message.textContent = text;

    message.className = `auth-message ${type}`;

}


// AUTH ERROR HANDLER

function getAuthError(code) {

    const errors = {

        "auth/email-already-in-use":
            "This email is already registered. Please login.",

        "auth/invalid-email":
            "Please enter a valid email address.",

        "auth/weak-password":
            "Please choose a stronger password.",

        "auth/operation-not-allowed":
            "This login method is not enabled in Firebase.",

        "auth/too-many-requests":
            "Too many attempts. Please try again later.",

        "auth/network-request-failed":
            "Network error. Check your internet connection.",

        "auth/popup-closed-by-user":
            "Google registration was cancelled.",

        "auth/invalid-phone-number":
            "Enter a valid mobile number.",

        "auth/quota-exceeded":
            "OTP quota exceeded. Try again later.",

        "auth/invalid-verification-code":
            "Incorrect OTP. Please try again.",

        "auth/code-expired":
            "OTP expired. Request a new OTP."

    };

    return errors[code] || "Registration failed. Please try again.";

}


// PASSWORD VISIBILITY

document.querySelectorAll(".toggle-password")
.forEach(button => {

    button.addEventListener("click", () => {

        const target = document.getElementById(
            button.dataset.target
        );

        const show = target.type === "password";

        target.type = show ? "text" : "password";

        button.innerHTML = show
            ? '<i class="fa-regular fa-eye-slash"></i>'
            : '<i class="fa-regular fa-eye"></i>';

    });

});


// TAB SWITCHING

emailTab.addEventListener("click", () => {

    emailForm.classList.remove("hidden");

    phoneForm.classList.add("hidden");

    emailTab.classList.add("active");

    phoneTab.classList.remove("active");

    showMessage("");

});


phoneTab.addEventListener("click", () => {

    phoneForm.classList.remove("hidden");

    emailForm.classList.add("hidden");

    phoneTab.classList.add("active");

    emailTab.classList.remove("active");

    showMessage("");

});


// PASSWORD VALIDATION

function validatePassword(password) {

    const strongPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    return strongPassword.test(password);

}


// SAVE CUSTOMER DETAILS

async function saveCustomer(user, details = {}) {

    const userRef = doc(db, "users", user.uid);

    await setDoc(userRef, {

        uid: user.uid,

        name: details.name || user.displayName || "",

        email: user.email || null,

        phone: details.phone || user.phoneNumber || null,

        provider: details.provider || "password",

        createdAt: serverTimestamp(),

        lastLogin: serverTimestamp()

    }, { merge: true });

}


// SUCCESS REDIRECT

async function completeRegistration(user, details = {}) {

    try {

        await saveCustomer(user, details);

        showMessage(
            "Welcome to AURA! Your account is ready.",
            "success"
        );

        setTimeout(() => {

            window.location.href = "index.html";

        }, 1500);

    } catch (error) {

        console.error(error);

        showMessage(
            "Your account was created, but your profile could not be saved. Please contact support."
        );

    }

}


// EMAIL REGISTRATION

emailForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = document.getElementById("fullName")
        .value.trim();

    const email = document.getElementById("registerEmail")
        .value.trim();

    const phone = document.getElementById("registerPhone")
        .value.trim();

    const password = document.getElementById("registerPassword")
        .value;

    const confirmPassword = document.getElementById("confirmPassword")
        .value;

    const terms = document.getElementById("terms").checked;


    if (name.length < 2) {

        showMessage("Please enter your full name.");

        return;

    }

    if (!/^[6-9]\d{9}$/.test(phone)) {

        showMessage("Enter a valid 10-digit Indian mobile number.");

        return;

    }

    if (!validatePassword(password)) {

        showMessage(
            "Password must have 8 characters, uppercase, lowercase and a number."
        );

        return;

    }

    if (password !== confirmPassword) {

        showMessage("Passwords do not match.");

        return;

    }

    if (!terms) {

        showMessage("Please accept the Terms and Conditions.");

        return;

    }


    registerBtn.disabled = true;

    try {

        const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        await updateProfile(result.user, {
            displayName: name
        });

        await completeRegistration(result.user, {
            name: name,
            phone: "+91" + phone,
            provider: "password"
        });

    } catch (error) {

        console.error(error);

        showMessage(getAuthError(error.code));

    } finally {

        registerBtn.disabled = false;

    }

});


// GOOGLE REGISTRATION

googleBtn.addEventListener("click", async () => {

    googleBtn.disabled = true;

    try {

        const provider = new GoogleAuthProvider();

        const result = await signInWithPopup(auth, provider);

        await completeRegistration(result.user, {
            name: result.user.displayName || "",
            provider: "google"
        });

    } catch (error) {

        console.error(error);

        showMessage(getAuthError(error.code));

    } finally {

        googleBtn.disabled = false;

    }

});


// PHONE OTP REGISTRATION

let confirmationResult = null;

let recaptchaVerifier = null;


function setupRecaptcha() {

    if (recaptchaVerifier) return;

    recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
            size: "normal",

            callback: () => {
                console.log("reCAPTCHA verified");
            },

            "expired-callback": () => {
                showMessage("Verification expired. Try again.");
            }

        }
    );

}


// SEND OTP

document.getElementById("sendRegisterOtpBtn")
.addEventListener("click", async () => {

    const name = document.getElementById("phoneName")
        .value.trim();

    const phone = document.getElementById("phoneRegisterNumber")
        .value.trim();

    const terms = document.getElementById("phoneTerms").checked;


    if (name.length < 2) {

        showMessage("Please enter your full name.");

        return;

    }

    if (!/^[6-9]\d{9}$/.test(phone)) {

        showMessage("Enter a valid 10-digit mobile number.");

        return;

    }

    if (!terms) {

        showMessage("Please accept the Terms and Conditions.");

        return;

    }


    const button = document.getElementById("sendRegisterOtpBtn");

    button.disabled = true;

    try {

        setupRecaptcha();

        await recaptchaVerifier.render();

        confirmationResult = await signInWithPhoneNumber(
            auth,
            "+91" + phone,
            recaptchaVerifier
        );

        document.getElementById("registerOtpGroup")
            .classList.remove("hidden");

        document.getElementById("verifyRegisterOtpBtn")
            .classList.remove("hidden");

        showMessage("OTP sent successfully.", "success");

    } catch (error) {

        console.error(error);

        showMessage(getAuthError(error.code));

        if (recaptchaVerifier) {

            recaptchaVerifier.clear();

            recaptchaVerifier = null;

        }

    } finally {

        button.disabled = false;

    }

});


// VERIFY OTP

document.getElementById("verifyRegisterOtpBtn")
.addEventListener("click", async () => {

    const otp = document.getElementById("registerOtp")
        .value.trim();

    if (!/^\d{6}$/.test(otp)) {

        showMessage("Enter the valid 6-digit OTP.");

        return;

    }

    if (!confirmationResult) {

        showMessage("Please request OTP first.");

        return;

    }


    const button = document.getElementById("verifyRegisterOtpBtn");

    button.disabled = true;

    try {

        const result = await confirmationResult.confirm(otp);

        const name = document.getElementById("phoneName")
            .value.trim();

        await updateProfile(result.user, {
            displayName: name
        });

        await completeRegistration(result.user, {
            name: name,
            provider: "phone"
        });

    } catch (error) {

        console.error(error);

        showMessage(getAuthError(error.code));

    } finally {

        button.disabled = false;

    }

});