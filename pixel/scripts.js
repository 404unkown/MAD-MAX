document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  // Elements
  const phoneInput = document.getElementById("phone");
  const ownerNameInput = document.getElementById("ownerName");
  const ownerNumberInput = document.getElementById("ownerNumber");
  const requestPairingBtn = document.getElementById("requestPairing");
  const statusEl = document.getElementById("status");
  const channelModal = document.getElementById("channelModal");
  const modalClose = document.getElementById("modalClose");
  const confirmFollowBtn = document.getElementById("confirmFollow");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById('navLinks');
  const nav = document.getElementById('nav');

  // Track if user has confirmed following channels
  let channelsFollowed = localStorage.getItem('channelsFollowed') === 'true';

  // Show channel modal on page load if not already followed
  if (!channelsFollowed) {
    setTimeout(() => {
      channelModal.classList.add('active');
    }, 1000);
  }

  // Close modal functions
  function closeModal() {
    channelModal.classList.remove('active');
    setTimeout(() => {
      channelModal.style.display = 'none';
    }, 400);
  }

  modalClose.addEventListener('click', closeModal);

  // Close modal when clicking outside
  channelModal.addEventListener('click', (e) => {
    if (e.target === channelModal) {
      closeModal();
    }
  });

  // Confirm following channels
  confirmFollowBtn.addEventListener('click', () => {
    channelsFollowed = true;
    localStorage.setItem('channelsFollowed', 'true');
    closeModal();
    
    // Show confirmation message
    showStatus(`
      <div style="text-align: center; color: var(--success);">
        <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
        <p>Thank you for following our channels! You can now proceed to connect your WhatsApp.</p>
      </div>
    `, "success");
  });

  // Mobile navigation toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      navToggle.innerHTML = navLinks.classList.contains('active') ?
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }

  // Listen for stats updates from server
  socket.on("statsUpdate", ({ activeSockets, totalUsers }) => {
    document.getElementById("activeSockets").textContent = activeSockets;
    document.getElementById("totalUsers").textContent = totalUsers;
  });

  // Navbar scroll effect
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    });
  }

  // Request pairing code
  requestPairingBtn.addEventListener("click", async () => {
    // Check if user has followed channels
    if (!channelsFollowed) {
      showStatus(`
        <div style="text-align: center; color: var(--warning);">
          <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
          <p>Please follow all our channels first to use CYBER BOT.</p>
          <button class="btn" style="margin-top: 10px;" onclick="document.getElementById('channelModal').classList.add('active')">
            <i class="fas fa-bell"></i> Show Channels
          </button>
        </div>
      `, "warning");
      return;
    }

    // Get owner details
    const ownerName = ownerNameInput ? ownerNameInput.value.trim() : "OWNER";
    const ownerNumber = ownerNumberInput ? ownerNumberInput.value.trim() : "";
    
    // Get number to pair
    const number = phoneInput.value.trim();
    
    // Validate owner number
    if (!ownerNumber) {
      showStatus("❌ Please enter the owner's phone number.", "error");
      return;
    }
    
    // Validate owner number format
    if (!/^[0-9]{8,15}$/.test(ownerNumber.replace(/\D/g, ''))) {
      showStatus("❌ Please enter a valid owner phone number (digits only, 8-15 characters).", "error");
      return;
    }
    
    // Validate pairing number
    if (!number) {
      showStatus("❌ Please enter the phone number to pair.", "error");
      return;
    }

    // Validate pairing number format
    if (!/^[0-9]{8,15}$/.test(number.replace(/\D/g, ''))) {
      showStatus("❌ Please enter a valid phone number to pair (digits only, 8-15 characters).", "error");
      return;
    }

    showStatus("<span class='spinner'></span> Requesting pairing code...", "loading");
    requestPairingBtn.disabled = true;

    try {
      const res = await fetch("/api/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          number: number,
          ownerNumber: ownerNumber,
          ownerName: ownerName || "OWNER"
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        showStatus("❌ Error: " + (data.error || "Failed to request pairing"), "error");
        requestPairingBtn.disabled = false;
        return;
      }

      const code = (data.pairingCode || "").toString().trim();
      const spacedCode = code.split("").join(" ");
      
      showStatus(`
        <div style="text-align: center;">
          <p style="margin-bottom: 10px; font-size: 1.1rem;">✅ Pairing code for <strong>${number}</strong>:</p>
          <div style="background: rgba(255, 68, 68, 0.1); padding: 8px; border-radius: 8px; margin-bottom: 15px;">
            <p style="color: #ff4444; font-size: 0.9rem;"><i class="fas fa-crown"></i> Owner: ${ownerName} (${ownerNumber})</p>
          </div>
          <div class="pairing-code" id="pairingCode">${spacedCode}</div>
          <p style="margin-top: 16px; opacity: 0.8;"><small>Click the code to copy — then enter it in WhatsApp to complete pairing.</small></p>
        </div>
      `, "success");

      // Add copy functionality
      const pairingEl = document.getElementById("pairingCode");
      if (pairingEl) {
        pairingEl.addEventListener("click", () => {
          navigator.clipboard.writeText(code)
            .then(() => {
              const originalText = pairingEl.textContent;
              pairingEl.textContent = "Copied!";
              pairingEl.style.letterSpacing = "2px";
              pairingEl.style.background = "rgba(0, 255, 157, 0.2)";
              
              setTimeout(() => {
                pairingEl.textContent = originalText;
                pairingEl.style.letterSpacing = "10px";
                pairingEl.style.background = "rgba(0, 0, 0, 0.4)";
              }, 2000);
            })
            .catch(() => {
              showStatus("❌ Failed to copy to clipboard. Please manually copy the code.", "error");
            });
        });
      }
      
      // Clear inputs
      phoneInput.value = "";
      if (ownerNameInput) ownerNameInput.value = "";
      if (ownerNumberInput) ownerNumberInput.value = "";
      
    } catch (err) {
      console.error("Pairing request failed", err);
      showStatus("❌ Failed to request pairing code (network or server error).", "error");
    } finally {
      requestPairingBtn.disabled = false;
    }
  });

  // Show status message with animation
  function showStatus(message, type = "") {
    statusEl.innerHTML = message;
    statusEl.className = "";
    if (type) statusEl.classList.add(type);
    statusEl.classList.add("fade-in");
  }

  // Socket: Linked event
  socket.on("linked", ({ sessionId }) => {
    showStatus(`
      <div style="text-align: center; color: var(--success);">
        <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 20px;"></i>
        <h3 style="margin-bottom: 16px;">✅ Successfully Linked!</h3>
        <p>Your device has been successfully connected. You can now use CYBER BOT features.</p>
        <p style="margin-top: 12px; opacity: 0.8;"><small>Session ID: ${sessionId}</small></p>
      </div>
    `, "success");
  });

  // Socket: pairing timeout
  socket.on("pairingTimeout", ({ number }) => {
    showStatus(`
      <div style="text-align: center; color: var(--warning);">
        <i class="fas fa-clock" style="font-size: 2.5rem; margin-bottom: 16px;"></i>
        <h3 style="margin-bottom: 12px;">⏰ Pairing Code Expired</h3>
        <p>Pairing code for ${number} has expired.</p>
        <p>Please request a new code if you still need to connect.</p>
      </div>
    `, "warning");
  });

  // Handle Enter key in phone input
  phoneInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      requestPairingBtn.click();
    }
  });

  // Input validation for phone numbers
  phoneInput.addEventListener("input", function(e) {
    this.value = this.value.replace(/\D/g, '');
  });
  
  if (ownerNumberInput) {
    ownerNumberInput.addEventListener("input", function(e) {
      this.value = this.value.replace(/\D/g, '');
    });
  }

  // Set current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Create particle effect
  function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = window.innerWidth < 768 ? 20 : 40;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      const size = Math.random() * 3 + 1;
      const posX = Math.random() * 100;
      const delay = Math.random() * 20;
      const duration = Math.random() * 15 + 20;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.animationDuration = `${duration}s`;
      
      particlesContainer.appendChild(particle);
    }
  }
  
  createParticles();

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add intersection observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe cards for scroll animations
  document.querySelectorAll('.card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
});