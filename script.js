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
   FORM SUBMISSION + SUCCESS MESSAGE
========================== */

const applicationForm =
    document.getElementById("applyForMeForm");

const applicationMessage =
    document.getElementById("applicationFormMessage");

const applicationSuccessMessage =
    document.getElementById("applicationSuccessMessage");

const successBackToSiteButton =
    document.getElementById("successBackToSiteButton");

const submitApplicationButton =
    applicationForm
        ? applicationForm.querySelector(
            'button[type="submit"]'
        )
        : null;


if (applicationForm) {

    applicationForm.addEventListener(
        "submit",
        async function (event) {

            /* Stop the browser from leaving the page */
            event.preventDefault();


            /* Check required fields */
            if (!applicationForm.checkValidity()) {

                applicationForm.reportValidity();

                return;

            }


            /* Clear previous message */
            if (applicationMessage) {

                applicationMessage.textContent = "";

                applicationMessage.className =
                    "form-message";

            }


            /* Disable submit button */
            if (submitApplicationButton) {

                submitApplicationButton.disabled = true;

                submitApplicationButton.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin ui-icon" aria-hidden="true"></i> SUBMITTING...';

            }


            try {

                /*
                 * FormData automatically includes:
                 * - all text fields
                 * - dropdowns
                 * - checkboxes
                 * - uploaded documents
                 */

                const formData =
                    new FormData(applicationForm);


                /*
                 * Send the form to FormSubmit
                 */

                const response =
                    await fetch(
                        applicationForm.action,
                        {
                            method: "POST",
                            body: formData,
                            headers: {
                                "Accept": "application/json"
                            }
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Application submission failed."
                    );

                }


                /* =========================
                   SUCCESS
                ========================== */

                applicationForm.hidden = true;


                if (applicationSuccessMessage) {

                    applicationSuccessMessage.hidden = false;

                    applicationSuccessMessage.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }


            } catch (error) {

                console.error(
                    "UniEasy submission error:",
                    error
                );


                /* =========================
                   ERROR MESSAGE
                ========================== */

                if (applicationMessage) {

                    applicationMessage.textContent =
                        "Something went wrong while sending your application. Please check your internet connection and try again.";

                    applicationMessage.className =
                        "form-message error";

                }


                /* Re-enable button */

                if (submitApplicationButton) {

                    submitApplicationButton.disabled = false;

                    submitApplicationButton.innerHTML =
                        '<i class="fa-solid fa-paper-plane ui-icon" aria-hidden="true"></i> SUBMIT APPLICATION';

                }

            }

        }
    );

}


/* =========================
   SUCCESS MESSAGE → BACK TO SITE
========================== */

