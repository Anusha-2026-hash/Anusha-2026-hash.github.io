/**
 * Anusha Rahman Roza — Modern Portfolio Script
 * Interactive behaviors: Theme toggle, Mobile Drawer, ScrollSpy,
 * Project Filters, Live Calculator Simulator, Modals, Form Validation,
 * Toast Notifications & Copy to Clipboard.
 */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* ==========================================================================
     1. THEME SWITCHER (Dark / Light Mode)
     ========================================================================== */
  const htmlElement = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  // Determine initial theme: saved user toggle > CV editorial light default
  const savedTheme = localStorage.getItem("anusha_cv_theme_v1");
  const currentTheme = savedTheme || "light";
  htmlElement.setAttribute("data-theme", currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const activeTheme = htmlElement.getAttribute("data-theme");
      const nextTheme = activeTheme === "dark" ? "light" : "dark";
      
      htmlElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("anusha_cv_theme_v1", nextTheme);
      showToast(`Switched to ${nextTheme === "dark" ? "Midnight Navy" : "Editorial Light"} theme`, nextTheme === "dark" ? "fa-moon" : "fa-sun");
    });
  }

  /* ==========================================================================
     2. STICKY HEADER & SCROLL SPY
     ========================================================================== */
  const siteHeader = document.getElementById("siteHeader");
  const backToTopBtn = document.getElementById("backToTop");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section[id]");

  function handleScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Header blur background
    if (siteHeader) {
      if (scrollY > 30) {
        siteHeader.classList.add("scrolled");
      } else {
        siteHeader.classList.remove("scrolled");
      }
    }

    // Back to top visibility
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    }

    // ScrollSpy active link detection
    let currentSectionId = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (currentSectionId && link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ==========================================================================
     3. MOBILE DRAWER NAVIGATION
     ========================================================================== */
  const menuToggle = document.getElementById("menuToggle");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  const drawerClose = document.getElementById("drawerClose");
  const drawerLinks = document.querySelectorAll(".drawer-link");

  function openDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.add("open");
      mobileDrawer.setAttribute("aria-hidden", "false");
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
  }

  function closeDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.remove("open");
      mobileDrawer.setAttribute("aria-hidden", "true");
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  }

  if (menuToggle) menuToggle.addEventListener("click", openDrawer);
  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

  drawerLinks.forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });

  // Close drawer and modals on Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDrawer();
      closeModal(calcModal);
      closeModal(projectDetailsModal);
    }
  });

  /* ==========================================================================
     4. INTERSECTION OBSERVER SCROLL REVEAL ANIMATIONS
     ========================================================================== */
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("visible"));
  }

  /* ==========================================================================
     5. PROJECT GALLERY CATEGORY FILTERING
     ========================================================================== */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active from all buttons
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filterValue = btn.getAttribute("data-filter");

      projectCards.forEach((card) => {
        const category = card.getAttribute("data-category");
        if (filterValue === "all" || category === filterValue) {
          card.style.display = "";
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, 20);
        } else {
          card.style.opacity = "0";
          card.style.transform = "scale(0.96)";
          setTimeout(() => {
            card.style.display = "none";
          }, 250);
        }
      });
    });
  });

  /* ==========================================================================
     6. INTERACTIVE WORKING CALCULATOR SIMULATOR & MODAL
     ========================================================================== */
  const calcModal = document.getElementById("calcModal");
  const openCalcModalBtn = document.getElementById("openCalcModalBtn");
  const closeCalcModalBtn = document.getElementById("closeCalcModalBtn");
  const closeCalcModalDot = document.getElementById("closeCalcModalDot");

  const calcCurrentDisplay = document.getElementById("calcCurrent");
  const calcHistoryDisplay = document.getElementById("calcHistory");
  const calcPad = document.getElementById("calcPad");

  // In-card mini previews
  const calcPreviewMain = document.getElementById("calcPreviewMain");
  const calcPreviewSub = document.getElementById("calcPreviewSub");

  let calcState = {
    current: "0",
    previous: null,
    operation: null,
    shouldResetScreen: false,
  };

  function updateCalcScreen() {
    if (calcCurrentDisplay) {
      calcCurrentDisplay.textContent = calcState.current;
    }
    if (calcHistoryDisplay) {
      if (calcState.previous !== null && calcState.operation) {
        const opSymbol = {
          add: "+",
          subtract: "−",
          multiply: "×",
          divide: "÷",
        }[calcState.operation] || "";
        calcHistoryDisplay.textContent = `${calcState.previous} ${opSymbol}`;
      } else {
        calcHistoryDisplay.textContent = "0";
      }
    }
    // Sync with card preview
    if (calcPreviewMain) calcPreviewMain.textContent = calcState.current;
    if (calcPreviewSub && calcState.previous !== null && calcState.operation) {
      const opSymbol = {
        add: "+",
        subtract: "−",
        multiply: "×",
        divide: "÷",
      }[calcState.operation] || "";
      calcPreviewSub.textContent = `${calcState.previous} ${opSymbol}`;
    }
  }

  function handleCalcInput(val) {
    if (calcState.current === "0" || calcState.shouldResetScreen) {
      calcState.current = val;
      calcState.shouldResetScreen = false;
    } else {
      if (val === "." && calcState.current.includes(".")) return;
      if (calcState.current.length < 12) {
        calcState.current += val;
      }
    }
    updateCalcScreen();
  }

  function handleCalcAction(action) {
    switch (action) {
      case "clear":
        calcState.current = "0";
        calcState.previous = null;
        calcState.operation = null;
        calcState.shouldResetScreen = false;
        break;

      case "toggle-sign":
        if (calcState.current !== "0") {
          calcState.current = (parseFloat(calcState.current) * -1).toString();
        }
        break;

      case "percent":
        calcState.current = (parseFloat(calcState.current) / 100).toString();
        break;

      case "add":
      case "subtract":
      case "multiply":
      case "divide":
        if (calcState.operation !== null && !calcState.shouldResetScreen) {
          executeCalc();
        }
        calcState.previous = calcState.current;
        calcState.operation = action;
        calcState.shouldResetScreen = true;
        break;

      case "calculate":
        if (calcState.operation && calcState.previous !== null) {
          executeCalc();
          calcState.operation = null;
          calcState.previous = null;
          calcState.shouldResetScreen = true;
        }
        break;
    }
    updateCalcScreen();
  }

  function executeCalc() {
    const prev = parseFloat(calcState.previous);
    const curr = parseFloat(calcState.current);
    if (isNaN(prev) || isNaN(curr)) return;

    let result = 0;
    switch (calcState.operation) {
      case "add":
        result = prev + curr;
        break;
      case "subtract":
        result = prev - curr;
        break;
      case "multiply":
        result = prev * curr;
        break;
      case "divide":
        if (curr === 0) {
          calcState.current = "Error";
          return;
        }
        result = prev / curr;
        break;
    }

    // Format float precision cleanly
    calcState.current = Math.round(result * 100000000) / 100000000 + "";
  }

  if (calcPad) {
    calcPad.addEventListener("click", (e) => {
      const btn = e.target.closest(".calc-btn");
      if (!btn) return;

      const val = btn.getAttribute("data-val");
      const action = btn.getAttribute("data-action");

      if (val !== null) {
        handleCalcInput(val);
      } else if (action) {
        handleCalcAction(action);
      }
    });
  }

  function openModal(modal) {
    if (modal) {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  if (openCalcModalBtn) {
    openCalcModalBtn.addEventListener("click", () => openModal(calcModal));
  }
  if (closeCalcModalBtn) {
    closeCalcModalBtn.addEventListener("click", () => closeModal(calcModal));
  }
  if (closeCalcModalDot) {
    closeCalcModalDot.addEventListener("click", () => closeModal(calcModal));
  }
  if (calcModal) {
    calcModal.addEventListener("click", (e) => {
      if (e.target === calcModal) closeModal(calcModal);
    });
  }

  /* ==========================================================================
     7. PROJECT DETAILS MODAL (Rich Exploration)
     ========================================================================== */
  const projectDetailsModal = document.getElementById("projectDetailsModal");
  const closeProjectModalBtn = document.getElementById("closeProjectModalBtn");
  const projectModalTitle = document.getElementById("projectModalTitle");
  const projectModalBody = document.getElementById("projectModalBody");
  const projectModalRepoLink = document.getElementById("projectModalRepoLink");

  const projectData = {
    fuelpass: {
      title: "FuelPass 2.0 — Vehicle & Fuel Management",
      category: "Desktop Application (C# / SQL Server)",
      desc: "A production-oriented desktop management software designed to streamline fuel dispensation, maintain vehicle fleet logs, verify quotas, and track driver consumption records through a secured Windows Forms interface connected to Microsoft SQL Server.",
      contribution: "Engineered core application forms, SQL database relational schemas, CRUD workflows for vehicle registries, and real-time fuel quota calculation algorithms.",
      tech: ["C#", ".NET", "Windows Forms", "Microsoft SQL Server", "ADO.NET", "Relational Database Design"],
      repo: "https://github.com/Anusha-2026-hash/Fuel-Pass",
    },
    garden: {
      title: "Open World Garden Adventure — 2D Graphics",
      category: "Graphics Programming (C++ / OpenGL)",
      desc: "A stylized 2D open-world game environment exploring procedural rendering, coordinate transformations, collision detection, and character movement built natively in C++ using OpenGL.",
      contribution: "Designed custom OpenGL shaders, terrain coordinate systems, keyboard-driven sprite navigation, and dynamic scene interaction elements.",
      tech: ["C++", "OpenGL", "GLUT / GLFW", "Computer Graphics", "Coordinate Geometry", "2D Animation"],
      repo: "https://github.com/Anusha-2026-hash/Open-World-2D-Game",
    },
    library: {
      title: "Library Management Interface",
      category: "Web Front-End (HTML / CSS / JS)",
      desc: "A modern front-end library catalog management interface facilitating book inventory exploration, search filtering, book reservations, and member records visualization.",
      contribution: "Constructed the responsive layout structure, interactive book shelf UI components, book search algorithms, and client-side form validations.",
      tech: ["HTML5", "CSS3", "JavaScript", "DOM Scripting", "Responsive UI", "Local State"],
      repo: "https://github.com/Anusha-2026-hash/Library-managing-front-end",
    },
    hrmanagement: {
      title: "HR Management System",
      category: "Desktop Application (C# / Windows Forms)",
      desc: "A comprehensive enterprise HR management application focused on human resource operations, including employee profile directories, attendance tracking, leave sanctioning, and payroll ledger computation.",
      contribution: "Developed employee data management views, automated attendance status logging, leave approval workflows, and payroll summary calculation logic.",
      tech: ["C#", "Windows Forms", "Object-Oriented Programming (OOP)", "File I/O / DB", "Enterprise UI"],
      repo: "https://github.com/Anusha-2026-hash/HR-Management-System",
    },
    letsplay: {
      title: "Lets-Play — Interactive Game Hosting Hub",
      category: "Web Platform (HTML5 / CSS3 / JavaScript)",
      desc: "A responsive browser game platform designed to showcase and host interactive lightweight web games, arcade high scores, and categorized mini-game experiences.",
      contribution: "Created the game portal layout, game loop integrations, dynamic category views, and responsive mobile-first UI.",
      tech: ["HTML5 Canvas", "CSS3 Animations", "JavaScript ES6+", "Browser Storage", "Game UI"],
      repo: "https://github.com/Anusha-2026-hash/Lets-Play",
    },
  };

  document.querySelectorAll("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalKey = btn.getAttribute("data-modal");
      const data = projectData[modalKey];
      if (!data) return;

      if (projectModalTitle) projectModalTitle.textContent = data.title;
      if (projectModalRepoLink) projectModalRepoLink.setAttribute("href", data.repo);

      if (projectModalBody) {
        projectModalBody.innerHTML = `
          <div class="modal-project-content">
            <span class="modal-project-cat"><i class="fa-solid fa-layer-group"></i> ${data.category}</span>
            <p class="modal-project-desc">${data.desc}</p>
            <div class="modal-project-box">
              <strong><i class="fa-solid fa-code-branch"></i> Project Highlights &amp; Architecture:</strong>
              <p style="margin-top: 6px;">${data.contribution}</p>
            </div>
            <strong>Technologies &amp; Competencies:</strong>
            <div class="modal-tech-list">
              ${data.tech.map((t) => `<span class="tech-tag">${t}</span>`).join("")}
            </div>
          </div>
        `;
      }

      openModal(projectDetailsModal);
    });
  });

  if (closeProjectModalBtn) {
    closeProjectModalBtn.addEventListener("click", () => closeModal(projectDetailsModal));
  }
  if (projectDetailsModal) {
    projectDetailsModal.addEventListener("click", (e) => {
      if (e.target === projectDetailsModal) closeModal(projectDetailsModal);
    });
  }

  /* ==========================================================================
     8. COPY ACTIONS (Code Snippet & Contact Info)
     ========================================================================== */
  const copyCodeBtn = document.getElementById("copyCodeBtn");
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener("click", () => {
      const codeSnippet = `const profile = {\n  name: "Anusha Rahman Roza",\n  degree: "BSc in CSE (Running)",\n  roles: ["Dev", "Digital Marketing"],\n  mindset: "Organized & eager to learn."\n};\n\nwhile (ideas) {\n  create();\n  grow();\n}`;
      copyToClipboard(codeSnippet, "Code snippet copied to clipboard!");
    });
  }

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const textToCopy = btn.getAttribute("data-copy");
      if (textToCopy) {
        copyToClipboard(textToCopy, `Copied "${textToCopy}" to clipboard!`);
      }
    });
  });

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg, "fa-check");
      }).catch(() => {
        fallbackCopyText(text, successMsg);
      });
    } else {
      fallbackCopyText(text, successMsg);
    }
  }

  function fallbackCopyText(text, successMsg) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      showToast(successMsg, "fa-check");
    } catch (err) {
      showToast("Unable to copy to clipboard", "fa-triangle-exclamation");
    }
    document.body.removeChild(textArea);
  }

  /* ==========================================================================
     9. TOAST NOTIFICATION UTILITY
     ========================================================================== */
  const toastContainer = document.getElementById("toastContainer");

  function showToast(message, iconClass = "fa-circle-check") {
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(15px)";
      toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }, 3200);
  }

  /* ==========================================================================
     10. CONTACT FORM VALIDATION & INTERACTIVE FEEDBACK
     ========================================================================== */
  const contactForm = document.getElementById("contactForm");
  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");
  const userSubject = document.getElementById("userSubject");
  const userMessage = document.getElementById("userMessage");
  const submitBtn = document.getElementById("submitBtn");
  const formFeedback = document.getElementById("formFeedback");

  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const subjectError = document.getElementById("subjectError");
  const messageError = document.getElementById("messageError");

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function clearErrors() {
    if (nameError) nameError.textContent = "";
    if (emailError) emailError.textContent = "";
    if (subjectError) subjectError.textContent = "";
    if (messageError) messageError.textContent = "";
    if (formFeedback) {
      formFeedback.className = "form-feedback";
      formFeedback.textContent = "";
      formFeedback.style.display = "none";
    }
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors();

      let isValid = true;

      // Validate Name
      if (!userName.value.trim()) {
        nameError.textContent = "Please enter your name.";
        isValid = false;
      } else if (userName.value.trim().length < 2) {
        nameError.textContent = "Name must be at least 2 characters long.";
        isValid = false;
      }

      // Validate Email
      if (!userEmail.value.trim()) {
        emailError.textContent = "Please enter your email address.";
        isValid = false;
      } else if (!validateEmail(userEmail.value.trim())) {
        emailError.textContent = "Please enter a valid email address.";
        isValid = false;
      }

      // Validate Subject
      if (!userSubject.value.trim()) {
        subjectError.textContent = "Please enter a subject.";
        isValid = false;
      }

      // Validate Message
      if (!userMessage.value.trim()) {
        messageError.textContent = "Please enter your message.";
        isValid = false;
      } else if (userMessage.value.trim().length < 10) {
        messageError.textContent = "Message should be at least 10 characters long.";
        isValid = false;
      }

      if (!isValid) return;

      // Simulate sending with loading state
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Sending Message...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;

        // Display Success State
        if (formFeedback) {
          formFeedback.className = "form-feedback success";
          formFeedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you, <strong>${escapeHtml(userName.value.trim())}</strong>! Your message has been prepared. I will respond to you soon.`;
          formFeedback.style.display = "block";
        }

        showToast("Message sent successfully!", "fa-circle-check");
        contactForm.reset();
      }, 1000);
    });
  }

  function escapeHtml(string) {
    const entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
    };
    return String(string).replace(/[&<>"'/]/g, (s) => entityMap[s]);
  }

  /* ==========================================================================
     11. AUTO-UPDATE COPYRIGHT YEAR
     ========================================================================== */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
