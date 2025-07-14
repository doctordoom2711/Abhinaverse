document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // Lenis with mobile support
  const lenis = new Lenis({
    smoothTouch: true,
    gestureOrientation: "vertical",
    touchMultiplier: 1.5,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Fix viewport height issue on mobile
  const setVh = () => {
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );
  };
  window.addEventListener("resize", setVh);
  setVh();

  // Refresh ScrollTrigger after load and resize/orientation changes
  window.addEventListener("load", () =>
    setTimeout(() => ScrollTrigger.refresh(), 100)
  );
  window.addEventListener("orientationchange", () =>
    ScrollTrigger.refresh(true)
  );

  const smoothStep = (p) => p * p * (3 - 2 * p);

  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: "75% top",
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;

      const heroCardsContainerOpacity = gsap.utils.interpolate(
        1,
        0.5,
        smoothStep(progress)
      );
      gsap.set(".hero-cards", { opacity: heroCardsContainerOpacity });

      ["#hero-card-1", "#hero-card-2", "#hero-card-3"].forEach(
        (cardId, index) => {
          const delay = index * 0.9;
          const cardProgress = gsap.utils.clamp(
            0,
            1,
            (progress - delay * 0.1) / (1 - delay * 0.1)
          );

          const y = gsap.utils.interpolate(
            "0%",
            "250%",
            smoothStep(cardProgress)
          );
          const scale = gsap.utils.interpolate(
            1,
            0.75,
            smoothStep(cardProgress)
          );

          let x = "0%";
          let rotation = 0;
          if (index === 0) {
            x = gsap.utils.interpolate("0%", "90%", smoothStep(cardProgress));
            rotation = gsap.utils.interpolate(0, -15, smoothStep(cardProgress));
          } else if (index === 2) {
            x = gsap.utils.interpolate("0%", "-90%", smoothStep(cardProgress));
            rotation = gsap.utils.interpolate(0, 15, smoothStep(cardProgress));
          }

          gsap.set(cardId, { y, x, rotation, scale });
        }
      );
    },
  });

  ScrollTrigger.create({
    trigger: ".services",
    start: "top top",
    end: "400%",
    pin: ".services",
    pinSpacing: true,
  });

  ScrollTrigger.create({
    trigger: ".services",
    start: "top top",
    end: "400%",
    onLeave: () => {
      const ServicesSection = document.querySelector(".services");
      const ServicesRect = ServicesSection.getBoundingClientRect();
      const ServicesTop = window.pageYOffset + ServicesRect.top;

      gsap.set(".cards", {
        position: "absolute",
        top: ServicesTop,
        left: 0,
        width: "100vw",
        height: "100vh",
      });
    },
    onEnterBack: () => {
      gsap.set(".cards", {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      });
    },
  });

  ScrollTrigger.create({
    trigger: ".services",
    start: "top bottom",
    end: "400%",
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;

      const headerProgress = gsap.utils.clamp(0, 1, progress / 0.9);
      const headerY = gsap.utils.interpolate(
        "400%",
        "0%",
        smoothStep(headerProgress)
      );

      gsap.set(".services-header", { y: headerY });

      ["#card-1", "#card-2", "#card-3"].forEach((cardId, index) => {
        const delay = index * 0.5;
        const cardProgress = gsap.utils.clamp(
          0,
          1,
          (progress - delay * 0.1) / (0.9 - delay * 0.1)
        );

        const innerCard = document.querySelector(`${cardId} .flip-card-inner`);

        let y;
        if (cardProgress < 0.4) {
          y = gsap.utils.interpolate(
            "-100%",
            "50%",
            smoothStep(cardProgress / 0.4)
          );
        } else if (cardProgress < 0.6) {
          y = gsap.utils.interpolate(
            "50%",
            "0%",
            smoothStep((cardProgress - 0.4) / 0.2)
          );
        } else {
          y = "0%";
        }

        let scale = 1;
        if (cardProgress < 0.4) {
          scale = gsap.utils.interpolate(
            0.25,
            0.75,
            smoothStep(cardProgress / 0.4)
          );
        } else if (cardProgress < 0.6) {
          scale = gsap.utils.interpolate(
            0.75,
            1,
            smoothStep((cardProgress - 0.4) / 0.2)
          );
        }

        let opacity = cardProgress < 0.2 ? smoothStep(cardProgress / 0.2) : 1;

        let x, rotate, rotationY;
        if (cardProgress < 0.6) {
          x = index === 0 ? "100%" : index === 1 ? "0%" : "-100%";
          rotate = index === 0 ? -5 : index === 1 ? 0 : 5;
          rotationY = 0;
        } else {
          const normalizedProgress = (cardProgress - 0.6) / 0.4;
          x = gsap.utils.interpolate(
            index === 0 ? "100%" : index === 1 ? "0%" : "-100%",
            "0%",
            smoothStep(normalizedProgress)
          );
          rotate = gsap.utils.interpolate(
            index === 0 ? -5 : index === 1 ? 0 : 5,
            0,
            smoothStep(normalizedProgress)
          );
          rotationY = smoothStep(normalizedProgress) * 180;
        }

        gsap.set(cardId, { opacity, y, x, rotate, scale });
        gsap.set(innerCard, { rotationY });
      });
    },
  });

  // SVG Eye Tracking with touch support
  const svg = document.querySelector("#svg");
  const mouse = svg.createSVGPoint();
  const leftEye = CreateEye("#left-eye");
  const rightEye = CreateEye("#right-eye");
  let requestId = null;

  function onFrame() {
    let point = mouse.matrixTransform(svg.getScreenCTM().inverse());
    leftEye.rotateTo(point);
    rightEye.rotateTo(point);
    requestId = null;
  }

  function onMouseMove(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    if (!requestId) requestId = requestAnimationFrame(onFrame);
  }

  // Support both mouse and touch
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        if (!requestId) requestId = requestAnimationFrame(onFrame);
      }
    },
    { passive: true }
  );

  function CreateEye(selector) {
    const element = document.querySelector(selector);
    gsap.set(element, { transformOrigin: "center" });
    let bbox = element.getBBox();
    let centerX = bbox.x + bbox.width / 2;
    let centery = bbox.y + bbox.height / 2;

    function rotateTo(point) {
      let dx = point.x - centerX;
      let dy = point.y - centery;
      let angle = Math.atan2(dy, dx);
      gsap.to(element, { duration: 0.3, rotation: angle + "_rad_short" });
    }

    return { element, rotateTo };
  }

  // Text hover/touch bounce
  const texts = document.querySelectorAll(".text");
  texts.forEach((text) => {
    const animateIn = () => {
      gsap.to(text, {
        y: -10,
        scale: 1.05,
        color: "#ff4d4d",
        duration: 0.3,
        ease: "power2.out",
      });
    };
    const animateOut = () => {
      gsap.to(text, {
        y: 0,
        scale: 1,
        color: "#000",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    text.addEventListener("mouseenter", animateIn);
    text.addEventListener("mouseleave", animateOut);
    text.addEventListener("touchstart", animateIn);
    text.addEventListener("touchend", animateOut);
  });

  // Cursor trail
  const cursor = document.querySelector(".cursor");
  let mouseX = 0,
    mouseY = 0,
    posX = 0,
    posY = 0;
  gsap.ticker.add(() => {
    posX += (mouseX - posX) * 0.15;
    posY += (mouseY - posY) * 0.15;
    gsap.set(cursor, { x: posX, y: posY });
  });

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Magnetic hover effect
  const magneticItems = document.querySelectorAll(".magnetic");
  magneticItems.forEach((el) => {
    const move = (e) => {
      const rect = el.getBoundingClientRect();
      const x =
        (e.clientX || e.touches?.[0]?.clientX || 0) -
        rect.left -
        rect.width / 2;
      const y =
        (e.clientY || e.touches?.[0]?.clientY || 0) -
        rect.top -
        rect.height / 2;
      gsap.to(el, {
        x: x * 0.3,
        y: y * 0.3,
        ease: "power2.out",
        duration: 0.4,
      });
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", () =>
      gsap.to(el, { x: 0, y: 0, ease: "power2.out", duration: 0.4 })
    );
    el.addEventListener("touchmove", move);
    el.addEventListener("touchend", () =>
      gsap.to(el, { x: 0, y: 0, ease: "power2.out", duration: 0.4 })
    );
  });
});