if (successBackToSiteButton) {

    successBackToSiteButton.addEventListener(
        "click",
        function () {

            if (applicationSuccessMessage) {

                applicationSuccessMessage.hidden = true;

            }


            if (applicationForm) {

                applicationForm.hidden = false;

            }


            if (applyForMeSection) {

                applyForMeSection.hidden = true;

            }


            window.scrollTo({
                top: 0,
                behavior: "smooth"
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

if (contactForm) {

    contactForm.addEventListener(
        "submit",
        function () {

            /*
             * The contact form will submit using
             * the action and method defined in HTML.
             */

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

    /* =========================================================
   UNIEASY - STUDENT HUB JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       1. APPLICATION DEADLINE COUNTDOWN
       ===================================================== */

    const deadlineUniversitySelect =
        document.getElementById("deadlineUniversitySelect");

    const deadlineCountdownResult =
        document.getElementById("deadlineCountdownResult");


    /*
       STARTER DATA

       These dates are examples/placeholders.
       Replace them with confirmed official deadlines
       when you have verified them.
    */

    const universityDeadlines = {

        CPUT: {
            name: "Cape Peninsula University of Technology",
            date: "2027-09-30",
            status: "Starter date — verify with CPUT"
        },

        CUT: {
            name: "Central University of Technology",
            date: "2027-09-30",
            status: "Starter date — verify with CUT"
        },

        DUT: {
            name: "Durban University of Technology",
            date: "2027-09-30",
            status: "Starter date — verify with DUT"
        },

        MUT: {
            name: "Mangosuthu University of Technology",
            date: "2027-09-30",
            status: "Starter date — verify with MUT"
        },

        NMU: {
            name: "Nelson Mandela University",
            date: "2027-09-30",
            status: "Starter date — verify with NMU"
        },

        NWU: {
            name: "North-West University",
            date: "2027-09-30",
            status: "Starter date — verify with NWU"
        },

        RU: {
            name: "Rhodes University",
            date: "2027-09-30",
            status: "Starter date — verify with Rhodes University"
        },

        SMU: {
            name: "Sefako Makgatho Health Sciences University",
            date: "2027-09-30",
            status: "Starter date — verify with SMU"
        },

        SPU: {
            name: "Sol Plaatje University",
            date: "2027-09-30",
            status: "Starter date — verify with SPU"
        },

        SU: {
            name: "Stellenbosch University",
            date: "2027-06-30",
            status: "Starter date — verify with Stellenbosch University"
        },

        TUT: {
            name: "Tshwane University of Technology",
            date: "2027-09-30",
            status: "Starter date — verify with TUT"
        },

        UCT: {
            name: "University of Cape Town",
            date: "2027-07-31",
            status: "Starter date — verify with UCT"
        },

        UFH: {
            name: "University of Fort Hare",
            date: "2027-09-30",
            status: "Starter date — verify with UFH"
        },

        UJ: {
            name: "University of Johannesburg",
            date: "2027-09-30",
            status: "Starter date — verify with UJ"
        },

        UKZN: {
            name: "University of KwaZulu-Natal",
            date: "2027-09-30",
            status: "Starter date — verify with UKZN"
        },

        UL: {
            name: "University of Limpopo",
            date: "2027-09-30",
            status: "Starter date — verify with UL"
        },

        UMP: {
            name: "University of Mpumalanga",
            date: "2027-09-30",
            status: "Starter date — verify with UMP"
        },

        UP: {
            name: "University of Pretoria",
            date: "2027-06-30",
            status: "Starter date — verify with UP"
        },

        UNISA: {
            name: "University of South Africa",
            date: "2027-09-30",
            status: "Starter date — verify with UNISA"
        },

        UFS: {
            name: "University of the Free State",
            date: "2027-09-30",
            status: "Starter date — verify with UFS"
        },

        UWC: {
            name: "University of the Western Cape",
            date: "2027-09-30",
            status: "Starter date — verify with UWC"
        },

        WITS: {
            name: "University of the Witwatersrand",
            date: "2027-06-30",
            status: "Starter date — verify with Wits"
        },

        VUT: {
            name: "Vaal University of Technology",
            date: "2027-09-30",
            status: "Starter date — verify with VUT"
        },

        UNIZULU: {
            name: "University of Zululand",
            date: "2027-09-30",
            status: "Starter date — verify with UniZulu"
        },

        WSU: {
            name: "Walter Sisulu University",
            date: "2027-09-30",
            status: "Starter date — verify with WSU"
        },

        UNIVEN: {
            name: "University of Venda",
            date: "2027-09-30",
            status: "Starter date — verify with UniVen"
        }

    };


    /* =====================================================
       UPDATE COUNTDOWN
       ===================================================== */

    function updateDeadlineCountdown() {

        if (!deadlineUniversitySelect || !deadlineCountdownResult) {
            return;
        }

        const universityCode = deadlineUniversitySelect.value;

        if (!universityCode) {

            deadlineCountdownResult.innerHTML =
                "Select a university to view its deadline.";

            return;
        }

        const university =
            universityDeadlines[universityCode];

        if (!university) {

            deadlineCountdownResult.innerHTML =
                "Deadline information is currently unavailable.";

            return;
        }

        const deadline =
            new Date(university.date + "T23:59:59");

        const now = new Date();

        const difference =
            deadline.getTime() - now.getTime();


        /* DATE DISPLAY */

        const formattedDate =
            deadline.toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });


        /* DEADLINE PASSED */

        if (difference <= 0) {

            deadlineCountdownResult.innerHTML = `
                <strong>${university.name}</strong>

                <div style="margin-top:8px;">
                    Deadline:
                    <strong>${formattedDate}</strong>
                </div>

                <div style="margin-top:8px;color:#b91c1c;">
                    This deadline has passed.
                </div>

                <small style="display:block;margin-top:8px;">
                    ${university.status}
                </small>
            `;

            return;
        }


        /* CALCULATE TIME */

        const days =
            Math.floor(
                difference / (1000 * 60 * 60 * 24)
            );

        const hours =
            Math.floor(
                (difference / (1000 * 60 * 60)) % 24
            );

        const minutes =
            Math.floor(
                (difference / (1000 * 60)) % 60
            );

        const seconds =
            Math.floor(
                (difference / 1000) % 60
            );


        deadlineCountdownResult.innerHTML = `

            <strong>${university.name}</strong>

            <div style="
                margin-top:10px;
                font-size:16px;
                font-weight:800;
                color:#c8102e;
            ">
                ${days} days
                ${hours}h
                ${minutes}m
                ${seconds}s
            </div>

            <div style="margin-top:8px;">
                Deadline:
                <strong>${formattedDate}</strong>
            </div>

            <small style="display:block;margin-top:8px;">
                ${university.status}
            </small>

        `;
    }


    if (deadlineUniversitySelect) {

        deadlineUniversitySelect.addEventListener(
            "change",
            updateDeadlineCountdown
        );

    }


    /* =====================================================
       LIVE COUNTDOWN
       ===================================================== */

    setInterval(function () {

        if (
            deadlineUniversitySelect &&
            deadlineUniversitySelect.value
        ) {
            updateDeadlineCountdown();
        }

    }, 1000);


    /* =====================================================
       2. APPLICATIONS CALENDAR
       ===================================================== */

    const applicationsCalendar =
        document.getElementById("applicationsCalendar");


    function createApplicationsCalendar() {

        if (!applicationsCalendar) {
            return;
        }

        const calendarItems = [

            {
                month: "JAN",
                title: "Application Season",
                text: "Check universities for newly opened applications."
            },

            {
                month: "FEB",
                title: "Applications",
                text: "Review courses, requirements and funding options."
            },

            {
                month: "MAR",
                title: "Application Check",
                text: "Make sure your supporting documents are ready."
            },

            {
                month: "APR",
                title: "Deadline Check",
                text: "Check each university's official application page."
            },

            {
                month: "MAY",
                title: "Applications",
                text: "Continue checking institutions with open applications."
            },

            {
                month: "JUN",
                title: "Important Deadlines",
                text: "Some programmes may have earlier closing dates."
            },

            {
                month: "JUL",
                title: "Application Period",
                text: "Check programme-specific deadlines carefully."
            },

            {
                month: "AUG",
                title: "Closing Period",
                text: "Some applications may begin closing."
            },

            {
                month: "SEP",
                title: "Final Checks",
                text: "Check remaining open applications."
            },

            {
                month: "OCT",
                title: "Late Applications",
                text: "Check whether any universities remain open."
            },

            {
                month: "NOV",
                title: "Results & Updates",
                text: "Monitor university application portals."
            },

            {
                month: "DEC",
                title: "Next Cycle",
                text: "Prepare for the next application cycle."
            }

        ];


        applicationsCalendar.innerHTML =
            calendarItems.map(function (item) {

                return `

                    <div
                        class="calendar-item"
                        style="grid-column: span 7;"
                    >

                        <strong>
                            ${item.month} — ${item.title}
                        </strong>

                        <p>
                            ${item.text}
                        </p>

                    </div>

                `;

            }).join("");
    }


    createApplicationsCalendar();


    /* =====================================================
       3. COURSE FINDER
       ===================================================== */

    const courseFinderInput =
        document.getElementById("courseFinderInput");

    const courseFinderResults =
        document.getElementById("courseFinderResults");


    const courses = [

        {
            course: "Computer Science",
            universities: [
                "University of Pretoria",
                "North-West University",
                "University of Johannesburg",
                "University of Cape Town",
                "University of the Witwatersrand"
            ]
        },

        {
            course: "Information Technology",
            universities: [
                "Tshwane University of Technology",
                "Cape Peninsula University of Technology",
                "Durban University of Technology",
                "Vaal University of Technology"
            ]
        },

        {
            course: "Mathematics",
            universities: [
                "North-West University",
                "University of Pretoria",
                "University of Johannesburg",
                "University of the Free State"
            ]
        },

        {
            course: "Accounting",
            universities: [
                "University of Johannesburg",
                "University of Pretoria",
                "University of Cape Town",
                "University of the Witwatersrand",
                "Stellenbosch University"
            ]
        },

        {
            course: "Law",
            universities: [
                "University of Cape Town",
                "University of Pretoria",
                "University of Johannesburg",
                "University of KwaZulu-Natal",
                "North-West University"
            ]
        },

        {
            course: "Education",
            universities: [
                "North-West University",
                "University of Johannesburg",
                "University of Pretoria",
                "University of Limpopo",
                "University of the Free State"
            ]
        },

        {
            course: "Nursing",
            universities: [
                "University of KwaZulu-Natal",
                "University of Pretoria",
                "University of Johannesburg",
                "University of Limpopo"
            ]
        },

        {
            course: "Engineering",
            universities: [
                "University of Pretoria",
                "University of Cape Town",
                "University of the Witwatersrand",
                "University of Johannesburg",
                "Tshwane University of Technology"
            ]
        },

        {
            course: "Psychology",
            universities: [
                "University of Johannesburg",
                "University of Pretoria",
                "University of Cape Town",
                "North-West University"
            ]
        },

        {
            course: "Business Management",
            universities: [
                "University of Johannesburg",
                "University of Pretoria",
                "University of Cape Town",
                "Stellenbosch University"
            ]
        }

    ];


    function searchCourses() {

        if (!courseFinderInput || !courseFinderResults) {
            return;
        }

        const searchTerm =
            courseFinderInput.value
                .trim()
                .toLowerCase();


        if (!searchTerm) {

            courseFinderResults.innerHTML =
                "Type a course name to search.";

            return;
        }


        const results =
            courses.filter(function (item) {

                return (
                    item.course
                        .toLowerCase()
                        .includes(searchTerm)
                    ||
                    item.universities.some(function (university) {

                        return university
                            .toLowerCase()
                            .includes(searchTerm);

                    })
                );

            });


        if (results.length === 0) {

            courseFinderResults.innerHTML = `

                <strong>No courses found</strong>

                <p style="margin-top:6px;">
                    Try searching for Computer Science,
                    Engineering, Nursing, Law or Education.
                </p>

            `;

            return;
        }


        courseFinderResults.innerHTML =

            results.map(function (item) {

                return `

                    <div class="course-result">

                        <strong>
                            ${item.course}
                        </strong>

                        <p style="margin-top:5px;">
                            Available at:
                        </p>

                        <ul style="
                            margin:7px 0 0;
                            padding-left:18px;
                        ">

                            ${item.universities.map(function (university) {

                                return `<li>${university}</li>`;

                            }).join("")}

                        </ul>

                    </div>

                `;

            }).join("");

    }


    if (courseFinderInput) {

        courseFinderInput.addEventListener(
            "input",
            searchCourses
        );

    }


    /* =====================================================
       4. CLOSING SOON
       ===================================================== */

    const closingSoonList =
        document.getElementById("closingSoonList");


    function updateClosingSoon() {

        if (!closingSoonList) {
            return;
        }


        const today = new Date();


        const upcoming = Object.entries(
            universityDeadlines
        )
        .map(function ([code, university]) {

            const deadline =
                new Date(university.date + "T23:59:59");

            const difference =
                deadline.getTime() - today.getTime();

            return {
                code: code,
                name: university.name,
                date: deadline,
                difference: difference
            };

        })
        .filter(function (item) {

            return (
                item.difference > 0 &&
                item.difference <=
                    60 * 24 * 60 * 60 * 1000
            );

        })
        .sort(function (a, b) {

            return a.difference - b.difference;

        })
        .slice(0, 5);


        if (upcoming.length === 0) {

            closingSoonList.innerHTML = `

                <strong>No upcoming deadlines in the next 60 days.</strong>

                <p style="margin-top:7px;">
                    Check back as official university dates are added.
                </p>

            `;

            return;
        }


        closingSoonList.innerHTML = upcoming.map(function (item) {

            const formattedDate =
                item.date.toLocaleDateString(
                    "en-ZA",
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                );


            const daysLeft =
                Math.ceil(
                    item.difference /
                    (1000 * 60 * 60 * 24)
                );


            return `

                <div class="deadline-item">

                    <strong>
                        ${item.name}
                    </strong>

                    <div style="margin-top:4px;">
                        Deadline:
                        ${formattedDate}
                    </div>

                    <small>
                        ${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining
                    </small>

                </div>

            `;

        }).join("");

    }


    updateClosingSoon();


    /* =====================================================
       5. NSFAS BUTTON
       ===================================================== */

    /*
       The NSFAS button is already connected directly
       to the official NSFAS website through the HTML.

       No extra JavaScript is required here.
    */


    /* =====================================================
       6. STUDENT NEWS
       ===================================================== */

    /*
       Student News currently uses static HTML.

       This means it will already display correctly.

       Later, this section can be connected to a database
       or news system so you can update it automatically.
    */


    /* =====================================================
       STUDENT HUB READY
       ===================================================== */

    console.log(
        "UniEasy Student Hub loaded successfully."
    );

});

    filterUniversities();

});
