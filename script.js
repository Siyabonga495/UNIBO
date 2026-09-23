/* =========================================================
   UNIEASY - INTERACTIVE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       MOBILE MENU
    ========================== */

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const mainNavigation =
        document.getElementById("mainNavigation");

    if (mobileMenuButton && mainNavigation) {

        mobileMenuButton.addEventListener("click", function () {

            mainNavigation.classList.toggle("open");

            const isOpen =
                mainNavigation.classList.contains("open");

            mobileMenuButton.setAttribute(
                "aria-expanded",
                isOpen
            );

            mobileMenuButton.textContent =
                isOpen ? "✕" : "☰";
        });


        const navigationLinks =
            mainNavigation.querySelectorAll("a");

        navigationLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                mainNavigation.classList.remove("open");

                mobileMenuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

                mobileMenuButton.textContent = "☰";

            });

        });

    }


    /* =========================
       DARK MODE
    ========================== */

    const darkModeButton =
        document.getElementById("darkModeButton");

    const savedTheme =
        localStorage.getItem("unieasy_theme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark-mode");

        if (darkModeButton) {
            darkModeButton.textContent = "☀️";
        }

    }


    if (darkModeButton) {

        darkModeButton.addEventListener("click", function () {

            document.body.classList.toggle("dark-mode");

            const darkMode =
                document.body.classList.contains("dark-mode");

            localStorage.setItem(
                "unieasy_theme",
                darkMode ? "dark" : "light"
            );

            darkModeButton.textContent =
                darkMode ? "☀️" : "🌙";

        });

    }


    /* =========================
       APPLY FOR ME
    ========================== */

    const openApplyForMe =
        document.getElementById("openApplyForMe");

    const closeApplyForMe =
        document.getElementById("closeApplyForMe");

    const applyForMeSection =
        document.getElementById("applyForMeSection");


    function openApplicationSection() {

        if (!applyForMeSection) {
            return;
        }

        applyForMeSection.hidden = false;

        applyForMeSection.classList.add("fade-in");

        setTimeout(function () {

            applyForMeSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 50);


        const firstName =
            document.getElementById("firstName");

        if (firstName) {

            setTimeout(function () {
                firstName.focus();
            }, 650);

        }

    }


    if (openApplyForMe) {

        openApplyForMe.addEventListener(
            "click",
            openApplicationSection
        );

    }


    if (closeApplyForMe) {

        closeApplyForMe.addEventListener(
            "click",
            function () {

                applyForMeSection.hidden = true;

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /* =========================
       UNIVERSITY SEARCH
    ========================== */

    const universitySearch =
        document.getElementById("universitySearch");

    const provinceFilter =
        document.getElementById("provinceFilter");

    const typeFilter =
        document.getElementById("typeFilter");

    const resultCount =
        document.getElementById("resultCount");

    const noResults =
        document.getElementById("noResults");

    const universityCards =
        document.querySelectorAll(".university-card");


    function filterUniversities() {

        const searchValue =
            universitySearch
                ? universitySearch.value
                    .toLowerCase()
                    .trim()
                : "";

        const provinceValue =
            provinceFilter
                ? provinceFilter.value
                : "all";

        const typeValue =
            typeFilter
                ? typeFilter.value
                : "all";


        let visibleCount = 0;


        universityCards.forEach(function (card) {

            const name =
                (card.dataset.name || "")
                    .toLowerCase();

            const province =
                card.dataset.province || "";

            const type =
                card.dataset.type || "";


            const matchesSearch =
                name.includes(searchValue);

            const matchesProvince =
                provinceValue === "all" ||
                province === provinceValue;

            const matchesType =
                typeValue === "all" ||
                type === typeValue;


            if (
                matchesSearch &&
                matchesProvince &&
                matchesType
            ) {

                card.style.display = "flex";

                visibleCount++;

            } else {

                card.style.display = "none";

            }

        });


        if (resultCount) {
            resultCount.textContent = visibleCount;
        }


        if (noResults) {

            noResults.hidden =
                visibleCount !== 0;

        }

    }


    if (universitySearch) {

        universitySearch.addEventListener(
            "input",
            filterUniversities
        );

    }


    if (provinceFilter) {

        provinceFilter.addEventListener(
            "change",
            filterUniversities
        );

    }


    if (typeFilter) {

        typeFilter.addEventListener(
            "change",
            filterUniversities
        );

    }


    /* =========================
       UNIVERSITY CARD EFFECT
    ========================== */

    universityCards.forEach(function (card) {

        card.addEventListener("mouseenter", function () {

            universityCards.forEach(function (otherCard) {

                if (otherCard !== card) {
                    otherCard.style.opacity = "0.72";
                }

            });

        });


        card.addEventListener("mouseleave", function () {

            universityCards.forEach(function (otherCard) {

                otherCard.style.opacity = "1";

            });

        });

    });


    /* =========================
       APPLICATION FORM
    ========================== */

    const applicationForm =
        document.getElementById("applyForMeForm");

    const applicationMessage =
        document.getElementById(
            "applicationFormMessage"
        );


    if (applicationForm) {

        applicationForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                if (!applicationForm.checkValidity()) {

                    applicationForm.reportValidity();

                    return;

                }


                if (applicationMessage) {

                    applicationMessage.className =
                        "form-message success";

                    applicationMessage.innerHTML =
                        "✅ Your information has been completed successfully. " +
                        "The current UniEasy website is a demonstration, " +
                        "so no real application has been submitted yet.";

                }


                applicationMessage.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }
        );

    }


    /* =========================
       FILE SIZE VALIDATION
    ========================== */

    const fileInputs =
        document.querySelectorAll(
            'input[type="file"]'
        );


    fileInputs.forEach(function (input) {

        input.addEventListener("change", function () {

            const files = Array.from(input.files);

            const maxSize =
                5 * 1024 * 1024;


            for (const file of files) {

                if (file.size > maxSize) {

                    alert(
                        `"${file.name}" is larger than 5 MB. ` +
                        "Please choose a smaller file."
                    );

                    input.value = "";

                    return;

                }

            }

        });

    });


    /* =========================
       ID NUMBER CLEANING
    ========================== */

    const idNumber =
        document.getElementById("idNumber");


    if (idNumber) {

        idNumber.addEventListener(
            "input",
            function () {

                this.value =
                    this.value.replace(
                        /[^0-9A-Za-z]/g,
                        ""
                    );

            }
        );

    }


    /* =========================
       CONTACT FORM
    ========================== */

    const contactForm =
        document.getElementById("contactForm");

    const contactName =
        document.getElementById("contactName");

    const contactEmail =
        document.getElementById("contactEmail");

    const contactMessage =
        document.getElementById("contactMessage");


    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const name =
                    contactName.value.trim();

                const email =
                    contactEmail.value.trim();

                const message =
                    contactMessage.value.trim();


                if (!name || !email || !message) {

                    alert(
                        "Please complete all contact fields."
                    );

                    return;

                }


                const subject =
                    encodeURIComponent(
                        "UniEasy Website Enquiry"
                    );

                const body =
                    encodeURIComponent(
                        "Name: " +
                        name +
                        "\n\nEmail: " +
                        email +
                        "\n\nMessage:\n" +
                        message
                    );


                window.location.href =
                    "mailto:unieasyy@gmail.com" +
                    "?subject=" +
                    subject +
                    "&body=" +
                    body;

            }
        );

    }


    /* =========================
       COOKIE CONSENT
    ========================== */

    const cookieBanner =
        document.getElementById("cookieBanner");

    const acceptCookies =
        document.getElementById("acceptCookies");

    const rejectCookies =
        document.getElementById("rejectCookies");

    const cookieSettingsButton =
        document.getElementById(
            "cookieSettingsButton"
        );


    function hideCookieBanner() {

        if (cookieBanner) {

            cookieBanner.hidden = true;

        }

    }


    function showCookieBanner() {

        if (cookieBanner) {

            cookieBanner.hidden = false;

        }

    }


    const cookieChoice =
        localStorage.getItem(
            "unieasy_cookie_choice"
        );


    if (!cookieChoice) {

        setTimeout(function () {
            showCookieBanner();
        }, 1500);

    }


    if (acceptCookies) {

        acceptCookies.addEventListener(
            "click",
            function () {

                localStorage.setItem(
                    "unieasy_cookie_choice",
                    "accepted"
                );

                hideCookieBanner();

            }
        );

    }


    if (rejectCookies) {

        rejectCookies.addEventListener(
            "click",
            function () {

                localStorage.setItem(
                    "unieasy_cookie_choice",
                    "rejected"
                );

                hideCookieBanner();

            }
        );

    }


    if (cookieSettingsButton) {

        cookieSettingsButton.addEventListener(
            "click",
            function () {

                showCookieBanner();

            }
        );

    }


    /* =========================
       BACK TO TOP
    ========================== */

    const backToTop =
        document.getElementById("backToTop");


    function updateBackToTop() {

        if (!backToTop) {
            return;
        }


        if (window.scrollY > 500) {

            backToTop.classList.add("show");

        } else {

            backToTop.classList.remove("show");

        }

    }


    window.addEventListener(
        "scroll",
        updateBackToTop
    );


    if (backToTop) {

        backToTop.addEventListener(
            "click",
            function () {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /* =========================
       CURRENT YEAR
    ========================== */

    const currentYear =
        document.getElementById("currentYear");


    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    /* =========================
       PREVENT SAME UNIVERSITY
       BEING SELECTED TWICE
    ========================== */

    const universityChoice1 =
        document.getElementById(
            "universityChoice1"
        );

    const universityChoice2 =
        document.getElementById(
            "universityChoice2"
        );


    function preventDuplicateUniversity() {

        if (
            !universityChoice1 ||
            !universityChoice2
        ) {
            return;
        }


        const firstChoice =
            universityChoice1.value;


        Array.from(
            universityChoice2.options
        ).forEach(function (option) {

            option.disabled =
                option.value !== "" &&
                option.value === firstChoice;

        });


        if (
            universityChoice2.value ===
            firstChoice
        ) {

            universityChoice2.value = "";

        }

    }


    if (universityChoice1) {

        universityChoice1.addEventListener(
            "change",
            preventDuplicateUniversity
        );

    }


    /* =========================
       FORM PROGRESS EFFECT
    ========================== */

    const formInputs =
        document.querySelectorAll(
            "#applyForMeForm input, " +
            "#applyForMeForm select, " +
            "#applyForMeForm textarea"
        );


    formInputs.forEach(function (input) {

        input.addEventListener(
            "change",
            function () {

                if (
                    input.value ||
                    input.checked
                ) {

                    input.style.borderColor =
                        "rgba(22, 163, 74, 0.7)";

                }

            }
        );

    });


    /* =========================
       INITIAL UNIVERSITY COUNT
    ========================== */

    filterUniversities();

});