document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

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
      gsap.set(".hero-cards", {
        opacity: heroCardsContainerOpacity,
      });

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

          gsap.set(cardId, {
            y: y,
            x: x,
            rotation: rotation,
            scale: scale,
          });
        }
      );
    },
  });

  ScrollTrigger.create({
    trigger: ".services",
    start: "top top",
    end: `+=${window.innerHeight * 4}px`,
    pin: ".services",
    pinSpacing: true,
  });

  ScrollTrigger.create({
    trigger: ".services",
    start: "top top",
    end: `+=${window.innerHeight * 4}px`,
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
    end: `+=${window.innerHeight * 4}`,
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;

      const headerProgress = gsap.utils.clamp(0, 1, progress / 0.9);
      const headerY = gsap.utils.interpolate(
        "400%",
        "0%",
        smoothStep(headerProgress)
      );

      gsap.set(".services-header", {
        y: headerY,
      });

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
          const normalizedProgress = cardProgress / 0.4;
          y = gsap.utils.interpolate(
            "-100%",
            "50%",
            smoothStep(normalizedProgress)
          );
        } else if (cardProgress < 0.6) {
          const normalizedProgress = (cardProgress - 0.4) / 0.2;
          y = gsap.utils.interpolate(
            "50%",
            "0%",
            smoothStep(normalizedProgress)
          );
        } else {
          y = "0%";
        }

        let scale;
        if (cardProgress < 0.4) {
          const normalizedProgress = cardProgress / 0.4;
          scale = gsap.utils.interpolate(
            0.25,
            0.75,
            smoothStep(normalizedProgress)
          );
        } else if (cardProgress < 0.6) {
          const normalizedProgress = (cardProgress - 0.4) / 0.2;
          scale = gsap.utils.interpolate(
            0.75,
            1,
            smoothStep(normalizedProgress)
          );
        } else {
          scale = 1;
        }

        let opacity;
        if (cardProgress < 0.2) {
          const normalizedProgress = cardProgress / 0.2;
          opacity = smoothStep(normalizedProgress);
        } else {
          opacity = 1;
        }

        let x, rotate, rotationY;
        if (cardProgress < 0.6) {
          x = index === 0 ? "100%" : index === 1 ? "0%" : "-100%";
          rotate = index === 0 ? -5 : index === 1 ? 0 : 5;
          rotationY = 0;
        } else if (cardProgress < 1) {
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
        } else {
          x = "0%";
          rotate = 0;
          rotationY = 180;
        }

        gsap.set(cardId, {
          opacity: opacity,
          y: y,
          x: x,
          rotate: rotate,
          scale: scale,
        });

        gsap.set(innerCard, {
          rotationY: rotationY,
        });
      });
    },
  });

  const svg = document.querySelector("#svg");
  const mouse = svg.createSVGPoint();

  const leftEye = CreateEye("#left-eye");
  const rightEye = CreateEye("#right-eye");

  let requestId = null;

  window.addEventListener("mousemove", onMouseMove);

  function onFrame() {
    let point = mouse.matrixTransform(svg.getScreenCTM().inverse());

    leftEye.rotateTo(point);
    rightEye.rotateTo(point);

    requestId = null;
  }

  function onMouseMove(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    if (!requestId) {
      requestId = requestAnimationFrame(onFrame);
    }
  }

  function CreateEye(selector) {
    const element = document.querySelector(selector);

    gsap.set(element, {
      transformOrigin: "center",
    });

    let bbox = element.getBBox();
    let centerX = bbox.x + bbox.width / 2;
    let centery = bbox.y + bbox.height / 2;

    function rotateTo(point) {
      let dx = point.x - centerX;
      let dy = point.y - centery;

      let angle = Math.atan2(dy, dx);

      gsap.to(element, 0.3, {
        rotation: angle + "_rad_short",
      });
    }

    return {
      element,
      rotateTo,
    };
  }

  const texts = document.querySelectorAll(".text");

  texts.forEach((text) => {
    text.addEventListener("mouseenter", () => {
      gsap.to(text, {
        y: -10,
        scale: 1.05,
        color: "#ff4d4d",
        duration: 0.3,
        ease: "power2.out",
      });
    });

    text.addEventListener("mouseleave", () => {
      gsap.to(text, {
        y: 0,
        scale: 1,
        color: "#000",
        duration: 0.3,
        ease: "power2.out",
      });
    });
  });

  const cursor = document.querySelector(".cursor");

  let mouseX = 0;
  let mouseY = 0;

  let posX = 0;
  let posY = 0;

  // Cursor trail loop
  gsap.ticker.add(() => {
    posX += (mouseX - posX) * 0.15;
    posY += (mouseY - posY) * 0.15;
    gsap.set(cursor, {
      x: posX,
      y: posY,
    });
  });

  // Update mouse coordinates
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Magnetic effect
  const magneticItems = document.querySelectorAll(".magnetic");

  magneticItems.forEach((el) => {
    el.addEventListener("mousemove", function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(this, {
        x: x * 0.3,
        y: y * 0.3,
        ease: "power2.out",
        duration: 0.4,
      });
    });

    el.addEventListener("mouseleave", function () {
      gsap.to(this, {
        x: 0,
        y: 0,
        ease: "power2.out",
        duration: 0.4,
      });
    });
  });
});
